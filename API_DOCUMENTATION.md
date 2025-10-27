# Inventory Management System API Documentation

## Overview

The Inventory Management System provides a comprehensive REST API for managing inventory, orders, users, payments, shipping, and marketplace integrations. This documentation covers all available endpoints, authentication, and usage examples.

## Authentication

### JWT Token Authentication

All API endpoints require authentication using JWT tokens.

#### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### Refresh Token
```http
POST /api/auth/token/refresh/
Authorization: Bearer <your-token>

{
  "refresh": "refresh-token-here"
}
```

#### Register New User
```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}
```

## Core API Endpoints

### Inventory Management

#### Get Inventory Items
```http
GET /api/inventory/items/
Authorization: Bearer <token>
```

**Query Parameters:**
- `product_name`: Filter by product name
- `category`: Filter by category
- `warehouse_id`: Filter by warehouse
- `stock_status`: low, normal, out
- `min_stock`: Minimum stock level
- `max_stock`: Maximum stock level

**Response:**
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/inventory/items/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "product": {
        "id": 1,
        "name": "Laptop",
        "sku": "LAP001",
        "price": 999.99,
        "category": "Electronics"
      },
      "warehouse": {
        "id": 1,
        "name": "Main Warehouse",
        "location": "123 Main St"
      },
      "quantity": 50,
      "min_stock_level": 5,
      "max_stock_level": 100,
      "last_updated": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Update Inventory Item
```http
PATCH /api/inventory/items/{id}/
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 75,
  "min_stock_level": 10
}
```

#### Bulk Inventory Operations
```http
POST /api/inventory/bulk-update/
Authorization: Bearer <token>
Content-Type: application/json

{
  "updates": [
    {"id": 1, "data": {"quantity": 60}},
    {"id": 2, "data": {"quantity": 40}}
  ]
}
```

#### Get Low Stock Alerts
```http
GET /api/inventory/alerts/
Authorization: Bearer <token>
```

### Order Management

#### Create Order
```http
POST /api/orders/
Authorization: Bearer <token>
Content-Type: application/json

{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 999.99
    }
  ],
  "shipping_address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip_code": "12345",
    "country": "USA"
  },
  "billing_address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip_code": "12345",
    "country": "USA"
  }
}
```

#### Get Orders
```http
GET /api/orders/
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: pending, confirmed, processing, shipped, delivered, cancelled
- `customer_id`: Filter by customer
- `date_from`: Start date (YYYY-MM-DD)
- `date_to`: End date (YYYY-MM-DD)
- `min_total`: Minimum order total
- `max_total`: Maximum order total

#### Update Order Status
```http
PATCH /api/orders/{id}/status/
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipped",
  "note": "Order shipped via UPS"
}
```

#### Add Order Note
```http
POST /api/orders/{id}/notes/
Authorization: Bearer <token>
Content-Type: application/json

{
  "note": "Customer requested expedited shipping"
}
```

### Warehouse Management

#### Get Warehouses
```http
GET /api/warehouses/
Authorization: Bearer <token>
```

#### Create Warehouse
```http
POST /api/warehouses/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "East Coast Warehouse",
  "location": "456 Industrial Blvd, Boston, MA 02101",
  "capacity": 5000,
  "is_active": true
}
```

#### Transfer Inventory Between Warehouses
```http
POST /api/inventory/transfer/
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": 1,
  "from_warehouse_id": 1,
  "to_warehouse_id": 2,
  "quantity": 25,
  "reason": "Rebalancing stock"
}
```

### Shipping Management

#### Create Shipment
```http
POST /api/shipping/
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": 1,
  "carrier": "UPS",
  "service_type": "Ground",
  "tracking_number": "1Z999AA1234567890",
  "shipping_cost": 15.99,
  "estimated_delivery": "2024-01-20"
}
```

#### Get Shipping Analytics
```http
GET /api/shipping/analytics/?period=30d
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_shipments": 150,
  "on_time_delivery_rate": 0.95,
  "average_shipping_cost": 12.50,
  "carrier_performance": [
    {
      "carrier": "UPS",
      "total_shipments": 80,
      "on_time_deliveries": 76,
      "average_cost": 13.25,
      "average_delivery_time": 2.5
    }
  ]
}
```

### Payment Management

#### Process Payment
```http
POST /api/payments/transactions/
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": 1,
  "amount": 1999.99,
  "currency": "USD",
  "payment_method": "credit_card",
  "gateway": "stripe"
}
```

#### Get Payment Gateways
```http
GET /api/payments/gateways/
Authorization: Bearer <token>
```

#### Configure Payment Gateway
```http
POST /api/payments/gateways/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Stripe Production",
  "gateway_type": "stripe",
  "api_key": "sk_live_...",
  "webhook_secret": "whsec_...",
  "is_active": true
}
```

### Marketplace Integration

#### Connect Marketplace
```http
POST /api/marketplace/connections/
Authorization: Bearer <token>
Content-Type: application/json

