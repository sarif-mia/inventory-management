import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  ShoppingCart as OrderIcon,
  ImportExport as ImportIcon,
  Refresh as RefreshIcon,
  CheckCircle as CompletedIcon,
  Pending as PendingIcon,
  LocalShipping as ShippingIcon,
  Cancel as CancelledIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuickCommerceOrders,
  importQuickCommerceOrder,
  fetchQuickCommerceConnections,
} from '../../store/slices/quickCommerceSlice';
import { QuickCommerceOrder, QuickCommerceConnection } from '../../types';
import { RootState } from '../../store';

const QuickCommerceOrderManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { orders, connections, loading, error } = useSelector((state: RootState) => state.quickCommerce);

  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [importingOrder, setImportingOrder] = useState(false);

  useEffect(() => {
    dispatch(fetchQuickCommerceConnections());
  }, [dispatch]);

  useEffect(() => {
    if (selectedConnection) {
      dispatch(fetchQuickCommerceOrders(selectedConnection));
    }
  }, [dispatch, selectedConnection]);

  const handleImportOrder = async () => {
    if (!selectedConnection || !orderId.trim()) return;

    setImportingOrder(true);
    try {
      await dispatch(importQuickCommerceOrder({
        orderId: orderId.trim(),
        connectionId: selectedConnection,
      }));
      setImportDialogOpen(false);
      setOrderId('');
      dispatch(fetchQuickCommerceOrders(selectedConnection));
    } catch (error) {
      console.error('Failed to import order:', error);
    } finally {
      setImportingOrder(false);
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return <CompletedIcon color="success" />;
      case 'pending':
      case 'confirmed':
        return <PendingIcon color="warning" />;
      case 'processing':
      case 'shipped':
        return <ShippingIcon color="info" />;
      case 'cancelled':
        return <CancelledIcon color="error" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'success';
      case 'pending':
      case 'confirmed':
        return 'warning';
      case 'processing':
      case 'shipped':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredOrders = selectedConnection
    ? orders.filter(o => o.connection === selectedConnection)
    : orders;

  const orderStats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status.toLowerCase() === 'pending').length,
    processing: filteredOrders.filter(o => o.status.toLowerCase() === 'processing').length,
    completed: filteredOrders.filter(o => ['completed', 'delivered'].includes(o.status.toLowerCase())).length,
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Quick Commerce Order Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => selectedConnection && dispatch(fetchQuickCommerceOrders(selectedConnection))}
            disabled={!selectedConnection || loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<ImportIcon />}
            onClick={() => setImportDialogOpen(true)}
            disabled={!selectedConnection}
          >
            Import Order
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Orders
              </Typography>
              <Typography variant="h4">
                {orderStats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {orderStats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Processing
              </Typography>
              <Typography variant="h4" color="info.main">
                {orderStats.processing}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h4" color="success.main">
                {orderStats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Select Connection
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Quick Commerce Platform</InputLabel>
              <Select
                value={selectedConnection || ''}
                label="Quick Commerce Platform"
                onChange={(e) => setSelectedConnection(Number(e.target.value) || null)}
              >
                {connections.map((connection) => (
                  <MenuItem key={connection.id} value={connection.id}>
                    {connection.name} ({connection.platform})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {!selectedConnection && (
              <Alert severity="info">
                Please select a connection to view orders.
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Orders
            </Typography>

            {selectedConnection ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Payment</TableCell>
                      <TableCell>Ordered At</TableCell>
                      <TableCell>Delivery Slot</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.external_id}</TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">{order.customer_name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {order.customer_phone}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getOrderStatusIcon(order.status)}
                              <Chip
                                label={order.status.toUpperCase()}
                                size="small"
                                color={getOrderStatusColor(order.status) as any}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={order.payment_status.toUpperCase()}
                              size="small"
                              color={getPaymentStatusColor(order.payment_status) as any}
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(order.ordered_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {order.delivery_slot ? (
                              <Box>
                                <Typography variant="body2">
                                  {new Date(order.delivery_slot.start_time).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })} - {new Date(order.delivery_slot.end_time).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {new Date(order.delivery_slot.date).toLocaleDateString()}
                                </Typography>
                              </Box>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                Select a connection to view orders.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import Order</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Enter the external order ID from the quick commerce platform
            </Typography>
            <TextField
              label="Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
              placeholder="e.g., QC123456"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleImportOrder}
            variant="contained"
            disabled={!orderId.trim() || importingOrder}
          >
            {importingOrder ? <CircularProgress size={20} /> : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuickCommerceOrderManagement;