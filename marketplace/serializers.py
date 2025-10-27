from rest_framework import serializers
from .models import Category, Product, Seller, MarketplaceIntegration, MarketplaceProduct

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'parent', 'description']
        read_only_fields = ['id']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    available_quantity = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'description', 'price', 'category',
            'category_name', 'brand', 'images', 'attributes', 'is_active',
            'available_quantity', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class SellerSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Seller
        fields = [
            'id', 'user', 'user_email', 'business_name', 'business_address',
            'tax_id', 'commission_rate', 'is_verified'
        ]
        read_only_fields = ['id']

class MarketplaceIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketplaceIntegration
        fields = [
            'id', 'name', 'api_key', 'api_secret', 'base_url',
            'is_active', 'last_sync'
        ]
        read_only_fields = ['id', 'last_sync']
        extra_kwargs = {
            'api_key': {'write_only': True},
            'api_secret': {'write_only': True}
        }

class MarketplaceProductSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    marketplace_name = serializers.CharField(source='marketplace.name', read_only=True)

    class Meta:
        model = MarketplaceProduct
        fields = [
            'id', 'product', 'product_name', 'marketplace', 'marketplace_name',
            'external_id', 'sync_status', 'last_sync'
        ]
        read_only_fields = ['id', 'last_sync']

class MarketplaceConnectSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    api_key = serializers.CharField(max_length=255)
    api_secret = serializers.CharField(max_length=255)
    base_url = serializers.URLField()

class SyncDataSerializer(serializers.Serializer):
    marketplace_id = serializers.IntegerField()
    sync_type = serializers.ChoiceField(choices=[
        ('products', 'Products'),
        ('orders', 'Orders'),
        ('inventory', 'Inventory')
    ])
    data = serializers.ListField(child=serializers.DictField(), required=False)