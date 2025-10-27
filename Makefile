# Inventory Management System - Makefile
# Provides common development and deployment commands

.PHONY: help install clean test lint format build deploy backup restore health-check logs

# Default target
help:
	@echo "Inventory Management System - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make install          Install all dependencies"
	@echo "  make clean            Clean up temporary files and caches"
	@echo "  make test             Run all tests (backend and frontend)"
	@echo "  make lint             Run linting on backend and frontend"
	@echo "  make format           Format code (backend and frontend)"
	@echo "  make dev              Start development environment"
	@echo "  make build            Build production assets"
	@echo ""
	@echo "Database:"
	@echo "  make migrate          Run database migrations"
	@echo "  make backup           Create database backup"
	@echo "  make restore          Restore database from backup"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy           Deploy to production"
	@echo "  make health-check     Run health checks"
	@echo "  make logs             Show application logs"
	@echo ""
	@echo "Documentation:"
	@echo "  make docs             Generate API documentation"
	@echo "  make help             Show this help message"

# Installation
install:
	@echo "Installing dependencies..."
	# Backend dependencies
	pip install -r requirements.txt
	# Frontend dependencies
	cd frontend && npm install
	@echo "Dependencies installed successfully"

# Cleanup
clean:
	@echo "Cleaning up..."
	# Python cache
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	# Frontend cache
	cd frontend && npm run clean 2>/dev/null || rm -rf node_modules/.cache 2>/dev/null || true
	# Docker
	docker system prune -f
	# Logs
	find . -name "*.log" -type f -delete
	@echo "Cleanup completed"

# Testing
test:
	@echo "Running tests..."
	# Backend tests
	python manage.py test --verbosity=2
	# Frontend tests
	cd frontend && npm test -- --watchAll=false --passWithNoTests
	@echo "All tests completed"

test-backend:
	@echo "Running backend tests..."
	python manage.py test --verbosity=2

test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm test -- --watchAll=false --passWithNoTests

# Code Quality
lint:
	@echo "Running linting..."
	# Backend linting
	flake8 inventory_management/ --max-line-length=100 --ignore=E203,W503
	# Frontend linting
	cd frontend && npm run lint
	@echo "Linting completed"

format:
	@echo "Formatting code..."
	# Backend formatting
	black inventory_management/ --line-length=100
	isort inventory_management/
	# Frontend formatting
	cd frontend && npm run format 2>/dev/null || echo "Frontend formatting not configured"
	@echo "Code formatting completed"

# Development
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build

dev-backend:
	@echo "Starting backend development server..."
	python manage.py runserver

dev-frontend:
	@echo "Starting frontend development server..."
	cd frontend && npm start

# Building
build:
	@echo "Building production assets..."
	# Collect static files
	python manage.py collectstatic --noinput --clear
	# Build frontend
	cd frontend && npm run build
	# Build Docker images
	docker-compose build
	@echo "Build completed"

build-frontend:
	@echo "Building frontend..."
	cd frontend && npm run build

build-backend:
	@echo "Building backend..."
	python manage.py collectstatic --noinput --clear

# Database Operations
migrate:
	@echo "Running database migrations..."
	python manage.py migrate --verbosity=2

migrate-production:
	@echo "Running production database migrations..."
	python scripts/migrate_production.py

makemigrations:
	@echo "Creating database migrations..."
	python manage.py makemigrations

setup-db:
	@echo "Setting up database..."
	python scripts/setup_database.py

# Backup and Restore
backup:
	@echo "Creating database backup..."
	python scripts/backup_database.py create --type=manual

backup-daily:
	@echo "Creating daily backup..."
	python scripts/backup_database.py create --type=daily

backup-info:
	@echo "Backup information..."
	python scripts/backup_database.py info

restore:
	@echo "Restoring database from backup..."
	@echo "Available backups:"
	python scripts/backup_database.py info
	@echo "Please specify backup file path:"
	@read -p "Backup file: " backup_file; \
	if [ -f "$$backup_file" ]; then \
		echo "Restoring from $$backup_file..."; \
		# Add restore logic here \
		echo "Restore functionality needs to be implemented"; \
	else \
		echo "Backup file not found: $$backup_file"; \
		exit 1; \
	fi

