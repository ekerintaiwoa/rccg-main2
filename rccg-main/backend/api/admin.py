from django.contrib import admin

from .models import (
	Event, Sermon, Slide, BlogPost, Devotional,
	AboutPage, AboutMandate, AboutFaith, TeamMember,
	ContactPage, ContactMessage,
    Book, AudioFile, WeeklyQuiz, QuizQuestion, QuizOption,
    BookQuestion, UserAnswer, GalleryImage,
    DailyPrayer, PrayerPointItem, PrayerRequest,
    HomeSection, HomeSectionBullet,
    OnlineGivingPage, GivingPurpose, GivingRecord,
    LiveStreamSettings, OpenHeavenDevotional
)

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
	list_display = ("title", "date", "time", "category", "is_upcoming")
	list_editable = ("is_upcoming",)
	search_fields = ("title", "description", "category")
	list_filter = ("category", "date", "is_upcoming")


@admin.register(Sermon)
class SermonAdmin(admin.ModelAdmin):
	list_display = ("title", "date", "speaker", "series")
	search_fields = ("title", "speaker", "series")
	list_filter = ("date", "speaker", "series")


@admin.register(Slide)
class SlideAdmin(admin.ModelAdmin):
	list_display = ("title", "is_active", "order")
	list_editable = ("is_active", "order")
	search_fields = ("title", "subtitle")


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
	list_display = ("title", "published", "published_at")
	list_filter = ("published",)
	prepopulated_fields = {"slug": ("title",)}
	search_fields = ("title", "excerpt", "content")


@admin.register(Devotional)
class DevotionalAdmin(admin.ModelAdmin):
	list_display = ("date", "title", "is_published")
	list_filter = ("is_published",)
	search_fields = ("title", "scripture", "content")


class AboutMandateInline(admin.TabularInline):
	model = AboutMandate
	extra = 1

class AboutFaithInline(admin.TabularInline):
	model = AboutFaith
	extra = 1

@admin.register(AboutPage)
class AboutPageAdmin(admin.ModelAdmin):
	inlines = [AboutMandateInline, AboutFaithInline]

	def has_add_permission(self, request):
		# Prevent adding more than one instance
		if self.model.objects.exists():
			return False
		return super().has_add_permission(request)


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
	list_display = ("name", "role", "order")
	list_editable = ("order",)
	search_fields = ("name", "role")


@admin.register(ContactPage)
class ContactPageAdmin(admin.ModelAdmin):
	def has_add_permission(self, request):
		if self.model.objects.exists():
			return False
		return super().has_add_permission(request)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
	list_display = ("name", "email", "subject", "created_at")
	search_fields = ("name", "email", "subject", "message")
	readonly_fields = ("created_at",)

@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
	list_display = ("title", "created_at")
	search_fields = ("title", "description")


class BookQuestionInline(admin.TabularInline):
	model = BookQuestion
	extra = 1

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
	list_display = ("title", "author", "is_book_of_the_week")
	list_filter = ("is_book_of_the_week",)
	search_fields = ("title", "author")
	inlines = [BookQuestionInline]


@admin.register(AudioFile)
class AudioFileAdmin(admin.ModelAdmin):
	list_display = ("title", "speaker", "created_at")
	search_fields = ("title", "speaker")


class QuizOptionInline(admin.TabularInline):
	model = QuizOption
	extra = 2

class QuizQuestionInline(admin.StackedInline):
	model = QuizQuestion
	extra = 1

@admin.register(WeeklyQuiz)
class WeeklyQuizAdmin(admin.ModelAdmin):
	list_display = ("title", "is_active", "created_at")
	list_filter = ("is_active",)
	# For simplicity in this demo, we'll just show QuizQuestionInline
	# Real apps might register QuizQuestion separately to manage options more easily
	inlines = [QuizQuestionInline]

@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ("question_text", "quiz")
    inlines = [QuizOptionInline]

@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
	list_display = ("user", "question", "created_at")
	readonly_fields = ("user", "question", "answer_text", "created_at")

class PrayerPointItemInline(admin.TabularInline):
	model = PrayerPointItem
	extra = 1

@admin.register(DailyPrayer)
class DailyPrayerAdmin(admin.ModelAdmin):
	list_display = ("date", "time_of_day", "title")
	list_filter = ("date", "time_of_day")
	search_fields = ("title", "verse", "declaration")
	inlines = [PrayerPointItemInline]

@admin.register(PrayerRequest)
class PrayerRequestAdmin(admin.ModelAdmin):
	list_display = ("name", "email", "is_prayed_for", "created_at")
	list_filter = ("is_prayed_for",)
	search_fields = ("name", "email", "request_text")
	readonly_fields = ("created_at",)


class HomeSectionBulletInline(admin.TabularInline):
	model = HomeSectionBullet
	extra = 1

@admin.register(HomeSection)
class HomeSectionAdmin(admin.ModelAdmin):
	list_display = ("title", "is_active", "order")
	list_editable = ("is_active", "order")
	search_fields = ("title", "description", "button_text")
	inlines = [HomeSectionBulletInline]


class GivingPurposeInline(admin.TabularInline):
	model = GivingPurpose
	extra = 1

@admin.register(OnlineGivingPage)
class OnlineGivingPageAdmin(admin.ModelAdmin):
	inlines = [GivingPurposeInline]

	def has_add_permission(self, request):
		if self.model.objects.exists():
			return False
		return super().has_add_permission(request)


@admin.register(GivingRecord)
class GivingRecordAdmin(admin.ModelAdmin):
	list_display = ("reference_code", "get_donor_name", "amount", "currency", "purpose", "status", "created_at")
	list_filter = ("status", "purpose", "is_anonymous", "created_at")
	search_fields = ("reference_code", "first_name", "last_name", "email", "user__username")
	readonly_fields = ("reference_code", "created_at")

	def get_donor_name(self, obj):
		return str(obj)
	get_donor_name.short_description = "Donor"


@admin.register(LiveStreamSettings)
class LiveStreamSettingsAdmin(admin.ModelAdmin):
	def has_add_permission(self, request):
		if self.model.objects.exists():
			return False
		return super().has_add_permission(request)


@admin.register(OpenHeavenDevotional)
class OpenHeavenDevotionalAdmin(admin.ModelAdmin):
    list_display = ("date", "title", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("title", "content")
    list_editable = ("is_active",)
    date_hierarchy = "date"
    fieldsets = (
        (None, {
            "fields": ("date", "title", "is_active"),
        }),
        ("Reading & Memory Verse", {
            "fields": ("bible_reading", "memory_verse", "memory_verse_text"),
        }),
        ("Message", {
            "fields": ("content",),
            "classes": ("wide",),
            "description": "Paste the full devotional message. Use blank lines to separate paragraphs.",
        }),
        ("Prayer & Hymn", {
            "fields": ("prayer_point", "hymn"),
        }),
    )
