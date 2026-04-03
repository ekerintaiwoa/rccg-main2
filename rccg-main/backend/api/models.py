from django.db import models
from django.contrib.auth.models import User
from PIL import Image, ImageOps


def resize_image(path: str, size: tuple[int, int], centering: tuple[float, float] = (0.5, 0.5)) -> None:
	"""Resize and crop an image in-place to fit exactly within size, without distortion."""
	try:
		img = Image.open(path)
		# Convert to RGB if it's RGBA or P to avoid issues when saving as JPEG
		if img.mode in ("RGBA", "P"):
			img = img.convert("RGB")
		# ImageOps.fit resizes and crops the image to exactly the specified size
		img = ImageOps.fit(img, size, Image.Resampling.LANCZOS, centering=centering)
		img.save(path, optimize=True, quality=85)
	except Exception as e:
		# If resizing fails, keep the original image.
		print(f"Error resizing image {path}: {e}")
		return

def resize_image_proportional(path: str, max_size: tuple[int, int]) -> None:
	"""Resize an image proportionally so it fits within max_size without cropping."""
	try:
		img = Image.open(path)
		if img.mode in ("RGBA", "P"):
			img = img.convert("RGB")
		img.thumbnail(max_size, Image.Resampling.LANCZOS)
		img.save(path, optimize=True, quality=85)
	except Exception as e:
		print(f"Error resizing image {path}: {e}")
		return



class TimeStampedModel(models.Model):
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		abstract = True


class Event(TimeStampedModel):
	title = models.CharField(max_length=200)
	date = models.DateField()
	time = models.CharField(max_length=50)
	description = models.TextField()
	category = models.CharField(max_length=50)
	image_url = models.URLField(blank=True)
	image_file = models.ImageField(
		upload_to="events/",
		blank=True,
		null=True,
		help_text="Recommended size: 1200 x 800 px",
	)

	def __str__(self) -> str:
		return self.title

	def save(self, *args, **kwargs) -> None:
		super().save(*args, **kwargs)
		if self.image_file and getattr(self.image_file, "path", None):
			resize_image(self.image_file.path, (1200, 800))


class Sermon(TimeStampedModel):
	title = models.CharField(max_length=200)
	series = models.CharField(max_length=200, blank=True)
	date = models.DateField()
	speaker = models.CharField(max_length=120)
	description = models.TextField(blank=True)
	duration = models.CharField(max_length=50, blank=True)
	thumbnail_url = models.URLField(blank=True)
	thumbnail_file = models.ImageField(
		upload_to="sermons/",
		blank=True,
		null=True,
		help_text="Recommended size: 800 x 450 px",
	)
	video_url = models.URLField(blank=True)

	def __str__(self) -> str:
		return self.title

	def save(self, *args, **kwargs) -> None:
		super().save(*args, **kwargs)
		if self.thumbnail_file and getattr(self.thumbnail_file, "path", None):
			resize_image(self.thumbnail_file.path, (800, 450))


class Slide(TimeStampedModel):
	title = models.CharField(max_length=200)
	subtitle = models.CharField(max_length=250, blank=True)
	description = models.TextField(blank=True)
	image_url = models.URLField(blank=True)
	image_file = models.ImageField(
		upload_to="slides/",
		blank=True,
		null=True,
		help_text="Recommended size: 1600 x 900 px",
	)
	cta_primary = models.CharField(max_length=100, blank=True)
	cta_secondary = models.CharField(max_length=100, blank=True)
	is_active = models.BooleanField(default=True)
	order = models.PositiveIntegerField(default=0)

	class Meta:
		ordering = ["order", "-created_at"]

	def __str__(self) -> str:
		return self.title

	def save(self, *args, **kwargs) -> None:
		super().save(*args, **kwargs)
		if self.image_file and getattr(self.image_file, "path", None):
			resize_image(self.image_file.path, (1600, 900))


class BlogPost(TimeStampedModel):
	title = models.CharField(max_length=200)
	slug = models.SlugField(unique=True)
	excerpt = models.TextField(blank=True)
	content = models.TextField()
	author = models.CharField(max_length=120, blank=True)
	published = models.BooleanField(default=True)
	published_at = models.DateTimeField(null=True, blank=True)
	image = models.ImageField(
		upload_to="blog/",
		blank=True,
		null=True,
		help_text="Recommended size: 1200 x 800 px",
	)

	class Meta:
		ordering = ["-published_at", "-created_at"]

	def __str__(self) -> str:
		return self.title

	def save(self, *args, **kwargs) -> None:
		super().save(*args, **kwargs)
		if self.image and getattr(self.image, "path", None):
			resize_image(self.image.path, (1200, 800))


