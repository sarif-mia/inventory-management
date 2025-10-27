import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Chip,
  Alert,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { updateFulfillmentStatus } from '../../store/slices/orderSlice';
import { Order, FulfillmentStatus } from '../../types';

interface OrderFulfillmentWorkflowProps {
  order: Order;
}

const OrderFulfillmentWorkflow: React.FC<OrderFulfillmentWorkflowProps> = ({ order }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order.fulfillment_status?.estimated_delivery || ''
  );

  const fulfillmentSteps = [
    'Packing',
    'Shipping',
    'Delivery'
  ];

  const getActiveStep = () => {
    const status = order.fulfillment_status;
    if (!status) return 0;
    if (status.packing_status === 'completed' && status.shipping_status === 'pending') return 1;
    if (status.shipping_status === 'shipped') return 2;
    if (status.shipping_status === 'delivered') return 3;
    return 0;
  };

  const handlePackingComplete = async () => {
    setLoading(true);
    try {
      await dispatch(updateFulfillmentStatus({
        orderId: order.id,
        fulfillmentData: {
          packing_status: 'completed',
          shipping_status: 'pending',
        }
      }));
    } catch (error) {
      console.error('Failed to update packing status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShippingComplete = async () => {
    if (!trackingNumber.trim()) return;

    setLoading(true);
    try {
      await dispatch(updateFulfillmentStatus({
        orderId: order.id,
        fulfillmentData: {
          shipping_status: 'shipped',
          tracking_number: trackingNumber,
          estimated_delivery: estimatedDelivery,
        }
      }));
    } catch (error) {
      console.error('Failed to update shipping status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeliveryComplete = async () => {
    setLoading(true);
    try {
      await dispatch(updateFulfillmentStatus({
        orderId: order.id,
        fulfillmentData: {
          shipping_status: 'delivered',
        }
      }));
    } catch (error) {
      console.error('Failed to update delivery status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_progress': return 'info';
      case 'completed':
      case 'shipped':
      case 'delivered': return 'success';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Fulfillment Workflow
        </Typography>

        <Stepper activeStep={getActiveStep()} sx={{ mb: 3 }}>
          {fulfillmentSteps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Packing Section */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1">Packing Status</Typography>
            <Chip
              label={order.fulfillment_status?.packing_status || 'pending'}
              color={getStatusColor(order.fulfillment_status?.packing_status || 'pending')}
              size="small"
            />
          </Box>
          {(order.fulfillment_status?.packing_status !== 'completed') && (
            <Button
              variant="contained"
              onClick={handlePackingComplete}
              disabled={loading}
              size="small"
            >
              Mark as Packed
            </Button>
          )}
        </Box>

        {/* Shipping Section */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1">Shipping Status</Typography>
            <Chip
              label={order.fulfillment_status?.shipping_status || 'pending'}
              color={getStatusColor(order.fulfillment_status?.shipping_status || 'pending')}
              size="small"
            />
          </Box>

          {order.fulfillment_status?.packing_status === 'completed' &&
           order.fulfillment_status?.shipping_status !== 'shipped' &&
           order.fulfillment_status?.shipping_status !== 'delivered' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Tracking Number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                sx={{ mb: 2 }}
                size="small"
              />
              <TextField
                fullWidth
                label="Estimated Delivery Date"
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleShippingComplete}
                disabled={loading || !trackingNumber.trim()}
                size="small"
              >
                Mark as Shipped
              </Button>
            </Box>
          )}

          {order.fulfillment_status?.tracking_number && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Tracking Number: {order.fulfillment_status.tracking_number}
            </Alert>
          )}
        </Box>

        {/* Delivery Section */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle1">Delivery Status</Typography>
            <Chip
              label={order.fulfillment_status?.shipping_status === 'delivered' ? 'delivered' : 'pending'}
              color={order.fulfillment_status?.shipping_status === 'delivered' ? 'success' : 'warning'}
              size="small"
            />
          </Box>

          {order.fulfillment_status?.shipping_status === 'shipped' && (
            <Button
              variant="contained"
              onClick={handleDeliveryComplete}
              disabled={loading}
              size="small"
              color="success"
            >
              Mark as Delivered
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default OrderFulfillmentWorkflow;