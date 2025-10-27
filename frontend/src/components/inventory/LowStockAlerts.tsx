import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchLowStockAlerts, acknowledgeAlert } from '../../store/slices/inventorySlice';
import { LowStockAlert } from '../../types';

const LowStockAlerts: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { lowStockAlerts, loading, error } = useSelector((state: RootState) => state.inventory);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const [selectedAlert, setSelectedAlert] = useState<LowStockAlert | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchLowStockAlerts());
  }, [dispatch]);

  const handleAcknowledge = async (alertId: number) => {
    try {
      await dispatch(acknowledgeAlert(alertId)).unwrap();
      setSnackbar({
        open: true,
        message: 'Alert acknowledged successfully',
        severity: 'success',
      });
      dispatch(fetchLowStockAlerts()); // Refresh data
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to acknowledge alert',
        severity: 'error',
      });
    }
  };

  const handleBulkAcknowledge = async () => {
    const unacknowledgedAlerts = lowStockAlerts.filter(alert => !alert.acknowledged);
    try {
      await Promise.all(
        unacknowledgedAlerts.map(alert => dispatch(acknowledgeAlert(alert.id)).unwrap())
      );
      setSnackbar({
        open: true,
        message: `Acknowledged ${unacknowledgedAlerts.length} alerts`,
        severity: 'success',
      });
      dispatch(fetchLowStockAlerts()); // Refresh data
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to acknowledge some alerts',
        severity: 'error',
      });
    }
  };

  const getAlertSeverity = (alert: LowStockAlert) => {
    if (alert.current_stock === 0) return { severity: 'error', icon: <ErrorIcon />, label: 'Out of Stock' };
    if (alert.alert_level === 'critical') return { severity: 'error', icon: <ErrorIcon />, label: 'Critical' };
    return { severity: 'warning', icon: <WarningIcon />, label: 'Warning' };
  };

  const unacknowledgedCount = lowStockAlerts.filter(alert => !alert.acknowledged).length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">
            Low Stock Alerts
            {unacknowledgedCount > 0 && (
              <Chip
                label={`${unacknowledgedCount} new`}
                color="error"
                size="small"
                sx={{ ml: 2 }}
                icon={<NotificationsIcon />}
              />
            )}
          </Typography>

          {unacknowledgedCount > 0 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleBulkAcknowledge}
              startIcon={<CheckCircleIcon />}
            >
              Acknowledge All
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {lowStockAlerts.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No low stock alerts at this time
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All products are sufficiently stocked
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Warehouse</TableCell>
                  <TableCell align="right">Current Stock</TableCell>
                  <TableCell align="right">Min Stock Level</TableCell>
                  <TableCell>Alert Level</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lowStockAlerts.map((alert) => {
                  const severity = getAlertSeverity(alert);
                  return (
                    <TableRow
                      key={alert.id}
                      hover
                      sx={{
                        backgroundColor: !alert.acknowledged ? 'action.hover' : 'inherit',
                        '&:hover': {
                          backgroundColor: !alert.acknowledged ? 'action.selected' : 'action.hover',
                        },
                      }}
                    >
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {alert.product.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {alert.product.category}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{alert.warehouse.name}</TableCell>
                      <TableCell align="right">{alert.current_stock}</TableCell>
                      <TableCell align="right">{alert.min_stock_level}</TableCell>
                      <TableCell>
                        <Chip
                          label={severity.label}
                          color={severity.severity as any}
                          size="small"
                          icon={severity.icon}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={alert.acknowledged ? 'Acknowledged' : 'Pending'}
                          color={alert.acknowledged ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(alert.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        {!alert.acknowledged && (
                          <Tooltip title="Acknowledge Alert">
                            <IconButton
                              size="small"
                              onClick={() => handleAcknowledge(alert.id)}
                              color="success"
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedAlert(alert);
                              setDetailsDialogOpen(true);
                            }}
                          >
                            <WarningIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Alert Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Alert Details</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedAlert.product.name}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Warehouse: {selectedAlert.warehouse.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {selectedAlert.warehouse.location}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Current Stock:</strong> {selectedAlert.current_stock}
                </Typography>
                <Typography variant="body2">
                  <strong>Minimum Level:</strong> {selectedAlert.min_stock_level}
                </Typography>
                <Typography variant="body2">
                  <strong>Alert Level:</strong> {selectedAlert.alert_level}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Status:</strong> {selectedAlert.acknowledged ? 'Acknowledged' : 'Pending'}
                </Typography>
                <Typography variant="body2">
                  <strong>Created:</strong> {new Date(selectedAlert.created_at).toLocaleString()}
                </Typography>
              </Box>

              <Alert
                severity={selectedAlert.current_stock === 0 ? 'error' : 'warning'}
                sx={{ mt: 2 }}
              >
                {selectedAlert.current_stock === 0
                  ? 'This product is completely out of stock and requires immediate attention.'
                  : `Stock level is below the minimum threshold. Consider restocking soon.`
                }
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          {selectedAlert && !selectedAlert.acknowledged && (
            <Button
              onClick={() => {
                handleAcknowledge(selectedAlert.id);
                setDetailsDialogOpen(false);
              }}
              variant="contained"
              color="success"
            >
              Acknowledge
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default LowStockAlerts;