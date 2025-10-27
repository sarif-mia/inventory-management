from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Shipment
from .serializers import ShipmentSerializer, ShipmentCreateSerializer, ShipmentTrackingUpdateSerializer

class ShipmentListCreateView(generics.ListCreateAPIView):
    serializer_class = ShipmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['carrier', 'status']
    search_fields = ['tracking_number', 'order__order_number', 'order__customer__username']
    ordering_fields = ['shipped_at', 'delivered_at', 'created_at']
    ordering = ['-shipped_at']

    def get_queryset(self):
        return Shipment.objects.select_related('order__customer')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ShipmentCreateSerializer
        return ShipmentSerializer

    def perform_create(self, serializer):
        shipment = serializer.save()
        # Update order status to shipped
        order = shipment.order
        order.status = 'shipped'
        order.save()
        shipment.shipped_at = timezone.now()
        shipment.save()

class ShipmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Shipment.objects.select_related('order__customer')
    serializer_class = ShipmentSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def update_shipment_tracking(request, pk):
    try:
        shipment = Shipment.objects.get(pk=pk)
    except Shipment.DoesNotExist:
        return Response({'error': 'Shipment not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = ShipmentTrackingUpdateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    new_status = serializer.validated_data['status']

    # Update shipment details
    if 'tracking_number' in serializer.validated_data:
        shipment.tracking_number = serializer.validated_data['tracking_number']
    if 'carrier' in serializer.validated_data:
        shipment.carrier = serializer.validated_data['carrier']

    # Handle status-specific logic
    if new_status == 'in_transit' and shipment.status == 'pending':
        shipment.shipped_at = timezone.now()
    elif new_status == 'delivered' and shipment.status != 'delivered':
        shipment.delivered_at = timezone.now()
        # Update order status
        shipment.order.status = 'delivered'
        shipment.order.save()

    shipment.status = new_status
    shipment.save()

    return Response(ShipmentSerializer(shipment).data)
