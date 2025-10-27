from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

class Product(models.Model):
    sku = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    brand = models.CharField(max_length=100)
    images = models.JSONField()  # Array of image URLs
    attributes = models.JSONField()  # Size, color, etc.
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def available_quantity(self):
        from inventory.models import Inventory
        total = Inventory.objects.filter(product=self).aggregate(
            total=models.Sum('quantity')
        )['total'] or 0
        return total

class Seller(models.Model):
    user = models.OneToOneField('users.User', on_delete=models.CASCADE)
    business_name = models.CharField(max_length=100)
    business_address = models.TextField()
    tax_id = models.CharField(max_length=50)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.10)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.business_name

class MarketplaceIntegration(models.Model):
    name = models.CharField(max_length=100)  # Amazon, Shopify, etc.
    api_key = models.CharField(max_length=255)
    api_secret = models.CharField(max_length=255)
    base_url = models.URLField()
    is_active = models.BooleanField(default=True)
    last_sync = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.name

class MarketplaceProduct(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    marketplace = models.ForeignKey(MarketplaceIntegration, on_delete=models.CASCADE)
    external_id = models.CharField(max_length=100)
    sync_status = models.CharField(max_length=20, choices=[
        ('synced', 'Synced'),
        ('pending', 'Pending'),
        ('failed', 'Failed')
    ])
    last_sync = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.product.name} - {self.marketplace.name}"

    class Meta:
        unique_together = ('product', 'marketplace')
