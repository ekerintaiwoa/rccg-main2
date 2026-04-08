from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create a superuser with predefined credentials if one does not already exist'

    def handle(self, *args, **kwargs):
        User = get_user_model()

        username = 'admin'
        email = 'admin@rccglubeck.com'
        password = 'AdminPass123!'

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f"Superuser '{username}' already exists. Skipping creation.")
            )
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(
            self.style.SUCCESS(f"Superuser '{username}' created successfully.")
        )
