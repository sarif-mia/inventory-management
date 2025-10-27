# Inventory Management System

A comprehensive inventory management system built with Django REST Framework (backend) and React (frontend). This system provides complete inventory tracking, order management, marketplace integration, payment processing, shipping management, and seller management capabilities.

## Features

### Core Features
- **Inventory Management**: Track products, stock levels, warehouses, and inventory movements
- **Order Management**: Complete order lifecycle from creation to fulfillment
- **User Management**: Role-based access control with JWT authentication
- **Dashboard & Analytics**: Real-time insights and performance metrics
- **Mobile-Responsive**: Optimized for desktop and mobile devices

### Advanced Features
- **Marketplace Integration**: Connect with Amazon, eBay, and custom marketplaces
- **Payment Processing**: Stripe, PayPal, and custom payment gateway support
- **Shipping Management**: Multi-carrier support with tracking and analytics
- **Seller Management**: Multi-vendor marketplace capabilities
- **Quick Commerce**: Real-time inventory sync for food delivery platforms
- **Background Tasks**: Celery-based asynchronous processing
- **API Documentation**: Comprehensive REST API with OpenAPI/Swagger

## Architecture

### Backend (Django)
- **Framework**: Django 5.2.7 with Django REST Framework
- **Database**: PostgreSQL (production) / SQLite (development)
- **Cache**: Redis for session and general caching
- **Task Queue**: Celery with Redis broker
- **Authentication**: JWT tokens with refresh capability
- **File Storage**: AWS S3 or local filesystem

### Frontend (React)
- **Framework**: React 19 with TypeScript
- **State Management**: Redux Toolkit
- **UI Library**: Material-UI (MUI) v7
- **Build Tool**: Create React App
- **PWA**: Service worker and offline capabilities

### Infrastructure
- **Containerization**: Docker and Docker Compose
- **Reverse Proxy**: Nginx
- **SSL/TLS**: Let's Encrypt or self-signed certificates
- **Monitoring**: Health checks and logging
- **Backup**: Automated database backups

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-management-software
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker (Recommended)**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Or start manually**

   **Backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

   **Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin/

### Production Deployment

1. **Build and deploy**
   ```bash
   # Build production images
   docker-compose build

   # Start production services
   docker-compose up -d
   ```

2. **SSL Certificate Setup**
   ```bash
   # Generate self-signed certificates for development
   python scripts/generate_ssl_cert.py

   # Or use Let's Encrypt for production
   certbot --nginx -d yourdomain.com
   ```

3. **Database Setup**
   ```bash
   # Run initial database setup
   python scripts/setup_database.py

   # Run production migrations
   python scripts/migrate_production.py
   ```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Django Configuration
DJANGO_ENV=production
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/inventory_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket
AWS_S3_REGION_NAME=us-east-1

# Payment Gateways
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Marketplace APIs
AMAZON_ACCESS_KEY=your-amazon-key
EBAY_APP_ID=your-ebay-app-id
```

### Docker Configuration

The system uses multiple Docker Compose files:

- `docker-compose.dev.yml`: Development environment
- `docker-compose.yml`: Production environment
- `nginx/nginx.conf`: Reverse proxy configuration

## API Documentation

### Authentication
```bash
# Login
POST /api/auth/login/
{
  "username": "admin",
  "password": "password"
}

# Get token
Response: {
  "token": "jwt-token-here",
  "user": {...}
}
```

### Core Endpoints

- **Inventory**: `/api/inventory/`
- **Orders**: `/api/orders/`
- **Users**: `/api/auth/`
- **Warehouses**: `/api/warehouses/`
- **Shipping**: `/api/shipping/`
- **Payments**: `/api/payments/`
- **Marketplace**: `/api/marketplace/`
- **Dashboard**: `/api/dashboard/`

### API Examples

```bash
# Get inventory items
GET /api/inventory/items/

# Create order
POST /api/orders/
{
  "customer_id": 1,
  "items": [
    {"product_id": 1, "quantity": 2}
  ]
}

# Update inventory
PATCH /api/inventory/items/1/
{
  "quantity": 50,
  "min_stock_level": 5
}
```

## Database Management

### Migrations
```bash
# Create migration
python manage.py makemigrations

# Run migrations
python manage.py migrate

# Production migration with backup
python scripts/migrate_production.py
```

### Backup and Restore
```bash
# Create backup
python scripts/backup_database.py create --type=daily

# List backups
python scripts/backup_database.py info

# Restore from backup
# Manual process: Copy backup file and restore using pg_restore or mysql
```

## Monitoring and Health Checks

### Health Check Endpoint
```bash
GET /health/
# Returns: OK
```

### System Health Check
```bash
python scripts/health_check.py
```

### Monitoring Features
- Request/response logging
- Error tracking with Sentry
- Performance monitoring
- Database connection pooling
- Cache hit/miss ratios

## Security

### Production Security Features
- HTTPS enforcement
- Security headers (CSP, HSTS, etc.)
- Rate limiting
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control
- Password hashing with PBKDF2
- Session management
- API key authentication for integrations

## Development

### Code Quality
```bash
# Backend
pip install -r requirements-dev.txt
flake8 .
black .
isort .

# Frontend
npm run lint
npm run test
```

### Testing
```bash
# Backend tests
python manage.py test

# Frontend tests
npm test

# API tests
python test_api.py
```

### Code Structure
```
inventory-management-software/
├── inventory_management/     # Django project
│   ├── settings/            # Environment-specific settings
│   ├── middleware.py        # Custom middleware
│   ├── exceptions.py        # Error handling
│   └── ...
├── dashboard/               # Dashboard app
├── inventory/               # Inventory management
├── orders/                  # Order management
├── users/                   # User management
├── payments/                # Payment processing
├── shipping/                # Shipping management
├── marketplace/             # Marketplace integration
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── store/          # Redux store
│   │   ├── services/       # API services
│   │   └── ...
│   └── public/
├── scripts/                 # Utility scripts
├── nginx/                   # Nginx configuration
├── docker-compose.yml       # Production deployment
└── docker-compose.dev.yml   # Development deployment
```

## Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] CDN configured for static files
- [ ] Firewall rules configured
- [ ] Regular security updates scheduled

### Scaling Considerations
- Database read replicas
- Redis clustering
- Load balancer configuration
- CDN for static assets
- Background task workers
- API rate limiting

## Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check database status
python manage.py dbshell
# Verify connection string in .env
```

**Static Files Not Loading**
```bash
# Collect static files
python manage.py collectstatic --noinput
# Check AWS S3 configuration
```

**Redis Connection Error**
```bash
# Check Redis service
docker-compose ps redis
# Verify REDIS_URL in .env
```

**Build Failures**
```bash
# Clear Docker cache
docker system prune -a
# Rebuild without cache
docker-compose build --no-cache
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for React components
- Write comprehensive tests
- Update documentation
- Use meaningful commit messages

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Documentation: [Link to docs]
- Issues: [GitHub Issues]
- Email: support@inventory-system.com

## Changelog

### Version 1.0.0
- Initial release
- Core inventory management
- Order processing
- User authentication
- Basic dashboard
- Docker deployment
- API documentation

### Future Enhancements
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Multi-tenant architecture
- [ ] AI-powered inventory forecasting
- [ ] Advanced marketplace integrations
- [ ] Real-time notifications
- [ ] Advanced user permissions