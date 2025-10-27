import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PaymentTransaction, ReconciliationRecord, PaymentGateway, Dispute, ReconciliationReport, PaymentHistory, FinancialReport, PaymentAnalytics, PaymentFilters, ReconciliationFilters, DisputeFilters, PaymentState } from '../../types';
import apiService from '../../services/api';

// Async thunks for payment operations
export const fetchPaymentTransactions = createAsyncThunk(
  'payment/fetchTransactions',
  async (filters?: PaymentFilters) => {
    const response = await apiService.getPaymentTransactions(filters);
    return response.data;
  }
);

export const fetchReconciliationRecords = createAsyncThunk(
  'payment/fetchReconciliationRecords',
  async (filters?: ReconciliationFilters) => {
    const response = await apiService.getReconciliationRecords(filters);
    return response.data;
  }
);

export const reconcilePayment = createAsyncThunk(
  'payment/reconcilePayment',
  async ({ paymentId, reconciliationData }: { paymentId: number; reconciliationData: Partial<ReconciliationRecord> }) => {
    const response = await apiService.reconcilePayment(paymentId, reconciliationData);
    return response.data;
  }
);

export const fetchPaymentGateways = createAsyncThunk(
  'payment/fetchGateways',
  async () => {
    const response = await apiService.getPaymentGateways();
    return response.data;
  }
);

export const updatePaymentGateway = createAsyncThunk(
  'payment/updateGateway',
  async ({ gatewayId, data }: { gatewayId: number; data: Partial<PaymentGateway> }) => {
    const response = await apiService.updatePaymentGateway(gatewayId, data);
    return response.data;
  }
);

export const fetchDisputes = createAsyncThunk(
  'payment/fetchDisputes',
  async (filters?: DisputeFilters) => {
    const response = await apiService.getDisputes(filters);
    return response.data;
  }
);

export const resolveDispute = createAsyncThunk(
  'payment/resolveDispute',
  async ({ disputeId, resolution }: { disputeId: number; resolution: string }) => {
    const response = await apiService.resolveDispute(disputeId, resolution);
    return response.data;
  }
);

export const fetchReconciliationReports = createAsyncThunk(
  'payment/fetchReports',
  async () => {
    const response = await apiService.getReconciliationReports();
    return response.data;
  }
);

export const generateReconciliationReport = createAsyncThunk(
  'payment/generateReport',
  async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
    const response = await apiService.generateReconciliationReport(startDate, endDate);
    return response.data;
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  'payment/fetchHistory',
  async (paymentId?: number) => {
    const response = await apiService.getPaymentHistory(paymentId);
    return response.data;
  }
);

export const fetchFinancialReports = createAsyncThunk(
  'payment/fetchFinancialReports',
  async () => {
    const response = await apiService.getFinancialReports();
    return response.data;
  }
);

export const generateFinancialReport = createAsyncThunk(
  'payment/generateFinancialReport',
  async ({ reportType, startDate, endDate }: { reportType: string; startDate: string; endDate: string }) => {
    const response = await apiService.generateFinancialReport(reportType, startDate, endDate);
    return response.data;
  }
);

export const fetchPaymentAnalytics = createAsyncThunk(
  'payment/fetchAnalytics',
  async (period: string = '30d') => {
    const response = await apiService.getPaymentAnalytics(period);
    return response.data;
  }
);

export const testPaymentGatewayConnection = createAsyncThunk(
  'payment/testGatewayConnection',
  async (gatewayId: number) => {
    const response = await apiService.testPaymentGatewayConnection(gatewayId);
    return response.data;
  }
);

export const updatePaymentTransaction = createAsyncThunk(
  'payment/updateTransaction',
  async ({ id, data }: { id: number; data: Partial<PaymentTransaction> }) => {
    const response = await apiService.updatePaymentTransaction(id, data);
    return response.data;
  }
);

