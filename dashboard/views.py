from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Sum, Avg
from django.db.models.functions import TruncMonth, TruncDay
from django.utils import timezone
from datetime import timedelta
from orders.models import Order
from marketplace.models import Product
from inventory.models import Inventory
from payments.models import PaymentTransaction
from users.models import User

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    """Get overall dashboard summary with key metrics"""
    today = timezone.now().date()
    thirty_days_ago = today - timedelta(days=30)

    # Orders metrics
    total_orders = Order.objects.count()
    recent_orders = Order.objects.filter(created_at__date__gte=thirty_days_ago).count()
    pending_orders = Order.objects.filter(status='pending').count()
    completed_orders = Order.objects.filter(status='delivered').count()

    # Revenue metrics
    total_revenue = PaymentTransaction.objects.filter(status='completed').aggregate(
        total=Sum('amount')
    )['total'] or 0

    recent_revenue = PaymentTransaction.objects.filter(
        status='completed',
        created_at__date__gte=thirty_days_ago
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Product metrics
    total_products = Product.objects.count()
    active_products = Product.objects.filter(is_active=True).count()
    low_stock_products = Inventory.objects.filter(
        available_quantity__lte=models.F('low_stock_threshold')
    ).count()

    # User metrics
    total_users = User.objects.count()
    recent_users = User.objects.filter(date_joined__date__gte=thirty_days_ago).count()

    return Response({
        'orders': {
            'total': total_orders,
            'recent': recent_orders,
            'pending': pending_orders,
            'completed': completed_orders
        },
        'revenue': {
            'total': total_revenue,
            'recent': recent_revenue
        },
        'products': {
            'total': total_products,
            'active': active_products,
            'low_stock': low_stock_products
        },
        'users': {
            'total': total_users,
            'recent': recent_users
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sales_reports(request):
    """Get sales reports with filtering options"""
    period = request.query_params.get('period', 'monthly')
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')

    queryset = PaymentTransaction.objects.filter(status='completed')

    if start_date and end_date:
        queryset = queryset.filter(created_at__date__gte=start_date, created_at__date__lte=end_date)

    if period == 'monthly':
        data = queryset.annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            total_sales=Sum('amount'),
            order_count=Count('id')
        ).order_by('month')
    elif period == 'daily':
        data = queryset.annotate(
            day=TruncDay('created_at')
        ).values('day').annotate(
            total_sales=Sum('amount'),
            order_count=Count('id')
        ).order_by('day')
    else:
        data = queryset.values('gateway').annotate(
            total_sales=Sum('amount'),
            order_count=Count('id')
        ).order_by('-total_sales')

    return Response(list(data))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def inventory_reports(request):
    """Get inventory reports"""
    report_type = request.query_params.get('type', 'summary')

    if report_type == 'low_stock':
        data = Inventory.objects.select_related('product', 'warehouse').filter(
            available_quantity__lte=models.F('low_stock_threshold')
        ).values(
            'product__name', 'product__sku', 'warehouse__name',
            'quantity', 'available_quantity', 'low_stock_threshold'
        )
    elif report_type == 'by_warehouse':
        data = Inventory.objects.select_related('warehouse').values(
            'warehouse__name'
        ).annotate(
            total_products=Count('product', distinct=True),
            total_quantity=Sum('quantity'),
            total_reserved=Sum('reserved_quantity')
        ).order_by('warehouse__name')
    else:  # summary
        data = {
            'total_products': Inventory.objects.values('product').distinct().count(),
            'total_quantity': Inventory.objects.aggregate(total=Sum('quantity'))['total'] or 0,
            'low_stock_alerts': Inventory.objects.filter(
                available_quantity__lte=models.F('low_stock_threshold')
            ).count(),
            'out_of_stock': Inventory.objects.filter(quantity=0).count()
        }

    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_reports(request):
    """Get order reports"""
    status_filter = request.query_params.get('status')
    period = request.query_params.get('period', 'monthly')

    queryset = Order.objects.all()

    if status_filter:
        queryset = queryset.filter(status=status_filter)

    if period == 'monthly':
        data = queryset.annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            order_count=Count('id'),
            total_amount=Sum('total_amount'),
            avg_order_value=Avg('total_amount')
        ).order_by('month')
    elif period == 'status':
        data = queryset.values('status').annotate(
            count=Count('id'),
            total_amount=Sum('total_amount')
        ).order_by('-count')
    else:
        data = queryset.values('payment_method').annotate(
            count=Count('id'),
            total_amount=Sum('total_amount')
        ).order_by('-total_amount')

    return Response(list(data))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def performance_analytics(request):
    """Get performance analytics"""
    # Order fulfillment time (simplified)
    completed_orders = Order.objects.filter(status='delivered').count()
    total_orders = Order.objects.count()
    fulfillment_rate = (completed_orders / total_orders * 100) if total_orders > 0 else 0

    # Average order value
    avg_order_value = Order.objects.aggregate(avg=Avg('total_amount'))['avg'] or 0

    # Top selling products
    top_products = OrderItem.objects.values(
        'product__name', 'product__sku'
    ).annotate(
        total_sold=Sum('quantity'),
        total_revenue=Sum('total_price')
    ).order_by('-total_sold')[:10]

    # Warehouse utilization
    warehouse_utilization = Warehouse.objects.annotate(
        utilization_percentage=(F('current_inventory_count') * 100.0 / F('capacity'))
    ).values('name', 'utilization_percentage', 'current_inventory_count', 'capacity')

    return Response({
        'fulfillment_rate': fulfillment_rate,
        'average_order_value': avg_order_value,
        'top_products': list(top_products),
        'warehouse_utilization': list(warehouse_utilization)
    })
