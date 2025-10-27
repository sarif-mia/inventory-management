from django.urls import path
from . import views

urlpatterns = [
    path('', views.InventoryListCreateView.as_view(), name='inventory-list'),
    path('<int:pk>/', views.InventoryDetailView.as_view(), name='inventory-detail'),
    path('adjust/', views.adjust_inventory, name='inventory-adjust'),
    path('low-stock/', views.low_stock_alerts, name='low-stock-alerts'),
]