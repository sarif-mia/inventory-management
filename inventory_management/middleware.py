import time
import logging
from django.http import HttpResponse
from django.conf import settings

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware:
    """
    Middleware to log all requests and responses with performance metrics
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()

        # Log incoming request
        logger.info(
            f"Request: {request.method} {request.path}",
            extra={
                'method': request.method,
                'path': request.path,
                'query_string': request.META.get('QUERY_STRING', ''),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'remote_addr': self.get_client_ip(request),
                'user': request.user.username if request.user.is_authenticated else 'anonymous',
                'content_type': request.META.get('CONTENT_TYPE', ''),
                'content_length': request.META.get('CONTENT_LENGTH', 0),
            }
        )

        response = self.get_response(request)

        # Calculate response time
        duration = time.time() - start_time

        # Log response
        logger.info(
            f"Response: {response.status_code} ({duration:.3f}s)",
            extra={
                'status_code': response.status_code,
                'duration': duration,
                'response_size': len(response.content) if hasattr(response, 'content') else 0,
            }
        )

        # Log slow requests
        if duration > 1.0:  # More than 1 second
            logger.warning(
                f"Slow request: {request.method} {request.path} took {duration:.3f}s",
                extra={
                    'method': request.method,
                    'path': request.path,
                    'duration': duration,
                    'user': request.user.username if request.user.is_authenticated else 'anonymous',
                }
            )

        return response

    def get_client_ip(self, request):
        """Get the client IP address, considering proxy headers"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class HealthCheckMiddleware:
    """
    Middleware to handle health check endpoints
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == '/health/':
            return HttpResponse('OK', content_type='text/plain')

        return self.get_response(request)


class SecurityHeadersMiddleware:
    """
    Middleware to add security headers to all responses
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Add security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # Content Security Policy (customize based on your needs)
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https: data:; "
            "connect-src 'self'; "
            "media-src 'self'; "
            "object-src 'none'; "
            "frame-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        response['Content-Security-Policy'] = csp

        return response


class MaintenanceModeMiddleware:
    """
    Middleware to handle maintenance mode
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if maintenance mode is enabled
        if getattr(settings, 'MAINTENANCE_MODE', False):
            # Allow access to admin and health check during maintenance
            if not (request.path.startswith('/admin/') or
                    request.path == '/health/' or
                    request.user.is_staff):
                return HttpResponse(
                    'Service is currently under maintenance. Please try again later.',
                    status=503,
                    content_type='text/plain'
                )

        return self.get_response(request)