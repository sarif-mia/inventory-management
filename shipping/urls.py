from django.urls import path
from . import views

urlpatterns = [
    path('', views.ShipmentListCreateView.as_view(), name='shipment-list'),
    path('<int:pk>/', views.ShipmentDetailView.as_view(), name='shipment-detail'),
    path('<int:pk>/track/', views.update_shipment_tracking, name='shipment-track'),
]