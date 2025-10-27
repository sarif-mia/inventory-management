import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { InventoryItem, InventoryHistory, LowStockAlert, BulkOperation, StockAdjustment, WarehouseTransfer, InventoryFilters, InventoryState } from '../../types';
import apiService from '../../services/api';

const initialState: InventoryState = {
  inventoryItems: [],
  inventoryHistory: [],
  lowStockAlerts: [],
  bulkOperations: [],
  loading: false,
  error: null,
};

export const fetchInventoryItems = createAsyncThunk(
  'inventory/fetchInventoryItems',
  async (filters: InventoryFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.getInventoryItems(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory items');
    }
  }
);

export const fetchInventoryItem = createAsyncThunk(
  'inventory/fetchInventoryItem',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getInventoryItem(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory item');
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/updateInventoryItem',
  async ({ id, data }: { id: number; data: Partial<InventoryItem> }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateInventoryItem(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update inventory item');
    }
  }
);

export const fetchInventoryHistory = createAsyncThunk(
  'inventory/fetchInventoryHistory',
  async ({ inventoryItemId, limit }: { inventoryItemId?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getInventoryHistory(inventoryItemId, limit);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory history');
    }
  }
);

export const fetchLowStockAlerts = createAsyncThunk(
  'inventory/fetchLowStockAlerts',
  async (acknowledged: boolean | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.getLowStockAlerts(acknowledged);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch low stock alerts');
    }
  }
);

export const acknowledgeAlert = createAsyncThunk(
  'inventory/acknowledgeAlert',
  async (alertId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.acknowledgeAlert(alertId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to acknowledge alert');
    }
  }
);

export const adjustStock = createAsyncThunk(
  'inventory/adjustStock',
  async (adjustment: StockAdjustment, { rejectWithValue }) => {
    try {
      const response = await apiService.adjustStock(adjustment);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to adjust stock');
    }
  }
);

export const transferStock = createAsyncThunk(
  'inventory/transferStock',
  async (transfer: WarehouseTransfer, { rejectWithValue }) => {
    try {
      const response = await apiService.transferStock(transfer);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to transfer stock');
    }
  }
);

export const bulkImportInventory = createAsyncThunk(
  'inventory/bulkImportInventory',
  async (file: File, { rejectWithValue }) => {
    try {
      const response = await apiService.bulkImportInventory(file);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to import inventory');
    }
  }
);

export const bulkExportInventory = createAsyncThunk(
  'inventory/bulkExportInventory',
  async (filters: InventoryFilters | undefined, { rejectWithValue }) => {
    try {
      const response = await apiService.bulkExportInventory(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export inventory');
    }
  }
);

export const bulkUpdateInventory = createAsyncThunk(
  'inventory/bulkUpdateInventory',
  async (updates: Array<{ id: number; data: Partial<InventoryItem> }>, { rejectWithValue }) => {
    try {
      const response = await apiService.bulkUpdateInventory(updates);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk update inventory');
    }
  }
);

export const getBulkOperationStatus = createAsyncThunk(
  'inventory/getBulkOperationStatus',
  async (operationId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getBulkOperationStatus(operationId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get bulk operation status');
    }
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearBulkOperations: (state) => {
      state.bulkOperations = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventoryItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.inventoryItems = action.payload;
      })
      .addCase(fetchInventoryItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.inventoryItems.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.inventoryItems[index] = action.payload;
        } else {
          state.inventoryItems.push(action.payload);
        }
      })
      .addCase(fetchInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.inventoryItems.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.inventoryItems[index] = action.payload;
        }
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchInventoryHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventoryHistory = action.payload;
      })
      .addCase(fetchInventoryHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchLowStockAlerts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLowStockAlerts.fulfilled, (state, action) => {
        state.loading = false;
        state.lowStockAlerts = action.payload;
      })
      .addCase(fetchLowStockAlerts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(acknowledgeAlert.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acknowledgeAlert.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.lowStockAlerts.findIndex(alert => alert.id === action.payload.id);
        if (index !== -1) {
          state.lowStockAlerts[index] = action.payload;
        }
      })
      .addCase(acknowledgeAlert.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(adjustStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adjustStock.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.inventoryItems.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.inventoryItems[index] = action.payload;
        }
      })
      .addCase(adjustStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(transferStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(transferStock.fulfilled, (state) => {
        state.loading = false;
        // Refetch inventory items after transfer
      })
      .addCase(transferStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(bulkImportInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkImportInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.bulkOperations.push(action.payload);
      })
      .addCase(bulkImportInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(bulkUpdateInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkUpdateInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.bulkOperations.push(action.payload);
      })
      .addCase(bulkUpdateInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getBulkOperationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBulkOperationStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.bulkOperations.findIndex(op => op.id === action.payload.id);
        if (index !== -1) {
          state.bulkOperations[index] = action.payload;
        } else {
          state.bulkOperations.push(action.payload);
        }
      })
      .addCase(getBulkOperationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearBulkOperations } = inventorySlice.actions;
export default inventorySlice.reducer;