from django.urls import path
from . import views

urlpatterns = [
    path('', views.WarehouseListCreateView.as_view(), name='warehouse-list'),
    path('<int:pk>/', views.WarehouseDetailView.as_view(), name='warehouse-detail'),
    path('<int:pk>/inventory/', views.warehouse_inventory, name='warehouse-inventory'),
]