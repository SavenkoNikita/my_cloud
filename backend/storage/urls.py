from django.urls import path
from . import views

urlpatterns = [
    path('', views.file_list, name='file_list'),
    path('<int:pk>/', views.file_detail, name='file_detail'),
    path('share/<uuid:share_link>/', views.file_share, name='file_share'),
]
