from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
	Event, Sermon, Slide, BlogPost, Devotional,
    AboutPage, TeamMember, ContactPage, ContactMessage,
    Book, AudioFile, WeeklyQuiz, BookQuestion, UserAnswer,
    GalleryImage, DailyPrayer, PrayerRequest, HomeSection,
    OnlineGivingPage, GivingPurpose, GivingRecord, LiveStreamSettings
)
from .serializers import (
	EventSerializer,
	SermonSerializer,
	SlideSerializer,
	BlogPostSerializer,
	DevotionalSerializer,
	AboutPageSerializer,
    TeamMemberSerializer,
    ContactPageSerializer,
    ContactMessageSerializer,
    BookSerializer,
    AudioFileSerializer,
    WeeklyQuizSerializer,
    GalleryImageSerializer,
    DailyPrayerSerializer,
    PrayerRequestSerializer,
    HomeSectionSerializer,
    OnlineGivingPageSerializer,
    GivingRecordSerializer,
    LiveStreamSettingsSerializer
)


def _http_get(url: str, timeout_seconds: int = 20) -> str:
    import urllib.request

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/json;q=0.9,*/*;q=0.8",
        },
    )
    with urllib.request.urlopen(req, timeout=timeout_seconds) as resp:
        charset = resp.headers.get_content_charset() or "utf-8"
        return resp.read().decode(charset, errors="replace")


def _strip_html_to_text(html: str) -> str:
    import html as html_lib
    import re

    text = html
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"</p\s*>", "\n\n", text, flags=re.IGNORECASE)
    text = re.sub(r"</(?:div|li|h1|h2|h3|h4|h5|h6)\s*>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = html_lib.unescape(text)
    return text


def _extract_blogger_post_body(post_html: str) -> str:
    import re

    match = re.search(
        r"<div class=['\"]post-body[^>]*>([\s\S]*?)<div class=['\"]post-footer['\"]",
        post_html,
        flags=re.IGNORECASE,
    )
    if match:
        return match.group(1)
    return post_html


def _extract_rccgonline_post_body(post_html: str) -> str:
    """Extract the main article body from an rccgonline.org WordPress post page."""
    import re

    # Try the standard WordPress/Gutenberg entry-content div first.
    for pattern in [
        r'<div[^>]+class=["\'][^"\']*entry-content[^"\']*["\'][^>]*>([\s\S]*?)</div>\s*</article',
        r'<div[^>]+class=["\'][^"\']*entry-content[^"\']*["\'][^>]*>([\s\S]*?)</div>\s*<(?:div|footer|aside)',
        r'<article[^>]*>([\s\S]*?)</article>',
    ]:
        match = re.search(pattern, post_html, flags=re.IGNORECASE)
        if match:
            return match.group(1)
    return post_html


def _parse_openheavens_text(raw_text: str, title: str, date_str: str) -> dict:
    import re

    message = raw_text

    def extract_content(start_marker: str, end_markers: list[str]) -> str:
        start = re.search(start_marker, message, flags=re.IGNORECASE | re.MULTILINE)
        if not start:
            return ""
        rest = message[start.end() :].lstrip()
        end_idx = len(rest)
        for end_marker in end_markers:
            end = re.search(end_marker, rest, flags=re.IGNORECASE | re.MULTILINE)
            if end and end.start() < end_idx:
                end_idx = end.start()
        return rest[:end_idx].strip()

    next_headings = [
        r"\n[^\n]*?(?:READ|BIBLE TEXT)\s*:\s*",
        r"\n[^\n]*?(?:MESSAGE)\s*\n",
        r"\n[^\n]*?(?:KEY POINT|PRAYER POINT|ACTION POINT)[^\n]*\n",
        r"\n[^\n]*?(?:HYMN)[^\n]*",
        r"\n[^\n]*?(?:BIBLE IN ONE YEAR)",
    ]

    mv_section = extract_content(r"\n[^\n]*?(?:MEMORISE|MEMORY VERSE)\s*\n", next_headings)
    verses_section = extract_content(r"\n[^\n]*?(?:READ|BIBLE TEXT)\s*:\s*", next_headings)
    message_section = extract_content(r"\n[^\n]*?(?:MESSAGE)\s*\n", next_headings)
    prayer_points_section = extract_content(
        r"\n[^\n]*?(?:KEY POINT|PRAYER POINT|ACTION POINT)[^\n]*\n",
        next_headings,
    )
    hymn_section = extract_content(r"\n[^\n]*?(?:HYMN)[^\n]*", next_headings)

    memory_verse_text = mv_section
    memory_verse = "Memory Verse"
    if mv_section:
        citation_match = re.search(r"([1-3]?\s*[A-Za-z]+\s+\d+:\d+(?:-\d+)?)[^\w]*$", mv_section)
        if citation_match:
            memory_verse = citation_match.group(1)
            memory_verse_text = mv_section.replace(memory_verse, "").strip()

    bible_reading = "Today's Reading"
    if verses_section:
        bible_reading = verses_section.splitlines()[0].strip() or bible_reading

    content_paragraphs = [p.strip() for p in re.split(r"\n\n+", message_section) if p.strip()]
    if not content_paragraphs:
        content_paragraphs = [message.strip()[:500] + "..."] if message.strip() else []

    prayer_point = " ".join([p.strip() for p in prayer_points_section.splitlines() if p.strip()])

    return {
        "title": title or "Daily Devotional",
        "date": date_str,
        "topic": "",
        "bible_reading": bible_reading,
        "memory_verse": memory_verse,
        "memory_verse_text": memory_verse_text,
        "content": content_paragraphs,
        "prayer_point": prayer_point,
        "hymn": hymn_section,
        "reflection": None,
    }


class OpenHeavenView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        import json
        import re
        import datetime

        date_str = request.query_params.get("date")
        if not date_str:
            date_str = timezone.localdate().isoformat()

        try:
            target_date = datetime.date.fromisoformat(date_str)
        except ValueError:
            return Response({"detail": "Invalid date format. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)

        # Fetch Open Heaven posts from the RCCG Online WordPress REST API.
        # We request posts published within a ±2-day window around the target date
        # to account for timezone differences and early-publishing, then match by
        # title (preferred) or post date (fallback) — same strategy as before.
        after_date = (target_date - datetime.timedelta(days=1)).isoformat()
        before_date = (target_date + datetime.timedelta(days=2)).isoformat()
        feed_url = (
            "https://rccgonline.org/wp-json/wp/v2/posts"
            f"?after={after_date}T00:00:00&before={before_date}T00:00:00"
            "&per_page=10&orderby=date&order=desc"
            "&categories_exclude=&search=open+heaven"
        )

        try:
            feed_raw = _http_get(feed_url)
            entries = json.loads(feed_raw)
            if not isinstance(entries, list):
                entries = []

            # If the windowed query returned nothing, fall back to a broader search
            # (last 20 Open Heaven posts) so we can still do a title-based match.
            if not entries:
                fallback_url = (
                    "https://rccgonline.org/wp-json/wp/v2/posts"
                    "?per_page=20&orderby=date&order=desc&search=open+heaven"
                )
                feed_raw = _http_get(fallback_url)
                entries = json.loads(feed_raw)
                if not isinstance(entries, list):
                    entries = []

            if not entries:
                return Response({"detail": "No feed entries"}, status=status.HTTP_502_BAD_GATEWAY)

            # --- Title-based date matching (preferred) ---
            # RCCG Online post titles follow patterns like:
            #   "Open Heaven 1 April 2025 – Topic Here"
            #   "Open Heaven April 1st 2025 | Topic"
            month_name = target_date.strftime("%B").lower()
            month_abbrev = target_date.strftime("%b").lower()
            month_candidates = {month_name, month_abbrev}
            if month_abbrev == "sep":
                month_candidates.add("sept")
            year_str = str(target_date.year)
            day_num = target_date.day
            # Accept optional leading zero and ordinal suffix (1st, 2nd, 3rd, 4th…).
            day_re = re.compile(rf"\b0?{day_num}(st|nd|rd|th)?\b", re.IGNORECASE)

            target_entry = None
            for entry in entries:
                # WordPress REST API: title is {"rendered": "..."} 
                title_rendered = (entry.get("title") or {}).get("rendered", "") or ""
                title_text = title_rendered.lower()
                # Order-agnostic match: title must contain month + year + day number.
                if (
                    any(m in title_text for m in month_candidates)
                    and year_str in title_text
                    and day_re.search(title_text)
                ):
                    target_entry = entry
                    break

            # --- Fallback: match by the post's published date field ---
            if not target_entry:
                for entry in entries:
                    # WordPress REST API: "date" is "2025-04-01T06:00:00" (local) or
                    # "date_gmt" is the UTC equivalent.
                    stamp = entry.get("date") or entry.get("date_gmt") or ""
                    if stamp.startswith(date_str):
                        target_entry = entry
                        break

            if not target_entry:
                return Response({"detail": "Devotional not found for date"}, status=status.HTTP_404_NOT_FOUND)

            # WordPress REST API: title and content are {"rendered": "..."} dicts.
            title = (target_entry.get("title") or {}).get("rendered", "") or ""
            post_href = target_entry.get("link") or ""

            # Prefer the full rendered content; fall back to excerpt.
            raw_html = (
                (target_entry.get("content") or {}).get("rendered")
                or (target_entry.get("excerpt") or {}).get("rendered")
                or ""
            )

            # If the REST API returned a truncated excerpt, fetch the full post page
            # and extract the article body directly from the HTML.
            if post_href and (not raw_html or len(raw_html) < 200):
                post_html = _http_get(post_href)
                raw_html = _extract_rccgonline_post_body(post_html) or raw_html

            text = _strip_html_to_text(raw_html)
            devotional = _parse_openheavens_text(text, title, date_str)
            return Response(devotional)
        except Exception as exc:
            return Response({"detail": "Failed to fetch devotional", "error": str(exc)}, status=status.HTTP_502_BAD_GATEWAY)


class EventViewSet(viewsets.ModelViewSet):
	queryset = Event.objects.all().order_by("date")
	serializer_class = EventSerializer


class SermonViewSet(viewsets.ModelViewSet):
	queryset = Sermon.objects.all().order_by("-date")
	serializer_class = SermonSerializer


class SlideViewSet(viewsets.ModelViewSet):
	queryset = Slide.objects.filter(is_active=True)
	serializer_class = SlideSerializer


class BlogPostViewSet(viewsets.ModelViewSet):
	queryset = BlogPost.objects.filter(published=True)
	serializer_class = BlogPostSerializer


class DevotionalViewSet(viewsets.ModelViewSet):
	queryset = Devotional.objects.filter(is_published=True).order_by("-date")
	serializer_class = DevotionalSerializer


class AboutPageView(APIView):
	def get(self, request, *args, **kwargs):
		about, created = AboutPage.objects.get_or_create(pk=1)
		serializer = AboutPageSerializer(about)
		return Response(serializer.data)


class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
	queryset = TeamMember.objects.all()
	serializer_class = TeamMemberSerializer


class ContactPageView(APIView):
	def get(self, request, *args, **kwargs):
		contact, created = ContactPage.objects.get_or_create(pk=1)
		serializer = ContactPageSerializer(contact)
		return Response(serializer.data)


class ContactMessageView(APIView):
	"""Accept contact form submissions."""

	def post(self, request, *args, **kwargs):
		serializer = ContactMessageSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response({"status": "ok"}, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email", "")

        if not username or not password:
            return Response({"error": "Username and password required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, email=email, password=password)
        token, created = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.username}, status=status.HTTP_201_CREATED)

class BookViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Book.objects.all().order_by("-created_at")
    serializer_class = BookSerializer

class GalleryImageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GalleryImage.objects.all().order_by("-created_at")
    serializer_class = GalleryImageSerializer

class AudioFileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AudioFile.objects.all().order_by("-created_at")
    serializer_class = AudioFileSerializer

class WeeklyQuizViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WeeklyQuiz.objects.filter(is_active=True).order_by("-created_at")
    serializer_class = WeeklyQuizSerializer

class SubmitAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        question_id = request.data.get("question_id")
        answer_text = request.data.get("answer_text")

        if not question_id or not answer_text:
             return Response({"error": "question_id and answer_text required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            question = BookQuestion.objects.get(id=question_id)
        except BookQuestion.DoesNotExist:
            return Response({"error": "Question not found."}, status=status.HTTP_404_NOT_FOUND)

        UserAnswer.objects.create(
            user=request.user,
            question=question,
            answer_text=answer_text
        )
        return Response({"status": "Answer submitted successfully!"}, status=status.HTTP_201_CREATED)

class DailyPrayerViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DailyPrayerSerializer

    def get_queryset(self):
        queryset = DailyPrayer.objects.all().order_by("-date", "time_of_day")
        date_param = self.request.query_params.get('date')
        if date_param:
            queryset = queryset.filter(date=date_param)
        return queryset

class PrayerRequestViewSet(viewsets.ModelViewSet):
    queryset = PrayerRequest.objects.all()
    serializer_class = PrayerRequestSerializer
    permission_classes = [permissions.AllowAny]


class HomeSectionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HomeSection.objects.filter(is_active=True).order_by("order", "id")
    serializer_class = HomeSectionSerializer

class OnlineGivingPageView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        giving_page, created = OnlineGivingPage.objects.get_or_create(pk=1)
        serializer = OnlineGivingPageSerializer(giving_page)
        return Response(serializer.data)


class GivingRecordViewSet(viewsets.ModelViewSet):
    serializer_class = GivingRecordSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return GivingRecord.objects.all()
        if user.is_authenticated:
            return GivingRecord.objects.filter(user=user)
        return GivingRecord.objects.none()

    def perform_create(self, serializer):
        import random, string
        ref_code = 'REF-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        
        user = self.request.user
        is_anonymous = serializer.validated_data.get('is_anonymous', False)
        
        if user.is_authenticated and not is_anonymous:
            serializer.save(user=user, reference_code=ref_code)
        else:
            serializer.save(reference_code=ref_code)


class LiveStreamSettingsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        settings, _ = LiveStreamSettings.objects.get_or_create(pk=1)
        serializer = LiveStreamSettingsSerializer(settings)
        return Response(serializer.data)


