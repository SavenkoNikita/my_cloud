from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    storage_path = models.CharField(max_length=255, blank=True)
    is_administrator = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.storage_path:
            self.storage_path = f"user_{self.username}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username
