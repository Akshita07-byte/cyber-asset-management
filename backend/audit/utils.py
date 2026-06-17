from .models import AuditLog

def log_action(user, action, instance, details=""):
    """
    Utility function to log an action to the AuditLog database.
    """
    model_name = instance.__class__.__name__
    object_id = str(instance.id) if hasattr(instance, 'id') else ""
    object_repr = str(instance)
    
    # If user is anonymous or not authenticated, log as None (System)
    log_user = user if user and user.is_authenticated else None
    
    AuditLog.objects.create(
        user=log_user,
        action=action,
        model_name=model_name,
        object_id=object_id,
        object_repr=object_repr,
        details=details
    )
