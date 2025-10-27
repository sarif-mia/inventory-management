from rest_framework import serializers
from .models import Inventory

class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    available_quantity = serializers.ReadOnlyField()
    is_low_stock = serializers.ReadOnlyField()

    class Meta:
        model = Inventory
        fields = [
            'id', 'product', 'product_name', 'warehouse', 'warehouse_name',
            'quantity', 'reserved_quantity', 'available_quantity',
            'low_stock_threshold', 'is_low_stock', 'last_updated'
        ]
        read_only_fields = ['id', 'last_updated']

class InventoryAdjustmentSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    warehouse_id = serializers.IntegerField()
    adjustment_type = serializers.ChoiceField(choices=[('add', 'Add'), ('subtract', 'Subtract')])
    quantity = serializers.IntegerField(min_value=1)
    reason = serializers.CharField(max_length=255, required=False)

    def validate(self, attrs):
        # Check if inventory exists
        try:
            inventory = Inventory.objects.get(
                product_id=attrs['product_id'],
                warehouse_id=attrs['warehouse_id']
            )
            if attrs['adjustment_type'] == 'subtract' and inventory.available_quantity < attrs['quantity']:
                raise serializers.ValidationError("Insufficient stock available")
        except Inventory.DoesNotExist:
            if attrs['adjustment_type'] == 'subtract':
                raise serializers.ValidationError("Inventory does not exist for subtraction")
        return attrs