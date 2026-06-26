from django.urls import path
from . import views

urlpatterns = [
    path("users/", views.list_users),
    path("users/create/", views.create_user),
    path("health/", views.health),
]