class Devotional(TimeStampedModel):
	date = models.DateField(unique=True)
	title = models.CharField(max_length=200)
	scripture = models.CharField(max_length=255, blank=True)
	content = models.TextField()
	prayer = models.TextField(blank=True)
	is_published = models.BooleanField(default=True)

	class Meta:
		ordering = ["-date"]

	def __str__(self) -> str:
		return f"{self.date} - {self.title}"


class AboutPage(TimeStampedModel):
	"""Singleton model for the About Us page."""
	hero_title = models.CharField(max_length=200, default="Our Journey")
	hero_subtitle = models.TextField(default="The Redeemed Christian Church of God is a worldwide community...")
	hero_image = models.ImageField(
		upload_to="about/",
		blank=True,
		null=True,
		help_text="Recommended size: 1920 x 1080 px",
	)
	
	history_title = models.CharField(max_length=200, default="RCCG History")
	history_content = models.TextField(blank=True)
	history_image = models.ImageField(
		upload_to="about/",
		blank=True,
		null=True,
		help_text="Recommended size: 800 x 500 px",
	)

	mandate_title = models.CharField(max_length=200, default="Global Mandate")
	mandate_subtitle = models.CharField(max_length=250, default="Our vision and mission for the world.")
	mandate_conclusion = models.TextField(blank=True)

	beliefs_title = models.CharField(max_length=200, default="Core Beliefs")
	beliefs_content = models.TextField(blank=True)
	beliefs_quote = models.TextField(blank=True)

	faith_title = models.CharField(max_length=200, default="Statement of Faith")
	faith_subtitle = models.CharField(max_length=250, default="What we believe and stand for.")

	class Meta:
		verbose_name = "About Page"
		verbose_name_plural = "About Page"

	def __str__(self):
		return "About Page Content"

	def save(self, *args, **kwargs) -> None:
		self.pk = 1  # Force singleton
		super().save(*args, **kwargs)
		if self.hero_image and getattr(self.hero_image, "path", None):
			resize_image(self.hero_image.path, (1920, 1080))
		if self.history_image and getattr(self.history_image, "path", None):
			resize_image(self.history_image.path, (800, 500))


class AboutMandate(TimeStampedModel):
	about_page = models.ForeignKey(AboutPage, related_name="mandates", on_delete=models.CASCADE)
	title = models.CharField(max_length=200)
	description = models.TextField()
	order = models.PositiveIntegerField(default=0)

	class Meta:
		ordering = ["order", "id"]

	def __str__(self):
		return self.title


class AboutFaith(TimeStampedModel):
	about_page = models.ForeignKey(AboutPage, related_name="faiths", on_delete=models.CASCADE)
	title = models.CharField(max_length=200)
	description = models.TextField()
	order = models.PositiveIntegerField(default=0)

	class Meta:
		ordering = ["order", "id"]

	def __str__(self):
		return self.title


class TeamMember(TimeStampedModel):
	name = models.CharField(max_length=150)
	role = models.CharField(max_length=150)
	description = models.TextField(blank=True)
	image = models.ImageField(
		upload_to="team/",
		blank=True,
		null=True,
		help_text="Recommended size: 800 x 1000 px",
	)
	email = models.EmailField(blank=True)
	linkedin = models.URLField(blank=True)
	order = models.PositiveIntegerField(default=0)

	class Meta:
		ordering = ["order", "id"]

	def __str__(self):
		return self.name

	def save(self, *args, **kwargs) -> None:
		super().save(*args, **kwargs)
		if self.image and getattr(self.image, "path", None):
			resize_image(self.image.path, (800, 1000), centering=(0.5, 0.0))


class ContactPage(TimeStampedModel):
	"""Singleton model for Contact Us page."""
	title = models.CharField(max_length=200, default="Contact Us")
	subtitle = models.TextField(default="We would love to hear from you. Whether you have a question, a prayer request, or a testimony, send us a message and our team will respond as soon as possible.")
	service_times = models.TextField(default="Sunday Celebration Service – 10:00 AM\nMidweek Bible Study – Wednesday 6:30 PM")
	address = models.TextField(default="RCCG House of Glory Lübeck\n(Add your church address here)")
	phone = models.CharField(max_length=50, default="+49 (0) 000 0000000")
	email = models.EmailField(default="info@rccg-houseofglory.de")

	class Meta:
		verbose_name = "Contact Page"
		verbose_name_plural = "Contact Page"

	def __str__(self):
		return "Contact Page Content"

	def save(self, *args, **kwargs) -> None:
		self.pk = 1  # Force singleton
		super().save(*args, **kwargs)


class ContactMessage(TimeStampedModel):
	name = models.CharField(max_length=150)
	email = models.EmailField()
	subject = models.CharField(max_length=250, blank=True)
	message = models.TextField()

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		return f"Message from {self.name} - {self.subject}"


