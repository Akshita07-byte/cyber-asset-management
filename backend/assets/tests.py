from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from assets.models import Asset
from vendors.models import Vendor

User = get_user_model()

class AssetAccessControlTests(APITestCase):
    def setUp(self):
        self.assets_list_url = '/api/assets/'
        
        # Create roles
        self.admin = User.objects.create_user(
            username='adminuser',
            password='password123',
            role='Admin'
        )
        self.employee = User.objects.create_user(
            username='employeeuser',
            password='password123',
            role='Employee'
        )

        # Create vendor
        self.vendor = Vendor.objects.create(name='Test Vendor')

    def test_employee_cannot_create_asset(self):
        """
        Verify that employees receive 403 Forbidden when attempting to create assets.
        """
        # Log in as employee
        token_response = self.client.post('/api/auth/token/', {
            'username': 'employeeuser',
            'password': 'password123'
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_response.data['access']}")
        
        # Post asset
        data = {
            'serial_number': 'TEST-SN-1122',
            'name': 'Test PC',
            'category': 'Computing',
            'price': 1000.00,
            'purchase_date': '2026-06-01',
            'status': 'Available'
        }
        response = self.client.post(self.assets_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_asset(self):
        """
        Verify that admins can successfully create assets.
        """
        # Log in as admin
        token_response = self.client.post('/api/auth/token/', {
            'username': 'adminuser',
            'password': 'password123'
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_response.data['access']}")
        
        # Post asset
        data = {
            'serial_number': 'TEST-SN-1122',
            'name': 'Test PC',
            'category': 'Computing',
            'price': 1000.00,
            'purchase_date': '2026-06-01',
            'status': 'Available'
        }
        response = self.client.post(self.assets_list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Asset.objects.filter(serial_number='TEST-SN-1122').exists())
