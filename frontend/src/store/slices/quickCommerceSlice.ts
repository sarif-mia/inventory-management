import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { QuickCommerceConnection, QuickCommerceSyncOperation, QuickCommerceProduct, QuickCommerceOrder, DeliverySlot, QuickCommercePricing, QuickCommerceAnalytics, EmergencyStockAllocation, QuickCommerceFilters, QuickCommerceSyncFilters } from '../../types';
import apiService from '../../services/api';

interface QuickCommerceState {
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

const initialState: QuickCommerceState = {
  connections: [],
  syncOperations: [],
  products: [],
  orders: [],
  deliverySlots: [],
  pricing: [],
  analytics: null,
  emergencyAllocations: [],
  loading: false,
  error: null,
};

// Async thunks for API calls
export const fetchQuickCommerceConnections = createAsyncThunk(
  'quickCommerce/fetchConnections',
  async (filters?: QuickCommerceFilters) => {
    const response = await apiService.getQuickCommerceConnections(filters);
    return response.data;
  }
);

export const createQuickCommerceConnection = createAsyncThunk(
  'quickCommerce/createConnection',
  async (connectionData: Omit<QuickCommerceConnection, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await apiService.createQuickCommerceConnection(connectionData);
    return response.data;
  }
);

export const updateQuickCommerceConnection = createAsyncThunk(
  'quickCommerce/updateConnection',
  async ({ id, data }: { id: number; data: Partial<QuickCommerceConnection> }) => {
    const response = await apiService.updateQuickCommerceConnection(id, data);
    return response.data;
  }
);

export const testQuickCommerceConnection = createAsyncThunk(
  'quickCommerce/testConnection',
  async (id: number) => {
    const response = await apiService.testQuickCommerceConnection(id);
    return response.data;
  }
);

export const fetchQuickCommerceSyncOperations = createAsyncThunk(
  'quickCommerce/fetchSyncOperations',
  async (filters?: QuickCommerceSyncFilters) => {
    const response = await apiService.getQuickCommerceSyncOperations(filters);
    return response.data;
  }
);

export const startQuickCommerceSync = createAsyncThunk(
  'quickCommerce/startSync',
  async ({ connectionId, operationType, direction }: { connectionId: number; operationType: string; direction: string }) => {
    const response = await apiService.startQuickCommerceSync(connectionId, operationType, direction);
    return response.data;
  }
);

export const fetchQuickCommerceProducts = createAsyncThunk(
  'quickCommerce/fetchProducts',
  async (connectionId?: number) => {
    const response = await apiService.getQuickCommerceProducts(connectionId);
    return response.data;
  }
);

export const syncQuickCommerceInventory = createAsyncThunk(
  'quickCommerce/syncInventory',
  async ({ productId, connectionId, quantity }: { productId: number; connectionId: number; quantity: number }) => {
    const response = await apiService.syncQuickCommerceInventory(productId, connectionId, quantity);
    return response.data;
  }
);

export const fetchQuickCommerceOrders = createAsyncThunk(
  'quickCommerce/fetchOrders',
  async (connectionId?: number) => {
    const response = await apiService.getQuickCommerceOrders(connectionId);
    return response.data;
  }
);

export const importQuickCommerceOrder = createAsyncThunk(
  'quickCommerce/importOrder',
  async ({ orderId, connectionId }: { orderId: string; connectionId: number }) => {
    const response = await apiService.importQuickCommerceOrder(orderId, connectionId);
    return response.data;
  }
);

export const fetchDeliverySlots = createAsyncThunk(
  'quickCommerce/fetchDeliverySlots',
  async (connectionId: number) => {
    const response = await apiService.getDeliverySlots(connectionId);
    return response.data;
  }
);

export const updateDeliverySlot = createAsyncThunk(
  'quickCommerce/updateDeliverySlot',
  async ({ id, data }: { id: number; data: Partial<DeliverySlot> }) => {
    const response = await apiService.updateDeliverySlot(id, data);
    return response.data;
  }
);

export const fetchQuickCommercePricing = createAsyncThunk(
  'quickCommerce/fetchPricing',
  async (connectionId?: number) => {
    const response = await apiService.getQuickCommercePricing(connectionId);
    return response.data;
  }
);

export const updateQuickCommercePricing = createAsyncThunk(
  'quickCommerce/updatePricing',
  async ({ id, data }: { id: number; data: Partial<QuickCommercePricing> }) => {
    const response = await apiService.updateQuickCommercePricing(id, data);
    return response.data;
  }
);

export const fetchQuickCommerceAnalytics = createAsyncThunk(
  'quickCommerce/fetchAnalytics',
  async ({ connectionId, period }: { connectionId: number; period: string }) => {
    const response = await apiService.getQuickCommerceAnalytics(connectionId, period);
    return response.data;
  }
);

export const fetchEmergencyStockAllocations = createAsyncThunk(
  'quickCommerce/fetchEmergencyAllocations',
  async (connectionId?: number) => {
    const response = await apiService.getEmergencyStockAllocations(connectionId);
    return response.data;
  }
);

export const createEmergencyStockAllocation = createAsyncThunk(
  'quickCommerce/createEmergencyAllocation',
  async (allocationData: Omit<EmergencyStockAllocation, 'id' | 'allocated_at'>) => {
    const response = await apiService.createEmergencyStockAllocation(allocationData);
    return response.data;
  }
);

const quickCommerceSlice = createSlice({
  name: 'quickCommerce',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch connections
      .addCase(fetchQuickCommerceConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuickCommerceConnections.fulfilled, (state, action) => {
        state.loading = false;
        state.connections = action.payload;
      })
      .addCase(fetchQuickCommerceConnections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch connections';
      })

      // Create connection
      .addCase(createQuickCommerceConnection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQuickCommerceConnection.fulfilled, (state, action) => {
        state.loading = false;
        state.connections.push(action.payload);
      })
      .addCase(createQuickCommerceConnection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create connection';
      })

