from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Allows access only to Admin users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'Admin'


class IsManagerOrAdmin(permissions.BasePermission):
    """
    Allows access to Managers and Admins.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['Admin', 'Manager']


class IsEmployee(permissions.BasePermission):
    """
    Allows access to employees.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'Employee'


class ReadOnlyOrAdminManager(permissions.BasePermission):
    """
    Allows read access to any authenticated user, write access only to Managers and Admins.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role in ['Admin', 'Manager']
