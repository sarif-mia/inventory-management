import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  TablePagination,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Visibility, Edit, CheckCircle, Cancel } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchPaymentTransactions, updatePaymentTransaction } from '../../store/slices/paymentSlice';
import { PaymentTransaction, PaymentFilters } from '../../types';

const PaymentTransactionList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading, error } = useSelector((state: RootState) => state.payments);

  const [filters, setFilters] = useState<PaymentFilters>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchPaymentTransactions(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (key: keyof PaymentFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleSearch = () => {
    dispatch(fetchPaymentTransactions({ ...filters, search: searchTerm }));
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusUpdate = async (transactionId: number, newStatus: string) => {
    try {
      await dispatch(updatePaymentTransaction({ id: transactionId, data: { status: newStatus } })).unwrap();
    } catch (error) {
      console.error('Failed to update transaction status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'refunded': return 'secondary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getGatewayColor = (gateway: string) => {
    switch (gateway.toLowerCase()) {
      case 'stripe': return 'primary';
      case 'paypal': return 'secondary';
      case 'square': return 'success';
      default: return 'default';
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Payment Transactions
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          label="Search Transactions"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="refunded">Refunded</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Gateway</InputLabel>
          <Select
            value={filters.gateway || ''}
            onChange={(e) => handleFilterChange('gateway', e.target.value)}
            label="Gateway"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="stripe">Stripe</MenuItem>
            <MenuItem value="paypal">PayPal</MenuItem>
            <MenuItem value="square">Square</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Payment Method</InputLabel>
          <Select
            value={filters.payment_method || ''}
            onChange={(e) => handleFilterChange('payment_method', e.target.value)}
            label="Payment Method"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="credit_card">Credit Card</MenuItem>
            <MenuItem value="debit_card">Debit Card</MenuItem>
            <MenuItem value="paypal">PayPal</MenuItem>
            <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Min Amount"
          type="number"
          variant="outlined"
          size="small"
          value={filters.min_amount || ''}
          onChange={(e) => handleFilterChange('min_amount', parseFloat(e.target.value) || undefined)}
        />

        <TextField
          label="Max Amount"
          type="number"
          variant="outlined"
          size="small"
          value={filters.max_amount || ''}
          onChange={(e) => handleFilterChange('max_amount', parseFloat(e.target.value) || undefined)}
        />

        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {/* Transactions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Transaction ID</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Gateway</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((transaction: PaymentTransaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>{transaction.gateway_transaction_id}</TableCell>
                  <TableCell>#{transaction.order}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.gateway}
                      color={getGatewayColor(transaction.gateway)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{transaction.payment_method.replace('_', ' ')}</TableCell>
                  <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>{transaction.currency.toUpperCase()}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status}
                      color={getStatusColor(transaction.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="secondary">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      {transaction.status === 'pending' && (
                        <>
                          <Tooltip title="Mark as Completed">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleStatusUpdate(transaction.id, 'completed')}
                            >
                              <CheckCircle />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Mark as Failed">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleStatusUpdate(transaction.id, 'failed')}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={transactions.length}
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Box>
  );
};

export default PaymentTransactionList;