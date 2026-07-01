from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Import ViewSets
from users.views import UserViewSet, UserRegisterView, UserProfileView
from assets.views import (
    AssetViewSet,
    AssetAssignmentViewSet,
    MaintenanceRecordViewSet,
    DashboardStatsView,
    ExportReportView,
    generate_invoice,
)
from vendors.views import VendorViewSet
from audit.views import AuditLogViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user-admin')
router.register(r'assets', AssetViewSet, basename='asset')
router.register(r'assignments', AssetAssignmentViewSet, basename='assignment')
router.register(r'maintenance', MaintenanceRecordViewSet, basename='maintenance')
router.register(r'vendors', VendorViewSet, basename='vendor')
router.register(r'audit', AuditLogViewSet, basename='audit')

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Routes
    path('api/', include(router.urls)),

    # Authentication
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register/', UserRegisterView.as_view(), name='auth_register'),
    path('api/auth/profile/', UserProfileView.as_view(), name='auth_profile'),

    # Dashboard & Reports
    path('api/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('api/reports/export/', ExportReportView.as_view(), name='export_report'),

    # Invoice Generator
    path(
        'api/assets/<int:pk>/invoice/',
        generate_invoice,
        name='generate_invoice'
    ),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)