class GalleryImage(TimeStampedModel):
	title = models.CharField(max_length=200, blank=True)
	description = models.TextField(blank=True)
	image = models.ImageField(
		upload_to="gallery/",
		help_text="Recommended size: 1200 x 800 px"
	)

	def __str__(self):
		return self.title or f"Gallery Image {self.id}"

	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)
		if self.image and getattr(self.image, "path", None):
			resize_image_proportional(self.image.path, (1200, 1200))

class Book(TimeStampedModel):
	title = models.CharField(max_length=200)
	author = models.CharField(max_length=150)
	description = models.TextField(blank=True)
	cover_image = models.ImageField(
		upload_to="books/covers/", 
		blank=True, 
		null=True,
		help_text="Recommended size: 600 x 900 px"
	)
	pdf_file = models.FileField(upload_to="books/pdfs/")
	is_book_of_the_week = models.BooleanField(default=False)

	def __str__(self):
		return self.title

	def save(self, *args, **kwargs):
		if self.is_book_of_the_week:
			# Ensure only one book of the week is active at a time
			Book.objects.filter(is_book_of_the_week=True).update(is_book_of_the_week=False)
		super().save(*args, **kwargs)
		if self.cover_image and getattr(self.cover_image, "path", None):
			resize_image(self.cover_image.path, (600, 900))


class AudioFile(TimeStampedModel):
	title = models.CharField(max_length=200)
	speaker = models.CharField(max_length=150)
	description = models.TextField(blank=True)
	cover_image = models.ImageField(
		upload_to="audios/covers/", 
		blank=True, 
		null=True,
		help_text="Recommended size: 800 x 800 px"
	)
	audio_file = models.FileField(upload_to="audios/files/")

	def __str__(self):
		return self.title

	def save(self, *args, **kwargs):
		super().save(*args, **kwargs)
		if self.cover_image and getattr(self.cover_image, "path", None):
			resize_image(self.cover_image.path, (800, 800))


class WeeklyQuiz(TimeStampedModel):
	title = models.CharField(max_length=200)
	description = models.TextField(blank=True)
	is_active = models.BooleanField(default=True)

	def __str__(self):
		return self.title

	def save(self, *args, **kwargs):
		if self.is_active:
			WeeklyQuiz.objects.filter(is_active=True).update(is_active=False)
		super().save(*args, **kwargs)


class QuizQuestion(TimeStampedModel):
	quiz = models.ForeignKey(WeeklyQuiz, related_name='questions', on_delete=models.CASCADE)
	question_text = models.CharField(max_length=500)
	order = models.PositiveIntegerField(default=0)

	class Meta:
		ordering = ['order', 'id']

	def __str__(self):
		return self.question_text


class QuizOption(TimeStampedModel):
	question = models.ForeignKey(QuizQuestion, related_name='options', on_delete=models.CASCADE)
	option_text = models.CharField(max_length=200)
	is_correct = models.BooleanField(default=False)

	def __str__(self):
		return self.option_text


class BookQuestion(TimeStampedModel):
	book = models.ForeignKey(Book, related_name='questions', on_delete=models.CASCADE)
	question_text = models.CharField(max_length=500)

	def __str__(self):
		return self.question_text


class UserAnswer(TimeStampedModel):
	user = models.ForeignKey(User, on_delete=models.CASCADE)
	question = models.ForeignKey(BookQuestion, related_name='answers', on_delete=models.CASCADE)
	answer_text = models.TextField()

	def __str__(self):
		return f"{self.user.username}'s answer to {self.question.id}"


class DailyPrayer(TimeStampedModel):
	TIME_CHOICES = [
		('morning', 'Morning'),
		('afternoon', 'Afternoon'),
		('evening', 'Evening'),
	]
	date = models.DateField()
	time_of_day = models.CharField(max_length=20, choices=TIME_CHOICES)
	title = models.CharField(max_length=200)
	verse = models.CharField(max_length=500, blank=True)
	declaration = models.TextField()

	class Meta:
		ordering = ['-date', 'time_of_day']
		unique_together = ['date', 'time_of_day']

	def __str__(self):
		return f"{self.date} - {self.get_time_of_day_display()} - {self.title}"


class PrayerPointItem(TimeStampedModel):
	prayer = models.ForeignKey(DailyPrayer, related_name='points', on_delete=models.CASCADE)
	text = models.TextField()
	order = models.PositiveIntegerField(default=0)

	class Meta:
		ordering = ['order', 'id']

	def __str__(self):
		return f"Point for {self.prayer.title}"


class PrayerRequest(TimeStampedModel):
	name = models.CharField(max_length=150)
	email = models.EmailField(blank=True)
	request_text = models.TextField()
	is_prayed_for = models.BooleanField(default=False)

	class Meta:
		ordering = ['-created_at']

	def __str__(self):
		return f"Prayer request by {self.name}"


