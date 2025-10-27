#!/usr/bin/env python
"""
Database setup and migration script for Inventory Management System
This script handles database creation, migrations, and initial data setup
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to the Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inventory_management.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection
from django.contrib.auth.models import User
from users.models import UserProfile
from inventory.models import Warehouse, Product, InventoryItem
from orders.models import Order, OrderItem
from django.utils import timezone


def create_database():
    """Create database if it doesn't exist (PostgreSQL only)"""
    db_settings = connection.settings_dict
    if db_settings['ENGINE'] == 'django.db.backends.postgresql':
        import psycopg2
        from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

        # Connect to PostgreSQL server (not the database)
        conn = psycopg2.connect(
            host=db_settings.get('HOST', 'localhost'),
            port=db_settings.get('PORT', 5432),
            user=db_settings.get('USER', ''),
            password=db_settings.get('PASSWORD', ''),
            dbname='postgres'  # Connect to default postgres database
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

        cursor = conn.cursor()
        db_name = db_settings['NAME']

        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
        exists = cursor.fetchone()

        if not exists:
            print(f"Creating database '{db_name}'...")
            cursor.execute(f"CREATE DATABASE {db_name}")
            print(f"Database '{db_name}' created successfully!")
        else:
            print(f"Database '{db_name}' already exists.")

        cursor.close()
        conn.close()


def run_migrations():
    """Run Django migrations"""
    print("Running database migrations...")
    execute_from_command_line(['manage.py', 'migrate', '--verbosity=2'])


def create_superuser():
    """Create a default superuser if none exists"""
    if not User.objects.filter(is_superuser=True).exists():
        print("Creating default superuser...")
        User.objects.create_superuser(
            username=os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin'),
            email=os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com'),
            password=os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123'),
            first_name='System',
            last_name='Administrator'
        )
        print("Superuser created successfully!")
    else:
        print("Superuser already exists.")


def create_initial_data():
    """Create initial data for development/testing"""
    print("Creating initial data...")

    # Create default warehouse
    warehouse, created = Warehouse.objects.get_or_create(
        name="Main Warehouse",
        defaults={
            'location': '123 Main St, City, State 12345',
            'capacity': 10000,
            'is_active': True
        }
    )
    if created:
        print("Created default warehouse")

    # Create sample products
    products_data = [
        {'name': 'Laptop', 'sku': 'LAP001', 'price': 999.99, 'category': 'Electronics'},
        {'name': 'Mouse', 'sku': 'MOU001', 'price': 29.99, 'category': 'Electronics'},
        {'name': 'Keyboard', 'sku': 'KEY001', 'price': 79.99, 'category': 'Electronics'},
        {'name': 'Monitor', 'sku': 'MON001', 'price': 299.99, 'category': 'Electronics'},
        {'name': 'Chair', 'sku': 'CHA001', 'price': 149.99, 'category': 'Furniture'},
    ]

    for product_data in products_data:
        product, created = Product.objects.get_or_create(
            sku=product_data['sku'],
            defaults={
                'name': product_data['name'],
                'price': product_data['price'],
                'category': product_data['category'],
                'description': f'Sample {product_data["name"]} product',
                'is_active': True
            }
        )
        if created:
            # Create inventory for this product
            InventoryItem.objects.get_or_create(
                product=product,
                warehouse=warehouse,
                defaults={
                    'quantity': 100,
                    'min_stock_level': 10,
                    'max_stock_level': 500
                }
            )
            print(f"Created product: {product.name}")

    print("Initial data creation completed!")


def setup_indexes():
    """Create additional database indexes for performance"""
    print("Setting up database indexes...")

    with connection.cursor() as cursor:
        # Index for product search
        cursor.execute("""
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search
            ON inventory_product USING gin (to_tsvector('english', name || ' ' || COALESCE(description, '')));
        """)

        # Index for order status and date
        cursor.execute("""
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_date
            ON orders_order (status, created_at DESC);
        """)

        # Index for inventory levels
        cursor.execute("""
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_levels
            ON inventory_inventoryitem (product_id, warehouse_id, quantity);
        """)

        # Index for order items
        cursor.execute("""
            CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_product
            ON orders_orderitem (product_id, order_id);
        """)

        print("Database indexes created successfully!")


def main():
    """Main setup function"""
    print("Starting Inventory Management System database setup...")

    try:
        # Create database (PostgreSQL only)
        create_database()

        # Run migrations
        run_migrations()

        # Create superuser
        create_superuser()

        # Create initial data (only in development)
        if os.environ.get('DJANGO_ENV', 'development') == 'development':
            create_initial_data()

        # Setup indexes
        setup_indexes()

        print("\nDatabase setup completed successfully!")
        print("\nNext steps:")
        print("1. Start the Django server: python manage.py runserver")
        print("2. Access the admin panel at: http://localhost:8000/admin/")
        print("3. API documentation at: http://localhost:8000/api/docs/")

    except Exception as e:
        print(f"Error during database setup: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()