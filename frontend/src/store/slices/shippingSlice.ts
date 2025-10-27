import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Shipment, Carrier, ShippingRate, ShippingLabel, BulkShipment, DeliveryNotification, ShippingAnalytics, ShipmentCreateRequest, ShipmentUpdateRequest, CarrierCreateRequest, CarrierUpdateRequest, ShippingRateRequest, ShippingFilters, ShippingState } from '../../types';
import apiService from '../../services/api';

// Async thunks for shipping operations
export const fetchShipments = createAsyncThunk(
  'shipping/fetchShipments',
  async (filters?: ShippingFilters) => {
    const response = await apiService.getShipments(filters);
    return response.data;
  }
);

export const fetchShipment = createAsyncThunk(
  'shipping/fetchShipment',
  async (id: number) => {
    const response = await apiService.getShipment(id);
    return response.data;
  }
);

export const createShipment = createAsyncThunk(
  'shipping/createShipment',
  async (shipmentData: ShipmentCreateRequest) => {
    const response = await apiService.createShipment(shipmentData);
    return response.data;
  }
);

export const updateShipment = createAsyncThunk(
  'shipping/updateShipment',
  async ({ id, data }: { id: number; data: ShipmentUpdateRequest }) => {
    const response = await apiService.updateShipment(id, data);
    return response.data;
  }
);

export const updateShipmentTracking = createAsyncThunk(
  'shipping/updateShipmentTracking',
  async ({ id, data }: { id: number; data: ShipmentUpdateRequest }) => {
    const response = await apiService.updateShipmentTracking(id, data);
    return response.data;
  }
);

export const fetchCarriers = createAsyncThunk(
  'shipping/fetchCarriers',
  async () => {
    const response = await apiService.getCarriers();
    return response.data;
  }
);

export const createCarrier = createAsyncThunk(
  'shipping/createCarrier',
  async (carrierData: CarrierCreateRequest) => {
    const response = await apiService.createCarrier(carrierData);
    return response.data;
  }
);

export const updateCarrier = createAsyncThunk(
  'shipping/updateCarrier',
  async ({ id, data }: { id: number; data: CarrierUpdateRequest }) => {
    const response = await apiService.updateCarrier(id, data);
    return response.data;
  }
);

export const deleteCarrier = createAsyncThunk(
  'shipping/deleteCarrier',
  async (id: number) => {
    await apiService.deleteCarrier(id);
    return id;
  }
);

export const testCarrierConnection = createAsyncThunk(
  'shipping/testCarrierConnection',
  async (id: number) => {
    const response = await apiService.testCarrierConnection(id);
    return response.data;
  }
);

export const getShippingRates = createAsyncThunk(
  'shipping/getShippingRates',
  async (rateRequest: ShippingRateRequest) => {
    const response = await apiService.getShippingRates(rateRequest);
    return response.data;
  }
);

export const generateShippingLabel = createAsyncThunk(
  'shipping/generateShippingLabel',
  async ({ shipmentId, format }: { shipmentId: number; format: 'pdf' | 'png' | 'zpl' }) => {
    const response = await apiService.generateShippingLabel(shipmentId, format);
    return response.data;
  }
);

export const createBulkShipment = createAsyncThunk(
  'shipping/createBulkShipment',
  async (bulkData: { name: string; shipmentIds: number[] }) => {
    const response = await apiService.createBulkShipment(bulkData);
    return response.data;
  }
);

export const fetchBulkShipments = createAsyncThunk(
  'shipping/fetchBulkShipments',
  async () => {
    const response = await apiService.getBulkShipments();
    return response.data;
  }
);

export const processBulkShipment = createAsyncThunk(
  'shipping/processBulkShipment',
  async (bulkShipmentId: number) => {
    const response = await apiService.processBulkShipment(bulkShipmentId);
    return response.data;
  }
);

export const fetchDeliveryNotifications = createAsyncThunk(
  'shipping/fetchDeliveryNotifications',
  async (shipmentId?: number) => {
    const response = await apiService.getDeliveryNotifications(shipmentId);
    return response.data;
  }
);

export const sendDeliveryNotification = createAsyncThunk(
  'shipping/sendDeliveryNotification',
  async ({ shipmentId, notificationData }: { shipmentId: number; notificationData: any }) => {
    const response = await apiService.sendDeliveryNotification(shipmentId, notificationData);
    return response.data;
  }
);

export const fetchShippingAnalytics = createAsyncThunk(
  'shipping/fetchShippingAnalytics',
  async (period: string = '30d') => {
    const response = await apiService.getShippingAnalytics(period);
    return response.data;
  }
);

// Initial state
const initialState: ShippingState = {
  shipments: [],
  carriers: [],
  shippingRates: [],
  shippingLabels: [],
  bulkShipments: [],
  deliveryNotifications: [],
  analytics: null,
  loading: false,
  error: null,
};