class HomeSection(TimeStampedModel):
	title = models.CharField(max_length=200, default="Welcome to RCCG")
	description = models.TextField()
	image = models.ImageField(
		upload_to="home/",
		blank=True,
		null=True,
		help_text="Recommended size: 800 x 500 px"
	)
	button_text = models.CharField(max_length=100, blank=True, default="Plan Your Visit")
	button_link = models.CharField(
		max_length=50, 
		blank=True, 
		default="about",
		help_text="The tab to open when clicking the button (e.g., 'about', 'events', 'give')"
	)
	order = models.PositiveIntegerField(default=0)
	is_active = models.BooleanField(default=True)

	class Meta:
		ordering = ["order", "id"]

	def __str__(self):
		return self.title

	def save(self, *args, **kwargs) -> None:
		super().save(*args, **kwargs)
		if self.image and getattr(self.image, "path", None):
			resize_image(self.image.path, (800, 500))


class HomeSectionBullet(TimeStampedModel):
	section = models.ForeignKey(HomeSection, related_name="bullets", on_delete=models.CASCADE)
	text = models.CharField(max_length=250)
	order = models.PositiveIntegerField(default=0)

	class Meta:
		ordering = ["order", "id"]

	def __str__(self):
		return self.text


class OnlineGivingPage(TimeStampedModel):
	"""Singleton model for Online Giving page."""
	title = models.CharField(max_length=200, default="Support Our Mission")
	subtitle = models.TextField(default='"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." — 2 Corinthians 9:7')
	currency_symbol = models.CharField(max_length=10, default="€")

	# Bank details
	bank_account_name = models.CharField(max_length=200, blank=True)
	bank_iban = models.CharField(max_length=50, blank=True)
	bank_bic = models.CharField(max_length=50, blank=True)

	class Meta:
		verbose_name = "Online Giving Page"
		verbose_name_plural = "Online Giving Page"

	def __str__(self):
		return "Online Giving Page Content"

	def save(self, *args, **kwargs) -> None:
		self.pk = 1  # Force singleton
		super().save(*args, **kwargs)


class GivingPurpose(TimeStampedModel):
	page = models.ForeignKey(OnlineGivingPage, related_name="purposes", on_delete=models.CASCADE, null=True, blank=True)
	title = models.CharField(max_length=200)
	description = models.TextField(blank=True)
	icon = models.CharField(max_length=50, blank=True, help_text="Lucide icon name, e.g., Heart, Globe, Building2")
	color = models.CharField(max_length=20, default="blue", choices=[('blue', 'Blue'), ('green', 'Green'), ('orange', 'Orange')])
	order = models.PositiveIntegerField(default=0)

	class Meta:
		ordering = ["order", "id"]

	def __str__(self):
		return self.title


class GivingRecord(TimeStampedModel):
	user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='giving_history')
	first_name = models.CharField(max_length=150, blank=True)
	last_name = models.CharField(max_length=150, blank=True)
	email = models.EmailField(blank=True)
	is_anonymous = models.BooleanField(default=False)
	amount = models.DecimalField(max_digits=10, decimal_places=2)
	currency = models.CharField(max_length=10, default="€")
	purpose = models.CharField(max_length=200)
	reference_code = models.CharField(max_length=50, unique=True)
	status = models.CharField(max_length=50, default="Pending")

	class Meta:
		ordering = ["-created_at"]

	def __str__(self):
		if self.is_anonymous:
			return f"Anonymous - {self.currency}{self.amount} - {self.reference_code}"
		name = f"{self.first_name} {self.last_name}".strip() or (self.user.username if self.user else "Unknown")
		return f"{name} - {self.currency}{self.amount} - {self.reference_code}"


class LiveStreamSettings(TimeStampedModel):
	title = models.CharField(max_length=200, default="Sunday Celebration Service")
	youtube_url = models.URLField(default="https://www.youtube.com/watch?v=4H4mAG6Wc-Y")
	service_day = models.CharField(max_length=20, default="Sunday")
	start_time = models.TimeField(default="10:00:00")
	end_time = models.TimeField(default="12:00:00")
	service_date = models.DateField(null=True, blank=True, help_text="Specific date for the stream. If set, this overrides the recurring service day.")
	is_recurring = models.BooleanField(default=True, help_text="If checked, uses the recurring 'Service Day'. If unchecked, it will use the specific 'Service Date'.")
	timezone = models.CharField(max_length=50, default="Europe/Berlin")

	class Meta:
		verbose_name = "Live Stream Settings"
		verbose_name_plural = "Live Stream Settings"

	def __str__(self):
		return "Live Stream Configuration"

	def save(self, *args, **kwargs) -> None:
		self.pk = 1  # Force singleton
		super().save(*args, **kwargs)


