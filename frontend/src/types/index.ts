// API Response Interfaces
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  date_joined: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user: number;
  products: OrderItem[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
  notes?: OrderNote[];
  fulfillment_status?: FulfillmentStatus;
  shipping_address?: ShippingAddress;
  payment_status?: string;
  tracking_number?: string;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface OrderNote {
  id: number;
  order: number;
  note: string;
  created_by: number;
  created_at: string;
}

export interface FulfillmentStatus {
  packing_status: 'pending' | 'in_progress' | 'completed';
  shipping_status: 'pending' | 'shipped' | 'delivered';
  tracking_number?: string;
  estimated_delivery?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  capacity: number;
}

export interface Payment {
  id: number;
  order: number;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
}

export interface Shipping {
  id: number;
  order: number;
  tracking_number: string;
  carrier: string;
  status: string;
  estimated_delivery: string;
}

// API Request Interfaces
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// Redux State Interfaces
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  orderHistory: OrderHistory[];
  customerOrders: Order[];
  loading: boolean;
  error: string | null;
}

export interface OrderHistory {
  id: number;
  order: number;
  action: string;
  old_value?: string;
  new_value?: string;
  user: number;
  timestamp: string;
}

export interface OrderFilters {
  status?: string;
  date_from?: string;
  date_to?: string;
  customer_id?: number;
  min_amount?: number;
  max_amount?: number;
}

export interface RootState {
  auth: AuthState;
  products: ProductState;
  orders: OrderState;
  shipping: ShippingState;
}

// Dashboard Types
export interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  totalInventory: number;
  lowStockAlerts: number;
  pendingOrders: number;
  completedOrders: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  sales: number;
  revenue: number;
}

export interface CategorySales {
  category: string;
  sales: number;
  percentage: number;
}

export interface InventoryLevel {
  productId: number;
  productName: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  warehouse: string;
}

export interface WarehouseUtilization {
  warehouseId: number;
  warehouseName: string;
  usedCapacity: number;
  totalCapacity: number;
  utilizationPercentage: number;
}

export interface OrderStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface FulfillmentRate {
  period: string;
  fulfilled: number;
  total: number;
  rate: number;
}

export interface CustomerInsight {
  customerId: number;
  customerName: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface PerformanceMetrics {
  conversionRate: number;
  averageOrderValue: number;
  customerRetentionRate: number;
  returnRate: number;
  period: string;
}

export interface DashboardFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  category?: string;
  warehouse?: string;
}

// Inventory Management Types
export interface InventoryItem {
  id: number;
  product: Product;
  warehouse: Warehouse;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  last_updated: string;
}

export interface InventoryHistory {
  id: number;
  inventory_item: number;
  action: 'add' | 'remove' | 'adjust' | 'transfer';
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason: string;
  user: number;
  timestamp: string;
}

export interface LowStockAlert {
  id: number;
  product: Product;
  warehouse: Warehouse;
  current_stock: number;
  min_stock_level: number;
  alert_level: 'warning' | 'critical';
  created_at: string;
  acknowledged: boolean;
}

export interface BulkOperation {
  id: number;
  operation_type: 'import' | 'export' | 'update';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_items: number;
  processed_items: number;
  created_at: string;
  completed_at?: string;
  errors?: string[];
}

export interface StockAdjustment {
  product_id: number;
  warehouse_id: number;
  adjustment_type: 'add' | 'remove' | 'set';
  quantity: number;
  reason: string;
}

export interface WarehouseTransfer {
  from_warehouse_id: number;
  to_warehouse_id: number;
  product_id: number;
  quantity: number;
  reason: string;
}

export interface InventoryFilters {
  product_name?: string;
  category?: string;
  warehouse_id?: number;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
  min_stock?: number;
  max_stock?: number;
}

export interface InventoryState {
  inventoryItems: InventoryItem[];
  inventoryHistory: InventoryHistory[];
  lowStockAlerts: LowStockAlert[];
  bulkOperations: BulkOperation[];
  loading: boolean;
  error: string | null;
}

