import { useState, useEffect, useCallback } from 'react';

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineTime: Date | null;
  connectionType: string;
}

interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}

class OfflineManager {
  private cache = new Map<string, CachedData>();
  private pendingRequests: Array<{
    id: string;
    request: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
  }> = [];
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Load cached data from localStorage
    this.loadFromStorage();

    // Start sync interval when coming back online
    this.startSyncWhenOnline();
  }

  private loadFromStorage() {
    try {
      const cached = localStorage.getItem('offline-cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        Object.entries(parsed).forEach(([key, data]: [string, any]) => {
          this.cache.set(key, data);
        });
      }
    } catch (error) {
      console.error('Failed to load offline cache:', error);
    }
  }

  private saveToStorage() {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      localStorage.setItem('offline-cache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Failed to save offline cache:', error);
    }
  }

  private startSyncWhenOnline() {
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && this.pendingRequests.length > 0) {
        this.syncPendingRequests();
      }
    }, 30000); // Check every 30 seconds
  }

  private async syncPendingRequests() {
    const requests = [...this.pendingRequests];
    this.pendingRequests = [];

    for (const req of requests) {
      try {
        const result = await req.request();
        req.resolve(result);
      } catch (error) {
        req.reject(error);
      }
    }
  }

  // Cache data for offline use
  setCache(key: string, data: any, ttl?: number): void {
    const cachedData: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: ttl ? Date.now() + ttl : undefined,
    };

    this.cache.set(key, cachedData);
    this.saveToStorage();
  }

  // Get cached data
  getCache(key: string): any | null {
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if expired
    if (cached.expiresAt && Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return cached.data;
  }

  // Queue request for when back online
  queueRequest(id: string, request: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      this.pendingRequests.push({
        id,
        request,
        resolve,
        reject,
        timestamp: Date.now(),
      });
    });
  }

  // Get pending request count
  getPendingRequestCount(): number {
    return this.pendingRequests.length;
  }

  // Clear expired cache
  clearExpiredCache(): void {
    const now = Date.now();
    this.cache.forEach((cached, key) => {
      if (cached.expiresAt && now > cached.expiresAt) {
        this.cache.delete(key);
      }
    });
    this.saveToStorage();
  }

  // Clear all cache
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem('offline-cache');
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// Create singleton instance
const offlineManager = new OfflineManager();

export const useOffline = () => {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    wasOffline: false,
    lastOnlineTime: navigator.onLine ? new Date() : null,
    connectionType: (navigator as any).connection?.effectiveType || 'unknown',
  });

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({
        ...prev,
        isOnline: true,
        lastOnlineTime: new Date(),
      }));

      // Show back online notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Back Online', {
          body: 'You are back online. Syncing data...',
          icon: '/logo192.png',
        });
      }
    };

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        isOnline: false,
        wasOffline: true,
      }));

      // Show offline notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Offline Mode', {
          body: 'You are currently offline. Some features may be limited.',
          icon: '/logo192.png',
          tag: 'offline-status',
        });
      }
    };

    const handleConnectionChange = () => {
      setState(prev => ({
        ...prev,
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes
    if ((navigator as any).connection) {
      (navigator as any).connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ((navigator as any).connection) {
        (navigator as any).connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, []);

  const cacheData = useCallback((key: string, data: any, ttl?: number) => {
    offlineManager.setCache(key, data, ttl);
  }, []);

  const getCachedData = useCallback((key: string) => {
    return offlineManager.getCache(key);
  }, []);

  const queueRequest = useCallback((id: string, request: () => Promise<any>) => {
    return offlineManager.queueRequest(id, request);
  }, []);

  const getPendingRequestCount = useCallback(() => {
    return offlineManager.getPendingRequestCount();
  }, []);

  const clearExpiredCache = useCallback(() => {
    offlineManager.clearExpiredCache();
  }, []);

  const clearCache = useCallback(() => {
    offlineManager.clearCache();
  }, []);

  return {
    ...state,
    cacheData,
    getCachedData,
    queueRequest,
    getPendingRequestCount,
    clearExpiredCache,
    clearCache,
  };
};

// Hook for offline-aware API calls
export const useOfflineApi = () => {
  const { isOnline, cacheData, getCachedData, queueRequest } = useOffline();

  const offlineApiCall = useCallback(async <T>(
    cacheKey: string,
    apiCall: () => Promise<T>,
    options?: {
      ttl?: number;
      forceRefresh?: boolean;
      fallbackData?: T;
    }
  ): Promise<T> => {
    const { ttl, forceRefresh = false, fallbackData } = options || {};

    // Try to get from cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    // If online, make the API call
    if (isOnline) {
      try {
        const data = await apiCall();
        cacheData(cacheKey, data, ttl);
        return data;
      } catch (error) {
        // If API fails, try cache as fallback
        const cached = getCachedData(cacheKey);
        if (cached !== null) {
          return cached;
        }
        throw error;
      }
    }

    // If offline, queue the request and return cached data or fallback
    if (!isOnline) {
      const cached = getCachedData(cacheKey);
      if (cached !== null) {
        // Queue the request for when back online
        queueRequest(`api-${cacheKey}-${Date.now()}`, apiCall);
        return cached;
      }

      if (fallbackData !== undefined) {
        return fallbackData;
      }

      throw new Error('Offline: No cached data available');
    }

    // This should never happen, but TypeScript needs it
    throw new Error('Unexpected state');
  }, [isOnline, cacheData, getCachedData, queueRequest]);

  return { offlineApiCall };
};

export default useOffline;