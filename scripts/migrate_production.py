#!/usr/bin/env python
"""
Production database migration script for Inventory Management System
Handles safe database migrations in production environment
"""

import os
import sys
import django
from pathlib import Path
import time
from datetime import datetime

# Add the project directory to the Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inventory_management.settings')
django.setup()

from django.core.management import call_command
from django.db import connection, transaction
from django.db.migrations.executor import MigrationExecutor


def create_backup():
    """Create database backup before migration"""
    print("Creating database backup...")

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = f"backup_pre_migration_{timestamp}.sql"

    db_settings = connection.settings_dict

    if db_settings['ENGINE'] == 'django.db.backends.postgresql':
        # PostgreSQL backup
        cmd = f"pg_dump -h {db_settings.get('HOST', 'localhost')} -p {db_settings.get('PORT', 5432)} -U {db_settings.get('USER')} -d {db_settings['NAME']} > {backup_file}"
        os.system(cmd)
        print(f"PostgreSQL backup created: {backup_file}")

    elif db_settings['ENGINE'] == 'django.db.backends.mysql':
        # MySQL backup
        cmd = f"mysqldump -h {db_settings.get('HOST', 'localhost')} -P {db_settings.get('PORT', 3306)} -u {db_settings.get('USER')} -p{db_settings.get('PASSWORD')} {db_settings['NAME']} > {backup_file}"
        os.system(cmd)
        print(f"MySQL backup created: {backup_file}")

    else:
        print("Backup not supported for this database engine. Skipping...")


def check_migration_status():
    """Check current migration status"""
    print("Checking migration status...")

    executor = MigrationExecutor(connection)
    plan = executor.migration_plan(executor.loader.graph.leaf_nodes())

    if not plan:
        print("No pending migrations found.")
        return False

    print(f"Found {len(plan)} pending migrations:")
    for migration, rolled_back in plan:
        status = "rolled back" if rolled_back else "pending"
        print(f"  - {migration.app_label}.{migration.name}: {status}")

    return True


def run_migrations():
    """Run database migrations safely"""
    print("Running database migrations...")

    try:
        # Run migrations with verbosity
        call_command('migrate', verbosity=2, interactive=False)
        print("Migrations completed successfully!")
        return True

    except Exception as e:
        print(f"Migration failed: {e}")
        print("Rolling back to previous state...")

        # Attempt rollback (this is basic - in production you'd want more sophisticated rollback)
        try:
            call_command('migrate', 'zero', verbosity=1, interactive=False)
            print("Rollback completed.")
        except Exception as rollback_error:
            print(f"Rollback failed: {rollback_error}")
            print("Manual intervention required!")

        return False


def validate_migrations():
    """Validate that migrations were applied correctly"""
    print("Validating migrations...")

    try:
        # Check if there are any unapplied migrations
        executor = MigrationExecutor(connection)
        plan = executor.migration_plan(executor.loader.graph.leaf_nodes())

        if plan:
            print(f"Warning: {len(plan)} migrations are still pending after migration!")
            return False

        # Run Django's check command
        call_command('check', deploy=True)

        print("Migration validation passed!")
        return True

    except Exception as e:
        print(f"Migration validation failed: {e}")
        return False


def update_indexes():
    """Update database indexes after migration"""
    print("Updating database indexes...")

    with connection.cursor() as cursor:
        # Rebuild any indexes that might need updating
        try:
            # Analyze tables for query optimization
            cursor.execute("ANALYZE;")
            print("Database statistics updated.")
        except:
            print("ANALYZE not supported on this database.")


def notify_services():
    """Notify other services about database changes"""
    print("Notifying services about database changes...")

    # This could send notifications to:
    # - Load balancers to refresh connections
    # - Cache systems to invalidate caches
    # - Monitoring systems
    # - Other microservices

    # For now, just log the notification
    print("Database migration completed. Services should be notified to refresh connections.")


def main():
    """Main migration function"""
    print("Starting production database migration...")
    print(f"Environment: {os.environ.get('DJANGO_ENV', 'unknown')}")
    print(f"Database: {connection.settings_dict.get('NAME', 'unknown')}")
    print("-" * 50)

    start_time = time.time()

    try:
        # Pre-migration checks
        if not check_migration_status():
            print("No migrations to apply. Exiting.")
            return

        # Create backup
        create_backup()

        # Run migrations
        if not run_migrations():
            print("Migration failed. Exiting with error.")
            sys.exit(1)

        # Validate
        if not validate_migrations():
            print("Migration validation failed. Please check manually.")
            sys.exit(1)

        # Post-migration tasks
        update_indexes()
        notify_services()

        end_time = time.time()
        duration = end_time - start_time

        print("-" * 50)
        print("Production migration completed successfully!")
        print(".2f")
        print("\nNext steps:")
        print("1. Restart application servers")
        print("2. Clear application caches")
        print("3. Monitor application logs for issues")
        print("4. Run integration tests")

    except Exception as e:
        print(f"Critical error during migration: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()