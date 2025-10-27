from django.test import TestCase
from inventory.models import Inventory
from marketplace.models import Product, Category
from warehouse.models import Warehouse

class InventoryModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(
            name='Test Category'
        )
        self.warehouse = Warehouse.objects.create(
            name='Test Warehouse',
            address='Test Address',
            capacity=1000
        )
        self.product = Product.objects.create(
            name='Test Product',
            sku='TEST001',
            description='Test Description',
            price=10.00,
            category=self.category,
            brand='Test Brand',
            images=[],
            attributes={}
        )

    def test_inventory_creation(self):
        inventory = Inventory.objects.create(
            product=self.product,
            warehouse=self.warehouse,
            quantity=100,
            low_stock_threshold=5
        )
        self.assertEqual(inventory.quantity, 100)
        self.assertEqual(inventory.available_quantity, 100)
        self.assertFalse(inventory.is_low_stock)

    def test_available_quantity(self):
        inventory = Inventory.objects.create(
            product=self.product,
            warehouse=self.warehouse,
            quantity=100,
            reserved_quantity=20
        )
        self.assertEqual(inventory.available_quantity, 80)

    def test_low_stock_detection(self):
        inventory = Inventory.objects.create(
            product=self.product,
            warehouse=self.warehouse,
            quantity=5,
            low_stock_threshold=10
        )
        self.assertTrue(inventory.is_low_stock)

    def test_inventory_str(self):
        inventory = Inventory.objects.create(
            product=self.product,
            warehouse=self.warehouse,
            quantity=50
        )
        expected_str = f"{self.product.name} - {self.warehouse.name}: {inventory.quantity}"
        self.assertEqual(str(inventory), expected_str)
