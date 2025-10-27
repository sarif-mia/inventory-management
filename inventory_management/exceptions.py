import logging
import traceback
import time
from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.db import IntegrityError, DatabaseError
from django.http import Http404

# Set up logger
logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST Framework
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Customize the error response format
        custom_response_data = {
            'error': {
                'code': response.status_code,
                'message': 'An error occurred',
                'details': response.data
            }
        }

        # Add specific error messages for common cases
        if response.status_code == status.HTTP_400_BAD_REQUEST:
            custom_response_data['error']['message'] = 'Bad request - please check your input'
        elif response.status_code == status.HTTP_401_UNAUTHORIZED:
            custom_response_data['error']['message'] = 'Authentication required'
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            custom_response_data['error']['message'] = 'You do not have permission to perform this action'
        elif response.status_code == status.HTTP_404_NOT_FOUND:
            custom_response_data['error']['message'] = 'Resource not found'
        elif response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR:
            custom_response_data['error']['message'] = 'Internal server error - please try again later'

        response.data = custom_response_data

    # Handle Django-specific exceptions
    if isinstance(exc, ValidationError):
        return Response({
            'error': {
                'code': status.HTTP_400_BAD_REQUEST,
                'message': 'Validation error',
                'details': exc.messages
            }
        }, status=status.HTTP_400_BAD_REQUEST)

    elif isinstance(exc, IntegrityError):
        return Response({
            'error': {
                'code': status.HTTP_400_BAD_REQUEST,
                'message': 'Database integrity error - this operation would violate data constraints',
                'details': str(exc)
            }
        }, status=status.HTTP_400_BAD_REQUEST)

    return response


def log_request_middleware(get_response):
    """
    Middleware to log all requests and responses
    """
    def middleware(request):
        start_time = time.time()

        # Log request
        logger.info(
            f"Request: {request.method} {request.path}",
            extra={
                'method': request.method,
                'path': request.path,
                'user_agent': request.META.get('HTTP_USER_AGENT'),
                'remote_addr': request.META.get('REMOTE_ADDR'),
                'user': request.user.username if request.user.is_authenticated else 'anonymous'
            }
        )

        response = get_response(request)

        # Calculate response time
        duration = time.time() - start_time

        # Log response
        logger.info(
            f"Response: {response.status_code} (duration: {duration:.3f}s)",
            extra={
                'status_code': response.status_code,
                'duration': duration,
                'content_length': len(response.content) if hasattr(response, 'content') else 0
            }
        )

        return response

    return middleware