# Deployment
deploy:
	@echo "Deploying to production..."
	bash scripts/deploy.sh

deploy-check:
	@echo "Pre-deployment checks..."
	# Check if .env exists
	if [ ! -f .env ]; then \
		echo "Error: .env file not found"; \
		exit 1; \
	fi
	# Check if required environment variables are set
	if ! grep -q "DJANGO_ENV=production" .env; then \
		echo "Warning: DJANGO_ENV is not set to production"; \
	fi
	@echo "Pre-deployment checks passed"

# Monitoring and Health Checks
health-check:
	@echo "Running health checks..."
	python scripts/health_check.py

logs:
	@echo "Showing application logs..."
	docker-compose logs -f --tail=100

logs-backend:
	@echo "Showing backend logs..."
	docker-compose logs -f backend

logs-frontend:
	@echo "Showing frontend logs..."
	docker-compose logs -f frontend

# Documentation
docs:
	@echo "Generating API documentation..."
	python scripts/generate_api_docs.py

docs-api:
	@echo "Generating API documentation..."
	python scripts/generate_api_docs.py

# SSL Certificate Management
ssl-generate:
	@echo "Generating SSL certificates..."
	python scripts/generate_ssl_cert.py

ssl-renew:
	@echo "Renewing SSL certificates..."
	sudo certbot renew

# Docker Utilities
docker-clean:
	@echo "Cleaning Docker resources..."
	docker-compose down -v
	docker system prune -a -f
	docker volume prune -f

docker-rebuild:
	@echo "Rebuilding Docker containers..."
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d

# Security
security-scan:
	@echo "Running security scan..."
	# Backend security
	safety check
	bandit -r inventory_management/
	# Frontend security
	cd frontend && npm audit

# Performance
performance-test:
	@echo "Running performance tests..."
	# Add performance testing commands here
	@echo "Performance testing not yet implemented"

# Database Maintenance
db-maintenance:
	@echo "Running database maintenance..."
	# Vacuum and analyze
	docker-compose exec db psql -U inventory_user -d inventory_db -c "VACUUM ANALYZE;"
	# Reindex (if needed)
	# docker-compose exec db psql -U inventory_user -d inventory_db -c "REINDEX DATABASE inventory_db;"

# Environment Management
env-dev:
	@echo "Setting up development environment..."
	cp .env.example .env.dev
	@echo "Development environment configured"

env-prod:
	@echo "Setting up production environment..."
	cp .env.example .env.prod
	@echo "Production environment configured. Please edit .env.prod with production values"

# Git Hooks
install-hooks:
	@echo "Installing git hooks..."
	# Add pre-commit hooks here
	@echo "Git hooks installation not yet implemented"

# CI/CD
ci-test:
	@echo "Running CI tests..."
	make lint
	make test
	make build

ci-deploy:
	@echo "Running CI deployment..."
	make deploy-check
	make deploy

# Utility Commands
shell:
	@echo "Opening Django shell..."
	python manage.py shell

dbshell:
	@echo "Opening database shell..."
	python manage.py dbshell

createsuperuser:
	@echo "Creating superuser..."
	python manage.py createsuperuser

collectstatic:
	@echo "Collecting static files..."
	python manage.py collectstatic --noinput

# Information
info:
	@echo "System Information:"
	@echo "==================="
	@echo "Python version: $$(python --version)"
	@echo "Node version: $$(cd frontend && node --version)"
	@echo "NPM version: $$(cd frontend && npm --version)"
	@echo "Docker version: $$(docker --version)"
	@echo "Docker Compose version: $$(docker-compose --version)"
	@echo ""
	@echo "Environment:"
	@echo "DJANGO_ENV: $$(grep DJANGO_ENV .env 2>/dev/null || echo 'Not set')"
	@echo "Database: $$(grep DATABASE_URL .env 2>/dev/null | cut -d'/' -f4 || echo 'Not configured')"

# Default target
.DEFAULT_GOAL := help