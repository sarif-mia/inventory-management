from rest_framework import serializers
from .models import PaymentTransaction

class PaymentTransactionSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    customer_name = serializers.CharField(source='order.customer.get_full_name', read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'order', 'order_number', 'customer_name', 'amount',
            'currency', 'gateway', 'transaction_id', 'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

class PaymentProcessSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(max_length=3, default='USD')
    gateway = serializers.CharField(max_length=50)
    payment_method_details = serializers.DictField(required=False)

    def validate_order_id(self, value):
        from orders.models import Order
        try:
            order = Order.objects.get(id=value)
            if hasattr(order, 'paymenttransaction'):
                raise serializers.ValidationError("Order already has a payment transaction")
            return value
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found")

class PaymentReconciliationSerializer(serializers.Serializer):
    transaction_id = serializers.CharField()
    status = serializers.ChoiceField(choices=[
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded')
    ])
    gateway_response = serializers.DictField(required=False)