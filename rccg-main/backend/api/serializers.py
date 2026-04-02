from rest_framework import serializers

from .models import (
    Event, Sermon, Slide, BlogPost, Devotional,
    AboutPage, AboutMandate, AboutFaith, TeamMember,
    ContactPage, ContactMessage,
    Book, AudioFile, WeeklyQuiz, QuizQuestion, QuizOption, BookQuestion, UserAnswer,
    GalleryImage, DailyPrayer, PrayerPointItem, PrayerRequest, HomeSection, HomeSectionBullet,
    OnlineGivingPage, GivingPurpose, GivingRecord, LiveStreamSettings
)

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"


class SermonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sermon
        fields = "__all__"


class SlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slide
        fields = "__all__"


class BlogPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogPost
        fields = "__all__"


class DevotionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Devotional
        fields = "__all__"


class AboutMandateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutMandate
        fields = ["id", "title", "description", "order"]


class AboutFaithSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutFaith
        fields = ["id", "title", "description", "order"]


class AboutPageSerializer(serializers.ModelSerializer):
    mandates = AboutMandateSerializer(many=True, read_only=True)
    faiths = AboutFaithSerializer(many=True, read_only=True)

    class Meta:
        model = AboutPage
        fields = "__all__"


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = "__all__"


class ContactPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactPage
        fields = "__all__"


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = "__all__"

class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = "__all__"

class BookQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookQuestion
        fields = ["id", "question_text"]

class BookSerializer(serializers.ModelSerializer):
    questions = BookQuestionSerializer(many=True, read_only=True)
    class Meta:
        model = Book
        fields = "__all__"

class AudioFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AudioFile
        fields = "__all__"

class QuizOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizOption
        fields = ["id", "option_text", "is_correct"]

class QuizQuestionSerializer(serializers.ModelSerializer):
    options = QuizOptionSerializer(many=True, read_only=True)
    class Meta:
        model = QuizQuestion
        fields = ["id", "question_text", "options"]

class WeeklyQuizSerializer(serializers.ModelSerializer):
    questions = QuizQuestionSerializer(many=True, read_only=True)
    class Meta:
        model = WeeklyQuiz
        fields = "__all__"

class PrayerPointItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrayerPointItem
        fields = ["id", "text", "order"]

class DailyPrayerSerializer(serializers.ModelSerializer):
    points = PrayerPointItemSerializer(many=True, read_only=True)
    class Meta:
        model = DailyPrayer
        fields = ["id", "date", "time_of_day", "title", "verse", "declaration", "points"]

class PrayerRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrayerRequest
        fields = ["id", "name", "email", "request_text", "is_prayed_for", "created_at"]

class HomeSectionBulletSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeSectionBullet
        fields = ["id", "text", "order"]

class HomeSectionSerializer(serializers.ModelSerializer):
    bullets = HomeSectionBulletSerializer(many=True, read_only=True)
    class Meta:
        model = HomeSection
        fields = "__all__"

class GivingPurposeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GivingPurpose
        fields = ["id", "title", "description", "icon", "color", "order"]

class OnlineGivingPageSerializer(serializers.ModelSerializer):
    purposes = GivingPurposeSerializer(many=True, read_only=True)

    class Meta:
        model = OnlineGivingPage
        fields = "__all__"

class GivingRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = GivingRecord
        fields = "__all__"
        read_only_fields = ["reference_code", "status", "user"]


class LiveStreamSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LiveStreamSettings
        fields = "__all__"

