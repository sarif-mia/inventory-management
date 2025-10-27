#!/usr/bin/env python
"""
Health check script for Inventory Management System
Performs comprehensive system health checks
"""

import os
import sys
import django
from pathlib import Path
import requests
import time
import psutil
from datetime import datetime

# Add the project directory to the Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inventory_management.settings')
django.setup()

from django.db import connection
from django.core.cache import cache
from django.conf import settings


class HealthChecker:
    def __init__(self):
        self.results = {}
        self.warnings = []
        self.errors = []

    def check_database(self):
        """Check database connectivity and performance"""
        print("Checking database connection...")

        try:
            with connection.cursor() as cursor:
                # Test basic connectivity
                cursor.execute("SELECT 1")
                result = cursor.fetchone()

                if result[0] != 1:
                    self.errors.append("Database connectivity test failed")
                    return False

                # Test query performance
                start_time = time.time()
                cursor.execute("SELECT COUNT(*) FROM django_migrations")
                count = cursor.fetchone()[0]
                query_time = time.time() - start_time

                if query_time > 1.0:  # More than 1 second
                    self.warnings.append(".2f")

                self.results['database'] = {
                    'status': 'healthy',
                    'migrations_count': count,
                    'query_time': query_time
                }

                print("Database connection healthy")
                return True

        except Exception as e:
            self.errors.append(f"Database check failed: {e}")
            self.results['database'] = {'status': 'unhealthy', 'error': str(e)}
            return False

    def check_cache(self):
        """Check cache system"""
        print("Checking cache system...")

        try:
            # Test cache set/get
            test_key = f"health_check_{int(time.time())}"
            test_value = "test_value"

            cache.set(test_key, test_value, 30)
            retrieved_value = cache.get(test_key)

            if retrieved_value != test_value:
                self.errors.append("Cache set/get test failed")
                return False

            # Clean up
            cache.delete(test_key)

            self.results['cache'] = {'status': 'healthy'}
            print("Cache system healthy")
            return True

        except Exception as e:
            self.errors.append(f"Cache check failed: {e}")
            self.results['cache'] = {'status': 'unhealthy', 'error': str(e)}
            return False

    def check_disk_space(self):
        """Check disk space availability"""
        print("Checking disk space...")

        try:
            disk_usage = psutil.disk_usage('/')

            # Check if disk usage is above 90%
            usage_percent = disk_usage.percent
            if usage_percent > 90:
                self.errors.append(f"Disk usage is {usage_percent}% - above 90% threshold")
                return False
            elif usage_percent > 80:
                self.warnings.append(f"Disk usage is {usage_percent}% - above 80% threshold")

            self.results['disk'] = {
                'status': 'healthy',
                'usage_percent': usage_percent,
                'free_gb': disk_usage.free / (1024**3)
            }

            print(f"Disk space healthy ({usage_percent}% used)")
            return True

        except Exception as e:
            self.warnings.append(f"Disk space check failed: {e}")
            return True  # Not critical

    def check_memory(self):
        """Check memory usage"""
        print("Checking memory usage...")

        try:
            memory = psutil.virtual_memory()

            # Check if memory usage is above 90%
            usage_percent = memory.percent
            if usage_percent > 95:
                self.errors.append(f"Memory usage is {usage_percent}% - above 95% threshold")
                return False
            elif usage_percent > 85:
                self.warnings.append(f"Memory usage is {usage_percent}% - above 85% threshold")

            self.results['memory'] = {
                'status': 'healthy',
                'usage_percent': usage_percent,
                'available_gb': memory.available / (1024**3)
            }

            print(f"Memory usage healthy ({usage_percent}% used)")
            return True

        except Exception as e:
            self.warnings.append(f"Memory check failed: {e}")
            return True  # Not critical

    def check_application(self):
        """Check application endpoints"""
        print("Checking application endpoints...")

        base_url = os.environ.get('HEALTH_CHECK_URL', 'http://localhost:8000')

        endpoints = [
            ('/', 'Main application'),
            ('/api/', 'API root'),
            ('/admin/', 'Admin panel'),
            ('/health/', 'Health check endpoint'),
        ]

        endpoint_results = {}

        for endpoint, description in endpoints:
            try:
                url = f"{base_url}{endpoint}"
                response = requests.get(url, timeout=10)

                if response.status_code == 200:
                    endpoint_results[endpoint] = {'status': 'healthy', 'code': response.status_code}
                else:
                    endpoint_results[endpoint] = {'status': 'warning', 'code': response.status_code}
                    self.warnings.append(f"{description} returned status {response.status_code}")

            except requests.exceptions.RequestException as e:
                endpoint_results[endpoint] = {'status': 'unhealthy', 'error': str(e)}
                self.errors.append(f"{description} is unreachable: {e}")

        self.results['application'] = {
            'status': 'healthy' if not any(r.get('status') == 'unhealthy' for r in endpoint_results.values()) else 'unhealthy',
            'endpoints': endpoint_results
        }

        healthy_count = sum(1 for r in endpoint_results.values() if r.get('status') == 'healthy')
        print(f"Application endpoints: {healthy_count}/{len(endpoints)} healthy")

        return len(self.errors) == 0

    def check_background_tasks(self):
        """Check background task queues"""
        print("Checking background tasks...")

        try:
            # Check if Celery is running (basic check)
            import subprocess
            result = subprocess.run(['pgrep', '-f', 'celery'], capture_output=True, text=True)

            if result.returncode == 0:
                self.results['celery'] = {'status': 'healthy', 'processes': len(result.stdout.strip().split('\n'))}
                print("Celery background tasks healthy")
            else:
                self.warnings.append("Celery processes not found - background tasks may not be running")
                self.results['celery'] = {'status': 'warning', 'error': 'No Celery processes found'}

        except Exception as e:
            self.warnings.append(f"Celery check failed: {e}")
            self.results['celery'] = {'status': 'warning', 'error': str(e)}

        return True

    def run_all_checks(self):
        """Run all health checks"""
        print("Starting comprehensive health check...")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print("-" * 50)

        checks = [
            self.check_database,
            self.check_cache,
            self.check_disk_space,
            self.check_memory,
            self.check_application,
            self.check_background_tasks,
        ]

        for check in checks:
            try:
                check()
            except Exception as e:
                self.errors.append(f"Check {check.__name__} failed with exception: {e}")

        return self.generate_report()

    def generate_report(self):
        """Generate health check report"""
        print("\n" + "=" * 50)
        print("HEALTH CHECK REPORT")
        print("=" * 50)

        # Overall status
        overall_status = "HEALTHY" if not self.errors else "UNHEALTHY"

        print(f"Overall Status: {overall_status}")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print()

        # Component status
        print("Component Status:")
        for component, result in self.results.items():
            status = result.get('status', 'unknown').upper()
            status_icon = "✓" if status == "HEALTHY" else "✗" if status == "UNHEALTHY" else "⚠"
            print(f"  {status_icon} {component}: {status}")

            # Additional details
            if 'error' in result:
                print(f"    Error: {result['error']}")
            elif component == 'database' and 'query_time' in result:
                print(".2f")
            elif component == 'disk' and 'usage_percent' in result:
                print(".1f")
            elif component == 'memory' and 'usage_percent' in result:
                print(".1f")

        print()

        # Warnings
        if self.warnings:
            print("Warnings:")
            for warning in self.warnings:
                print(f"  ⚠ {warning}")
            print()

        # Errors
        if self.errors:
            print("Errors:")
            for error in self.errors:
                print(f"  ✗ {error}")
            print()

        # Recommendations
        if self.errors or self.warnings:
            print("Recommendations:")
            if any('disk' in str(error) for error in self.errors):
                print("  - Free up disk space or add more storage")
            if any('memory' in str(error) for error in self.errors):
                print("  - Increase memory or optimize memory usage")
            if any('database' in str(error) for error in self.errors):
                print("  - Check database connectivity and configuration")
            if any('cache' in str(error) for error in self.errors):
                print("  - Verify Redis/cache server configuration")
            if any('application' in str(error) for error in self.errors):
                print("  - Check application server and reverse proxy configuration")
            print()

        return len(self.errors) == 0


def main():
    """Main health check function"""
    checker = HealthChecker()
    is_healthy = checker.run_all_checks()

    # Exit with appropriate code
    sys.exit(0 if is_healthy else 1)


if __name__ == '__main__':
    main()