#!/usr/bin/env python
"""
API Documentation Generator for Inventory Management System
Generates comprehensive API documentation from Django REST Framework
"""

import os
import sys
import django
import json
from pathlib import Path
from collections import defaultdict

# Add the project directory to the Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inventory_management.settings')
django.setup()

from django.urls import reverse
from django.test import Client
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from drf_yasg.generators import OpenAPISchemaGenerator
from drf_yasg import openapi


class APIDocumentationGenerator:
    def __init__(self):
        self.client = APIClient()
        self.schema_generator = OpenAPISchemaGenerator()
        self.endpoints = defaultdict(dict)

    def authenticate_client(self):
        """Create a test user and authenticate the client"""
        # Create or get test user
        user, created = User.objects.get_or_create(
            username='api_docs_user',
            defaults={
                'email': 'api-docs@example.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            user.set_password('test_password_123')
            user.save()

        # Get or create token
        token, created = Token.objects.get_or_create(user=user)

        # Authenticate client
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.key}')
        return token.key

    def get_endpoints(self):
        """Extract all API endpoints from URL patterns"""
        from django.urls import get_resolver
        from rest_framework.routers import APIRootView

        resolver = get_resolver()
        endpoints = []

        def extract_endpoints(urlpatterns, prefix=''):
            for pattern in urlpatterns:
                if hasattr(pattern, 'url_patterns'):
                    # This is an include
                    new_prefix = prefix + str(pattern.pattern)
                    extract_endpoints(pattern.url_patterns, new_prefix)
                elif hasattr(pattern, 'pattern') and hasattr(pattern, 'callback'):
                    # This is a URL pattern
                    url = prefix + str(pattern.pattern)
                    if url.startswith('/api/'):
                        view = pattern.callback
                        if hasattr(view, 'view_class'):
                            view_class = view.view_class
                        else:
                            view_class = view

                        endpoints.append({
                            'url': url,
                            'view': view_class,
                            'name': getattr(pattern, 'name', ''),
                            'methods': self.get_allowed_methods(view_class)
                        })

        extract_endpoints(resolver.urlpatterns)
        return endpoints

    def get_allowed_methods(self, view_class):
        """Get allowed HTTP methods for a view"""
        if hasattr(view_class, 'allowed_methods'):
            return view_class.allowed_methods
        elif hasattr(view_class, 'http_method_names'):
            return [method.upper() for method in view_class.http_method_names if method != 'options']
        else:
            return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

    def test_endpoint(self, endpoint):
        """Test an endpoint and collect response information"""
        url = endpoint['url']
        methods = endpoint['methods']

        endpoint_info = {
            'url': url,
            'methods': methods,
            'responses': {},
            'parameters': [],
            'description': self.get_view_description(endpoint['view'])
        }

        for method in methods:
            try:
                # Prepare test data based on method
                test_data = self.get_test_data_for_method(method, url)

                # Make request
                if method == 'GET':
                    response = self.client.get(url, test_data)
                elif method == 'POST':
                    response = self.client.post(url, test_data, format='json')
                elif method == 'PUT':
                    response = self.client.put(url, test_data, format='json')
                elif method == 'PATCH':
                    response = self.client.patch(url, test_data, format='json')
                elif method == 'DELETE':
                    response = self.client.delete(url)

                # Store response info
                endpoint_info['responses'][method] = {
                    'status_code': response.status_code,
                    'content_type': response.get('Content-Type', ''),
                    'sample_response': self.format_response_data(response.data) if hasattr(response, 'data') else None
                }

            except Exception as e:
                endpoint_info['responses'][method] = {
                    'error': str(e),
                    'status_code': 500
                }

        return endpoint_info

    def get_test_data_for_method(self, method, url):
        """Generate test data based on method and URL"""
        test_data = {}

        # Extract resource type from URL
        if 'inventory' in url:
            if method in ['POST', 'PUT', 'PATCH']:
                test_data = {
                    'product_id': 1,
                    'warehouse_id': 1,
                    'quantity': 50,
                    'min_stock_level': 5,
                    'max_stock_level': 100
                }
        elif 'orders' in url:
            if method in ['POST', 'PUT', 'PATCH']:
                test_data = {
                    'customer_id': 1,
                    'items': [
                        {'product_id': 1, 'quantity': 2, 'unit_price': 99.99}
                    ],
                    'shipping_address': {
                        'street': '123 Main St',
                        'city': 'Anytown',
                        'state': 'CA',
                        'zip_code': '12345',
                        'country': 'USA'
                    }
                }
        elif 'auth' in url and 'register' in url:
            test_data = {
                'username': 'testuser',
                'email': 'test@example.com',
                'password': 'testpass123',
                'first_name': 'Test',
                'last_name': 'User'
            }

        return test_data

    def get_view_description(self, view_class):
        """Get description from view class"""
        if hasattr(view_class, '__doc__') and view_class.__doc__:
            return view_class.__doc__.strip()
        elif hasattr(view_class, 'get_view_description'):
            return view_class.get_view_description()
        else:
            return f"{view_class.__name__} API endpoint"

    def format_response_data(self, data, max_items=3):
        """Format response data for documentation"""
        if isinstance(data, dict):
            formatted = {}
            for key, value in data.items():
                if isinstance(value, list) and len(value) > max_items:
                    formatted[key] = value[:max_items] + [f"... {len(value) - max_items} more items"]
                elif isinstance(value, dict):
                    formatted[key] = self.format_response_data(value, max_items)
                else:
                    formatted[key] = value
            return formatted
        elif isinstance(data, list):
            if len(data) > max_items:
                return data[:max_items] + [f"... {len(data) - max_items} more items"]
            return [self.format_response_data(item, max_items) for item in data]
        else:
            return data

    def generate_openapi_schema(self):
        """Generate OpenAPI schema"""
        try:
            schema = self.schema_generator.get_schema()
            return schema
        except Exception as e:
            print(f"Failed to generate OpenAPI schema: {e}")
            return None

    def generate_markdown_docs(self, endpoints_info):
        """Generate Markdown documentation"""
        docs = ["# Inventory Management System API Documentation\n"]
        docs.append("Generated automatically from Django REST Framework endpoints.\n")

        # Group endpoints by category
        categories = defaultdict(list)

        for endpoint in endpoints_info:
            url_parts = endpoint['url'].strip('/').split('/')
            if len(url_parts) > 1 and url_parts[1] in ['auth', 'inventory', 'orders', 'warehouses', 'shipping', 'payments', 'marketplace', 'dashboard']:
                category = url_parts[1].title()
            else:
                category = 'General'
            categories[category].append(endpoint)

        # Generate documentation for each category
        for category, endpoints in categories.items():
            docs.append(f"## {category} API\n")

            for endpoint in endpoints:
                docs.append(f"### `{endpoint['url']}`\n")
                docs.append(f"**Methods:** {', '.join(endpoint['methods'])}\n")
                docs.append(f"**Description:** {endpoint['description']}\n")

                # Authentication note
                if 'auth' not in endpoint['url']:
                    docs.append("**Authentication:** Required (JWT Bearer token)\n")

                # Request/Response examples
                for method, response_info in endpoint['responses'].items():
                    docs.append(f"#### {method}\n")

                    if 'error' in response_info:
                        docs.append(f"**Error:** {response_info['error']}\n")
                    else:
                        docs.append(f"**Status Code:** {response_info['status_code']}\n")

                        if response_info.get('sample_response'):
                            docs.append("**Sample Response:**\n```json\n")
                            docs.append(json.dumps(response_info['sample_response'], indent=2))
                            docs.append("\n```\n")

                docs.append("---\n")

        return '\n'.join(docs)

    def generate_postman_collection(self, endpoints_info):
        """Generate Postman collection JSON"""
        collection = {
            "info": {
                "name": "Inventory Management System API",
                "description": "Complete API collection for Inventory Management System",
                "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            "item": [],
            "variable": [
                {
                    "key": "base_url",
                    "value": "http://localhost:8000",
                    "type": "string"
                },
                {
                    "key": "token",
                    "value": "",
                    "type": "string"
                }
            ]
        }

        # Group by category
        categories = defaultdict(list)

        for endpoint in endpoints_info:
            url_parts = endpoint['url'].strip('/').split('/')
            if len(url_parts) > 1 and url_parts[1] in ['auth', 'inventory', 'orders', 'warehouses', 'shipping', 'payments', 'marketplace', 'dashboard']:
                category = url_parts[1].title()
            else:
                category = 'General'
            categories[category].append(endpoint)

        # Create folder structure
        for category, endpoints in categories.items():
            folder = {
                "name": category,
                "item": []
            }

            for endpoint in endpoints:
                for method in endpoint['methods']:
                    request_item = {
                        "name": f"{method} {endpoint['url']}",
                        "request": {
                            "method": method,
                            "header": [
                                {
                                    "key": "Content-Type",
                                    "value": "application/json"
                                }
                            ],
                            "url": {
                                "raw": "{{base_url}}{endpoint['url']}",
                                "host": ["{{base_url}}"],
                                "path": endpoint['url'].strip('/').split('/')
                            }
                        }
                    }

                    # Add authorization for non-auth endpoints
                    if 'auth' not in endpoint['url']:
                        request_item["request"]["header"].append({
                            "key": "Authorization",
                            "value": "Bearer {{token}}"
                        })

                    # Add request body for applicable methods
                    if method in ['POST', 'PUT', 'PATCH'] and endpoint.get('test_data'):
                        request_item["request"]["body"] = {
                            "mode": "raw",
                            "raw": json.dumps(endpoint['test_data'], indent=2)
                        }

                    folder["item"].append(request_item)

            collection["item"].append(folder)

        return collection

    def save_documentation(self, markdown_docs, postman_collection, openapi_schema=None):
        """Save generated documentation to files"""
        docs_dir = BASE_DIR / 'docs' / 'api'
        docs_dir.mkdir(parents=True, exist_ok=True)

        # Save Markdown documentation
        with open(docs_dir / 'api_documentation.md', 'w') as f:
            f.write(markdown_docs)

        # Save Postman collection
        with open(docs_dir / 'postman_collection.json', 'w') as f:
            json.dump(postman_collection, f, indent=2)

        # Save OpenAPI schema if available
        if openapi_schema:
            with open(docs_dir / 'openapi_schema.json', 'w') as f:
                json.dump(openapi_schema, f, indent=2)

        print(f"Documentation saved to: {docs_dir}")


def main():
    """Main documentation generation function"""
    print("Generating API documentation...")

    generator = APIDocumentationGenerator()

    # Authenticate client
    token = generator.authenticate_client()
    print(f"Authenticated with token: {token[:20]}...")

    # Get all endpoints
    endpoints = generator.get_endpoints()
    print(f"Found {len(endpoints)} API endpoints")

    # Test endpoints and collect information
    endpoints_info = []
    for i, endpoint in enumerate(endpoints):
        print(f"Testing endpoint {i+1}/{len(endpoints)}: {endpoint['url']}")
        endpoint_info = generator.test_endpoint(endpoint)
        endpoints_info.append(endpoint_info)

    # Generate OpenAPI schema
    print("Generating OpenAPI schema...")
    openapi_schema = generator.generate_openapi_schema()

    # Generate Markdown documentation
    print("Generating Markdown documentation...")
    markdown_docs = generator.generate_markdown_docs(endpoints_info)

    # Generate Postman collection
    print("Generating Postman collection...")
    postman_collection = generator.generate_postman_collection(endpoints_info)

    # Save documentation
    print("Saving documentation...")
    generator.save_documentation(markdown_docs, postman_collection, openapi_schema)

    print("API documentation generation completed!")
    print("\nGenerated files:")
    print("- docs/api/api_documentation.md")
    print("- docs/api/postman_collection.json")
    print("- docs/api/openapi_schema.json (if available)")


if __name__ == '__main__':
    main()