from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserRegisterSerializer
from .permissions import IsAdmin, IsManagerOrAdmin
from audit.utils import log_action

User = get_user_model()

class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def perform_create(self, serializer):
        user = serializer.save()
        log_action(user, 'CREATE', user, f"Registered new user profile with role: {user.role}")


class UserProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        user = serializer.save()
        log_action(user, 'UPDATE', user, "Updated personal profile settings")


class UserViewSet(viewsets.ModelViewSet):
    """
    User administration API.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated(), IsManagerOrAdmin()]
        return [permissions.IsAuthenticated(), IsAdmin()]

    def perform_update(self, serializer):
        user = serializer.save()
        log_action(self.request.user, 'UPDATE', user, f"Admin updated user {user.username} role to {user.role}")

    def perform_destroy(self, instance):
        username = instance.username
        log_action(self.request.user, 'DELETE', instance, f"Admin deleted user {username}")
        instance.delete()
