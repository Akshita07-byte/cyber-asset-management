from rest_framework import viewsets, permissions
from .models import AuditLog
from .serializers import AuditLogSerializer
from users.permissions import IsAdmin

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ReadOnly API for Audit Logs. Restricted to Admin only.
    """
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
