from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

class UserAuthenticationTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth_register')
        self.token_url = reverse('token_obtain_pair')
        self.profile_url = reverse('auth_profile')
        
        # Create user
        self.username = 'testemployee'
        self.password = 'testpassword123'
        self.user = User.objects.create_user(
            username=self.username,
            email='employee@test.com',
            password=self.password,
            role='Employee'
        )

    def test_user_registration(self):
        """
        Verify that new users can register through the registration endpoint.
        """
        data = {
            'username': 'newuser',
            'password': 'newpassword123',
            'email': 'newuser@test.com',
            'first_name': 'New',
            'last_name': 'User',
            'role': 'Employee',
            'phone_number': '+12345',
            'department': 'Testing'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_jwt_token_obtain(self):
        """
        Verify that users receive JWT tokens upon login.
        """
        data = {
            'username': self.username,
            'password': self.password
        }
        response = self.client.post(self.token_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_profile_access_with_jwt(self):
        """
        Verify profile endpoint is accessible with token and returns correct role.
        """
        # Obtain token
        token_response = self.client.post(self.token_url, {
            'username': self.username,
            'password': self.password
        }, format='json')
        access_token = token_response.data['access']
        
        # Access profile
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'Employee')
        self.assertEqual(response.data['username'], self.username)
