import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { LoginRequest, RegisterRequest, User, DashboardMetrics, SalesData, TopProduct, CategorySales, InventoryLevel, WarehouseUtilization, OrderStatusDistribution, FulfillmentRate, CustomerInsight, PerformanceMetrics, InventoryItem, InventoryHistory, LowStockAlert, BulkOperation, StockAdjustment, WarehouseTransfer, InventoryFilters, Warehouse, Seller, SellerProduct, SellerOrder, SellerCommission, SellerNotification, SellerAnalytics, SellerDashboardMetrics, SellerRegistrationRequest, SellerProfileUpdate, SellerVerificationRequest, SellerProductCreate, SellerProductUpdate, SellerFilters, Shipment, Carrier, ShippingRate, ShippingLabel, BulkShipment, DeliveryNotification, ShippingAnalytics, ShipmentCreateRequest, ShipmentUpdateRequest, CarrierCreateRequest, CarrierUpdateRequest, ShippingRateRequest, ShippingFilters, PaymentTransaction, ReconciliationRecord, PaymentGateway, Dispute, ReconciliationReport, PaymentHistory, FinancialReport, PaymentAnalytics, PaymentFilters, ReconciliationFilters, DisputeFilters, MarketplaceConnection, SyncOperation, MarketplaceProduct, MarketplaceOrder, MarketplaceAnalytics, BulkMarketplaceOperation, MarketplaceFilters, SyncFilters, QuickCommerceConnection, QuickCommerceSyncOperation, QuickCommerceProduct, QuickCommerceOrder, DeliverySlot, QuickCommercePricing, QuickCommerceAnalytics, EmergencyStockAllocation, QuickCommerceFilters, QuickCommerceSyncFilters } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AxiosResponse<{ token: string; user: User }>> {
    return this.api.post('/auth/login/', credentials);
  }

  async register(userData: RegisterRequest): Promise<AxiosResponse<User>> {
    return this.api.post('/auth/register/', userData);
  }

  async getCurrentUser(): Promise<AxiosResponse<User>> {
    return this.api.get('/auth/user/');
  }

  // Products
  async getProducts(): Promise<AxiosResponse<any[]>> {
    return this.api.get('/products/');
  }

  async getProduct(id: number): Promise<AxiosResponse<any>> {
    return this.api.get(`/products/${id}/`);
  }

  // Orders
  async getOrders(filters?: any): Promise<AxiosResponse<any[]>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key].toString());
        }
      });
    }
    return this.api.get(`/orders/?${params.toString()}`);
  }

  async getOrder(id: number): Promise<AxiosResponse<any>> {
    return this.api.get(`/orders/${id}/`);
  }

  async createOrder(orderData: any): Promise<AxiosResponse<any>> {
    return this.api.post('/orders/', orderData);
  }

  async updateOrder(id: number, orderData: any): Promise<AxiosResponse<any>> {
    return this.api.patch(`/orders/${id}/`, orderData);
  }

  async updateOrderStatus(id: number, status: string, note?: string): Promise<AxiosResponse<any>> {
    return this.api.patch(`/orders/${id}/status/`, { status, note });
  }

  async addOrderNote(orderId: number, note: string): Promise<AxiosResponse<any>> {
    return this.api.post(`/orders/${orderId}/notes/`, { note });
  }

  async getOrderHistory(orderId: number): Promise<AxiosResponse<any[]>> {
    return this.api.get(`/orders/${orderId}/history/`);
  }

  async getCustomerOrders(customerId: number): Promise<AxiosResponse<any[]>> {
    return this.api.get(`/orders/customer/${customerId}/`);
  }

  async updateFulfillmentStatus(orderId: number, fulfillmentData: any): Promise<AxiosResponse<any>> {
    return this.api.patch(`/orders/${orderId}/fulfillment/`, fulfillmentData);
  }

  // Dashboard methods
  async getDashboardMetrics(): Promise<AxiosResponse<DashboardMetrics>> {
    return this.api.get('/dashboard/metrics/');
  }

  async getSalesData(startDate?: string, endDate?: string): Promise<AxiosResponse<SalesData[]>> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return this.api.get(`/dashboard/sales/?${params.toString()}`);
  }

  async getTopProducts(limit: number = 10): Promise<AxiosResponse<TopProduct[]>> {
    return this.api.get(`/dashboard/top-products/?limit=${limit}`);
  }

  async getCategorySales(): Promise<AxiosResponse<CategorySales[]>> {
    return this.api.get('/dashboard/category-sales/');
  }

  async getInventoryLevels(): Promise<AxiosResponse<InventoryLevel[]>> {
    return this.api.get('/dashboard/inventory-levels/');
  }

  async getWarehouseUtilization(): Promise<AxiosResponse<WarehouseUtilization[]>> {
    return this.api.get('/dashboard/warehouse-utilization/');
  }

  async getOrderStatusDistribution(): Promise<AxiosResponse<OrderStatusDistribution[]>> {
    return this.api.get('/dashboard/order-status-distribution/');
  }

  async getFulfillmentRates(): Promise<AxiosResponse<FulfillmentRate[]>> {
    return this.api.get('/dashboard/fulfillment-rates/');
  }

  async getCustomerInsights(): Promise<AxiosResponse<CustomerInsight[]>> {
    return this.api.get('/dashboard/customer-insights/');
  }

  async getPerformanceMetrics(): Promise<AxiosResponse<PerformanceMetrics>> {
    return this.api.get('/dashboard/performance-metrics/');
  }

  // Inventory Management APIs
  async getInventoryItems(filters?: InventoryFilters): Promise<AxiosResponse<InventoryItem[]>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.product_name) params.append('product_name', filters.product_name);
      if (filters.category) params.append('category', filters.category);
      if (filters.warehouse_id) params.append('warehouse_id', filters.warehouse_id.toString());
      if (filters.stock_status) params.append('stock_status', filters.stock_status);
      if (filters.min_stock) params.append('min_stock', filters.min_stock.toString());
      if (filters.max_stock) params.append('max_stock', filters.max_stock.toString());
    }
    return this.api.get(`/inventory/items/?${params.toString()}`);
  }

  async getInventoryItem(id: number): Promise<AxiosResponse<InventoryItem>> {
    return this.api.get(`/inventory/items/${id}/`);
  }

  async updateInventoryItem(id: number, data: Partial<InventoryItem>): Promise<AxiosResponse<InventoryItem>> {
    return this.api.patch(`/inventory/items/${id}/`, data);
  }

  async getInventoryHistory(inventoryItemId?: number, limit: number = 50): Promise<AxiosResponse<InventoryHistory[]>> {
    const params = new URLSearchParams();
    if (inventoryItemId) params.append('inventory_item', inventoryItemId.toString());
    params.append('limit', limit.toString());
    return this.api.get(`/inventory/history/?${params.toString()}`);
  }

  async getLowStockAlerts(acknowledged?: boolean): Promise<AxiosResponse<LowStockAlert[]>> {
    const params = new URLSearchParams();
    if (acknowledged !== undefined) params.append('acknowledged', acknowledged.toString());
    return this.api.get(`/inventory/alerts/?${params.toString()}`);
  }

  async acknowledgeAlert(alertId: number): Promise<AxiosResponse<LowStockAlert>> {
    return this.api.patch(`/inventory/alerts/${alertId}/acknowledge/`);
  }

  async adjustStock(adjustment: StockAdjustment): Promise<AxiosResponse<InventoryItem>> {
    return this.api.post('/inventory/adjust/', adjustment);
  }

  async transferStock(transfer: WarehouseTransfer): Promise<AxiosResponse<any>> {
    return this.api.post('/inventory/transfer/', transfer);
  }

  async getWarehouses(): Promise<AxiosResponse<Warehouse[]>> {
    return this.api.get('/warehouses/');
  }

  async getWarehouse(id: number): Promise<AxiosResponse<Warehouse>> {
    return this.api.get(`/warehouses/${id}/`);
  }

  async createWarehouse(warehouse: Omit<Warehouse, 'id'>): Promise<AxiosResponse<Warehouse>> {
    return this.api.post('/warehouses/', warehouse);
  }

  async updateWarehouse(id: number, warehouse: Partial<Warehouse>): Promise<AxiosResponse<Warehouse>> {
    return this.api.patch(`/warehouses/${id}/`, warehouse);
  }

  async deleteWarehouse(id: number): Promise<AxiosResponse<void>> {
    return this.api.delete(`/warehouses/${id}/`);
  }

  async bulkImportInventory(file: File): Promise<AxiosResponse<BulkOperation>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post('/inventory/bulk-import/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async bulkExportInventory(filters?: InventoryFilters): Promise<AxiosResponse<Blob>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.product_name) params.append('product_name', filters.product_name);
      if (filters.category) params.append('category', filters.category);
      if (filters.warehouse_id) params.append('warehouse_id', filters.warehouse_id.toString());
      if (filters.stock_status) params.append('stock_status', filters.stock_status);
    }
    return this.api.get(`/inventory/bulk-export/?${params.toString()}`, {
      responseType: 'blob',
    });
  }

  async bulkUpdateInventory(updates: Array<{ id: number; data: Partial<InventoryItem> }>): Promise<AxiosResponse<BulkOperation>> {
    return this.api.post('/inventory/bulk-update/', { updates });
  }

  async getBulkOperationStatus(operationId: number): Promise<AxiosResponse<BulkOperation>> {
    return this.api.get(`/inventory/bulk-operations/${operationId}/`);
  }

  // Seller Management APIs
  async getSellers(filters?: SellerFilters): Promise<AxiosResponse<Seller[]>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.verification_status) params.append('verification_status', filters.verification_status);
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters.business_name) params.append('business_name', filters.business_name);
      if (filters.min_rating) params.append('min_rating', filters.min_rating.toString());
      if (filters.max_rating) params.append('max_rating', filters.max_rating.toString());
    }
    return this.api.get(`/sellers/?${params.toString()}`);
  }

  async getSeller(sellerId: number): Promise<AxiosResponse<Seller>> {
    return this.api.get(`/sellers/${sellerId}/`);
  }

  async registerSeller(registrationData: SellerRegistrationRequest): Promise<AxiosResponse<Seller>> {
    return this.api.post('/sellers/register/', registrationData);
  }

  async updateSellerProfile(sellerId: number, data: SellerProfileUpdate): Promise<AxiosResponse<Seller>> {
    return this.api.patch(`/sellers/${sellerId}/profile/`, data);
  }

  async verifySeller(verificationData: SellerVerificationRequest): Promise<AxiosResponse<Seller>> {
    return this.api.patch(`/sellers/${verificationData.seller_id}/verify/`, {
      status: verificationData.status,
      notes: verificationData.notes,
    });
  }

  async getSellerProducts(sellerId: number): Promise<AxiosResponse<SellerProduct[]>> {
    return this.api.get(`/sellers/${sellerId}/products/`);
  }

  async createSellerProduct(sellerId: number, productData: SellerProductCreate): Promise<AxiosResponse<SellerProduct>> {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    formData.append('category', productData.category);
    formData.append('stock_quantity', productData.stock_quantity.toString());
    formData.append('min_order_quantity', productData.min_order_quantity.toString());

    productData.images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    return this.api.post(`/sellers/${sellerId}/products/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async updateSellerProduct(productId: number, data: SellerProductUpdate): Promise<AxiosResponse<SellerProduct>> {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.price) formData.append('price', data.price.toString());
    if (data.category) formData.append('category', data.category);
    if (data.stock_quantity !== undefined) formData.append('stock_quantity', data.stock_quantity.toString());
    if (data.min_order_quantity !== undefined) formData.append('min_order_quantity', data.min_order_quantity.toString());
    if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString());

    if (data.images) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }

    return this.api.patch(`/seller-products/${productId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async deleteSellerProduct(productId: number): Promise<AxiosResponse<void>> {
    return this.api.delete(`/seller-products/${productId}/`);
  }

  async getSellerOrders(sellerId: number): Promise<AxiosResponse<SellerOrder[]>> {
    return this.api.get(`/sellers/${sellerId}/orders/`);
  }

  async getSellerCommissions(sellerId: number): Promise<AxiosResponse<SellerCommission[]>> {
    return this.api.get(`/sellers/${sellerId}/commissions/`);
  }

  async getSellerNotifications(sellerId: number): Promise<AxiosResponse<SellerNotification[]>> {
    return this.api.get(`/sellers/${sellerId}/notifications/`);
  }

  async markNotificationAsRead(notificationId: number): Promise<AxiosResponse<SellerNotification>> {
    return this.api.patch(`/seller-notifications/${notificationId}/read/`);
  }

  async getSellerAnalytics(sellerId: number, period: string): Promise<AxiosResponse<SellerAnalytics>> {
    return this.api.get(`/sellers/${sellerId}/analytics/?period=${period}`);
  }

  async getSellerDashboardMetrics(sellerId: number): Promise<AxiosResponse<SellerDashboardMetrics>> {
    return this.api.get(`/sellers/${sellerId}/dashboard-metrics/`);
  }

  // Shipping Management APIs
  async getShipments(filters?: ShippingFilters): Promise<AxiosResponse<Shipment[]>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.carrier) params.append('carrier', filters.carrier);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.tracking_number) params.append('tracking_number', filters.tracking_number);
      if (filters.order_number) params.append('order_number', filters.order_number);
    }
    return this.api.get(`/shipping/?${params.toString()}`);
  }

  async getShipment(id: number): Promise<AxiosResponse<Shipment>> {
    return this.api.get(`/shipping/${id}/`);
  }

  async createShipment(shipmentData: ShipmentCreateRequest): Promise<AxiosResponse<Shipment>> {
    return this.api.post('/shipping/', shipmentData);
  }

  async updateShipment(id: number, shipmentData: ShipmentUpdateRequest): Promise<AxiosResponse<Shipment>> {
    return this.api.patch(`/shipping/${id}/`, shipmentData);
  }

  async updateShipmentTracking(id: number, trackingData: ShipmentUpdateRequest): Promise<AxiosResponse<Shipment>> {
    return this.api.put(`/shipping/${id}/track/`, trackingData);
  }

  async getCarriers(): Promise<AxiosResponse<Carrier[]>> {
    return this.api.get('/shipping/carriers/');
  }

  async getCarrier(id: number): Promise<AxiosResponse<Carrier>> {
    return this.api.get(`/shipping/carriers/${id}/`);
  }

  async createCarrier(carrierData: CarrierCreateRequest): Promise<AxiosResponse<Carrier>> {
    return this.api.post('/shipping/carriers/', carrierData);
  }

  async updateCarrier(id: number, carrierData: CarrierUpdateRequest): Promise<AxiosResponse<Carrier>> {
    return this.api.patch(`/shipping/carriers/${id}/`, carrierData);
  }

  async deleteCarrier(id: number): Promise<AxiosResponse<void>> {
    return this.api.delete(`/shipping/carriers/${id}/`);
  }

  async testCarrierConnection(id: number): Promise<AxiosResponse<{ success: boolean; message: string }>> {
    return this.api.post(`/shipping/carriers/${id}/test-connection/`);
  }

  async getShippingRates(rateRequest: ShippingRateRequest): Promise<AxiosResponse<ShippingRate[]>> {
    return this.api.post('/shipping/rates/', rateRequest);
  }

  async generateShippingLabel(shipmentId: number, format: 'pdf' | 'png' | 'zpl' = 'pdf'): Promise<AxiosResponse<ShippingLabel>> {
    return this.api.post(`/shipping/${shipmentId}/label/`, { format });
  }

  async createBulkShipment(bulkData: { name: string; shipmentIds: number[] }): Promise<AxiosResponse<BulkShipment>> {
    return this.api.post('/shipping/bulk/', bulkData);
  }

  async getBulkShipments(): Promise<AxiosResponse<BulkShipment[]>> {
    return this.api.get('/shipping/bulk/');
  }

  async getBulkShipment(id: number): Promise<AxiosResponse<BulkShipment>> {
    return this.api.get(`/shipping/bulk/${id}/`);
  }

  async processBulkShipment(bulkShipmentId: number): Promise<AxiosResponse<BulkShipment>> {
    return this.api.post(`/shipping/bulk/${bulkShipmentId}/process/`);
  }

  async getDeliveryNotifications(shipmentId?: number): Promise<AxiosResponse<DeliveryNotification[]>> {
    const params = shipmentId ? `?shipment=${shipmentId}` : '';
    return this.api.get(`/shipping/notifications/${params}`);
  }

  async sendDeliveryNotification(shipmentId: number, notificationData: any): Promise<AxiosResponse<DeliveryNotification>> {
    return this.api.post(`/shipping/${shipmentId}/notify/`, notificationData);
  }

  async getShippingAnalytics(period: string = '30d'): Promise<AxiosResponse<ShippingAnalytics>> {
    return this.api.get(`/shipping/analytics/?period=${period}`);
  }

  // Payment Reconciliation APIs
  async getPaymentTransactions(filters?: PaymentFilters): Promise<AxiosResponse<PaymentTransaction[]>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.gateway) params.append('gateway', filters.gateway);
      if (filters.payment_method) params.append('payment_method', filters.payment_method);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.min_amount) params.append('min_amount', filters.min_amount.toString());
      if (filters.max_amount) params.append('max_amount', filters.max_amount.toString());
      if (filters.currency) params.append('currency', filters.currency);
    }
    return this.api.get(`/payments/transactions/?${params.toString()}`);
  }

  async getPaymentTransaction(id: number): Promise<AxiosResponse<PaymentTransaction>> {
    return this.api.get(`/payments/transactions/${id}/`);
  }

  async updatePaymentTransaction(id: number, data: Partial<PaymentTransaction>): Promise<AxiosResponse<PaymentTransaction>> {
    return this.api.patch(`/payments/transactions/${id}/`, data);
  }

  async getReconciliationRecords(filters?: ReconciliationFilters): Promise<AxiosResponse<ReconciliationRecord[]>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.min_discrepancy) params.append('min_discrepancy', filters.min_discrepancy.toString());
      if (filters.max_discrepancy) params.append('max_discrepancy', filters.max_discrepancy.toString());
      if (filters.reconciled_by) params.append('reconciled_by', filters.reconciled_by.toString());
    }
    return this.api.get(`/payments/reconciliation/?${params.toString()}`);
  }

  async reconcilePayment(paymentId: number, reconciliationData: Partial<ReconciliationRecord>): Promise<AxiosResponse<ReconciliationRecord>> {
    return this.api.post(`/payments/transactions/${paymentId}/reconcile/`, reconciliationData);
  }

  async updateReconciliationRecord(id: number, data: Partial<ReconciliationRecord>): Promise<AxiosResponse<ReconciliationRecord>> {
    return this.api.patch(`/payments/reconciliation/${id}/`, data);
  }

  async getPaymentGateways(): Promise<AxiosResponse<PaymentGateway[]>> {
    return this.api.get('/payments/gateways/');
  }

  async getPaymentGateway(id: number): Promise<AxiosResponse<PaymentGateway>> {
    return this.api.get(`/payments/gateways/${id}/`);
  }

  async createPaymentGateway(gatewayData: Omit<PaymentGateway, 'id'>): Promise<AxiosResponse<PaymentGateway>> {
    return this.api.post('/payments/gateways/', gatewayData);
  }

  async updatePaymentGateway(id: number, data: Partial<PaymentGateway>): Promise<AxiosResponse<PaymentGateway>> {
    return this.api.patch(`/payments/gateways/${id}/`, data);
  }

  async deletePaymentGateway(id: number): Promise<AxiosResponse<void>> {
    return this.api.delete(`/payments/gateways/${id}/`);
  }

  async testPaymentGatewayConnection(id: number): Promise<AxiosResponse<{ success: boolean; message: string }>> {
    return this.api.post(`/payments/gateways/${id}/test-connection/`);
  }

  async getDisputes(filters?: DisputeFilters): Promise<AxiosResponse<Dispute[]>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.reason) params.append('reason', filters.reason);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.min_amount) params.append('min_amount', filters.min_amount.toString());
      if (filters.max_amount) params.append('max_amount', filters.max_amount.toString());
    }
    return this.api.get(`/payments/disputes/?${params.toString()}`);
  }

  async getDispute(id: number): Promise<AxiosResponse<Dispute>> {
    return this.api.get(`/payments/disputes/${id}/`);
  }

  async createDispute(disputeData: Omit<Dispute, 'id'>): Promise<AxiosResponse<Dispute>> {
    return this.api.post('/payments/disputes/', disputeData);
  }

  async updateDispute(id: number, data: Partial<Dispute>): Promise<AxiosResponse<Dispute>> {
    return this.api.patch(`/payments/disputes/${id}/`, data);
  }

  async resolveDispute(id: number, resolution: string): Promise<AxiosResponse<Dispute>> {
    return this.api.post(`/payments/disputes/${id}/resolve/`, { resolution });
  }

  async uploadDisputeEvidence(disputeId: number, files: File[]): Promise<AxiosResponse<Dispute>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`evidence[${index}]`, file);
    });
    return this.api.post(`/payments/disputes/${disputeId}/evidence/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async getReconciliationReports(): Promise<AxiosResponse<ReconciliationReport[]>> {
    return this.api.get('/payments/reports/reconciliation/');
  }

  async generateReconciliationReport(startDate: string, endDate: string): Promise<AxiosResponse<ReconciliationReport>> {
    return this.api.post('/payments/reports/reconciliation/generate/', { start_date: startDate, end_date: endDate });
  }

  async exportReconciliationReport(reportId: number, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<AxiosResponse<Blob>> {
    return this.api.get(`/payments/reports/reconciliation/${reportId}/export/?format=${format}`, {
      responseType: 'blob',
    });
  }

  async getPaymentHistory(paymentId?: number): Promise<AxiosResponse<PaymentHistory[]>> {
    const params = paymentId ? `?payment=${paymentId}` : '';
    return this.api.get(`/payments/history/${params}`);
  }

  async getFinancialReports(): Promise<AxiosResponse<FinancialReport[]>> {
    return this.api.get('/payments/reports/financial/');
  }

  async generateFinancialReport(reportType: string, startDate: string, endDate: string): Promise<AxiosResponse<FinancialReport>> {
    return this.api.post('/payments/reports/financial/generate/', {
      report_type: reportType,
      start_date: startDate,
      end_date: endDate,
    });
  }

  async exportFinancialReport(reportId: number, format: 'pdf' | 'excel' | 'csv' = 'pdf'): Promise<AxiosResponse<Blob>> {
    return this.api.get(`/payments/reports/financial/${reportId}/export/?format=${format}`, {
      responseType: 'blob',
    });
  }

  async getPaymentAnalytics(period: string = '30d'): Promise<AxiosResponse<PaymentAnalytics>> {
    return this.api.get(`/payments/analytics/?period=${period}`);
  }

  async bulkReconcilePayments(reconciliationData: Array<{ payment_id: number; status: string; notes?: string }>): Promise<AxiosResponse<any>> {
    return this.api.post('/payments/bulk-reconcile/', { reconciliations: reconciliationData });
  }

  async bulkUpdatePaymentStatus(updates: Array<{ id: number; status: string }>): Promise<AxiosResponse<any>> {
    return this.api.post('/payments/bulk-update-status/', { updates });
  }

  // Marketplace Integration APIs
  async getMarketplaceConnections(filters?: MarketplaceFilters): Promise<AxiosResponse<MarketplaceConnection[]>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.status) params.append('status', filters.status);
      if (filters.last_sync_from) params.append('last_sync_from', filters.last_sync_from);
      if (filters.last_sync_to) params.append('last_sync_to', filters.last_sync_to);
      if (filters.connection_id) params.append('connection_id', filters.connection_id.toString());
    }
    return this.api.get(`/marketplace/connections/?${params.toString()}`);
  }

  async getMarketplaceConnection(id: number): Promise<AxiosResponse<MarketplaceConnection>> {
    return this.api.get(`/marketplace/connections/${id}/`);
  }

  async createMarketplaceConnection(connectionData: Omit<MarketplaceConnection, 'id' | 'created_at' | 'updated_at'>): Promise<AxiosResponse<MarketplaceConnection>> {
    return this.api.post('/marketplace/connections/', connectionData);
  }

  async updateMarketplaceConnection(id: number, data: Partial<MarketplaceConnection>): Promise<AxiosResponse<MarketplaceConnection>> {
    return this.api.patch(`/marketplace/connections/${id}/`, data);
  }

  async deleteMarketplaceConnection(id: number): Promise<AxiosResponse<void>> {
    return this.api.delete(`/marketplace/connections/${id}/`);
  }

  async testMarketplaceConnection(id: number): Promise<AxiosResponse<{ success: boolean; message: string; details?: any }>> {
    return this.api.post(`/marketplace/connections/${id}/test/`);
  }

  async getSyncOperations(filters?: SyncFilters): Promise<AxiosResponse<SyncOperation[]>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.operation_type) params.append('operation_type', filters.operation_type);
      if (filters.status) params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.connection_id) params.append('connection_id', filters.connection_id.toString());
    }
    return this.api.get(`/marketplace/sync-operations/?${params.toString()}`);
  }

  async getSyncOperation(id: number): Promise<AxiosResponse<SyncOperation>> {
    return this.api.get(`/marketplace/sync-operations/${id}/`);
  }

  async startSyncOperation(connectionId: number, operationType: string, direction: string): Promise<AxiosResponse<SyncOperation>> {
    return this.api.post('/marketplace/sync-operations/', {
      connection: connectionId,
      operation_type: operationType,
      direction: direction,
    });
  }

  async retrySyncOperation(syncOperationId: number): Promise<AxiosResponse<SyncOperation>> {
    return this.api.post(`/marketplace/sync-operations/${syncOperationId}/retry/`);
  }

  async cancelSyncOperation(syncOperationId: number): Promise<AxiosResponse<void>> {
    return this.api.post(`/marketplace/sync-operations/${syncOperationId}/cancel/`);
  }

  async getMarketplaceProducts(connectionId?: number): Promise<AxiosResponse<MarketplaceProduct[]>> {
    const params = connectionId ? `?connection=${connectionId}` : '';
    return this.api.get(`/marketplace/products/${params}`);
  }

  async getMarketplaceProduct(id: number): Promise<AxiosResponse<MarketplaceProduct>> {
    return this.api.get(`/marketplace/products/${id}/`);
  }

  async syncProductToMarketplace(productId: number, connectionId: number): Promise<AxiosResponse<MarketplaceProduct>> {
    return this.api.post('/marketplace/products/sync/', {
      product_id: productId,
      connection_id: connectionId,
    });
  }

  async updateMarketplaceProduct(id: number, data: Partial<MarketplaceProduct>): Promise<AxiosResponse<MarketplaceProduct>> {
    return this.api.patch(`/marketplace/products/${id}/`, data);
  }

  async getMarketplaceOrders(connectionId?: number): Promise<AxiosResponse<MarketplaceOrder[]>> {
    const params = connectionId ? `?connection=${connectionId}` : '';
    return this.api.get(`/marketplace/orders/${params}`);
  }

  async getMarketplaceOrder(id: number): Promise<AxiosResponse<MarketplaceOrder>> {
    return this.api.get(`/marketplace/orders/${id}/`);
  }

  async importMarketplaceOrder(orderId: string, connectionId: number): Promise<AxiosResponse<MarketplaceOrder>> {
    return this.api.post('/marketplace/orders/import/', {
      external_order_id: orderId,
      connection_id: connectionId,
    });
  }

  async updateMarketplaceOrder(id: number, data: Partial<MarketplaceOrder>): Promise<AxiosResponse<MarketplaceOrder>> {
    return this.api.patch(`/marketplace/orders/${id}/`, data);
  }

  async syncInventoryToMarketplace(productId: number, connectionId: number, quantity: number): Promise<AxiosResponse<any>> {
    return this.api.post('/marketplace/inventory/sync/', {
      product_id: productId,
      connection_id: connectionId,
      quantity: quantity,
    });
  }

  async getMarketplaceAnalytics(connectionId: number, period: string): Promise<AxiosResponse<MarketplaceAnalytics>> {
    return this.api.get(`/marketplace/analytics/${connectionId}/?period=${period}`);
  }

  async getBulkMarketplaceOperations(): Promise<AxiosResponse<BulkMarketplaceOperation[]>> {
    return this.api.get('/marketplace/bulk-operations/');
  }

  async getBulkMarketplaceOperation(id: number): Promise<AxiosResponse<BulkMarketplaceOperation>> {
    return this.api.get(`/marketplace/bulk-operations/${id}/`);
  }

  async startBulkMarketplaceOperation(operationType: string, connections: number[]): Promise<AxiosResponse<BulkMarketplaceOperation>> {
    return this.api.post('/marketplace/bulk-operations/', {
      operation_type: operationType,
      connections: connections,
    });
  }

  async cancelBulkMarketplaceOperation(id: number): Promise<AxiosResponse<void>> {
    return this.api.post(`/marketplace/bulk-operations/${id}/cancel/`);
  }

  // Quick Commerce Integration APIs
  async getQuickCommerceConnections(filters?: QuickCommerceFilters): Promise<AxiosResponse<QuickCommerceConnection[]>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.status) params.append('status', filters.status);
      if (filters.last_sync_from) params.append('last_sync_from', filters.last_sync_from);
      if (filters.last_sync_to) params.append('last_sync_to', filters.last_sync_to);
      if (filters.connection_id) params.append('connection_id', filters.connection_id.toString());
    }
    return this.api.get(`/quick-commerce/connections/?${params.toString()}`);
  }

  async getQuickCommerceConnection(id: number): Promise<AxiosResponse<QuickCommerceConnection>> {
    return this.api.get(`/quick-commerce/connections/${id}/`);
  }

  async createQuickCommerceConnection(connectionData: Omit<QuickCommerceConnection, 'id' | 'created_at' | 'updated_at'>): Promise<AxiosResponse<QuickCommerceConnection>> {
    return this.api.post('/quick-commerce/connections/', connectionData);
  }

  async updateQuickCommerceConnection(id: number, data: Partial<QuickCommerceConnection>): Promise<AxiosResponse<QuickCommerceConnection>> {
    return this.api.patch(`/quick-commerce/connections/${id}/`, data);
  }

  async deleteQuickCommerceConnection(id: number): Promise<AxiosResponse<void>> {
    return this.api.delete(`/quick-commerce/connections/${id}/`);
  }

  async testQuickCommerceConnection(id: number): Promise<AxiosResponse<{ success: boolean; message: string; details?: any }>> {
    return this.api.post(`/quick-commerce/connections/${id}/test/`);
  }

  async getQuickCommerceSyncOperations(filters?: QuickCommerceSyncFilters): Promise<AxiosResponse<QuickCommerceSyncOperation[]>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.operation_type) params.append('operation_type', filters.operation_type);
      if (filters.status) params.append('status', filters.status);
      if (filters.date_from) params.append('date_from', filters.date_from);
      if (filters.date_to) params.append('date_to', filters.date_to);
      if (filters.connection_id) params.append('connection_id', filters.connection_id.toString());
    }
    return this.api.get(`/quick-commerce/sync-operations/?${params.toString()}`);
  }

  async getQuickCommerceSyncOperation(id: number): Promise<AxiosResponse<QuickCommerceSyncOperation>> {
    return this.api.get(`/quick-commerce/sync-operations/${id}/`);
  }

  async startQuickCommerceSync(connectionId: number, operationType: string, direction: string): Promise<AxiosResponse<QuickCommerceSyncOperation>> {
    return this.api.post('/quick-commerce/sync-operations/', {
      connection: connectionId,
      operation_type: operationType,
      direction: direction,
    });
  }

  async retryQuickCommerceSync(syncOperationId: number): Promise<AxiosResponse<QuickCommerceSyncOperation>> {
    return this.api.post(`/quick-commerce/sync-operations/${syncOperationId}/retry/`);
  }

  async cancelQuickCommerceSync(syncOperationId: number): Promise<AxiosResponse<void>> {
    return this.api.post(`/quick-commerce/sync-operations/${syncOperationId}/cancel/`);
  }

  async getQuickCommerceProducts(connectionId?: number): Promise<AxiosResponse<QuickCommerceProduct[]>> {
    const params = connectionId ? `?connection=${connectionId}` : '';
    return this.api.get(`/quick-commerce/products/${params}`);
  }

  async getQuickCommerceProduct(id: number): Promise<AxiosResponse<QuickCommerceProduct>> {
    return this.api.get(`/quick-commerce/products/${id}/`);
  }

  async syncQuickCommerceInventory(productId: number, connectionId: number, quantity: number): Promise<AxiosResponse<any>> {
    return this.api.post('/quick-commerce/inventory/sync/', {
      product_id: productId,
      connection_id: connectionId,
      quantity: quantity,
    });
  }

  async updateQuickCommerceProduct(id: number, data: Partial<QuickCommerceProduct>): Promise<AxiosResponse<QuickCommerceProduct>> {
    return this.api.patch(`/quick-commerce/products/${id}/`, data);
  }

  async getQuickCommerceOrders(connectionId?: number): Promise<AxiosResponse<QuickCommerceOrder[]>> {
    const params = connectionId ? `?connection=${connectionId}` : '';
    return this.api.get(`/quick-commerce/orders/${params}`);
  }

  async getQuickCommerceOrder(id: number): Promise<AxiosResponse<QuickCommerceOrder>> {
    return this.api.get(`/quick-commerce/orders/${id}/`);
  }

  async importQuickCommerceOrder(orderId: string, connectionId: number): Promise<AxiosResponse<QuickCommerceOrder>> {
    return this.api.post('/quick-commerce/orders/import/', {
      external_order_id: orderId,
      connection_id: connectionId,
    });
  }

  async updateQuickCommerceOrder(id: number, data: Partial<QuickCommerceOrder>): Promise<AxiosResponse<QuickCommerceOrder>> {
    return this.api.patch(`/quick-commerce/orders/${id}/`, data);
  }

  async getDeliverySlots(connectionId: number): Promise<AxiosResponse<DeliverySlot[]>> {
    return this.api.get(`/quick-commerce/delivery-slots/?connection=${connectionId}`);
  }

  async getDeliverySlot(id: number): Promise<AxiosResponse<DeliverySlot>> {
    return this.api.get(`/quick-commerce/delivery-slots/${id}/`);
  }

  async updateDeliverySlot(id: number, data: Partial<DeliverySlot>): Promise<AxiosResponse<DeliverySlot>> {
    return this.api.patch(`/quick-commerce/delivery-slots/${id}/`, data);
  }

  async getQuickCommercePricing(connectionId?: number): Promise<AxiosResponse<QuickCommercePricing[]>> {
    const params = connectionId ? `?connection=${connectionId}` : '';
    return this.api.get(`/quick-commerce/pricing/${params}`);
  }

  async getQuickCommercePricingItem(id: number): Promise<AxiosResponse<QuickCommercePricing>> {
    return this.api.get(`/quick-commerce/pricing/${id}/`);
  }

  async updateQuickCommercePricing(id: number, data: Partial<QuickCommercePricing>): Promise<AxiosResponse<QuickCommercePricing>> {
    return this.api.patch(`/quick-commerce/pricing/${id}/`, data);
  }

  async getQuickCommerceAnalytics(connectionId: number, period: string): Promise<AxiosResponse<QuickCommerceAnalytics>> {
    return this.api.get(`/quick-commerce/analytics/${connectionId}/?period=${period}`);
  }

  async getEmergencyStockAllocations(connectionId?: number): Promise<AxiosResponse<EmergencyStockAllocation[]>> {
    const params = connectionId ? `?connection=${connectionId}` : '';
    return this.api.get(`/quick-commerce/emergency-allocations/${params}`);
  }

  async getEmergencyStockAllocation(id: number): Promise<AxiosResponse<EmergencyStockAllocation>> {
    return this.api.get(`/quick-commerce/emergency-allocations/${id}/`);
  }

  async createEmergencyStockAllocation(allocationData: Omit<EmergencyStockAllocation, 'id' | 'allocated_at'>): Promise<AxiosResponse<EmergencyStockAllocation>> {
    return this.api.post('/quick-commerce/emergency-allocations/', allocationData);
  }

  async updateEmergencyStockAllocation(id: number, data: Partial<EmergencyStockAllocation>): Promise<AxiosResponse<EmergencyStockAllocation>> {
    return this.api.patch(`/quick-commerce/emergency-allocations/${id}/`, data);
  }

  async cancelEmergencyStockAllocation(id: number): Promise<AxiosResponse<void>> {
    return this.api.post(`/quick-commerce/emergency-allocations/${id}/cancel/`);
  }

  // Generic methods
  get instance(): AxiosInstance {
    return this.api;
  }
}

export const apiService = new ApiService();
export default apiService;