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
import { fetchOrderHistory } from '../../store/slices/orderSlice';
import { OrderHistory as OrderHistoryType } from '../../types';

interface OrderHistoryProps {
  orderId: number;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ orderId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { orderHistory, loading, error } = useSelector(
    (state: RootState) => state.orders as any
  );

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrderHistory(orderId));
    }
  }, [dispatch, orderId]);

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created': return 'success';
      case 'updated': return 'info';
      case 'status_changed': return 'primary';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

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
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Order History & Audit Trail
        </Typography>

        {orderHistory && orderHistory.length > 0 ? (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>User</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderHistory.map((history: OrderHistoryType) => (
                  <TableRow key={history.id} hover>
                    <TableCell>
                      {new Date(history.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={history.action.replace('_', ' ')}
                        color={getActionColor(history.action)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {history.old_value && history.new_value ? (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            From: {history.old_value}
                          </Typography>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            To: {history.new_value}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2">
                          {history.old_value || history.new_value || 'N/A'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      User {history.user}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Alert severity="info">
            No history records found for this order.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderHistory;