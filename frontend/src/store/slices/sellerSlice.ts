import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Seller, SellerState, SellerProduct, SellerOrder, SellerCommission, SellerNotification, SellerAnalytics, SellerDashboardMetrics, SellerRegistrationRequest, SellerProfileUpdate, SellerVerificationRequest, SellerProductCreate, SellerProductUpdate, SellerFilters } from '../../types';
import apiService from '../../services/api';

const initialState: SellerState = {
  sellers: [],
  currentSeller: null,
  sellerProducts: [],
  sellerOrders: [],
  sellerCommissions: [],
  sellerNotifications: [],
  sellerAnalytics: null,
  dashboardMetrics: null,
  loading: false,
  error: null,
};

// Seller Management Thunks
export const fetchSellers = createAsyncThunk(
  'sellers/fetchSellers',
  async (filters: SellerFilters = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getSellers(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sellers');
    }
  }
);

export const fetchSellerById = createAsyncThunk(
  'sellers/fetchSellerById',
  async (sellerId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getSeller(sellerId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch seller');
    }
  }
);

export const registerSeller = createAsyncThunk(
  'sellers/registerSeller',
  async (registrationData: SellerRegistrationRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.registerSeller(registrationData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to register seller');
    }
  }
);

export const updateSellerProfile = createAsyncThunk(
  'sellers/updateSellerProfile',
  async ({ sellerId, data }: { sellerId: number; data: SellerProfileUpdate }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateSellerProfile(sellerId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update seller profile');
    }
  }
);

export const verifySeller = createAsyncThunk(
  'sellers/verifySeller',
  async (verificationData: SellerVerificationRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.verifySeller(verificationData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify seller');
    }
  }
);

// Seller Product Management Thunks
export const fetchSellerProducts = createAsyncThunk(
  'sellers/fetchSellerProducts',
  async (sellerId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getSellerProducts(sellerId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch seller products');
    }
  }
);

export const createSellerProduct = createAsyncThunk(
  'sellers/createSellerProduct',
  async ({ sellerId, productData }: { sellerId: number; productData: SellerProductCreate }, { rejectWithValue }) => {
    try {
      const response = await apiService.createSellerProduct(sellerId, productData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateSellerProduct = createAsyncThunk(
  'sellers/updateSellerProduct',
  async ({ productId, data }: { productId: number; data: SellerProductUpdate }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateSellerProduct(productId, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteSellerProduct = createAsyncThunk(
  'sellers/deleteSellerProduct',
  async (productId: number, { rejectWithValue }) => {
    try {
      await apiService.deleteSellerProduct(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

// Seller Orders Thunks
export const fetchSellerOrders = createAsyncThunk(
  'sellers/fetchSellerOrders',
  async (sellerId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getSellerOrders(sellerId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch seller orders');
    }
  }
);

// Seller Commissions Thunks
export const fetchSellerCommissions = createAsyncThunk(
  'sellers/fetchSellerCommissions',
  async (sellerId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getSellerCommissions(sellerId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch seller commissions');
    }
  }
);

// Seller Notifications Thunks
export const fetchSellerNotifications = createAsyncThunk(
  'sellers/fetchSellerNotifications',
  async (sellerId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getSellerNotifications(sellerId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch seller notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'sellers/markNotificationAsRead',
  async (notificationId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.markNotificationAsRead(notificationId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

// Seller Analytics Thunks
export const fetchSellerAnalytics = createAsyncThunk(
  'sellers/fetchSellerAnalytics',
  async ({ sellerId, period }: { sellerId: number; period: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.getSellerAnalytics(sellerId, period);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch seller analytics');
    }
  }
);

export const fetchSellerDashboardMetrics = createAsyncThunk(
  'sellers/fetchSellerDashboardMetrics',
  async (sellerId: number, { rejectWithValue }) => {
    try {
      const response = await apiService.getSellerDashboardMetrics(sellerId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard metrics');
    }
  }
);

const sellerSlice = createSlice({
  name: 'sellers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSeller: (state, action) => {
      state.currentSeller = action.payload;
    },
    clearSellerProducts: (state) => {
      state.sellerProducts = [];
    },
    clearSellerOrders: (state) => {
      state.sellerOrders = [];
    },
    clearSellerCommissions: (state) => {
      state.sellerCommissions = [];
    },
    clearSellerNotifications: (state) => {
      state.sellerNotifications = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Sellers
      .addCase(fetchSellers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellers.fulfilled, (state, action) => {
        state.loading = false;
        state.sellers = action.payload;
      })
      .addCase(fetchSellers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Seller by ID
      .addCase(fetchSellerById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSeller = action.payload;
      })
      .addCase(fetchSellerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register Seller
      .addCase(registerSeller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerSeller.fulfilled, (state, action) => {
        state.loading = false;
        state.sellers.push(action.payload);
        state.currentSeller = action.payload;
      })
      .addCase(registerSeller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Seller Profile
      .addCase(updateSellerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSellerProfile.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sellers.findIndex(seller => seller.id === action.payload.id);
        if (index !== -1) {
          state.sellers[index] = action.payload;
        }
        if (state.currentSeller?.id === action.payload.id) {
          state.currentSeller = action.payload;
        }
      })
      .addCase(updateSellerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify Seller
      .addCase(verifySeller.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifySeller.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sellers.findIndex(seller => seller.id === action.payload.id);
        if (index !== -1) {
          state.sellers[index] = action.payload;
        }
        if (state.currentSeller?.id === action.payload.id) {
          state.currentSeller = action.payload;
        }
      })
      .addCase(verifySeller.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Seller Products
      .addCase(fetchSellerProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerProducts = action.payload;
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Seller Product
      .addCase(createSellerProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSellerProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerProducts.push(action.payload);
      })
      .addCase(createSellerProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Seller Product
      .addCase(updateSellerProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSellerProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sellerProducts.findIndex(product => product.id === action.payload.id);
        if (index !== -1) {
          state.sellerProducts[index] = action.payload;
        }
      })
      .addCase(updateSellerProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Seller Product
      .addCase(deleteSellerProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSellerProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerProducts = state.sellerProducts.filter(product => product.id !== action.payload);
      })
      .addCase(deleteSellerProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Seller Orders
      .addCase(fetchSellerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerOrders = action.payload;
      })
      .addCase(fetchSellerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Seller Commissions
      .addCase(fetchSellerCommissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerCommissions.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerCommissions = action.payload;
      })
      .addCase(fetchSellerCommissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Seller Notifications
      .addCase(fetchSellerNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerNotifications = action.payload;
      })
      .addCase(fetchSellerNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Mark Notification as Read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sellerNotifications.findIndex(notification => notification.id === action.payload.id);
        if (index !== -1) {
          state.sellerNotifications[index] = action.payload;
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Seller Analytics
      .addCase(fetchSellerAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerAnalytics = action.payload;
      })
      .addCase(fetchSellerAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Seller Dashboard Metrics
      .addCase(fetchSellerDashboardMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerDashboardMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardMetrics = action.payload;
      })
      .addCase(fetchSellerDashboardMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentSeller,
  clearSellerProducts,
  clearSellerOrders,
  clearSellerCommissions,
  clearSellerNotifications,
} = sellerSlice.actions;

export default sellerSlice.reducer;