from django.db import models
from django.conf import settings
from vendors.models import Vendor

import qrcode 
from io import BytesIO 
from django.core.files.base import ContentFile
from PIL import Image

class Asset(models.Model):
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Assigned', 'Assigned'),
        ('Maintenance', 'Maintenance'),
        ('Retired', 'Retired'),
    ]
    
    CATEGORY_CHOICES = [
        ('Computing', 'Computing Devices'),
        ('Network', 'Network Equipment'),
        ('Software', 'Software & Licenses'),
        ('Mobile', 'Mobile Devices'),
        ('Furniture', 'Office Furniture'),
        ('Other', 'Other Assets'),
    ]

    serial_number = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Computing')
    model = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    purchase_date = models.DateField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    warranty_expiry = models.DateField(blank=True, null=True)
    vendor = models.ForeignKey(Vendor, on_delete=models.SET_NULL, null=True, blank=True, related_name='assets')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Invoice Management Fields
    invoice_number = models.CharField(max_length=100, blank=True, null=True)
    invoice_date = models.DateField(blank=True, null=True)
    gst = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    invoice_file = models.FileField(upload_to='invoices/', blank=True, null=True)
  
    
    # QR Code Field
    qr_code = models.FileField(upload_to='qrcodes/', blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.serial_number}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new or not self.qr_code:
            import qrcode
            from io import BytesIO
            from django.core.files.base import ContentFile
            
            # Generate QR Code pointing to Asset Details URL
            frontend_base = "https://cyber-asset-management-mhjb.vercel.app"
            details_url =  f"https://cyber-asset-management-5.onrender.com/api/assets/{self.pk}/"
            
            qr = qrcode.QRCode(
                version=1,
                box_size=10,
                border=4
            )
            qr.add_data(details_url)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            
            # Save to model
            file_name = f"qr_{self.serial_number}.png"
            self.qr_code.save(file_name, ContentFile(buffer.getvalue()), save=False)
            super().save(update_fields=['qr_code'])


class AssetAssignment(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Returned', 'Returned'),
        ('Overdue', 'Overdue'),
    ]

    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='assignments')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='asset_assignments')
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='granted_assignments')
    assigned_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.asset.name} assigned to {self.assigned_to.username}"


class MaintenanceRecord(models.Model):
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    asset = models.ForeignKey(Asset, on_delete=models.CASCADE, related_name='maintenance_records')
    description = models.TextField()
    cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    scheduled_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    performed_by = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Maintenance for {self.asset.name} on {self.scheduled_date}"
