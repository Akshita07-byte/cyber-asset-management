from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Asset, AssetAssignment, MaintenanceRecord
from vendors.serializers import VendorSerializer

User = get_user_model()

class AssetSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)

    class Meta:
        model = Asset
        fields = '__all__'
        read_only_fields = ('qr_code',)


class AssetAssignmentSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_serial = serializers.CharField(source='asset.serial_number', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    assigned_by_username = serializers.CharField(source='assigned_by.username', read_only=True)

    class Meta:
        model = AssetAssignment
        fields = '__all__'
        read_only_fields = ('assigned_by', 'assigned_date')


class MaintenanceRecordSerializer(serializers.ModelSerializer):
    asset_name = serializers.CharField(source='asset.name', read_only=True)
    asset_serial = serializers.CharField(source='asset.serial_number', read_only=True)

    class Meta:
        model = MaintenanceRecord
        fields = '__all__'
