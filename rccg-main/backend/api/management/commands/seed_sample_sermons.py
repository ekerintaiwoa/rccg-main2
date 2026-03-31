from datetime import datetime

from django.core.management.base import BaseCommand

from api.models import Sermon


SAMPLE_SERMONS = [
    {
        "title": "Love One Another: The Heart of the Gospel",
        "series": "Walking in Light",
        "date": "2023-10-22",
        "speaker": "Pastor John Smith",
        "description": "Exploring the commandment that defines the Christian life and how it transforms our relationships.",
        "duration": "38:42",
        "thumbnail_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
        "video_url": "",
    },
    {
        "title": "Walking in Truth",
        "series": "Walking in Light",
        "date": "2023-10-15",
        "speaker": "Pastor John Smith",
        "description": "What does it mean to walk in the truth of God's Word in a culture that treats truth as relative?",
        "duration": "42:15",
        "thumbnail_url": "https://images.unsplash.com/photo-1490730141103-6ac27d020028?auto=format&fit=crop&w=800&q=80",
        "video_url": "",
    },
    {
        "title": "Finding Rest in the Storm",
        "series": "Psalms of Summer",
        "date": "2023-08-27",
        "speaker": "Dr. Sarah Williams",
        "description": "A study of Psalm 46 and how we can find true stillness and peace when the world around us is in chaos.",
        "duration": "35:10",
        "thumbnail_url": "https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=800&q=80",
        "video_url": "",
    },
    {
        "title": "The Authority of Scripture",
        "series": "Foundation Stones",
        "date": "2023-07-09",
        "speaker": "Pastor John Smith",
        "description": "Why we believe the Bible is the inspired word of God and how it serves as the final authority for our faith.",
        "duration": "45:55",
        "thumbnail_url": "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80",
        "video_url": "",
    },
]


class Command(BaseCommand):
    help = "Seed the database with sample sermons"

    def handle(self, *args, **options):
        created_count = 0
        for data in SAMPLE_SERMONS:
            date_obj = datetime.strptime(data["date"], "%Y-%m-%d").date()
            obj, created = Sermon.objects.get_or_create(
                title=data["title"],
                date=date_obj,
                defaults={
                    "series": data["series"],
                    "speaker": data["speaker"],
                    "description": data["description"],
                    "duration": data["duration"],
                    "thumbnail_url": data["thumbnail_url"],
                    "video_url": data["video_url"],
                },
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded {created_count} sermon(s)."))
