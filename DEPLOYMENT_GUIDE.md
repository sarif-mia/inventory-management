# Deployment Guide

This guide provides comprehensive instructions for deploying the Inventory Management System in various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Development Deployment](#development-deployment)
4. [Production Deployment](#production-deployment)
5. [SSL/TLS Configuration](#ssltls-configuration)
6. [Database Setup](#database-setup)
7. [Monitoring Setup](#monitoring-setup)
8. [Backup Configuration](#backup-configuration)
9. [Scaling](#scaling)
10. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- **OS**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recommended for production)
- **Storage**: 20GB+ SSD
- **Network**: 100Mbps+ connection

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Python 3.11+ (for local development)
- Node.js 18+ (for local development)
- Nginx (for production)
- PostgreSQL 15+ (for production)
- Redis 7+ (for production)

### Domain and SSL
- Registered domain name
- SSL certificate (Let's Encrypt recommended)
- DNS configuration pointing to server

## Environment Setup

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git htop ufw fail2ban

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create application user
sudo useradd -m -s /bin/bash inventory
sudo usermod -aG docker inventory

# Switch to application user
sudo su - inventory
```

### 2. Clone Repository

```bash
git clone <repository-url> ~/inventory-management-software
cd ~/inventory-management-software

# Create necessary directories
mkdir -p ssl logs backups
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```bash
# Django Configuration
DJANGO_ENV=production
SECRET_KEY=your-64-character-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://inventory_user:secure_password@localhost:5432/inventory_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# AWS S3 (optional, for file storage)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket
AWS_S3_REGION_NAME=us-east-1

# SSL
SSL_CERT_PATH=/etc/ssl/certs/yourdomain.crt
SSL_KEY_PATH=/etc/ssl/private/yourdomain.key
```

## Development Deployment

### Using Docker Compose (Recommended)

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build -d

# Check logs
docker-compose -f docker-compose.dev.yml logs -f

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin/
```

### Manual Development Setup

```bash
# Backend setup
cd ~/inventory-management-software
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start backend
python manage.py runserver 0.0.0.0:8000

# Frontend setup (in another terminal)
cd frontend
npm install
npm start
```

## Production Deployment

### 1. SSL Certificate Setup

#### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Certificates will be stored in /etc/letsencrypt/live/yourdomain.com/
```

#### Using Self-Signed Certificate (Development Only)

```bash
# Generate self-signed certificate
python scripts/generate_ssl_cert.py --cert-dir ssl

# Copy to system location
sudo cp ssl/cert.pem /etc/ssl/certs/
sudo cp ssl/key.pem /etc/ssl/private/
```

### 2. Database Setup

#### PostgreSQL Installation

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql

# In PostgreSQL shell:
CREATE DATABASE inventory_db;
CREATE USER inventory_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE inventory_db TO inventory_user;
ALTER USER inventory_user CREATEDB;
\q
```

#### Database Initialization

```bash
# Run database setup script
python scripts/setup_database.py

# Create initial data (optional)
python manage.py shell -c "
from django.contrib.auth.models import User
User.objects.create_superuser('admin', 'admin@yourdomain.com', 'secure_password')
"
```

### 3. Redis Setup

```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: supervised systemd
# Set: maxmemory 256mb
# Set: maxmemory-policy allkeys-lru

# Start Redis
sudo systemctl start redis
sudo systemctl enable redis
```

### 4. Application Deployment

```bash
# Build production images
docker-compose build

# Start production services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 5. Nginx Configuration

```bash
# Install Nginx
sudo apt install nginx

# Copy nginx configuration
sudo cp nginx/nginx.conf /etc/nginx/sites-available/inventory

# Edit configuration for your domain
sudo nano /etc/nginx/sites-available/inventory

# Update server_name and SSL paths
server_name yourdomain.com www.yourdomain.com;
ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

# Enable site
sudo ln -s /etc/nginx/sites-available/inventory /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## SSL/TLS Configuration

### Security Headers

The application includes comprehensive security headers:

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
```

### SSL Configuration

```nginx
# SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

### Certificate Renewal (Let's Encrypt)

```bash
# Test renewal
sudo certbot renew --dry-run

# Set up automatic renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Database Setup

### Production Database Configuration

```python
# settings/production.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'inventory_db',
        'USER': 'inventory_user',
        'PASSWORD': 'secure_password',
        'HOST': 'localhost',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
        },
        'CONN_MAX_AGE': 600,
        'CONN_HEALTH_CHECKS': True,
    }
}
```

### Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_orders_status_date ON orders_order (status, created_at DESC);
CREATE INDEX CONCURRENTLY idx_inventory_product_warehouse ON inventory_inventoryitem (product_id, warehouse_id);
CREATE INDEX CONCURRENTLY idx_payments_status_date ON payments_paymenttransaction (status, created_at DESC);

-- Analyze tables
ANALYZE orders_order;
ANALYZE inventory_inventoryitem;
ANALYZE payments_paymenttransaction;
```

## Monitoring Setup

### Health Checks

```bash
# Run health check
python scripts/health_check.py

# Set up cron job for regular health checks
crontab -e
# Add: */5 * * * * cd /home/inventory/inventory-management-software && python scripts/health_check.py >> logs/health_check.log 2>&1
```

### Log Rotation

```bash
# Configure logrotate
sudo nano /etc/logrotate.d/inventory

/home/inventory/inventory-management-software/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 inventory inventory
    postrotate
        docker-compose restart backend
    endscript
}
```

### Monitoring Tools

#### Prometheus + Grafana Setup

```bash
# Install Prometheus
sudo apt install prometheus prometheus-node-exporter

# Install Grafana
sudo apt install grafana

# Configure Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server

# Access Grafana at http://your-server:3000
# Default credentials: admin/admin
```

## Backup Configuration

### Automated Backups

```bash
# Set up daily database backup
crontab -e
# Add: 0 2 * * * cd /home/inventory/inventory-management-software && python scripts/backup_database.py create --type=daily

# Set up weekly backup rotation
# Add: 0 3 * * 0 cd /home/inventory/inventory-management-software && python scripts/backup_database.py rotate
```

### Backup Verification

```bash
# List backups
python scripts/backup_database.py info

# Test backup restoration (on staging environment)
# 1. Create new database
# 2. Restore from backup file
# 3. Verify data integrity
```

### Offsite Backup

```bash
# Upload backups to cloud storage
aws s3 sync backups/ s3://your-backup-bucket/

# Or use rsync to remote server
rsync -avz backups/ user@backup-server:/path/to/backups/
```

## Scaling

### Horizontal Scaling

#### Load Balancer Setup

```nginx
# /etc/nginx/sites-available/load-balancer

upstream backend_servers {
    server backend1.yourdomain.com:8000;
    server backend2.yourdomain.com:8000;
    server backend3.yourdomain.com:8000;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://backend_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### Database Scaling

```python
# settings/production.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'inventory_db',
        'USER': 'inventory_user',
        'PASSWORD': 'secure_password',
        'HOST': 'database-cluster.yourdomain.com',
        'PORT': '5432',
        'OPTIONS': {
            'sslmode': 'require',
        },
    },
    'replica1': {
        'ENGINE': 'django.db.backends.postgresql',
        # ... replica configuration
    }
}
```

#### Redis Clustering

```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    command: redis-server /etc/redis/redis.conf
    volumes:
      - ./redis.conf:/etc/redis/redis.conf
      - redis_data:/data
    networks:
      - inventory-network

  redis-sentinel:
    image: redis:7-alpine
    command: redis-sentinel /etc/redis/sentinel.conf
    volumes:
      - ./sentinel.conf:/etc/redis/sentinel.conf
    depends_on:
      - redis
    networks:
      - inventory-network
```

### Vertical Scaling

#### Resource Monitoring

```bash
# Monitor system resources
htop
df -h
free -h
iostat -x 1

# Docker resource usage
docker stats

# Database performance
python manage.py shell -c "
from django.db import connection
cursor = connection.cursor()
cursor.execute('SELECT * FROM pg_stat_activity;')
print(cursor.fetchall())
"
```

## Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check Docker containers
docker-compose ps

# Check logs
docker-compose logs backend

# Check environment variables
docker-compose exec backend env

# Test database connection
docker-compose exec db psql -U inventory_user -d inventory_db -c "SELECT 1;"
```

#### Database Connection Issues

```bash
# Test database connectivity
python manage.py dbshell

# Check database service
sudo systemctl status postgresql

# Check connection string
python manage.py shell -c "
from django.db import connection
print(connection.settings_dict)
"
```

#### Static Files Not Loading

```bash
# Collect static files
python manage.py collectstatic --noinput

# Check file permissions
ls -la staticfiles/

# Check Nginx configuration
sudo nginx -t
sudo systemctl reload nginx
```

#### SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in /etc/ssl/certs/yourdomain.crt -text -noout

# Test SSL connection
openssl s_client -connect yourdomain.com:443

# Renew Let's Encrypt certificate
sudo certbot renew
```

#### Performance Issues

```bash
# Check slow queries
python manage.py shell -c "
from django.db import connection
cursor = connection.cursor()
cursor.execute('SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;')
print(cursor.fetchall())
"

# Check cache hit rate
python manage.py shell -c "
from django.core.cache import cache
# Add cache monitoring logic
"
```

### Log Analysis

```bash
# View recent logs
tail -f logs/django.log

# Search for errors
grep "ERROR" logs/django.log | tail -20

# Analyze access patterns
awk '{print $1}' logs/access.log | sort | uniq -c | sort -nr | head -10
```

### Emergency Recovery

```bash
# Stop all services
docker-compose down

# Restore from backup
# 1. Identify good backup file
# 2. Stop database
# 3. Restore database from backup
# 4. Start services
# 5. Verify application functionality

# Quick rollback (if using blue-green deployment)
docker-compose pull
docker-compose up -d
```

## Maintenance Tasks

### Regular Maintenance

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose pull

# Clean up old Docker images
docker image prune -f

# Database maintenance
docker-compose exec db vacuumdb --all --analyze

# Log rotation
sudo logrotate /etc/logrotate.d/inventory
```

### Security Updates

```bash
# Update SSL certificates
sudo certbot renew

# Security audit
# Run security scanning tools
# Review and update dependencies
pip list --outdated
npm audit

# Update secrets and rotate keys
# Change database passwords
# Update API keys
```

## Performance Optimization

### Database Optimization

```sql
-- Create indexes
CREATE INDEX CONCURRENTLY idx_orders_customer_date ON orders_order (customer_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_inventory_sku ON inventory_product (sku);

-- Update statistics
ANALYZE orders_order;
ANALYZE inventory_product;

-- Partition large tables (if needed)
-- CREATE TABLE orders_order_y2024 PARTITION OF orders_order FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Application Optimization

```python
# settings/production.py
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Database connection pooling
DATABASES['default']['CONN_MAX_AGE'] = 600
DATABASES['default']['CONN_HEALTH_CHECKS'] = True
```

### CDN Setup (Optional)

```python
# settings/production.py
AWS_S3_CUSTOM_DOMAIN = 'cdn.yourdomain.com'
STATIC_URL = f'https://{AWS_S3_CUSTOM_DOMAIN}/static/'
```

## Support

For deployment support:
- Check logs: `docker-compose logs`
- Health check: `python scripts/health_check.py`
- Documentation: This guide
- Issues: GitHub repository
- Email: deployment-support@inventory-system.com

## Checklist

### Pre-Deployment
- [ ] Server provisioned and configured
- [ ] Domain DNS configured
- [ ] SSL certificates obtained
- [ ] Environment variables set
- [ ] Database created and configured
- [ ] Redis installed and running

### Deployment
- [ ] Code deployed successfully
- [ ] Database migrations run
- [ ] Static files collected
- [ ] Services started and healthy
- [ ] Nginx configured and running
- [ ] SSL working correctly

### Post-Deployment
- [ ] Application accessible via HTTPS
- [ ] Admin panel working
- [ ] API endpoints responding
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Documentation updated

### Monitoring
- [ ] Health checks passing
- [ ] Logs being written
- [ ] Performance metrics collected
- [ ] Alerts configured
- [ ] Backup verification completed