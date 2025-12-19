from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser
import re


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = CustomUser
        fields = ('username', 'password', 'email', 'full_name')

    def validate_username(self, value):
        if not value[0].isalpha():
            raise serializers.ValidationError("Логин должен начинаться с буквы")
        if not value.isalnum():
            raise serializers.ValidationError("Логин должен содержать только латинские буквы и цифры")
        if len(value) < 4 or len(value) > 20:
            raise serializers.ValidationError("Логин должен быть от 4 до 20 символов")
        return value

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Пароль должен быть не менее 6 символов")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы одну заглавную букву")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы одну цифру")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Пароль должен содержать хотя бы один специальный символ")
        return value

    def validate_email(self, value):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            raise serializers.ValidationError("Неверный формат email")
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            password=validated_data['password']
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class UserSerializer(serializers.ModelSerializer):
    files_count = serializers.SerializerMethodField()
    total_size = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'full_name', 'is_administrator', 'files_count', 'total_size')

    def get_files_count(self, obj):
        return obj.files.count()

    def get_total_size(self, obj):
        return sum(file.size for file in obj.files.all())
