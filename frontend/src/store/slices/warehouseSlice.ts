import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Warehouse, WarehouseState } from '../../types';
import apiService from '../../services/api';

const initialState: WarehouseState = {
  warehouses: [],
  loading: false,
  error: null,
};

export const fetchWarehouses = createAsyncThunk(
  'warehouse/fetchWarehouses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getWarehouses();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouses');
    }
  }
);

export const fetchWarehouse = createAsyncThunk(
  'warehouse/fetchWarehouse',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getWarehouse(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch warehouse');
    }
  }
);

export const createWarehouse = createAsyncThunk(
  'warehouse/createWarehouse',
  async (warehouse: Omit<Warehouse, 'id'>, { rejectWithValue }) => {
    try {
      const response = await apiService.createWarehouse(warehouse);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create warehouse');
    }
  }
);

export const updateWarehouse = createAsyncThunk(
  'warehouse/updateWarehouse',
  async ({ id, data }: { id: number; data: Partial<Warehouse> }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateWarehouse(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update warehouse');
    }
  }
);

export const deleteWarehouse = createAsyncThunk(
  'warehouse/deleteWarehouse',
  async (id: number, { rejectWithValue }) => {
    try {
      await apiService.deleteWarehouse(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete warehouse');
    }
  }
);

const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchWarehouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.warehouses.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.warehouses[index] = action.payload;
        } else {
          state.warehouses.push(action.payload);
        }
      })
      .addCase(fetchWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createWarehouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses.push(action.payload);
      })
      .addCase(createWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateWarehouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWarehouse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.warehouses.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.warehouses[index] = action.payload;
        }
      })
      .addCase(updateWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteWarehouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWarehouse.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = state.warehouses.filter(w => w.id !== action.payload);
      })
      .addCase(deleteWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = warehouseSlice.actions;
export default warehouseSlice.reducer;