from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from .models import Inventory
from .serializers import InventorySerializer, InventoryAdjustmentSerializer
from users.permissions import IsWarehouseStaffOrAdmin

class InventoryListCreateView(generics.ListCreateAPIView):
    queryset = Inventory.objects.select_related('product', 'warehouse')
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated, IsWarehouseStaffOrAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['product', 'warehouse', 'quantity']
    search_fields = ['product__name', 'warehouse__name']
    ordering_fields = ['quantity', 'last_updated', 'low_stock_threshold']
    ordering = ['-last_updated']

    def perform_create(self, serializer):
        # Check for existing inventory
        product = serializer.validated_data['product']
        warehouse = serializer.validated_data['warehouse']
        existing = Inventory.objects.filter(product=product, warehouse=warehouse).first()
        if existing:
            existing.quantity += serializer.validated_data.get('quantity', 0)
            existing.save()
            return existing
        return serializer.save()

class InventoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Inventory.objects.select_related('product', 'warehouse')
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated, IsWarehouseStaffOrAdmin]

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsWarehouseStaffOrAdmin])
def adjust_inventory(request):
    serializer = InventoryAdjustmentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    product_id = serializer.validated_data['product_id']
    warehouse_id = serializer.validated_data['warehouse_id']
    adjustment_type = serializer.validated_data['adjustment_type']
    quantity = serializer.validated_data['quantity']

    with transaction.atomic():
        inventory, created = Inventory.objects.get_or_create(
            product_id=product_id,
            warehouse_id=warehouse_id,
            defaults={'quantity': 0, 'reserved_quantity': 0}
        )

        if adjustment_type == 'add':
            inventory.quantity += quantity
        elif adjustment_type == 'subtract':
            if inventory.available_quantity < quantity:
                return Response(
                    {'error': 'Insufficient stock available'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            inventory.quantity -= quantity

        inventory.save()

    return Response(InventorySerializer(inventory).data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsWarehouseStaffOrAdmin])
def low_stock_alerts(request):
    low_stock_items = Inventory.objects.select_related('product', 'warehouse').filter(
        available_quantity__lte=models.F('low_stock_threshold')
    )
    serializer = InventorySerializer(low_stock_items, many=True)
    return Response(serializer.data)
