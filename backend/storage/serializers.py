import os
from rest_framework import serializers
from .models import UserFile
from django.conf import settings


class FileSerializer(serializers.ModelSerializer):
    original_name = serializers.CharField(read_only=True)
    size = serializers.IntegerField(read_only=True)
    uploaded_at = serializers.DateTimeField(read_only=True)
    last_downloaded_at = serializers.DateTimeField(read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    share_url = serializers.SerializerMethodField()

    class Meta:
        model = UserFile
        fields = ('id', 'user', 'original_name', 'file', 'size', 'uploaded_at',
                  'last_downloaded_at', 'comment', 'share_link', 'share_url')
        read_only_fields = ('share_link',)

    def get_share_url(self, obj):
        request = self.context.get('request')
        if request and obj.share_link:
            return request.build_absolute_uri(f'/api/storage/share/{obj.share_link}/')
        return None

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class FileRenameSerializer(serializers.Serializer):
    new_name = serializers.CharField(max_length=255)