export interface WarehouseState {
  warehouses: Warehouse[];
  loading: boolean;
  error: string | null;
}

// Seller Management Types
export interface Seller {
  id: number;
  user: User;
  business_name: string;
  business_description: string;
  business_address: string;
  phone_number: string;
  tax_id?: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verification_documents: SellerDocument[];
  commission_rate: number;
  total_sales: number;
  total_revenue: number;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SellerDocument {
  id: number;
  seller: number;
  document_type: 'business_license' | 'tax_certificate' | 'identity_proof' | 'bank_statement';
  file_name: string;
  file_url: string;
  uploaded_at: string;
  verified: boolean;
}

export interface SellerProduct {
  id: number;
  seller: Seller;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock_quantity: number;
  min_order_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SellerOrder {
  id: number;
  seller: Seller;
  order: Order;
  items: SellerOrderItem[];
  commission_amount: number;
  seller_earnings: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface SellerOrderItem {
  id: number;
  seller_order: number;
  product: SellerProduct;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface SellerCommission {
  id: number;
  seller: Seller;
  order: Order;
  commission_rate: number;
  commission_amount: number;
  paid: boolean;
  paid_at?: string;
  created_at: string;
}

export interface SellerNotification {
  id: number;
  seller: Seller;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
}

export interface SellerAnalytics {
  seller_id: number;
  period: string;
  total_sales: number;
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  top_products: SellerProduct[];
  sales_trend: SalesData[];
  commission_earned: number;
  commission_paid: number;
}

export interface SellerDashboardMetrics {
  total_products: number;
  active_products: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number;
  commission_earned: number;
  commission_pending: number;
  average_rating: number;
  recent_orders: SellerOrder[];
  low_stock_products: SellerProduct[];
}

export interface SellerRegistrationRequest {
  business_name: string;
  business_description: string;
  business_address: string;
  phone_number: string;
  tax_id?: string;
  commission_rate: number;
}

export interface SellerProfileUpdate {
  business_name?: string;
  business_description?: string;
  business_address?: string;
  phone_number?: string;
  tax_id?: string;
}

export interface SellerVerificationRequest {
  seller_id: number;
  status: 'verified' | 'rejected';
  notes?: string;
}

export interface SellerProductCreate {
  name: string;
  description: string;
  price: number;
  category: string;
  images: File[];
  stock_quantity: number;
  min_order_quantity: number;
}

export interface SellerProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  images?: File[];
  stock_quantity?: number;
  min_order_quantity?: number;
  is_active?: boolean;
}

export interface SellerState {
  sellers: Seller[];
  currentSeller: Seller | null;
  sellerProducts: SellerProduct[];
  sellerOrders: SellerOrder[];
  sellerCommissions: SellerCommission[];
  sellerNotifications: SellerNotification[];
  sellerAnalytics: SellerAnalytics | null;
  dashboardMetrics: SellerDashboardMetrics | null;
  loading: boolean;
  error: string | null;
}

export interface SellerFilters {
  verification_status?: string;
  is_active?: boolean;
  business_name?: string;
  min_rating?: number;
  max_rating?: number;
}

// Shipping Management Types
export interface Shipment {
  id: number;
  order: number;
  order_number: string;
  customer_name: string;
  tracking_number: string;
  carrier: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'returned';
  shipped_at?: string;
  delivered_at?: string;
}

export interface Carrier {
  id: number;
  name: string;
  code: string;
  api_key?: string;
  api_secret?: string;
  is_active: boolean;
  configuration: CarrierConfiguration;
  created_at: string;
  updated_at: string;
}

export interface CarrierConfiguration {
  base_url: string;
  tracking_url_template: string;
  label_formats: string[];
  supported_services: string[];
  rate_shopping_enabled: boolean;
}

export interface ShippingRate {
  carrier: string;
  service: string;
  cost: number;
  estimated_delivery: string;
  currency: string;
}

export interface ShippingLabel {
  id: number;
  shipment: number;
  label_data: string; // Base64 encoded PDF/image
  format: 'pdf' | 'png' | 'zpl';
  created_at: string;
}

export interface BulkShipment {
  id: number;
  name: string;
  shipments: number[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  errors?: string[];
}

export interface DeliveryNotification {
  id: number;
  shipment: number;
  type: 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed_delivery' | 'returned';
  message: string;
  timestamp: string;
  sent: boolean;
}

export interface ShippingAnalytics {
  period: string;
  total_shipments: number;
  on_time_delivery_rate: number;
  average_shipping_cost: number;
  carrier_performance: CarrierPerformance[];
  shipping_cost_trend: ShippingCostData[];
  delivery_time_distribution: DeliveryTimeData[];
}

export interface CarrierPerformance {
  carrier: string;
  total_shipments: number;
  on_time_deliveries: number;
  average_cost: number;
  average_delivery_time: number;
}

export interface ShippingCostData {
  date: string;
  cost: number;
  shipments: number;
}

export interface DeliveryTimeData {
  range: string;
  count: number;
  percentage: number;
}

export interface ShipmentCreateRequest {
  order: number;
  tracking_number: string;
  carrier: string;
}

export interface ShipmentUpdateRequest {
  status?: 'pending' | 'in_transit' | 'delivered' | 'returned';
  tracking_number?: string;
  carrier?: string;
}

export interface CarrierCreateRequest {
  name: string;
  code: string;
  api_key?: string;
  api_secret?: string;
  configuration: CarrierConfiguration;
}

export interface CarrierUpdateRequest {
  name?: string;
  code?: string;
  api_key?: string;
  api_secret?: string;
  is_active?: boolean;
  configuration?: Partial<CarrierConfiguration>;
}

export interface ShippingRateRequest {
  origin: Address;
  destination: Address;
  packages: Package[];
  carrier?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface Package {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  value?: number;
}

export interface ShippingState {
  shipments: Shipment[];
  carriers: Carrier[];
  shippingRates: ShippingRate[];
  shippingLabels: ShippingLabel[];
  bulkShipments: BulkShipment[];
  deliveryNotifications: DeliveryNotification[];
  analytics: ShippingAnalytics | null;
  loading: boolean;
  error: string | null;
}

export interface ShippingFilters {
  status?: string;
  carrier?: string;
  date_from?: string;
  date_to?: string;
  tracking_number?: string;
  order_number?: string;
}

// Payment Reconciliation Types
export interface PaymentTransaction {
  id: number;
  order: number;
  amount: number;
  currency: string;
  payment_method: string;
  gateway_transaction_id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  gateway: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface ReconciliationRecord {
  id: number;
  payment_transaction: number;
  order_amount: number;
  payment_amount: number;
  discrepancy_amount: number;
  discrepancy_reason?: string;
  status: 'matched' | 'discrepancy' | 'resolved' | 'escalated';
  reconciled_by?: number;
  reconciled_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentGateway {
  id: number;
  name: string;
  code: string;
  api_key?: string;
  api_secret?: string;
  webhook_url?: string;
  is_active: boolean;
  configuration: PaymentGatewayConfiguration;
  supported_currencies: string[];
  supported_methods: string[];
  created_at: string;
  updated_at: string;
}

export interface PaymentGatewayConfiguration {
  base_url: string;
  timeout: number;
  retry_attempts: number;
  webhook_secret?: string;
  additional_settings?: Record<string, any>;
}

export interface Dispute {
  id: number;
  payment_transaction: number;
  order: number;
  amount: number;
  reason: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  resolution?: string;
  resolved_by?: number;
  resolved_at?: string;
  evidence: DisputeEvidence[];
  created_at: string;
  updated_at: string;
}

export interface DisputeEvidence {
  id: number;
  dispute: number;
  file_name: string;
  file_url: string;
  uploaded_by: number;
  uploaded_at: string;
}

export interface ReconciliationReport {
  id: number;
  period_start: string;
  period_end: string;
  total_transactions: number;
  matched_transactions: number;
  discrepancy_transactions: number;
  total_discrepancy_amount: number;
  resolved_discrepancies: number;
  unresolved_discrepancies: number;
  generated_at: string;
  generated_by: number;
}

export interface PaymentHistory {
  id: number;
  payment_transaction: number;
  action: string;
  old_value?: string;
  new_value?: string;
  user: number;
  timestamp: string;
  notes?: string;
}

export interface FinancialReport {
  id: number;
  report_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  total_revenue: number;
  total_payments: number;
  total_refunds: number;
  total_fees: number;
  net_revenue: number;
  currency: string;
  breakdown_by_gateway: GatewayBreakdown[];
  breakdown_by_method: MethodBreakdown[];
  generated_at: string;
  generated_by: number;
}

export interface GatewayBreakdown {
  gateway: string;
  transactions: number;
  amount: number;
  fees: number;
  success_rate: number;
}

export interface MethodBreakdown {
  method: string;
  transactions: number;
  amount: number;
  success_rate: number;
}

export interface PaymentAnalytics {
  period: string;
  total_transactions: number;
  total_volume: number;
  average_transaction_value: number;
  success_rate: number;
  refund_rate: number;
  chargeback_rate: number;
  top_gateways: GatewayPerformance[];
  transaction_trends: TransactionTrend[];
}

export interface GatewayPerformance {
  gateway: string;
  transactions: number;
  success_rate: number;
  average_processing_time: number;
  total_fees: number;
}

export interface TransactionTrend {
  date: string;
  transactions: number;
  volume: number;
  success_rate: number;
}

export interface PaymentFilters {
  status?: string;
  gateway?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  currency?: string;
}

export interface ReconciliationFilters {
  status?: string;
  date_from?: string;
  date_to?: string;
  min_discrepancy?: number;
  max_discrepancy?: number;
  reconciled_by?: number;
}

export interface DisputeFilters {
  status?: string;
  reason?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface PaymentState {
  transactions: PaymentTransaction[];
  reconciliationRecords: ReconciliationRecord[];
  gateways: PaymentGateway[];
  disputes: Dispute[];
  reports: ReconciliationReport[];
  history: PaymentHistory[];
  financialReports: FinancialReport[];
  analytics: PaymentAnalytics | null;
  loading: boolean;
  error: string | null;
}

// Marketplace Integration Types
export interface MarketplaceConnection {
  id: number;
  name: string;
  platform: 'amazon' | 'ebay' | 'etsy' | 'shopify' | 'woocommerce' | 'custom';
  api_key?: string;
  api_secret?: string;
  access_token?: string;
  refresh_token?: string;
  store_url?: string;
  configuration: MarketplaceConfiguration;
  status: 'active' | 'inactive' | 'error';
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceConfiguration {
  rate_limits: {
    requests_per_minute: number;
    requests_per_hour: number;
  };
  webhook_url?: string;
  additional_settings?: Record<string, any>;
}

export interface SyncOperation {
  id: number;
  connection: number;
  operation_type: 'products' | 'orders' | 'inventory' | 'analytics';
  direction: 'import' | 'export' | 'sync';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  total_items: number;
  processed_items: number;
  failed_items: number;
  errors: SyncError[];
  started_at: string;
  completed_at?: string;
  retry_count: number;
  max_retries: number;
}

export interface SyncError {
  id: number;
  sync_operation: number;
  item_id?: string;
  error_type: string;
  error_message: string;
  error_details?: Record<string, any>;
  retryable: boolean;
  created_at: string;
}

export interface MarketplaceProduct {
  id: number;
  connection: number;
  external_id: string;
  internal_product: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  stock_quantity: number;
  sku: string;
  category: string;
  images: string[];
  variants: ProductVariant[];
  last_sync: string;
  sync_status: 'synced' | 'pending' | 'failed';
}

export interface ProductVariant {
  id: number;
  external_id: string;
  name: string;
  price: number;
  stock_quantity: number;
  sku: string;
  attributes: Record<string, string>;
}

export interface MarketplaceOrder {
  id: number;
  connection: number;
  external_id: string;
  internal_order?: number;
  customer_name: string;
  customer_email: string;
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress;
  items: MarketplaceOrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  ordered_at: string;
  last_sync: string;
  sync_status: 'synced' | 'pending' | 'failed';
}

export interface MarketplaceOrderItem {
  id: number;
  external_id: string;
  product: MarketplaceProduct;
  quantity: number;
  unit_price: number;
  total_price: number;
  sku: string;
}

export interface MarketplaceAnalytics {
  connection_id: number;
  period: string;
  total_sales: number;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  conversion_rate: number;
  top_products: TopMarketplaceProduct[];
  sales_trend: SalesData[];
  category_performance: CategoryPerformance[];
  geographic_sales: GeographicSales[];
  customer_demographics: CustomerDemographics;
}

export interface TopMarketplaceProduct {
  product_id: number;
  product_name: string;
  sales: number;
  revenue: number;
  orders: number;
}

export interface CategoryPerformance {
  category: string;
  sales: number;
  revenue: number;
  percentage: number;
}

export interface GeographicSales {
  region: string;
  country: string;
  sales: number;
  revenue: number;
  orders: number;
}

export interface CustomerDemographics {
  age_groups: AgeGroup[];
  gender_distribution: GenderDistribution[];
  location_distribution: LocationDistribution[];
}

export interface AgeGroup {
  range: string;
  count: number;
  percentage: number;
}

export interface GenderDistribution {
  gender: string;
  count: number;
  percentage: number;
}

export interface LocationDistribution {
  location: string;
  count: number;
  percentage: number;
}

export interface BulkMarketplaceOperation {
  id: number;
  operation_type: 'sync_all' | 'update_prices' | 'update_inventory' | 'import_orders';
  connections: number[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  total_operations: number;
  completed_operations: number;
  failed_operations: number;
  started_at: string;
  completed_at?: string;
  errors: string[];
}

export interface RetryConfiguration {
  max_retries: number;
  retry_delay: number; // in seconds
  exponential_backoff: boolean;
  retry_on_errors: string[];
}

export interface MarketplaceFilters {
  platform?: string;
  status?: string;
  last_sync_from?: string;
  last_sync_to?: string;
  connection_id?: number;
}

export interface SyncFilters {
  operation_type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  connection_id?: number;
}

export interface MarketplaceState {
  connections: MarketplaceConnection[];
  syncOperations: SyncOperation[];
  marketplaceProducts: MarketplaceProduct[];
  marketplaceOrders: MarketplaceOrder[];
  analytics: MarketplaceAnalytics | null;
  bulkOperations: BulkMarketplaceOperation[];
  loading: boolean;
  error: string | null;
}

// Quick Commerce Types
export interface QuickCommerceConnection {
  id: number;
  name: string;
  platform: 'blinkit' | 'swiggy_instamart' | 'zepto' | 'bigbasket' | 'custom';
  api_key?: string;
  api_secret?: string;
  access_token?: string;
  refresh_token?: string;
  store_url?: string;
  configuration: QuickCommerceConfiguration;
  status: 'active' | 'inactive' | 'error';
  last_sync?: string;
  created_at: string;
  updated_at: string;
}

export interface QuickCommerceConfiguration {
  rate_limits: {
    requests_per_minute: number;
    requests_per_hour: number;
  };
  webhook_url?: string;
  additional_settings?: Record<string, any>;
}

export interface QuickCommerceSyncOperation {
  id: number;
  connection: number;
  operation_type: 'inventory' | 'orders' | 'pricing' | 'analytics';
  direction: 'import' | 'export' | 'sync';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  total_items: number;
  processed_items: number;
  failed_items: number;
  errors: QuickCommerceSyncError[];
  started_at: string;
  completed_at?: string;
  retry_count: number;
  max_retries: number;
}

export interface QuickCommerceSyncError {
  id: number;
  sync_operation: number;
  item_id?: string;
  error_type: string;
  error_message: string;
  error_details?: Record<string, any>;
  retryable: boolean;
  created_at: string;
}

export interface QuickCommerceProduct {
  id: number;
  connection: number;
  external_id: string;
  internal_product: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  stock_quantity: number;
  sku: string;
  category: string;
  images: string[];
  variants: QuickCommerceProductVariant[];
  last_sync: string;
  sync_status: 'synced' | 'pending' | 'failed';
}

export interface QuickCommerceProductVariant {
  id: number;
  external_id: string;
  name: string;
  price: number;
  stock_quantity: number;
  sku: string;
  attributes: Record<string, string>;
}

export interface QuickCommerceOrder {
  id: number;
  connection: number;
  external_id: string;
  internal_order?: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  billing_address: ShippingAddress;
  items: QuickCommerceOrderItem[];
  subtotal: number;
  delivery_fee: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  ordered_at: string;
  delivery_slot?: DeliverySlot;
  last_sync: string;
  sync_status: 'synced' | 'pending' | 'failed';
}

export interface QuickCommerceOrderItem {
  id: number;
  external_id: string;
  product: QuickCommerceProduct;
  quantity: number;
  unit_price: number;
  total_price: number;
  sku: string;
}

export interface DeliverySlot {
  id: number;
  connection: number;
  start_time: string;
  end_time: string;
  date: string;
  available_capacity: number;
  total_capacity: number;
  is_available: boolean;
  pricing_multiplier: number;
}

export interface QuickCommercePricing {
  id: number;
  connection: number;
  product: number;
  base_price: number;
  dynamic_price: number;
  min_price: number;
  max_price: number;
  pricing_strategy: 'fixed' | 'dynamic' | 'surge';
  surge_multiplier: number;
  last_updated: string;
  is_active: boolean;
}

export interface QuickCommerceAnalytics {
  connection_id: number;
  period: string;
  total_sales: number;
  total_orders: number;
  total_revenue: number;
  average_order_value: number;
  conversion_rate: number;
  top_products: TopQuickCommerceProduct[];
  sales_trend: SalesData[];
  category_performance: CategoryPerformance[];
  delivery_performance: DeliveryPerformance;
  slot_utilization: SlotUtilization[];
}

export interface TopQuickCommerceProduct {
  product_id: number;
  product_name: string;
  sales: number;
  revenue: number;
  orders: number;
}

export interface DeliveryPerformance {
  total_deliveries: number;
  on_time_deliveries: number;
  average_delivery_time: number;
  customer_satisfaction_score: number;
}

export interface SlotUtilization {
  slot_id: number;
  date: string;
  utilization_percentage: number;
  revenue_generated: number;
}

export interface EmergencyStockAllocation {
  id: number;
  connection: number;
  product: number;
  allocated_quantity: number;
  reason: 'high_demand' | 'low_stock' | 'promotion' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  allocated_at: string;
  expires_at?: string;
  status: 'active' | 'expired' | 'cancelled';
}

export interface QuickCommerceFilters {
  platform?: string;
  status?: string;
  last_sync_from?: string;
  last_sync_to?: string;
  connection_id?: number;
}

export interface QuickCommerceSyncFilters {
  operation_type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  connection_id?: number;
}

export interface QuickCommerceState {
  connections: QuickCommerceConnection[];
  syncOperations: QuickCommerceSyncOperation[];
  products: QuickCommerceProduct[];
  orders: QuickCommerceOrder[];
  deliverySlots: DeliverySlot[];
  pricing: QuickCommercePricing[];
  analytics: QuickCommerceAnalytics | null;
  emergencyAllocations: EmergencyStockAllocation[];
  loading: boolean;
  error: string | null;
}