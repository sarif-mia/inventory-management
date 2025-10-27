import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab';
import Grid from '@mui/material/Grid';
import {
  Notifications as NotifyIcon,
  NotificationsActive as ActiveNotifyIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Error as FailedIcon,
  Schedule as PendingIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchDeliveryNotifications, sendDeliveryNotification } from '../../store/slices/shippingSlice';
import { DeliveryNotification } from '../../types';

const DeliveryTracking: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { deliveryNotifications, loading, error } = useSelector((state: RootState) => state.shipping);

  const [selectedNotification, setSelectedNotification] = useState<DeliveryNotification | null>(null);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    dispatch(fetchDeliveryNotifications());
  }, [dispatch]);

  const handleSendNotification = async (shipmentId: number) => {
    if (!notificationMessage.trim()) return;

    try {
      await dispatch(sendDeliveryNotification({
        shipmentId,
        notificationData: {
          type: 'custom',
          message: notificationMessage,
        },
      })).unwrap();

      setNotificationMessage('');
      dispatch(fetchDeliveryNotifications());
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const handleViewTracking = (notification: DeliveryNotification) => {
    setSelectedNotification(notification);
    setTrackingDialogOpen(true);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'in_transit': return <ShippingIcon />;
      case 'out_for_delivery': return <LocationIcon />;
      case 'delivered': return <DeliveredIcon />;
      case 'failed_delivery': return <FailedIcon />;
      case 'returned': return <FailedIcon />;
      default: return <PendingIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'in_transit': return 'info';
      case 'out_for_delivery': return 'warning';
      case 'delivered': return 'success';
      case 'failed_delivery': return 'error';
      case 'returned': return 'error';
      default: return 'default';
    }
  };

  const getTrackingTimeline = (notifications: DeliveryNotification[]) => {
    return notifications
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((notification, index) => (
        <TimelineItem key={notification.id}>
          <TimelineOppositeContent color="text.secondary">
            {new Date(notification.timestamp).toLocaleString()}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color={getNotificationColor(notification.type)}>
              {getNotificationIcon(notification.type)}
            </TimelineDot>
            {index < notifications.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="h6" component="span">
              {notification.type.replace('_', ' ').toUpperCase()}
            </Typography>
            <Typography>{notification.message}</Typography>
            <Typography variant="body2" color="text.secondary">
              {notification.sent ? 'Notification sent' : 'Notification pending'}
            </Typography>
          </TimelineContent>
        </TimelineItem>
      ));
  };

  const getShipmentNotifications = (shipmentId: number) => {
    return deliveryNotifications.filter(n => n.shipment === shipmentId);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Delivery Tracking & Notifications
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Delivery Notifications */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Delivery Notifications
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Shipment ID</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deliveryNotifications.map((notification) => (
                      <TableRow key={notification.id} hover>
                        <TableCell>#{notification.shipment}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getNotificationIcon(notification.type)}
                            label={notification.type.replace('_', ' ')}
                            color={getNotificationColor(notification.type)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {notification.message}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(notification.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={notification.sent ? 'Sent' : 'Pending'}
                            color={notification.sent ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Tracking Timeline">
                            <IconButton
                              size="small"
                              onClick={() => handleViewTracking(notification)}
                              color="primary"
                            >
                              <LocationIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {deliveryNotifications.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No delivery notifications yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Send Notification */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Send Custom Notification
              </Typography>

              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notification Message"
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Enter custom notification message..."
                  sx={{ mb: 2 }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleSendNotification(1)} // This should be dynamic based on selected shipment
                  disabled={!notificationMessage.trim() || loading}
                  startIcon={<NotifyIcon />}
                >
                  {loading ? <CircularProgress size={20} /> : 'Send Notification'}
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Send custom notifications to customers about their shipments.
                Notifications will be sent via email and SMS if configured.
              </Typography>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notification Stats
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Total Sent:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {deliveryNotifications.filter(n => n.sent).length}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Pending:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {deliveryNotifications.filter(n => !n.sent).length}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Success Rate:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {deliveryNotifications.length > 0
                    ? Math.round((deliveryNotifications.filter(n => n.sent).length / deliveryNotifications.length) * 100)
                    : 0
                  }%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tracking Timeline Dialog */}
      <Dialog open={trackingDialogOpen} onClose={() => setTrackingDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Shipment Tracking Timeline
        </DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Shipment #{selectedNotification.shipment}
              </Typography>

              <Timeline position="alternate">
                {getTrackingTimeline(getShipmentNotifications(selectedNotification.shipment))}
              </Timeline>

              {getShipmentNotifications(selectedNotification.shipment).length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No tracking events available for this shipment
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrackingDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryTracking;