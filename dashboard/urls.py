from django.urls import path
from . import views

urlpatterns = [
    path('summary/', views.dashboard_summary, name='dashboard-summary'),
    path('reports/sales/', views.sales_reports, name='sales-reports'),
    path('reports/inventory/', views.inventory_reports, name='inventory-reports'),
    path('reports/orders/', views.order_reports, name='order-reports'),
    path('analytics/performance/', views.performance_analytics, name='performance-analytics'),
]