import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  MarketplaceConnection,
  SyncOperation,
  MarketplaceProduct,
  MarketplaceOrder,
  MarketplaceAnalytics,
  BulkMarketplaceOperation,
  MarketplaceFilters,
  SyncFilters,
  MarketplaceState
} from '../../types';
import apiService from '../../services/api';

// Async thunks for marketplace operations
export const fetchMarketplaceConnections = createAsyncThunk(
  'marketplace/fetchConnections',
  async (filters?: MarketplaceFilters) => {
    const response = await apiService.getMarketplaceConnections(filters);
    return response.data;
  }
);

export const createMarketplaceConnection = createAsyncThunk(
  'marketplace/createConnection',
  async (connectionData: Omit<MarketplaceConnection, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await apiService.createMarketplaceConnection(connectionData);
    return response.data;
  }
);

export const updateMarketplaceConnection = createAsyncThunk(
  'marketplace/updateConnection',
  async ({ connectionId, data }: { connectionId: number; data: Partial<MarketplaceConnection> }) => {
    const response = await apiService.updateMarketplaceConnection(connectionId, data);
    return response.data;
  }
);

export const testMarketplaceConnection = createAsyncThunk(
  'marketplace/testConnection',
  async (connectionId: number) => {
    const response = await apiService.testMarketplaceConnection(connectionId);
    return response.data;
  }
);

export const deleteMarketplaceConnection = createAsyncThunk(
  'marketplace/deleteConnection',
  async (connectionId: number) => {
    await apiService.deleteMarketplaceConnection(connectionId);
    return connectionId;
  }
);

export const fetchSyncOperations = createAsyncThunk(
  'marketplace/fetchSyncOperations',
  async (filters?: SyncFilters) => {
    const response = await apiService.getSyncOperations(filters);
    return response.data;
  }
);

export const startSyncOperation = createAsyncThunk(
  'marketplace/startSync',
  async ({ connectionId, operationType, direction }: { connectionId: number; operationType: string; direction: string }) => {
    const response = await apiService.startSyncOperation(connectionId, operationType, direction);
    return response.data;
  }
);

export const retrySyncOperation = createAsyncThunk(
  'marketplace/retrySync',
  async (syncOperationId: number) => {
    const response = await apiService.retrySyncOperation(syncOperationId);
    return response.data;
  }
);

export const cancelSyncOperation = createAsyncThunk(
  'marketplace/cancelSync',
  async (syncOperationId: number) => {
    await apiService.cancelSyncOperation(syncOperationId);
    return syncOperationId;
  }
);

export const fetchMarketplaceProducts = createAsyncThunk(
  'marketplace/fetchProducts',
  async (connectionId?: number) => {
    const response = await apiService.getMarketplaceProducts(connectionId);
    return response.data;
  }
);

export const syncProductToMarketplace = createAsyncThunk(
  'marketplace/syncProduct',
  async ({ productId, connectionId }: { productId: number; connectionId: number }) => {
    const response = await apiService.syncProductToMarketplace(productId, connectionId);
    return response.data;
  }
);

export const fetchMarketplaceOrders = createAsyncThunk(
  'marketplace/fetchOrders',
  async (connectionId?: number) => {
    const response = await apiService.getMarketplaceOrders(connectionId);
    return response.data;
  }
);

export const importMarketplaceOrder = createAsyncThunk(
  'marketplace/importOrder',
  async ({ orderId, connectionId }: { orderId: string; connectionId: number }) => {
    const response = await apiService.importMarketplaceOrder(orderId, connectionId);
    return response.data;
  }
);

export const syncInventoryToMarketplace = createAsyncThunk(
  'marketplace/syncInventory',
  async ({ productId, connectionId, quantity }: { productId: number; connectionId: number; quantity: number }) => {
    const response = await apiService.syncInventoryToMarketplace(productId, connectionId, quantity);
    return response.data;
  }
);

export const fetchMarketplaceAnalytics = createAsyncThunk(
  'marketplace/fetchAnalytics',
  async ({ connectionId, period }: { connectionId: number; period: string }) => {
    const response = await apiService.getMarketplaceAnalytics(connectionId, period);
    return response.data;
  }
);

export const startBulkOperation = createAsyncThunk(
  'marketplace/startBulkOperation',
  async ({ operationType, connections }: { operationType: string; connections: number[] }) => {
    const response = await apiService.startBulkMarketplaceOperation(operationType, connections);
    return response.data;
  }
);

export const fetchBulkOperations = createAsyncThunk(
  'marketplace/fetchBulkOperations',
  async () => {
    const response = await apiService.getBulkMarketplaceOperations();
    return response.data;
  }
);

