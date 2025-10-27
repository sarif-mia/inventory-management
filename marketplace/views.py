from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db import transaction
from .models import Category, Product, Seller, MarketplaceIntegration, MarketplaceProduct
from .serializers import (
    CategorySerializer, ProductSerializer, SellerSerializer,
    MarketplaceIntegrationSerializer, MarketplaceProductSerializer,
    MarketplaceConnectSerializer, SyncDataSerializer
)
from users.permissions import IsSellerOrAdmin

# Product Management
class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.select_related('category')
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'brand', 'is_active']
    search_fields = ['name', 'sku', 'description']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['-created_at']

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related('category')
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

# Category Management
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    ordering = ['name']

# Seller Management
class SellerListCreateView(generics.ListCreateAPIView):
    queryset = Seller.objects.select_related('user')
    serializer_class = SellerSerializer
    permission_classes = [permissions.IsAuthenticated, IsSellerOrAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_verified']
    search_fields = ['business_name', 'user__username', 'user__email']
    ordering_fields = ['business_name']
    ordering = ['business_name']

class SellerDetailView(generics.RetrieveUpdateAPIView):
    queryset = Seller.objects.select_related('user')
    serializer_class = SellerSerializer
    permission_classes = [permissions.IsAuthenticated, IsSellerOrAdmin]

# Marketplace Integration
class MarketplaceListView(generics.ListAPIView):
    queryset = MarketplaceIntegration.objects.all()
    serializer_class = MarketplaceIntegrationSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def connect_marketplace(request):
    serializer = MarketplaceConnectSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    marketplace, created = MarketplaceIntegration.objects.get_or_create(
        name=serializer.validated_data['name'],
        defaults={
            'api_key': serializer.validated_data['api_key'],
            'api_secret': serializer.validated_data['api_secret'],
            'base_url': serializer.validated_data['base_url'],
            'is_active': True
        }
    )

    if not created:
        return Response({'error': 'Marketplace already connected'}, status=status.HTTP_400_BAD_REQUEST)

    return Response(MarketplaceIntegrationSerializer(marketplace).data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def sync_marketplace_data(request, marketplace_id):
    try:
        marketplace = MarketplaceIntegration.objects.get(id=marketplace_id)
    except MarketplaceIntegration.DoesNotExist:
        return Response({'error': 'Marketplace not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = SyncDataSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    sync_type = serializer.validated_data['sync_type']

    # Simulate sync process (in real implementation, call actual marketplace APIs)
    with transaction.atomic():
        marketplace.last_sync = timezone.now()
        marketplace.save()

        if sync_type == 'products':
            # Sync products logic would go here
            pass
        elif sync_type == 'orders':
            # Sync orders logic would go here
            pass
        elif sync_type == 'inventory':
            # Sync inventory logic would go here
            pass

    return Response({'message': f'{sync_type} sync completed successfully'})

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def marketplace_products(request, marketplace_id):
    try:
        marketplace = MarketplaceIntegration.objects.get(id=marketplace_id)
    except MarketplaceIntegration.DoesNotExist:
        return Response({'error': 'Marketplace not found'}, status=status.HTTP_404_NOT_FOUND)

    products = MarketplaceProduct.objects.filter(marketplace=marketplace).select_related('product')
    serializer = MarketplaceProductSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def push_product_to_marketplace(request, marketplace_id):
    try:
        marketplace = MarketplaceIntegration.objects.get(id=marketplace_id)
    except MarketplaceIntegration.DoesNotExist:
        return Response({'error': 'Marketplace not found'}, status=status.HTTP_404_NOT_FOUND)

    product_ids = request.data.get('product_ids', [])
    if not product_ids:
        return Response({'error': 'product_ids required'}, status=status.HTTP_400_BAD_REQUEST)

    pushed_products = []
    for product_id in product_ids:
        try:
            product = Product.objects.get(id=product_id)
            marketplace_product, created = MarketplaceProduct.objects.get_or_create(
                product=product,
                marketplace=marketplace,
                defaults={
                    'external_id': f"ext_{product_id}_{marketplace_id}",
                    'sync_status': 'synced'
                }
            )
            pushed_products.append(marketplace_product)
        except Product.DoesNotExist:
            continue

    serializer = MarketplaceProductSerializer(pushed_products, many=True)
    return Response(serializer.data)
