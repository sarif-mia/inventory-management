import React, { useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchCustomerOrders } from '../../store/slices/orderSlice';
import { Order } from '../../types';

interface CustomerOrderHistoryProps {
  customerId: number;
}

const CustomerOrderHistory: React.FC<CustomerOrderHistoryProps> = ({ customerId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { customerOrders, loading, error } = useSelector(
    (state: RootState) => state.orders as any
  );

  useEffect(() => {
    if (customerId) {
      dispatch(fetchCustomerOrders(customerId));
    }
  }, [dispatch, customerId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'processing': return 'primary';
      case 'shipped': return 'secondary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const totalSpent = customerOrders?.reduce((total, order) => total + order.total_amount, 0) || 0;
  const totalOrders = customerOrders?.length || 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Customer Order History
      </Typography>

      {/* Customer Summary */}
      <Box display="flex" gap={3} mb={3}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h4" color="primary">
              {totalOrders}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Orders
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h4" color="primary">
              ${totalSpent.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Spent
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h4" color="primary">
              ${(totalOrders > 0 ? totalSpent / totalOrders : 0).toFixed(2)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Average Order Value
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Orders Table */}
      {customerOrders && customerOrders.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Items</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customerOrders.map((order: Order) => (
                <TableRow key={order.id} hover>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>${order.total_amount.toFixed(2)}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{order.products.length} items</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">
          No orders found for this customer.
        </Alert>
      )}
    </Box>
  );
};

export default CustomerOrderHistory;