const initialState: MarketplaceState = {
  connections: [],
  syncOperations: [],
  marketplaceProducts: [],
  marketplaceOrders: [],
  analytics: null,
  bulkOperations: [],
  loading: false,
  error: null,
};

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateSyncOperationStatus: (state, action: PayloadAction<{ id: number; status: string; progress?: number }>) => {
      const operation = state.syncOperations.find(op => op.id === action.payload.id);
      if (operation) {
        operation.status = action.payload.status as any;
        if (action.payload.progress !== undefined) {
          operation.processed_items = action.payload.progress;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch connections
      .addCase(fetchMarketplaceConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketplaceConnections.fulfilled, (state, action: PayloadAction<MarketplaceConnection[]>) => {
        state.loading = false;
        state.connections = action.payload;
      })
      .addCase(fetchMarketplaceConnections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch marketplace connections';
      })

      // Create connection
      .addCase(createMarketplaceConnection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMarketplaceConnection.fulfilled, (state, action: PayloadAction<MarketplaceConnection>) => {
        state.loading = false;
        state.connections.push(action.payload);
      })
      .addCase(createMarketplaceConnection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create marketplace connection';
      })

      // Update connection
      .addCase(updateMarketplaceConnection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMarketplaceConnection.fulfilled, (state, action: PayloadAction<MarketplaceConnection>) => {
        state.loading = false;
        const index = state.connections.findIndex(conn => conn.id === action.payload.id);
        if (index !== -1) {
          state.connections[index] = action.payload;
        }
      })
      .addCase(updateMarketplaceConnection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update marketplace connection';
      })

      // Test connection
      .addCase(testMarketplaceConnection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(testMarketplaceConnection.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(testMarketplaceConnection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to test marketplace connection';
      })

      // Delete connection
      .addCase(deleteMarketplaceConnection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMarketplaceConnection.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.connections = state.connections.filter(conn => conn.id !== action.payload);
      })
      .addCase(deleteMarketplaceConnection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete marketplace connection';
      })

      // Fetch sync operations
      .addCase(fetchSyncOperations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSyncOperations.fulfilled, (state, action: PayloadAction<SyncOperation[]>) => {
        state.loading = false;
        state.syncOperations = action.payload;
      })
      .addCase(fetchSyncOperations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sync operations';
      })

      // Start sync operation
      .addCase(startSyncOperation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startSyncOperation.fulfilled, (state, action: PayloadAction<SyncOperation>) => {
        state.loading = false;
        state.syncOperations.push(action.payload);
      })
      .addCase(startSyncOperation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to start sync operation';
      })

      // Retry sync operation
      .addCase(retrySyncOperation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(retrySyncOperation.fulfilled, (state, action: PayloadAction<SyncOperation>) => {
        state.loading = false;
        const index = state.syncOperations.findIndex(op => op.id === action.payload.id);
        if (index !== -1) {
          state.syncOperations[index] = action.payload;
        }
      })
      .addCase(retrySyncOperation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to retry sync operation';
      })

      // Cancel sync operation
      .addCase(cancelSyncOperation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSyncOperation.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        const operation = state.syncOperations.find(op => op.id === action.payload);
        if (operation) {
          operation.status = 'failed';
        }
      })
      .addCase(cancelSyncOperation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to cancel sync operation';
      })

      // Fetch marketplace products
      .addCase(fetchMarketplaceProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketplaceProducts.fulfilled, (state, action: PayloadAction<MarketplaceProduct[]>) => {
        state.loading = false;
        state.marketplaceProducts = action.payload;
      })
      .addCase(fetchMarketplaceProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch marketplace products';
      })

      // Sync product to marketplace
      .addCase(syncProductToMarketplace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncProductToMarketplace.fulfilled, (state, action: PayloadAction<MarketplaceProduct>) => {
        state.loading = false;
        const index = state.marketplaceProducts.findIndex(product => product.id === action.payload.id);
        if (index !== -1) {
          state.marketplaceProducts[index] = action.payload;
        } else {
          state.marketplaceProducts.push(action.payload);
        }
      })
      .addCase(syncProductToMarketplace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to sync product to marketplace';
      })

      // Fetch marketplace orders
      .addCase(fetchMarketplaceOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketplaceOrders.fulfilled, (state, action: PayloadAction<MarketplaceOrder[]>) => {
        state.loading = false;
        state.marketplaceOrders = action.payload;
      })
      .addCase(fetchMarketplaceOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch marketplace orders';
      })

      // Import marketplace order
      .addCase(importMarketplaceOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importMarketplaceOrder.fulfilled, (state, action: PayloadAction<MarketplaceOrder>) => {
        state.loading = false;
        const index = state.marketplaceOrders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.marketplaceOrders[index] = action.payload;
        } else {
          state.marketplaceOrders.push(action.payload);
        }
      })
      .addCase(importMarketplaceOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to import marketplace order';
      })

      // Sync inventory to marketplace
      .addCase(syncInventoryToMarketplace.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(syncInventoryToMarketplace.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(syncInventoryToMarketplace.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to sync inventory to marketplace';
      })

      // Fetch marketplace analytics
      .addCase(fetchMarketplaceAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketplaceAnalytics.fulfilled, (state, action: PayloadAction<MarketplaceAnalytics>) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchMarketplaceAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch marketplace analytics';
      })

      // Start bulk operation
      .addCase(startBulkOperation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startBulkOperation.fulfilled, (state, action: PayloadAction<BulkMarketplaceOperation>) => {
        state.loading = false;
        state.bulkOperations.push(action.payload);
      })
      .addCase(startBulkOperation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to start bulk operation';
      })

      // Fetch bulk operations
      .addCase(fetchBulkOperations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBulkOperations.fulfilled, (state, action: PayloadAction<BulkMarketplaceOperation[]>) => {
        state.loading = false;
        state.bulkOperations = action.payload;
      })
      .addCase(fetchBulkOperations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bulk operations';
      });
  },
});

export const { clearError, setLoading, updateSyncOperationStatus } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;