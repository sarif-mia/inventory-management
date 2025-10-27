from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from .models import PaymentTransaction
from .serializers import PaymentTransactionSerializer, PaymentProcessSerializer, PaymentReconciliationSerializer

class PaymentTransactionListView(generics.ListAPIView):
    queryset = PaymentTransaction.objects.select_related('order__customer')
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'gateway', 'currency']
    search_fields = ['transaction_id', 'order__order_number', 'order__customer__username']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']

class PaymentTransactionDetailView(generics.RetrieveAPIView):
    queryset = PaymentTransaction.objects.select_related('order__customer')
    serializer_class = PaymentTransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def process_payment(request):
    serializer = PaymentProcessSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    order_id = serializer.validated_data['order_id']
    amount = serializer.validated_data['amount']
    currency = serializer.validated_data['currency']
    gateway = serializer.validated_data['gateway']

    from orders.models import Order
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    # Simulate payment processing (in real implementation, integrate with actual payment gateway)
    transaction_id = f"txn_{order_id}_{gateway.lower()}_{order.created_at.timestamp()}"

    with transaction.atomic():
        payment = PaymentTransaction.objects.create(
            order=order,
            amount=amount,
            currency=currency,
            gateway=gateway,
            transaction_id=transaction_id,
            status='completed'  # Simulate successful payment
        )

        # Update order status
        order.status = 'confirmed'
        order.save()

    return Response(PaymentTransactionSerializer(payment).data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reconcile_payment(request):
    serializer = PaymentReconciliationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    transaction_id = serializer.validated_data['transaction_id']
    new_status = serializer.validated_data['status']

    try:
        payment = PaymentTransaction.objects.get(transaction_id=transaction_id)
    except PaymentTransaction.DoesNotExist:
        return Response({'error': 'Payment transaction not found'}, status=status.HTTP_404_NOT_FOUND)

    with transaction.atomic():
        old_status = payment.status
        payment.status = new_status
        payment.save()

        # Handle order status based on payment status
        if new_status == 'completed' and old_status != 'completed':
            payment.order.status = 'confirmed'
            payment.order.save()
        elif new_status == 'failed':
            payment.order.status = 'cancelled'
            payment.order.save()
        elif new_status == 'refunded':
            payment.order.status = 'refunded'
            payment.order.save()

    return Response(PaymentTransactionSerializer(payment).data)
