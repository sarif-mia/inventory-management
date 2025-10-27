from rest_framework import serializers
from .models import Warehouse

class WarehouseSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.get_full_name', read_only=True)
    current_inventory_count = serializers.ReadOnlyField()
    total_inventory_quantity = serializers.ReadOnlyField()

    class Meta:
        model = Warehouse
        fields = [
            'id', 'name', 'address', 'manager', 'manager_name',
            'capacity', 'is_active', 'current_inventory_count',
            'total_inventory_quantity'
        ]
        read_only_fields = ['id']