import csv
from django.http import HttpResponse
from rest_framework import viewsets, permissions, status, decorators, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import models
from .models import Asset, AssetAssignment, MaintenanceRecord
from .serializers import AssetSerializer, AssetAssignmentSerializer, MaintenanceRecordSerializer
from users.permissions import ReadOnlyOrAdminManager
from audit.utils import log_action
from audit.models import AuditLog
from audit.serializers import AuditLogSerializer
from rest_framework.renderers import TemplateHTMLRenderer , JSONRenderer


from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny

class AssetViewSet(viewsets.ModelViewSet):
    renderer_classes = [TemplateHTMLRenderer , JSONRenderer]
    template_name = "assets/asset_details.html"
    queryset = Asset.objects.all().order_by('-created_at')
    serializer_class = AssetSerializer
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser, JSONParser)
   

    def retrieve(self, request, *args, **kwargs):
       asset = self.get_object()
       return Response(
        {"asset": asset},
        template_name="assets/asset_details.html"
    )

    def get_queryset(self):
        queryset = Asset.objects.all().order_by('-created_at')
        
        # Advanced Search & Filter
        search = self.request.query_params.get('search', None)
        category = self.request.query_params.get('category', None)
        status = self.request.query_params.get('status', None)
        vendor = self.request.query_params.get('vendor', None)

        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) |
                models.Q(serial_number__icontains=search) |
                models.Q(model__icontains=search)
            )
        if category:
            queryset = queryset.filter(category=category)
        if status:
            queryset = queryset.filter(status=status)
        if vendor:
            queryset = queryset.filter(vendor_id=vendor)
            
        return queryset

    def perform_create(self, serializer):
        asset = serializer.save()
        log_action(self.request.user, 'CREATE', asset, f"Added asset: {asset.name} (S/N: {asset.serial_number})")

    def perform_update(self, serializer):
        asset = serializer.save()
        log_action(self.request.user, 'UPDATE', asset, f"Updated asset: {asset.name}")

    def perform_destroy(self, instance):
        name = instance.name
        sn = instance.serial_number
        log_action(self.request.user, 'DELETE', instance, f"Deleted asset: {name} (S/N: {sn})")
        instance.delete()


class AssetAssignmentViewSet(viewsets.ModelViewSet):
    queryset = AssetAssignment.objects.all().order_by('-assigned_date')
    serializer_class = AssetAssignmentSerializer
    permission_classes = [ReadOnlyOrAdminManager]

    def get_queryset(self):
        user = self.request.user
        # Employees can only view their own assignments
        if user.role == 'Employee':
            return AssetAssignment.objects.filter(assigned_to=user).order_by('-assigned_date')
        
        queryset = AssetAssignment.objects.all().order_by('-assigned_date')
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    def perform_create(self, serializer):
        # Assign the asset
        asset = serializer.validated_data['asset']
        if asset.status != 'Available':
            raise serializers.ValidationError({"asset": "This asset is not available for assignment."})

        assignment = serializer.save(assigned_by=self.request.user, status='Active')
        
        # Update Asset Status to Assigned
        asset.status = 'Assigned'
        asset.save()

        log_action(
            self.request.user, 
            'ASSIGN', 
            assignment, 
            f"Assigned asset '{asset.name}' to user '{assignment.assigned_to.username}' until {assignment.due_date}"
        )
        
        # Log asset update as well
        log_action(self.request.user, 'UPDATE', asset, f"Asset status updated to 'Assigned'")

    @decorators.action(detail=True, methods=['post'], permission_classes=[ReadOnlyOrAdminManager])
    def return_asset(self, request, pk=None):
        assignment = self.get_object()
        if assignment.status == 'Returned':
            return Response({"detail": "Asset has already been returned."}, status=status.HTTP_400_BAD_REQUEST)

        assignment.status = 'Returned'
        assignment.return_date = timezone.now().date()
        assignment.save()

        # Update Asset Status back to Available
        asset = assignment.asset
        asset.status = 'Available'
        asset.save()

        log_action(
            request.user, 
            'RETURN', 
            assignment, 
            f"Returned asset '{asset.name}' from user '{assignment.assigned_to.username}'"
        )
        log_action(request.user, 'UPDATE', asset, f"Asset status updated to 'Available'")

        return Response(AssetAssignmentSerializer(assignment).data)


class MaintenanceRecordViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRecord.objects.all().order_by('-scheduled_date')
    serializer_class = MaintenanceRecordSerializer
    
    def get_permissions(self):
        # Employees can schedule maintenance requests, but only Managers/Admins can write/update general records.
        if self.action in ['create', 'list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [ReadOnlyOrAdminManager()]

    def get_queryset(self):
        user = self.request.user
        # Employees can only view maintenance records for assets assigned to them, or records they requested
        if user.role == 'Employee':
            return MaintenanceRecord.objects.filter(asset__assignments__assigned_to=user).distinct().order_by('-scheduled_date')
        
        queryset = MaintenanceRecord.objects.all().order_by('-scheduled_date')
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        return queryset

    def perform_create(self, serializer):
        asset = serializer.validated_data['asset']
        record = serializer.save()

        # Update Asset Status to Maintenance if the record starts scheduled or in-progress
        if record.status in ['Scheduled', 'In Progress']:
            asset.status = 'Maintenance'
            asset.save()
            log_action(self.request.user, 'UPDATE', asset, "Asset status updated to 'Maintenance'")

        log_action(
            self.request.user, 
            'MAINTENANCE_START', 
            record, 
            f"Scheduled maintenance for asset '{asset.name}' (S/N: {asset.serial_number}) on {record.scheduled_date}"
        )

    def perform_update(self, serializer):
        old_record = self.get_object()
        record = serializer.save()
        asset = record.asset

        # If maintenance is now Completed or Cancelled, restore asset status to Available
        if record.status in ['Completed', 'Cancelled'] and old_record.status not in ['Completed', 'Cancelled']:
            asset.status = 'Available'
            asset.save()
            log_action(self.request.user, 'UPDATE', asset, "Asset status updated to 'Available'")
            
            action_type = 'MAINTENANCE_END'
            log_action(
                self.request.user, 
                action_type, 
                record, 
                f"Completed maintenance for asset '{asset.name}' with cost: ${record.cost}"
            )
        else:
            log_action(
                self.request.user, 
                'UPDATE', 
                record, 
                f"Updated maintenance details for asset '{asset.name}'"
            )


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        
        # KPIs
        total_assets = Asset.objects.count()
        assigned_assets = Asset.objects.filter(status='Assigned').count()
        maintenance_assets = Asset.objects.filter(status='Maintenance').count()
        expired_warranties = Asset.objects.filter(warranty_expiry__lt=today).count()
        total_value = Asset.objects.aggregate(total=models.Sum('price'))['total'] or 0
        
        # Category Breakdown
        category_breakdown = Asset.objects.values('category').annotate(count=models.Count('id'))
        
        # Status Breakdown
        status_breakdown = Asset.objects.values('status').annotate(count=models.Count('id'))
        
        # Recent Maintenance Costs
        maintenance_costs = MaintenanceRecord.objects.filter(status='Completed').values('asset__category').annotate(total_cost=models.Sum('cost'))
        
        # Monthly Maintenance Cost Trend (last 6 months)
        monthly_trend = []
        six_months_ago = today - timezone.timedelta(days=180)
        monthly_data = MaintenanceRecord.objects.filter(
            scheduled_date__gte=six_months_ago
        ).values('scheduled_date__month').annotate(total=models.Sum('cost'), count=models.Count('id')).order_by('scheduled_date__month')
        
        # Resolve month names
        month_names = {1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 
                       7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'}
        for item in monthly_data:
            monthly_trend.append({
                'month': month_names.get(item['scheduled_date__month'], str(item['scheduled_date__month'])),
                'cost': float(item['total'] or 0),
                'count': item['count']
            })

        # Recent activities
        if request.user.role == 'Admin':
            recent_logs = AuditLog.objects.all()[:10]
        else:
            recent_logs = AuditLog.objects.filter(user=request.user)[:10]
        recent_activities = AuditLogSerializer(recent_logs, many=True).data

        return Response({
            'kpis': {
                'total_assets': total_assets,
                'assigned_assets': assigned_assets,
                'maintenance_assets': maintenance_assets,
                'expired_warranties': expired_warranties,
                'total_value': float(total_value),
            },
            'categories': list(category_breakdown),
            'status': list(status_breakdown),
            'maintenance_costs': list(maintenance_costs),
            'monthly_trend': monthly_trend,
            'recent_activities': recent_activities
        })


class ExportReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, ReadOnlyOrAdminManager]

    def get(self, request):
        report_type = request.query_params.get('type', 'assets')
        
        if report_type == 'assets':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="assets_report.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Serial Number', 'Name', 'Category', 'Model', 'Status', 'Purchase Date', 'Price', 'Warranty Expiry', 'Vendor'])
            
            for asset in Asset.objects.all().select_related('vendor'):
                writer.writerow([
                    asset.serial_number,
                    asset.name,
                    asset.category,
                    asset.model or '',
                    asset.status,
                    asset.purchase_date,
                    asset.price,
                    asset.warranty_expiry or '',
                    asset.vendor.name if asset.vendor else ''
                ])
            return response
            
        elif report_type == 'maintenance':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="maintenance_report.csv"'
            
            writer = csv.writer(response)
            writer.writerow(['Asset Name', 'Asset S/N', 'Description', 'Cost', 'Scheduled Date', 'Completed Date', 'Status', 'Performed By'])
            
            for record in MaintenanceRecord.objects.all().select_related('asset'):
                writer.writerow([
                    record.asset.name,
                    record.asset.serial_number,
                    record.description,
                    record.cost,
                    record.scheduled_date,
                    record.completed_date or '',
                    record.status,
                    record.performed_by or ''
                ])
            return response
            
        return Response({"detail": "Invalid report type."}, status=status.HTTP_400_BAD_REQUEST)
