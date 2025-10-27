from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit objects.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.user_type == 'admin'

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.user_type == 'admin':
            return True
        return obj.customer == request.user

class IsWarehouseStaffOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow warehouse staff or admins to access warehouse operations.
    """
    def has_permission(self, request, view):
        return request.user and request.user.user_type in ['admin', 'warehouse_staff']

class IsSellerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow sellers or admins to access seller operations.
    """
    def has_permission(self, request, view):
        return request.user and request.user.user_type in ['admin', 'seller']

    def has_object_permission(self, request, view, obj):
        if request.user.user_type == 'admin':
            return True
        return hasattr(obj, 'user') and obj.user == request.user