{
  "platform": "amazon",
  "name": "Amazon US Store",
  "credentials": {
    "access_key": "AKIA...",
    "secret_key": "secret...",
    "seller_id": "A1B2C3...",
    "marketplace_id": "ATVPDKIKX0DER"
  }
}
```

#### Sync Products to Marketplace
```http
POST /api/marketplace/products/sync/
Authorization: Bearer <token>
Content-Type: application/json

{
  "product_id": 1,
  "connection_id": 1,
  "price": 999.99,
  "quantity": 50
}
```

#### Get Marketplace Analytics
```http
GET /api/marketplace/analytics/1/?period=30d
Authorization: Bearer <token>
```

### Dashboard & Analytics

#### Get Dashboard Metrics
```http
GET /api/dashboard/metrics/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total_sales": 150000.00,
  "total_orders": 450,
  "total_inventory_value": 75000.00,
  "low_stock_items": 12,
  "pending_orders": 25,
  "monthly_revenue": 25000.00
}
```

#### Get Sales Data
```http
GET /api/dashboard/sales/?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <token>
```

#### Get Inventory Levels
```http
GET /api/dashboard/inventory-levels/
Authorization: Bearer <token>
```

### User Management

#### Get Current User Profile
```http
GET /api/auth/user/
Authorization: Bearer <token>
```

#### Update User Profile
```http
PATCH /api/auth/user/
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com"
}
```

#### Change Password
```http
POST /api/auth/change-password/
Authorization: Bearer <token>
Content-Type: application/json

{
  "old_password": "currentpassword",
  "new_password": "newsecurepassword"
}
```

## Error Handling

All API endpoints return standardized error responses:

```json
{
  "error": {
    "code": 400,
    "message": "Bad request - please check your input",
    "details": {
      "field_name": ["This field is required."]
    }
  }
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting

API endpoints are rate limited to prevent abuse:
- Authenticated requests: 1000/hour
- Anonymous requests: 100/hour
- Burst limit: 50 requests/minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1609459200
```

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

```json
{
  "count": 150,
  "next": "http://localhost:8000/api/inventory/items/?page=2",
  "previous": null,
  "results": [...]
}
```

## Filtering and Sorting

Most list endpoints support filtering and sorting:

### Filtering
- Use query parameters to filter results
- Example: `GET /api/orders/?status=pending&date_from=2024-01-01`

### Sorting
- Use `ordering` parameter
- Example: `GET /api/inventory/items/?ordering=name` (ascending)
- Example: `GET /api/inventory/items/?ordering=-created_at` (descending)

## File Uploads

Endpoints that accept file uploads require `multipart/form-data`:

```http
POST /api/inventory/bulk-import/
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: inventory.csv
```

## Webhooks

The system supports webhooks for real-time notifications:

### Supported Events
- `order.created`
- `order.updated`
- `payment.completed`
- `shipment.delivered`
- `inventory.low_stock`

### Webhook Payload Example
```json
{
  "event": "order.created",
  "data": {
    "order_id": 123,
    "customer_id": 456,
    "total": 199.99,
    "items": [...]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## SDKs and Libraries

### Python Client
```python
from inventory_client import InventoryClient

client = InventoryClient(api_key='your-token')
orders = client.get_orders(status='pending')
```

### JavaScript Client
```javascript
import { InventoryAPI } from 'inventory-api-client';

const client = new InventoryAPI({ token: 'your-token' });
const products = await client.getInventoryItems();
```

## Testing

### API Testing Examples

```bash
# Test authentication
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Test inventory endpoint
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/inventory/items/

# Test order creation
curl -X POST http://localhost:8000/api/orders/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"customer_id":1,"items":[{"product_id":1,"quantity":2}]}'
```

## Versioning

API versioning is handled through URL paths:
- Current version: v1 (no prefix for backward compatibility)
- Future versions: `/api/v2/endpoint/`

## Support

For API support and questions:
- API Documentation: This document
- Support Email: api-support@inventory-system.com
- Issue Tracker: GitHub Issues

## Changelog

### API v1.0.0
- Initial API release
- Core CRUD operations for all resources
- JWT authentication
- Pagination and filtering
- Error handling and validation
- Rate limiting
- Webhook support