from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
	Event, Sermon, Slide, BlogPost, Devotional,
    AboutPage, TeamMember, ContactPage, ContactMessage,
    Book, AudioFile, WeeklyQuiz, BookQuestion, UserAnswer,
    GalleryImage, DailyPrayer, PrayerRequest, HomeSection,
    OnlineGivingPage, GivingPurpose, GivingRecord
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
    GivingRecordSerializer
)


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


