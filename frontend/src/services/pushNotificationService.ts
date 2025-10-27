interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: any;
}

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class PushNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return;
    }

    // Check current permission
    this.permission = Notification.permission;

    // Register service worker if not already registered
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered for push notifications');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  getPermission(): NotificationPermission {
    return this.permission;
  }

  async showNotification(options: PushNotificationOptions): Promise<void> {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/logo192.png',
        badge: options.badge || '/favicon.ico',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        data: options.data,
      });

      // Auto-close after 5 seconds if not requiring interaction
      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Mock push notification scenarios for inventory management
  async mockLowStockAlert(productName: string, currentStock: number, minStock: number): Promise<void> {
    await this.showNotification({
      title: 'Low Stock Alert',
      body: `${productName} is running low (${currentStock} units remaining, minimum: ${minStock})`,
      icon: '/warning-icon.png',
      tag: 'low-stock',
      requireInteraction: true,
      actions: [
        { action: 'restock', title: 'Restock Now' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
      data: { type: 'low-stock', productName, currentStock, minStock },
    });
  }

  async mockOrderUpdate(orderId: string, status: string): Promise<void> {
    await this.showNotification({
      title: 'Order Update',
      body: `Order #${orderId} status changed to: ${status}`,
      icon: '/order-icon.png',
      tag: 'order-update',
      data: { type: 'order-update', orderId, status },
    });
  }

  async mockDeliveryAlert(deliveryId: string, estimatedTime: string): Promise<void> {
    await this.showNotification({
      title: 'Delivery Update',
      body: `Delivery #${deliveryId} is arriving in approximately ${estimatedTime}`,
      icon: '/delivery-icon.png',
      tag: 'delivery',
      data: { type: 'delivery', deliveryId, estimatedTime },
    });
  }

  async mockPaymentReminder(invoiceId: string, amount: number, dueDate: string): Promise<void> {
    await this.showNotification({
      title: 'Payment Reminder',
      body: `Invoice #${invoiceId} for $${amount} is due on ${dueDate}`,
      icon: '/payment-icon.png',
      tag: 'payment-reminder',
      requireInteraction: true,
      actions: [
        { action: 'pay-now', title: 'Pay Now' },
        { action: 'remind-later', title: 'Remind Later' },
      ],
      data: { type: 'payment-reminder', invoiceId, amount, dueDate },
    });
  }

  async mockSystemAlert(message: string, severity: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    const icons = {
      info: '/info-icon.png',
      warning: '/warning-icon.png',
      error: '/error-icon.png',
    };

    await this.showNotification({
      title: 'System Alert',
      body: message,
      icon: icons[severity],
      tag: 'system-alert',
      requireInteraction: severity === 'error',
      data: { type: 'system-alert', message, severity },
    });
  }

  // Simulate receiving push notifications (for demo purposes)
  startMockNotifications(): void {
    // Simulate various notifications at random intervals
    const scenarios = [
      () => this.mockLowStockAlert('Wireless Headphones', 5, 10),
      () => this.mockOrderUpdate('ORD-2024-001', 'Shipped'),
      () => this.mockDeliveryAlert('DEL-2024-001', '30 minutes'),
      () => this.mockPaymentReminder('INV-2024-001', 299.99, '2024-12-31'),
      () => this.mockSystemAlert('System maintenance scheduled for tonight at 2 AM'),
    ];

    // Send a notification every 30-60 seconds for demo
    const scheduleNotification = () => {
      const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      randomScenario();

      const delay = 30000 + Math.random() * 30000; // 30-60 seconds
      setTimeout(scheduleNotification, delay);
    };

    // Start after initial delay
    setTimeout(scheduleNotification, 10000);
  }

  // Stop mock notifications
  stopMockNotifications(): void {
    // In a real implementation, you'd clear all scheduled timeouts
    console.log('Mock notifications stopped');
  }
}

// Create singleton instance
export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;