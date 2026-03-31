from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Create a superuser admin account if one does not already exist'

    def handle(self, *args, **kwargs):
        User = get_user_model()

        username = 'admin'
        email = 'admin@rccglubeck.com'
        password = 'AdminPass123!'

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(
                    f'Superuser "{username}" already exists. Skipping creation.'
                )
            )
        else:
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'Superuser "{username}" created successfully.'
                )
            )
