from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'full_name', 'is_administrator', 'is_staff', 'is_superuser', 'is_active')
    list_filter = ('is_administrator', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'email', 'full_name')
    ordering = ('username',)

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('full_name', 'email', 'storage_path')}),
        ('Permissions', {
            'fields': ('is_administrator', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'full_name', 'password1', 'password2',
                       'is_administrator', 'is_staff', 'is_active', 'is_superuser'),
        }),
    )
