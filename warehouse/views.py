from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Warehouse
from .serializers import WarehouseSerializer
from inventory.models import Inventory
from inventory.serializers import InventorySerializer
from users.permissions import IsWarehouseStaffOrAdmin

class WarehouseListCreateView(generics.ListCreateAPIView):
    queryset = Warehouse.objects.select_related('manager')
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated, IsWarehouseStaffOrAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'manager']
    search_fields = ['name', 'address', 'manager__username']
    ordering_fields = ['name', 'capacity', 'current_inventory_count']
    ordering = ['name']

class WarehouseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Warehouse.objects.select_related('manager')
    serializer_class = WarehouseSerializer
    permission_classes = [permissions.IsAuthenticated, IsWarehouseStaffOrAdmin]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsWarehouseStaffOrAdmin])
def warehouse_inventory(request, pk):
    try:
        warehouse = Warehouse.objects.get(pk=pk)
    except Warehouse.DoesNotExist:
        return Response({'error': 'Warehouse not found'}, status=404)

    inventory_items = Inventory.objects.filter(warehouse=warehouse).select_related('product')
    serializer = InventorySerializer(inventory_items, many=True)
    return Response(serializer.data)
