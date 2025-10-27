from django.urls import path
from . import views

urlpatterns = [
    path('', views.PaymentTransactionListView.as_view(), name='payment-list'),
    path('<int:pk>/', views.PaymentTransactionDetailView.as_view(), name='payment-detail'),
    path('process/', views.process_payment, name='payment-process'),
    path('reconcile/', views.reconcile_payment, name='payment-reconcile'),
]