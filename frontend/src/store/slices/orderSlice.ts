import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Order, OrderState, OrderHistory, OrderFilters } from '../../types';
import apiService from '../../services/api';

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  orderHistory: [],
  customerOrders: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getOrders();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData: any, { rejectWithValue }) => {
    try {
      const response = await apiService.createOrder(orderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getOrder(orderId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order');
    }
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateOrder(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order');
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status, note }: { id: number; status: string; note?: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateOrderStatus(id, status, note);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const addOrderNote = createAsyncThunk(
  'orders/addOrderNote',
  async ({ orderId, note }: { orderId: number; note: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.addOrderNote(orderId, note);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add note');
    }
  }
);

export const fetchOrderHistory = createAsyncThunk(
  'orders/fetchOrderHistory',
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getOrderHistory(orderId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order history');
    }
  }
);

export const fetchCustomerOrders = createAsyncThunk(
  'orders/fetchCustomerOrders',
  async (customerId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getCustomerOrders(customerId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer orders');
    }
  }
);

export const updateFulfillmentStatus = createAsyncThunk(
  'orders/updateFulfillmentStatus',
  async ({ orderId, fulfillmentData }: { orderId: number; fulfillmentData: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateFulfillmentStatus(orderId, fulfillmentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update fulfillment status');
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    clearOrderHistory: (state) => {
      state.orderHistory = [];
    },
    clearCustomerOrders: (state) => {
      state.customerOrders = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addOrderNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrderNote.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentOrder) {
          state.currentOrder.notes = state.currentOrder.notes || [];
          state.currentOrder.notes.push(action.payload);
        }
      })
      .addCase(addOrderNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.orderHistory = action.payload;
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCustomerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.customerOrders = action.payload;
      })
      .addCase(fetchCustomerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateFulfillmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFulfillmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentOrder?.id === action.payload.id) {
          state.currentOrder = action.payload;
        }
      })
      .addCase(updateFulfillmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentOrder, clearOrderHistory, clearCustomerOrders } = orderSlice.actions;
export default orderSlice.reducer;