      // Update connection
      .addCase(updateQuickCommerceConnection.fulfilled, (state, action) => {
        const index = state.connections.findIndex(conn => conn.id === action.payload.id);
        if (index !== -1) {
          state.connections[index] = action.payload;
        }
      })

      // Fetch sync operations
      .addCase(fetchQuickCommerceSyncOperations.fulfilled, (state, action) => {
        state.syncOperations = action.payload;
      })

      // Start sync
      .addCase(startQuickCommerceSync.fulfilled, (state, action) => {
        state.syncOperations.push(action.payload);
      })

      // Fetch products
      .addCase(fetchQuickCommerceProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      })

      // Fetch orders
      .addCase(fetchQuickCommerceOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })

      // Import order
      .addCase(importQuickCommerceOrder.fulfilled, (state, action) => {
        state.orders.push(action.payload);
      })

      // Fetch delivery slots
      .addCase(fetchDeliverySlots.fulfilled, (state, action) => {
        state.deliverySlots = action.payload;
      })

      // Update delivery slot
      .addCase(updateDeliverySlot.fulfilled, (state, action) => {
        const index = state.deliverySlots.findIndex(slot => slot.id === action.payload.id);
        if (index !== -1) {
          state.deliverySlots[index] = action.payload;
        }
      })

      // Fetch pricing
      .addCase(fetchQuickCommercePricing.fulfilled, (state, action) => {
        state.pricing = action.payload;
      })

      // Update pricing
      .addCase(updateQuickCommercePricing.fulfilled, (state, action) => {
        const index = state.pricing.findIndex(price => price.id === action.payload.id);
        if (index !== -1) {
          state.pricing[index] = action.payload;
        }
      })

      // Fetch analytics
      .addCase(fetchQuickCommerceAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
      })

      // Fetch emergency allocations
      .addCase(fetchEmergencyStockAllocations.fulfilled, (state, action) => {
        state.emergencyAllocations = action.payload;
      })

      // Create emergency allocation
      .addCase(createEmergencyStockAllocation.fulfilled, (state, action) => {
        state.emergencyAllocations.push(action.payload);
      });
  },
});

export const { clearError, setLoading } = quickCommerceSlice.actions;
export default quickCommerceSlice.reducer;