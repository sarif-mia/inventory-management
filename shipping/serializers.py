from rest_framework import serializers
from .models import Shipment

class ShipmentSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    customer_name = serializers.CharField(source='order.customer.get_full_name', read_only=True)

    class Meta:
        model = Shipment
        fields = [
            'id', 'order', 'order_number', 'customer_name', 'tracking_number',
            'carrier', 'status', 'shipped_at', 'delivered_at'
        ]
        read_only_fields = ['id', 'shipped_at', 'delivered_at']

class ShipmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shipment
        fields = ['order', 'tracking_number', 'carrier']

    def validate_order(self, value):
        if hasattr(value, 'shipment'):
            raise serializers.ValidationError("Order already has a shipment")
        return value

class ShipmentTrackingUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        ('pending', 'Pending'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('returned', 'Returned')
    ])
    tracking_number = serializers.CharField(required=False)
    carrier = serializers.CharField(required=False)