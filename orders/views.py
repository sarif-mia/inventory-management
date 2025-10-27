from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer, OrderStatusUpdateSerializer
from users.permissions import IsOwnerOrAdmin

class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['status', 'customer', 'payment_method', 'shipping_method']
    search_fields = ['order_number', 'customer__username', 'customer__email']
    ordering_fields = ['created_at', 'updated_at', 'total_amount']
    ordering = ['-created_at']

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'customer':
            return Order.objects.filter(customer=user).prefetch_related('items__product')
        return Order.objects.all().prefetch_related('items__product')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer

    def perform_create(self, serializer):
        with transaction.atomic():
            order = serializer.save()
            # Reserve inventory for the order
            for item in order.items.all():
                from inventory.models import Inventory
                # For simplicity, reserve from first available warehouse
                inventory = Inventory.objects.filter(
                    product=item.product,
                    available_quantity__gte=item.quantity
                ).first()
                if inventory:
                    inventory.reserved_quantity += item.quantity
                    inventory.save()
            return order

class OrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'customer':
            return Order.objects.filter(customer=user).prefetch_related('items__product')
        return Order.objects.all().prefetch_related('items__product')

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated, IsOwnerOrAdmin])
def update_order_status(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = OrderStatusUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    new_status = serializer.validated_data['status']
    old_status = order.status

    with transaction.atomic():
        order.status = new_status
        order.save()

        # Handle inventory based on status changes
        if new_status == 'cancelled' and old_status in ['pending', 'confirmed']:
            # Release reserved inventory
            for item in order.items.all():
                from inventory.models import Inventory
                inventories = Inventory.objects.filter(product=item.product)
                for inventory in inventories:
                    if inventory.reserved_quantity >= item.quantity:
                        inventory.reserved_quantity -= item.quantity
                        inventory.save()
                        break

        elif new_status == 'delivered':
            # Convert reserved to sold (remove from inventory)
            for item in order.items.all():
                from inventory.models import Inventory
                inventories = Inventory.objects.filter(product=item.product)
                for inventory in inventories:
                    if inventory.reserved_quantity >= item.quantity:
                        inventory.reserved_quantity -= item.quantity
                        inventory.quantity -= item.quantity
                        inventory.save()
                        break

    return Response(OrderSerializer(order).data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsOwnerOrAdmin])
def cancel_order(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if order.status not in ['pending', 'confirmed']:
        return Response(
            {'error': 'Order cannot be cancelled at this stage'},
            status=status.HTTP_400_BAD_REQUEST
        )

    with transaction.atomic():
        order.status = 'cancelled'
        order.save()

        # Release reserved inventory
        for item in order.items.all():
            from inventory.models import Inventory
            inventories = Inventory.objects.filter(product=item.product)
            for inventory in inventories:
                if inventory.reserved_quantity >= item.quantity:
                    inventory.reserved_quantity -= item.quantity
                    inventory.save()
                    break

    return Response(OrderSerializer(order).data)
