#!/usr/bin/env python3
"""
Simple API testing script for inventory management system
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(method, url, data=None, headers=None):
    """Test an API endpoint"""
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers)
        else:
            print(f"Unsupported method: {method}")
            return False

        print(f"{method} {url} - Status: {response.status_code}")
        if response.status_code >= 400:
            print(f"Error: {response.text[:200]}...")
        else:
            print(f"Success: {response.text[:200]}...")
        return response.status_code < 400
    except Exception as e:
        print(f"Error testing {method} {url}: {e}")
        return False

def main():
    print("Testing Inventory Management API Endpoints")
    print("=" * 50)

    # Test auth endpoints
    print("\n1. Testing Authentication Endpoints:")
    test_endpoint('POST', f"{BASE_URL}/api/auth/register/", {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123",
        "user_type": "customer"
    })

    # Test inventory endpoints
    print("\n2. Testing Inventory Endpoints:")
    test_endpoint('GET', f"{BASE_URL}/api/inventory/")

    # Test warehouse endpoints
    print("\n3. Testing Warehouse Endpoints:")
    test_endpoint('GET', f"{BASE_URL}/api/warehouses/")

    # Test orders endpoints
    print("\n4. Testing Orders Endpoints:")
    test_endpoint('GET', f"{BASE_URL}/api/orders/")

    # Test payments endpoints
    print("\n5. Testing Payments Endpoints:")
    test_endpoint('GET', f"{BASE_URL}/api/payments/")

    # Test shipping endpoints
    print("\n6. Testing Shipping Endpoints:")
    test_endpoint('GET', f"{BASE_URL}/api/shipping/")

    # Test marketplace endpoints
    print("\n7. Testing Marketplace Endpoints:")
    test_endpoint('GET', f"{BASE_URL}/api/marketplace/")

    # Test dashboard endpoints
    print("\n8. Testing Dashboard Endpoints:")
    test_endpoint('GET', f"{BASE_URL}/api/dashboard/")

    print("\nAPI Testing Complete!")

if __name__ == "__main__":
    main()