from django.db import models

class Inventory(models.Model):
    product = models.ForeignKey('marketplace.Product', on_delete=models.CASCADE)
    warehouse = models.ForeignKey('warehouse.Warehouse', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=0)
    reserved_quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=10)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.name} - {self.warehouse.name}: {self.quantity}"

    @property
    def available_quantity(self):
        return self.quantity - self.reserved_quantity

    @property
    def is_low_stock(self):
        return self.available_quantity <= self.low_stock_threshold

    class Meta:
        unique_together = ('product', 'warehouse')
