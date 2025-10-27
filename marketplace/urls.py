from django.urls import path
from . import views

urlpatterns = [
    # Product management
    path('products/', views.ProductListCreateView.as_view(), name='product-list'),
    path('products/<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),

    # Category management
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list'),

    # Seller management
    path('sellers/', views.SellerListCreateView.as_view(), name='seller-list'),
    path('sellers/<int:pk>/', views.SellerDetailView.as_view(), name='seller-detail'),

    # Marketplace integration
    path('marketplaces/', views.MarketplaceListView.as_view(), name='marketplace-list'),
    path('marketplaces/connect/', views.connect_marketplace, name='marketplace-connect'),
    path('marketplaces/<int:marketplace_id>/sync/', views.sync_marketplace_data, name='marketplace-sync'),
    path('marketplaces/<int:marketplace_id>/products/', views.marketplace_products, name='marketplace-products'),
    path('marketplaces/<int:marketplace_id>/push/', views.push_product_to_marketplace, name='marketplace-push'),
]