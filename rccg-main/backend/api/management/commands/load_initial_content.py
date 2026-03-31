import datetime
from django.core.management.base import BaseCommand
from api.models import (
    AboutPage, AboutMandate, AboutFaith,
    TeamMember, ContactPage, Devotional,
    Book, AudioFile, WeeklyQuiz, QuizQuestion, QuizOption, BookQuestion,
    GalleryImage
)

class Command(BaseCommand):
    help = 'Load initial content from hardcoded frontend values'

    def handle(self, *args, **kwargs):
        self.stdout.write("Loading About Page...")
        about, _ = AboutPage.objects.get_or_create(
            pk=1,
            defaults={
                'hero_title': "Our Journey",
                'hero_subtitle': "The Redeemed Christian Church of God is a worldwide community of believers dedicated to holiness, prayer, and spreading the Gospel of Jesus Christ to every nation.",
                'history_title': "RCCG History",
                'history_content': "In July 1909, a man named Pa Akindayomi was born in Nigeria. Despite growing up among idol worshippers, he sought a greater power and eventually found his way to Christianity. He joined the Cherubim and Seraphim church but heard a divine calling to serve. After years of struggles, he surrendered to God’s will and founded the Glory of God Fellowship in 1952, which later became the Redeemed Christian Church of God (RCCG).\n\nPa Akindayomi received a vision from God, leading to the establishment of RCCG with a covenant of divine provision. In the early 1970s, God revealed to him that Enoch Adejare Adeboye, a university lecturer, would be his successor. Pastor Adeboye joined RCCG in 1973, became a pastor in 1975, and received guidance from Pa Akindayomi.\n\nWhen Pa Akindayomi passed away at the age of 71, Pastor Adeboye became his successor as per God’s plan. Since 1981, RCCG has experienced significant growth, with thousands of parishes in Nigeria and a presence in other African countries, Europe, the United States, and the Caribbean. Today, RCCG continues to spread the message of Christianity worldwide.",
                'mandate_title': "Global Mandate",
                'mandate_subtitle': "Our vision and mission for the world.",
                'mandate_conclusion': "To accomplish No. 1 above, holiness will be our lifestyle.\n\nTo accomplish No. 2 & 3 above, we will plant churches within five (5) minutes of walking distance in every city and town of developing countries and within five (5) minutes of driving distance in every city and town of developed countries. We will pursue these objectives until every Nation in the world is reached for Jesus Christ our Lord.",
                'beliefs_title': "Core Beliefs",
                'beliefs_content': "The Redeemed Christian Church of God (RCCG) affirms its belief in the Holy Bible as the infallible and authoritative word of God given to guide all men and women to salvation.\n\nOur doctrines and liturgy, therefore, derive from the Holy Bible. As a Christian organization, all we do is underpinned by prayer, even as we seek spiritual intervention and guidance for every decision taken in furtherance of our objectives.\n\nWe are open to the general public in the quest to reach our world and communities with the Christian message of salvation informed by God’s unconditional love for all persons.\n\nWherever we operate, our steadfast commitment is towards upholding our communities, beginning with the family unit which forms the core of society. In this regard, we ensure that every precaution is taken to care for, nurture, and protect children in our care in order to forestall any emotional, physical, or spiritual abuse.\n\nFurthermore, we encourage families to stay together in order to build a healthy society. Hence, we provide pastoral care and guidance to our members with the objectives of promoting Christ-likeness and the upholding of family life.",
                'beliefs_quote': "We do not condone, encourage, or engage in any form of physical, emotional, or psychological abuse. We believe that children are the heritage of the Lord (Psalm 127:3) and that if one trains up a child in the way he/she should go when they are old, they will not depart from it (Proverbs 22:6).",
                'faith_title': "Statement of Faith",
                'faith_subtitle': "What we believe and stand for."
            }
        )

        if not about.mandates.exists():
            AboutMandate.objects.create(about_page=about, title="To Make Heaven", description="Our primary goal is to spend eternity with God.", order=1)
            AboutMandate.objects.create(about_page=about, title="Take Many With Us", description="To take as many people as possible with us to heaven.", order=2)
            AboutMandate.objects.create(about_page=about, title="Every Family", description="To have a member of RCCG in every family of every Nation.", order=3)

        if not about.faiths.exists():
            faiths = [
                ("God the Father", "Creator of heaven and earth, who made man in His own image and likeness."),
                ("The Holy Trinity", "The three persons of the Godhead: God the Father, God the Son, and God the Holy Spirit - Three-in-One."),
                ("The Virgin Birth", "Jesus was conceived by the Holy Spirit and born of the Virgin Mary."),
                ("Death & Resurrection", "Jesus was crucified and died for the sins of mankind, was buried, and rose from the dead on the third day."),
                ("The Holy Spirit", "The Comforter and Teacher of all things, who dwells within us, uniting us to Jesus Christ."),
                ("Baptism of Holy Spirit", "Freely available to all who believe, manifested by the gift of speaking in unknown tongues."),
                ("Salvation", "A gift from God through grace and faith in Jesus Christ; that all who believe in Him may be saved."),
                ("The Blood of Jesus", "Shed for us on the Cross at Calvary, cleanses us from all sin, and grants us access to God."),
                ("Second Coming", "Jesus will come again in glory, the dead in Christ will rise, and we will be translated into His presence."),
                ("The Holy Bible", "The infallible and authoritative word of God given to direct all men and women to salvation.")
            ]
            for i, (f_title, f_desc) in enumerate(faiths, 1):
                AboutFaith.objects.create(about_page=about, title=f_title, description=f_desc, order=i)

        self.stdout.write("Loading Team Members...")
        team = [
            {"name": "Rev. David Johnson", "role": "Lead Pastor", "description": "David has been leading our community for 12 years with a heart for teaching and community outreach."},
            {"name": "Pastor Sarah Chen", "role": "Associate Pastor", "description": "Sarah oversees our small groups and discipleship programs. She is passionate about mentoring the next generation."},
            {"name": "Marcus Thompson", "role": "Worship Director", "description": "Marcus leads our music ministry with excellence. His goal is to create space for connection through worship."}
        ]
        for i, t in enumerate(team, 1):
            TeamMember.objects.get_or_create(name=t["name"], defaults={
                'role': t["role"],
                'description': t["description"],
                'order': i
            })

        self.stdout.write("Loading Contact Page...")
        ContactPage.objects.get_or_create(
            pk=1,
            defaults={
                'title': "Contact Us",
                'subtitle': "We would love to hear from you. Whether you have a question, a prayer request, or a testimony, send us a message and our team will respond as soon as possible.",
                'service_times': "Sunday Celebration Service – 10:00 AM\nMidweek Bible Study – Wednesday 6:30 PM",
                'address': "RCCG House of Glory Lübeck\n(Add your church address here)",
                'phone': "+49 (0) 000 0000000",
                'email': "info@rccg-houseofglory.de",
            }
        )

        self.stdout.write("Loading Devotional Sample...")
        today = datetime.date.today()
        Devotional.objects.get_or_create(
            date=today,
            defaults={
                'title': "The Power of Grace",
                'scripture': "Ephesians 2:8-9",
                'content': "For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God—not by works, so that no one can boast.\n\nToday, remember that God's grace is sufficient for everything you need. You don't have to earn His love; it is freely given.",
                'prayer': "Lord, thank You for Your endless grace. Help me to rest in Your unconditional love today.",
                'is_published': True
            }
        )

        
        self._load_library_content()
        self._load_gallery_content()

        self.stdout.write(self.style.SUCCESS('Successfully loaded initial content.'))

    def _load_library_content(self):
        self.stdout.write("Loading initial Library content...")

        book, _ = Book.objects.get_or_create(
            title="Living a Life of Purpose",
            author="Pastor E.A. Adeboye",
            defaults={
                "description": "Discover the true reason for your existence and how to align with God's perfect will for your life.",
                "is_book_of_the_week": True
            }
        )
        
        # Add a reflection question for the book
        if not BookQuestion.objects.filter(book=book).exists():
            BookQuestion.objects.create(
                book=book,
                question_text="What is the most profound challenge you face in discovering your purpose?"
            )

        AudioFile.objects.get_or_create(
            title="The Power of Prayer",
            speaker="Pastor E.A. Adeboye",
            defaults={
                "description": "A deep dive into building an effective prayer life."
            }
        )

        quiz, created = WeeklyQuiz.objects.get_or_create(
            title="Faith Foundations Quiz",
            defaults={
                "description": "Test your knowledge on the fundamental principles of faith as taught this week.",
                "is_active": True
            }
        )

        if created:
            q1 = QuizQuestion.objects.create(quiz=quiz, question_text="What is faith according to Hebrews 11:1?", order=1)
            QuizOption.objects.create(question=q1, option_text="Believing in yourself", is_correct=False)
            QuizOption.objects.create(question=q1, option_text="The substance of things hoped for, the evidence of things not seen", is_correct=True)
            QuizOption.objects.create(question=q1, option_text="Positive thinking", is_correct=False)

    def _load_gallery_content(self):
        self.stdout.write("Loading initial Gallery content...")
        GalleryImage.objects.get_or_create(
            title="Sunday Worship Service",
            defaults={
                "description": "A glorious time of worship and praise in the presence of God.",
            }
        )
        GalleryImage.objects.get_or_create(
            title="Youth Sunday",
            defaults={
                "description": "Our vibrant youths leading the congregation in a powerful ministration.",
            }
        )
        GalleryImage.objects.get_or_create(
            title="Community Outreach",
            defaults={
                "description": "Reaching out to our local community with the love of Christ.",
            }
        )
