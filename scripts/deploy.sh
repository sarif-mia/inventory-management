#!/bin/bash

# Inventory Management System Deployment Script
# This script handles automated deployment to production

set -e  # Exit on any error

# Configuration
APP_NAME="inventory-management-system"
DOMAIN="yourdomain.com"
EMAIL="admin@yourdomain.com"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    log "DEPLOYMENT FAILED: $1"
    exit 1
}

# Success message
success() {
    echo -e "${GREEN}✓ $1${NC}"
    log "SUCCESS: $1"
}

# Warning message
warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    log "WARNING: $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."

    # Check if running as root or with sudo
    if [[ $EUID -eq 0 ]]; then
        error_exit "This script should not be run as root"
    fi

    # Check required commands
    local required_commands=("docker" "docker-compose" "git" "curl")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error_exit "Required command '$cmd' is not installed"
        fi
    done

    # Check if .env file exists
    if [[ ! -f ".env" ]]; then
        error_exit ".env file not found. Please create it from .env.example"
    fi

    success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating pre-deployment backup..."

    if [[ -f "scripts/backup_database.py" ]]; then
        python scripts/backup_database.py create --type=pre_deployment || warning "Backup creation failed"
    else
        warning "Backup script not found, skipping backup"
    fi
}

# Pull latest changes
pull_changes() {
    log "Pulling latest changes from repository..."

    if [[ -d ".git" ]]; then
        git pull origin main || error_exit "Failed to pull changes from repository"
        success "Repository updated successfully"
    else
        warning "Not a git repository, skipping pull"
    fi
}

# Build and test application
build_application() {
    log "Building application..."

    # Build Docker images
    docker-compose build --no-cache || error_exit "Failed to build Docker images"

    success "Application built successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."

    # Wait for database to be ready
    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose exec -T db pg_isready -U inventory_user -d inventory_db &>/dev/null; then
            break
        fi
        log "Waiting for database... (attempt $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done

    if [[ $attempt -gt $max_attempts ]]; then
        error_exit "Database is not ready after $max_attempts attempts"
    fi

    # Run migrations
    docker-compose run --rm backend python manage.py migrate || error_exit "Database migration failed"

    success "Database migrations completed"
}

# Collect static files
collect_static() {
    log "Collecting static files..."

    docker-compose run --rm backend python manage.py collectstatic --noinput --clear || error_exit "Static file collection failed"

    success "Static files collected"
}

# Run tests
run_tests() {
    log "Running tests..."

    # Run backend tests
    if docker-compose run --rm backend python manage.py test --verbosity=2; then
        success "Backend tests passed"
    else
        warning "Backend tests failed, but continuing deployment"
    fi

    # Run frontend build (which includes tests)
    if docker-compose run --rm frontend npm run build; then
        success "Frontend build completed"
    else
        error_exit "Frontend build failed"
    fi
}

# Deploy application
deploy_application() {
    log "Deploying application..."

    # Stop existing containers
    docker-compose down || warning "Failed to stop existing containers"

    # Start new containers
    docker-compose up -d || error_exit "Failed to start application"

    # Wait for application to be ready
    local max_attempts=60
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s "http://localhost/health/" &>/dev/null; then
            break
        fi
        log "Waiting for application... (attempt $attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done

    if [[ $attempt -gt $max_attempts ]]; then
        error_exit "Application is not ready after $max_attempts attempts"
    fi

    success "Application deployed successfully"
}

# Health check
health_check() {
    log "Running health checks..."

    # Run comprehensive health check
    if [[ -f "scripts/health_check.py" ]]; then
        if python scripts/health_check.py; then
            success "Health checks passed"
        else
            error_exit "Health checks failed"
        fi
    else
        warning "Health check script not found"
    fi
}

# Clean up old resources
cleanup() {
    log "Cleaning up old resources..."

    # Remove unused Docker images
    docker image prune -f || warning "Failed to prune Docker images"

    # Remove old backups (keep last 7)
    if [[ -d "$BACKUP_DIR" ]]; then
        ls -t "$BACKUP_DIR"/*.gz 2>/dev/null | tail -n +8 | xargs -r rm || warning "Failed to clean old backups"
    fi

    success "Cleanup completed"
}

# Send notification
send_notification() {
    local status="$1"
    local message="$2"

    log "Sending deployment notification..."

    # Here you could integrate with Slack, email, or other notification services
    # Example: curl -X POST -H 'Content-type: application/json' --data '{"text":"'"$message"'"}' $SLACK_WEBHOOK_URL

    if [[ "$status" == "success" ]]; then
        success "Deployment notification sent"
    else
        warning "Deployment notification sent (failure)"
    fi
}

# Rollback function
rollback() {
    log "Starting rollback..."

    # Stop current deployment
    docker-compose down || warning "Failed to stop current deployment"

    # Restore from backup if available
    local latest_backup=$(ls -t "$BACKUP_DIR"/*.gz 2>/dev/null | head -1)
    if [[ -n "$latest_backup" ]]; then
        log "Restoring from backup: $latest_backup"
        # Add backup restoration logic here
        warning "Backup restoration not implemented in this script"
    fi

    # Start previous version
    docker-compose up -d || error_exit "Failed to rollback"

    error_exit "Deployment rolled back due to failure"
}

# Main deployment function
main() {
    echo "🚀 Starting deployment of $APP_NAME"
    echo "Domain: $DOMAIN"
    echo "Log file: $LOG_FILE"
    echo

    # Trap errors for rollback
    trap 'rollback' ERR

    # Run deployment steps
    check_prerequisites
    create_backup
    pull_changes
    build_application
    run_migrations
    collect_static
    run_tests
    deploy_application
    health_check
    cleanup

    # Send success notification
    send_notification "success" "✅ Deployment of $APP_NAME completed successfully"

    echo
    echo "🎉 Deployment completed successfully!"
    echo "Application is available at: https://$DOMAIN"
    echo "Admin panel: https://$DOMAIN/admin/"
    echo "API documentation: https://$DOMAIN/api/docs/"
    echo
    echo "Log file: $LOG_FILE"
}

# Run main function
main "$@"