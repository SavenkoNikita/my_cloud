from django.contrib import admin
from .models import UserFile


@admin.register(UserFile)
class UserFileAdmin(admin.ModelAdmin):
    list_display = ('original_name', 'user', 'size', 'uploaded_at', 'last_downloaded_at')
    list_filter = ('user', 'uploaded_at')
    search_fields = ('original_name', 'user__username')
    readonly_fields = ('size', 'uploaded_at', 'last_downloaded_at', 'share_link')
    fieldsets = (
        (None, {
            'fields': ('user', 'original_name', 'file', 'comment')
        }),
        ('Дополнительная информация', {
            'fields': ('size', 'uploaded_at', 'last_downloaded_at', 'share_link', 'file_path'),
            'classes': ('collapse',)
        }),
    )
