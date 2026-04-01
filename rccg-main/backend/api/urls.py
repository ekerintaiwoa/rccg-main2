from django.urls import path, include
from rest_framework.routers import DefaultRouter

from rest_framework.authtoken.views import obtain_auth_token

from .views import (
    EventViewSet,
    SermonViewSet,
    SlideViewSet,
    BlogPostViewSet,
    DevotionalViewSet,
	AboutPageView,
	TeamMemberViewSet,
	ContactPageView,
    ContactMessageView,
    RegisterView,
    BookViewSet,
    AudioFileViewSet,
    WeeklyQuizViewSet,
    SubmitAnswerView,
    GalleryImageViewSet,
    DailyPrayerViewSet,
    PrayerRequestViewSet,
    HomeSectionViewSet,
    OnlineGivingPageView,
    GivingRecordViewSet,
    OpenHeavenView
)

router = DefaultRouter()
router.register("events", EventViewSet)
router.register("sermons", SermonViewSet)
router.register("slides", SlideViewSet)
router.register("blogs", BlogPostViewSet)
router.register("devotionals", DevotionalViewSet)
router.register("team", TeamMemberViewSet, basename="team")
router.register("books", BookViewSet, basename="books")
router.register("audios", AudioFileViewSet, basename="audios")
router.register("quizzes", WeeklyQuizViewSet, basename="quizzes")
router.register("gallery", GalleryImageViewSet, basename="gallery")
router.register("prayers", DailyPrayerViewSet, basename="prayers")
router.register("prayer-requests", PrayerRequestViewSet, basename="prayer-requests")
router.register("home-sections", HomeSectionViewSet, basename="home-sections")
router.register("giving-records", GivingRecordViewSet, basename="giving-records")

urlpatterns = [
    path("", include(router.urls)),
    path("about/", AboutPageView.as_view(), name="about-page"),
    path("contact-info/", ContactPageView.as_view(), name="contact-page"),
    path("contact/", ContactMessageView.as_view(), name="contact-message"),
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", obtain_auth_token, name="login"),
    path("submit-answer/", SubmitAnswerView.as_view(), name="submit-answer"),
    path("online-giving/", OnlineGivingPageView.as_view(), name="online-giving"),
	path("open-heaven/", OpenHeavenView.as_view(), name="open-heaven"),
]