const initialState: PaymentState = {
  transactions: [],
  reconciliationRecords: [],
  gateways: [],
  disputes: [],
  reports: [],
  history: [],
  financialReports: [],
  analytics: null,
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
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
      // Fetch transactions
      .addCase(fetchPaymentTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentTransactions.fulfilled, (state, action: PayloadAction<PaymentTransaction[]>) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchPaymentTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payment transactions';
      })

      // Fetch reconciliation records
      .addCase(fetchReconciliationRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReconciliationRecords.fulfilled, (state, action: PayloadAction<ReconciliationRecord[]>) => {
        state.loading = false;
        state.reconciliationRecords = action.payload;
      })
      .addCase(fetchReconciliationRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reconciliation records';
      })

      // Reconcile payment
      .addCase(reconcilePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reconcilePayment.fulfilled, (state, action: PayloadAction<ReconciliationRecord>) => {
        state.loading = false;
        const index = state.reconciliationRecords.findIndex(record => record.id === action.payload.id);
        if (index !== -1) {
          state.reconciliationRecords[index] = action.payload;
        } else {
          state.reconciliationRecords.push(action.payload);
        }
      })
      .addCase(reconcilePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reconcile payment';
      })

      // Fetch gateways
      .addCase(fetchPaymentGateways.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentGateways.fulfilled, (state, action: PayloadAction<PaymentGateway[]>) => {
        state.loading = false;
        state.gateways = action.payload;
      })
      .addCase(fetchPaymentGateways.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payment gateways';
      })

      // Update gateway
      .addCase(updatePaymentGateway.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentGateway.fulfilled, (state, action: PayloadAction<PaymentGateway>) => {
        state.loading = false;
        const index = state.gateways.findIndex(gateway => gateway.id === action.payload.id);
        if (index !== -1) {
          state.gateways[index] = action.payload;
        }
      })
      .addCase(updatePaymentGateway.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update payment gateway';
      })

      // Fetch disputes
      .addCase(fetchDisputes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDisputes.fulfilled, (state, action: PayloadAction<Dispute[]>) => {
        state.loading = false;
        state.disputes = action.payload;
      })
      .addCase(fetchDisputes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch disputes';
      })

      // Resolve dispute
      .addCase(resolveDispute.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resolveDispute.fulfilled, (state, action: PayloadAction<Dispute>) => {
        state.loading = false;
        const index = state.disputes.findIndex(dispute => dispute.id === action.payload.id);
        if (index !== -1) {
          state.disputes[index] = action.payload;
        }
      })
      .addCase(resolveDispute.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to resolve dispute';
      })

      // Fetch reports
      .addCase(fetchReconciliationReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReconciliationReports.fulfilled, (state, action: PayloadAction<ReconciliationReport[]>) => {
        state.loading = false;
        state.reports = action.payload;
      })
      .addCase(fetchReconciliationReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reconciliation reports';
      })

      // Generate report
      .addCase(generateReconciliationReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateReconciliationReport.fulfilled, (state, action: PayloadAction<ReconciliationReport>) => {
        state.loading = false;
        state.reports.push(action.payload);
      })
      .addCase(generateReconciliationReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to generate reconciliation report';
      })

      // Fetch history
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action: PayloadAction<PaymentHistory[]>) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payment history';
      })

      // Fetch financial reports
      .addCase(fetchFinancialReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFinancialReports.fulfilled, (state, action: PayloadAction<FinancialReport[]>) => {
        state.loading = false;
        state.financialReports = action.payload;
      })
      .addCase(fetchFinancialReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch financial reports';
      })

      // Generate financial report
      .addCase(generateFinancialReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateFinancialReport.fulfilled, (state, action: PayloadAction<FinancialReport>) => {
        state.loading = false;
        state.financialReports.push(action.payload);
      })
      .addCase(generateFinancialReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to generate financial report';
      })

      // Fetch analytics
      .addCase(fetchPaymentAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentAnalytics.fulfilled, (state, action: PayloadAction<PaymentAnalytics>) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchPaymentAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payment analytics';
      });
  },
});

export const { clearError, setLoading } = paymentSlice.actions;
export default paymentSlice.reducer;