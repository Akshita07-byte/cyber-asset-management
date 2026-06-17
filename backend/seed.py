import os
import django
import datetime
from django.utils import timezone

# Setup Django Environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from vendors.models import Vendor
from assets.models import Asset, AssetAssignment, MaintenanceRecord
from audit.models import AuditLog

User = get_user_model()

def seed_database():
    print("Seeding database...")
    
    # 1. Clear existing data
    AuditLog.objects.all().delete()
    AssetAssignment.objects.all().delete()
    MaintenanceRecord.objects.all().delete()
    Asset.objects.all().delete()
    Vendor.objects.all().delete()
    User.objects.all().delete()

    print("Cleared existing tables.")

    # 2. Create Users
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@cyberasset.com',
        password='adminpassword123',
        first_name='Sarah',
        last_name='Connor',
        role='Admin',
        phone_number='+1 (555) 019-2831',
        department='Global Operations'
    )
    
    manager = User.objects.create_user(
        username='manager',
        email='manager@cyberasset.com',
        password='managerpassword123',
        first_name='Alex',
        last_name='Mercer',
        role='Manager',
        phone_number='+1 (555) 014-9988',
        department='Asset Management'
    )

    employee = User.objects.create_user(
        username='employee',
        email='employee@cyberasset.com',
        password='employeepassword123',
        first_name='David',
        last_name='Lightman',
        role='Employee',
        phone_number='+1 (555) 012-3344',
        department='Cybersecurity Research'
    )

    print("Created users (admin, manager, employee).")

    # 3. Create Vendors
    v1 = Vendor.objects.create(
        name='Quantum Dynamics Group',
        contact_person='Elena Vance',
        email='corporate@quantumdynamics.io',
        phone='+1 (800) 555-0100',
        address='100 Quantum Way, Sector 7, Austin, TX',
        rating=4.90
    )

    v2 = Vendor.objects.create(
        name='Apex Cybernetics',
        contact_person='Walter Lanning',
        email='support@apexcyber.com',
        phone='+1 (888) 444-2026',
        address='Cyber Tower 1, Level 42, San Francisco, CA',
        rating=4.50
    )

    v3 = Vendor.objects.create(
        name='Nova Tech Solutions',
        contact_person='Miles Dyson',
        email='contracts@novatech.co',
        phone='+1 (866) 999-7711',
        address='300 Cyberdyne Blvd, Los Angeles, CA',
        rating=4.20
    )

    print("Created vendors.")

    # 4. Create Assets
    today = timezone.now().date()
    
    a1 = Asset.objects.create(
        serial_number='QBL-2026-001',
        name='Quantum Blade Workstation v9',
        category='Computing',
        model='QBW-900X',
        status='Assigned',
        purchase_date=today - datetime.timedelta(days=90),
        price=3499.99,
        warranty_expiry=today + datetime.timedelta(days=275),
        vendor=v1,
        description='Quantum-core processing unit with 128GB unified memory and glassmorphic OLED screen.'
    )

    a2 = Asset.objects.create(
        serial_number='HLP-2026-992',
        name='HoloLens Pro AR Visor V3',
        category='Computing',
        model='HP-AR3',
        status='Available',
        purchase_date=today - datetime.timedelta(days=120),
        price=4200.00,
        warranty_expiry=today + datetime.timedelta(days=245),
        vendor=v2,
        description='Enterprise-grade augmented reality visor for virtual cybernetic control panels.'
    )

    a3 = Asset.objects.create(
        serial_number='CSR-771-NX',
        name='CyberShield Threat Router X1',
        category='Network',
        model='CS-RX1-NET',
        status='Maintenance',
        purchase_date=today - datetime.timedelta(days=365),
        price=1850.00,
        warranty_expiry=today - datetime.timedelta(days=5), # Expired 5 days ago
        vendor=v3,
        description='Hardware firewall and deep packet analysis router with AI anomaly filtering.'
    )

    a4 = Asset.objects.create(
        serial_number='AES-LIC-8812',
        name='Apex Enterprise Core License',
        category='Software',
        model='APEX-ENT-CORE',
        status='Available',
        purchase_date=today - datetime.timedelta(days=10),
        price=12500.00,
        warranty_expiry=today + datetime.timedelta(days=355),
        vendor=v2,
        description='Site-wide license for Apex Cloud infrastructure and dynamic virtual staging environments.'
    )

    a5 = Asset.objects.create(
        serial_number='NDE-FURN-09',
        name='Neural Desk Bio-Ergonomic Chair',
        category='Furniture',
        model='NDB-E1',
        status='Assigned',
        purchase_date=today - datetime.timedelta(days=15),
        price=899.00,
        warranty_expiry=today + datetime.timedelta(days=715),
        vendor=v1,
        description='Self-adjusting biometric chair matching posture through thermal memory mesh.'
    )

    print("Created assets.")

    # 5. Create Asset Assignments
    asg1 = AssetAssignment.objects.create(
        asset=a1,
        assigned_to=employee,
        assigned_by=manager,
        assigned_date=today - datetime.timedelta(days=80),
        due_date=today + datetime.timedelta(days=100),
        status='Active',
        notes='Assigned for high-performance machine learning compilation and cyber security tasks.'
    )

    asg2 = AssetAssignment.objects.create(
        asset=a5,
        assigned_to=manager,
        assigned_by=admin,
        assigned_date=today - datetime.timedelta(days=10),
        due_date=today + datetime.timedelta(days=170),
        status='Active',
        notes='Office upgrade for supervisor desk.'
    )

    print("Created assignments.")

    # 6. Create Maintenance Records
    m1 = MaintenanceRecord.objects.create(
        asset=a3,
        description='AI firmware updates and diagnostic checks for hardware-level firewall vulnerabilities.',
        cost=150.00,
        scheduled_date=today - datetime.timedelta(days=2),
        status='In Progress',
        performed_by='Nova Tech Support Team'
    )

    m2 = MaintenanceRecord.objects.create(
        asset=a1,
        description='Routine screen calibration and thermal paste replacement.',
        cost=75.00,
        scheduled_date=today - datetime.timedelta(days=45),
        completed_date=today - datetime.timedelta(days=44),
        status='Completed',
        performed_by='Quantum Services Group'
    )

    print("Created maintenance records.")

    # 7. Create Audit Logs
    AuditLog.objects.create(
        user=admin,
        action='CREATE',
        model_name='User',
        object_id=str(employee.id),
        object_repr=str(employee),
        details='Superuser seeded system database and created base personnel logs.',
        timestamp=timezone.now() - datetime.timedelta(minutes=30)
    )

    AuditLog.objects.create(
        user=manager,
        action='ASSIGN',
        model_name='AssetAssignment',
        object_id=str(asg1.id),
        object_repr=str(asg1),
        details=f"Assigned {a1.name} to employee '{employee.username}' with serial {a1.serial_number}.",
        timestamp=timezone.now() - datetime.timedelta(minutes=20)
    )

    AuditLog.objects.create(
        user=manager,
        action='MAINTENANCE_START',
        model_name='MaintenanceRecord',
        object_id=str(m1.id),
        object_repr=str(m1),
        details=f"Logged maintenance request for router {a3.name} due to security patches.",
        timestamp=timezone.now() - datetime.timedelta(minutes=10)
    )

    print("Database seeding completed successfully.")

if __name__ == '__main__':
    seed_database()
