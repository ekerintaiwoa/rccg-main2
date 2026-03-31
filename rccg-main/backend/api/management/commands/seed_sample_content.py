from datetime import datetime, date

from django.core.management.base import BaseCommand

from api.models import Event, Sermon, Slide, BlogPost, Devotional


SAMPLE_EVENTS = [
    {
        "title": "Sunday Worship Service",
        "date": "2026-10-15",
        "time": "9:00 AM & 11:00 AM",
        "description": "Join us in the Main Sanctuary or online for a time of worship, prayer, and teaching.",
        "category": "worship",
        "image_url": "https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=800&q=80",
    },
    {
        "title": "Ignite Youth Service",
        "date": "2026-10-18",
        "time": "6:30 PM - 8:30 PM",
        "description": "High School and Middle School students gathering for fellowship and worship.",
        "category": "youth",
        "image_url": "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80",
    },
    {
        "title": "Adult Small Groups",
        "date": "2026-10-19",
        "time": "7:00 PM - Various locations",
        "description": "Deeper dive into the Sunday sermon in a small community setting.",
        "category": "groups",
        "image_url": "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
    },
]


SAMPLE_SLIDES = [
    {
        "title": "2026: Our Year of Dominion",
        "subtitle": "Genesis 1:26",
        "description": "Step into a year of authority, purpose, and God-given dominion.",
        "image_url": "https://images.unsplash.com/photo-1490730141103-6ac27d020028?auto=format&fit=crop&w=1600&q=80",
        "cta_primary": "Plan Your Visit",
        "cta_secondary": "Watch Live",
        "order": 1,
    },
    {
        "title": "A Home for Every Nation",
        "subtitle": "RCCG House of Glory",
        "description": "No matter your background, there is a place for you here.",
        "image_url": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1600&q=80",
        "cta_primary": "I'm New",
        "cta_secondary": "View Events",
        "order": 2,
    },
]


SAMPLE_BLOG_POSTS = [
    {
        "title": "Walking in Dominion in 2026",
        "slug": "walking-in-dominion-2026",
        "excerpt": "Discover practical ways to live in the fullness of the dominion Christ has given you.",
        "content": "This is a sample blog post about walking in dominion. You can replace this with real content.",
        "author": "Pastor John Doe",
    },
    {
        "title": "The Power of a Praying Church",
        "slug": "the-power-of-a-praying-church",
        "excerpt": "How a praying church shapes communities, nations, and generations.",
        "content": "Sample content for a post on corporate prayer and intercession.",
        "author": "Prayer Team",
    },
    {
        "title": "Raising Godly Children in a Digital Age",
        "slug": "raising-godly-children-in-a-digital-age",
        "excerpt": "Biblical principles and practical tools for parents raising children in an increasingly digital world.",
        "content": (
            "In every generation, God entrusts children to parents, guardians, and the wider church family. "
            "Raising godly children in a noisy and distracted digital world is not an accident; it is the result "
            "of intentional prayer, consistent example, and Spirit-led conversations at home. "
            "Our goal is not to shield children from every challenge, but to equip them to shine as light wherever "
            "God sends them.\n\n"
            "One of the practical ways we can disciple our children is by bringing Scripture into everyday life. "
            "Read the Bible together at the dinner table, talk about what they watched online, and gently point their "
            "hearts back to Jesus. Ask questions like, 'What do you think God says about this?' or 'How can we respond "
            "in a way that honors Christ?' These simple questions open doors for the Holy Spirit to work deeply in "
            "their hearts.\n\n"
            "Finally, remember that parents are not alone. God has given us the local church community, trusted mentors, "
            "and other families who are on the same journey. As we worship together, serve together, and pray together, "
            "our children see a living picture of the kingdom of God. Even in a digital age, the grace of God is more "
            "than enough to help us raise sons and daughters who love Jesus, love His Word, and carry His presence into "
            "their schools, workplaces, and future homes."
        ),
        "author": "Family Life Ministry",
    },
]


SAMPLE_DEVOTIONALS = [
    {
        "date": date(2026, 3, 23),
        "title": "Living in Daily Dominion",
        "scripture": "Genesis 1:26",
        "content": "This is sample content for the Open Heaven devotional for today.",
        "prayer": "Lord, help me walk in the dominion you have given me today.",
    },
    {
        "date": date(2026, 3, 22),
        "title": "Trusting God in Uncertain Times",
        "scripture": "Proverbs 3:5-6",
        "content": "Sample devotional content about trusting God.",
        "prayer": "Father, I choose to trust you with all my heart.",
    },
]


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
]


class Command(BaseCommand):
    help = "Seed the database with sample content: events, sermons, slides, blog posts, devotionals"

    def handle(self, *args, **options):
        events_created = 0
        for data in SAMPLE_EVENTS:
            event_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
            _, created = Event.objects.get_or_create(
                title=data["title"],
                date=event_date,
                defaults={
                    "time": data["time"],
                    "description": data["description"],
                    "category": data["category"],
                    "image_url": data["image_url"],
                },
            )
            if created:
                events_created += 1

        sermons_created = 0
        for data in SAMPLE_SERMONS:
            sermon_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
            _, created = Sermon.objects.get_or_create(
                title=data["title"],
                date=sermon_date,
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
                sermons_created += 1

        slides_created = 0
        for idx, data in enumerate(SAMPLE_SLIDES, start=1):
            _, created = Slide.objects.get_or_create(
                title=data["title"],
                defaults={
                    "subtitle": data["subtitle"],
                    "description": data["description"],
                    "image_url": data["image_url"],
                    "cta_primary": data["cta_primary"],
                    "cta_secondary": data["cta_secondary"],
                    "order": data.get("order", idx),
                    "is_active": True,
                },
            )
            if created:
                slides_created += 1

        blogs_created = 0
        now = datetime.now()
        for data in SAMPLE_BLOG_POSTS:
            _, created = BlogPost.objects.get_or_create(
                slug=data["slug"],
                defaults={
                    "title": data["title"],
                    "excerpt": data["excerpt"],
                    "content": data["content"],
                    "author": data["author"],
                    "published": True,
                    "published_at": now,
                },
            )
            if created:
                blogs_created += 1

        devos_created = 0
        for data in SAMPLE_DEVOTIONALS:
            _, created = Devotional.objects.get_or_create(
                date=data["date"],
                defaults={
                    "title": data["title"],
                    "scripture": data["scripture"],
                    "content": data["content"],
                    "prayer": data["prayer"],
                    "is_published": True,
                },
            )
            if created:
                devos_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded: {events_created} event(s), {sermons_created} sermon(s), {slides_created} slide(s), {blogs_created} blog post(s), {devos_created} devotional(s)."
            )
        )
