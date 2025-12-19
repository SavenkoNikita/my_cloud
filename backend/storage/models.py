import os
import uuid
from django.db import models
from django.conf import settings


def user_directory_path(instance, filename):
    return f"{instance.user.storage_path}/{uuid.uuid4()}_{filename}"


class UserFile(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='files')
    original_name = models.CharField(max_length=255)
    file = models.FileField(upload_to=user_directory_path)
    size = models.BigIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    last_downloaded_at = models.DateTimeField(null=True, blank=True)
    comment = models.TextField(blank=True)
    share_link = models.UUIDField(default=uuid.uuid4, unique=True)
    file_path = models.CharField(max_length=500, blank=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.original_name} ({self.user.username})"

    def save(self, *args, **kwargs):
        if not self.pk and self.file:
            self.original_name = os.path.basename(self.file.name)
            self.size = self.file.size
        super().save(*args, **kwargs)
