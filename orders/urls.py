from django.urls import path
from . import views

urlpatterns = [
    path('', views.OrderListCreateView.as_view(), name='order-list'),
    path('<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/status/', views.update_order_status, name='order-status-update'),
    path('<int:pk>/cancel/', views.cancel_order, name='order-cancel'),
]