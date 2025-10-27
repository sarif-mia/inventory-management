from django.db import models

class Warehouse(models.Model):
    name = models.CharField(max_length=100)
    address = models.TextField()
    manager = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True)
    capacity = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    @property
    def current_inventory_count(self):
        from inventory.models import Inventory
        return Inventory.objects.filter(warehouse=self).count()

    @property
    def total_inventory_quantity(self):
        from inventory.models import Inventory
        total = Inventory.objects.filter(warehouse=self).aggregate(
            total=models.Sum('quantity')
        )['total'] or 0
        return total
