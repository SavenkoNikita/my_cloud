from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from .models import CustomUser
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication, BasicAuthentication


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def register(request):
    print(f"Registration attempt: {request.data}")
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        print(f"User created: {user.username}")
        return Response({'message': 'Пользователь успешно создан'}, status=status.HTTP_201_CREATED)

    print(f"Registration errors: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def login_view(request):
    print(f"Login attempt for user: {request.data.get('username')}")

    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        print(f"Validated: username={username}, password={'*' * len(password)}")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            print(f"User {username} authenticated successfully. Session: {request.session.session_key}")

            return Response({
                'success': True,
                'message': 'Вход выполнен успешно',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'full_name': user.full_name,
                    'is_administrator': user.is_administrator
                }
            })
        else:
            print(f"Authentication FAILED for user: {username}")
            return Response({
                'success': False,
                'error': 'Неверный логин или пароль'
            }, status=status.HTTP_401_UNAUTHORIZED)
    else:
        print(f"Serializer errors: {serializer.errors}")

    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({'message': 'Выход выполнен успешно'})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def user_list(request):
    users = CustomUser.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET', 'DELETE', 'PATCH'])
@permission_classes([IsAdminUser])
def user_detail(request, pk):
    try:
        user = CustomUser.objects.get(pk=pk)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    elif request.method == 'DELETE':
        user.delete()
        return Response({'message': 'Пользователь удален'})
    elif request.method == 'PATCH':
        is_admin = request.data.get('is_administrator')
        if is_admin is not None:
            user.is_administrator = is_admin
            user.save()
            return Response({'message': 'Статус обновлен'})
        return Response({'error': 'Неверные данные'}, status=status.HTTP_400_BAD_REQUEST)