// Slice
const shippingSlice = createSlice({
  name: 'shipping',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearShippingRates: (state) => {
      state.shippingRates = [];
    },
    clearShippingLabels: (state) => {
      state.shippingLabels = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch shipments
      .addCase(fetchShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipments.fulfilled, (state, action: PayloadAction<Shipment[]>) => {
        state.loading = false;
        state.shipments = action.payload;
      })
      .addCase(fetchShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch shipments';
      })

      // Fetch single shipment
      .addCase(fetchShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShipment.fulfilled, (state, action: PayloadAction<Shipment>) => {
        state.loading = false;
        const index = state.shipments.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.shipments[index] = action.payload;
        } else {
          state.shipments.push(action.payload);
        }
      })
      .addCase(fetchShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch shipment';
      })

      // Create shipment
      .addCase(createShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createShipment.fulfilled, (state, action: PayloadAction<Shipment>) => {
        state.loading = false;
        state.shipments.push(action.payload);
      })
      .addCase(createShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create shipment';
      })

      // Update shipment
      .addCase(updateShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShipment.fulfilled, (state, action: PayloadAction<Shipment>) => {
        state.loading = false;
        const index = state.shipments.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.shipments[index] = action.payload;
        }
      })
      .addCase(updateShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update shipment';
      })

      // Update shipment tracking
      .addCase(updateShipmentTracking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShipmentTracking.fulfilled, (state, action: PayloadAction<Shipment>) => {
        state.loading = false;
        const index = state.shipments.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.shipments[index] = action.payload;
        }
      })
      .addCase(updateShipmentTracking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update shipment tracking';
      })

      // Fetch carriers
      .addCase(fetchCarriers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarriers.fulfilled, (state, action: PayloadAction<Carrier[]>) => {
        state.loading = false;
        state.carriers = action.payload;
      })
      .addCase(fetchCarriers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch carriers';
      })

      // Create carrier
      .addCase(createCarrier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCarrier.fulfilled, (state, action: PayloadAction<Carrier>) => {
        state.loading = false;
        state.carriers.push(action.payload);
      })
      .addCase(createCarrier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create carrier';
      })

      // Update carrier
      .addCase(updateCarrier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCarrier.fulfilled, (state, action: PayloadAction<Carrier>) => {
        state.loading = false;
        const index = state.carriers.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.carriers[index] = action.payload;
        }
      })
      .addCase(updateCarrier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update carrier';
      })

      // Delete carrier
      .addCase(deleteCarrier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCarrier.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.carriers = state.carriers.filter(c => c.id !== action.payload);
      })
      .addCase(deleteCarrier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete carrier';
      })

      // Test carrier connection
      .addCase(testCarrierConnection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(testCarrierConnection.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(testCarrierConnection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to test carrier connection';
      })

      // Get shipping rates
      .addCase(getShippingRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShippingRates.fulfilled, (state, action: PayloadAction<ShippingRate[]>) => {
        state.loading = false;
        state.shippingRates = action.payload;
      })
      .addCase(getShippingRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get shipping rates';
      })

      // Generate shipping label
      .addCase(generateShippingLabel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateShippingLabel.fulfilled, (state, action: PayloadAction<ShippingLabel>) => {
        state.loading = false;
        state.shippingLabels.push(action.payload);
      })
      .addCase(generateShippingLabel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to generate shipping label';
      })

      // Create bulk shipment
      .addCase(createBulkShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBulkShipment.fulfilled, (state, action: PayloadAction<BulkShipment>) => {
        state.loading = false;
        state.bulkShipments.push(action.payload);
      })
      .addCase(createBulkShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create bulk shipment';
      })

      // Fetch bulk shipments
      .addCase(fetchBulkShipments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBulkShipments.fulfilled, (state, action: PayloadAction<BulkShipment[]>) => {
        state.loading = false;
        state.bulkShipments = action.payload;
      })
      .addCase(fetchBulkShipments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bulk shipments';
      })

      // Process bulk shipment
      .addCase(processBulkShipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processBulkShipment.fulfilled, (state, action: PayloadAction<BulkShipment>) => {
        state.loading = false;
        const index = state.bulkShipments.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.bulkShipments[index] = action.payload;
        }
      })
      .addCase(processBulkShipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to process bulk shipment';
      })

      // Fetch delivery notifications
      .addCase(fetchDeliveryNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeliveryNotifications.fulfilled, (state, action: PayloadAction<DeliveryNotification[]>) => {
        state.loading = false;
        state.deliveryNotifications = action.payload;
      })
      .addCase(fetchDeliveryNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch delivery notifications';
      })

      // Send delivery notification
      .addCase(sendDeliveryNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendDeliveryNotification.fulfilled, (state, action: PayloadAction<DeliveryNotification>) => {
        state.loading = false;
        state.deliveryNotifications.push(action.payload);
      })
      .addCase(sendDeliveryNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send delivery notification';
      })

      // Fetch shipping analytics
      .addCase(fetchShippingAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShippingAnalytics.fulfilled, (state, action: PayloadAction<ShippingAnalytics>) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchShippingAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch shipping analytics';
      });
  },
});

export const { clearError, clearShippingRates, clearShippingLabels } = shippingSlice.actions;
export default shippingSlice.reducer;