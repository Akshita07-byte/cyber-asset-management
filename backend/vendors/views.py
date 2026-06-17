from rest_framework import viewsets
from .models import Vendor
from .serializers import VendorSerializer
from users.permissions import ReadOnlyOrAdminManager
from audit.utils import log_action

class VendorViewSet(viewsets.ModelViewSet):
    queryset = Vendor.objects.all().order_by('-created_at')
    serializer_class = VendorSerializer
    permission_classes = [ReadOnlyOrAdminManager]

    def perform_create(self, serializer):
        vendor = serializer.save()
        log_action(self.request.user, 'CREATE', vendor, f"Registered new vendor: {vendor.name}")

    def perform_update(self, serializer):
        vendor = serializer.save()
        log_action(self.request.user, 'UPDATE', vendor, f"Updated vendor details for {vendor.name}")

    def perform_destroy(self, instance):
        name = instance.name
        log_action(self.request.user, 'DELETE', instance, f"Deleted vendor: {name}")
        instance.delete()
