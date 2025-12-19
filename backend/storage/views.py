import os
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse
from django.utils.text import get_valid_filename
from django.utils import timezone
from .models import UserFile
from .serializers import FileSerializer, FileRenameSerializer
from users.models import CustomUser
from rest_framework.permissions import AllowAny


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def file_list(request):
    if request.method == 'GET':
        if request.user.is_administrator:
            user_id = request.query_params.get('user_id')
            if user_id:
                files = UserFile.objects.filter(user_id=user_id)
            else:
                files = UserFile.objects.all()
        else:
            files = UserFile.objects.filter(user=request.user)

        serializer = FileSerializer(files, many=True, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = FileSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'DELETE', 'PATCH'])
@permission_classes([IsAuthenticated])
def file_detail(request, pk):
    try:
        file = UserFile.objects.get(pk=pk)
    except UserFile.DoesNotExist:
        return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)

    if not request.user.is_administrator and file.user != request.user:
        return Response({'error': 'Нет прав доступа'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        file.last_downloaded_at = timezone.now()
        file.save()

        response = FileResponse(file.file.open('rb'))
        response['Content-Disposition'] = f'attachment; filename="{get_valid_filename(file.original_name)}"'
        return response

    elif request.method == 'DELETE':
        file_path = file.file.path
        if os.path.exists(file_path):
            os.remove(file_path)
        file.delete()
        return Response({'message': 'Файл удален'})

    elif request.method == 'PATCH':
        if 'comment' in request.data:
            file.comment = request.data['comment']
            file.save()
            return Response({'message': 'Комментарий обновлен'})

        if 'new_name' in request.data:
            return Response({'message': 'Функция переименования в разработке'})


@api_view(['GET'])
@permission_classes([AllowAny])
def file_share(request, share_link):
    try:
        file = UserFile.objects.get(share_link=share_link)
    except UserFile.DoesNotExist:
        return Response({'error': 'Файл не найден'}, status=status.HTTP_404_NOT_FOUND)

    file.last_downloaded_at = timezone.now()
    file.save()

    response = FileResponse(file.file.open('rb'))
    response['Content-Disposition'] = f'attachment; filename="{get_valid_filename(file.original_name)}"'
    return response
