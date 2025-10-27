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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  PlayArrow as StartIcon,
  Stop as StopIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchShipments, createBulkShipment, fetchBulkShipments, processBulkShipment } from '../../store/slices/shippingSlice';
import { Shipment, BulkShipment, ShippingFilters } from '../../types';

const BulkShippingOperations: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { shipments, bulkShipments, loading, error } = useSelector((state: RootState) => state.shipping);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedShipments, setSelectedShipments] = useState<number[]>([]);
  const [bulkName, setBulkName] = useState('');
  const [filters, setFilters] = useState<ShippingFilters>({ status: 'pending' });
  const [processingBulk, setProcessingBulk] = useState<BulkShipment | null>(null);

  useEffect(() => {
    dispatch(fetchShipments(filters));
    dispatch(fetchBulkShipments());
  }, [dispatch, filters]);

  const handleCreateBulkShipment = async () => {
    if (selectedShipments.length === 0 || !bulkName.trim()) return;

    try {
      await dispatch(createBulkShipment({
        name: bulkName,
        shipmentIds: selectedShipments,
      })).unwrap();

      setCreateDialogOpen(false);
      setSelectedShipments([]);
      setBulkName('');
      dispatch(fetchBulkShipments());
    } catch (error) {
      console.error('Failed to create bulk shipment:', error);
    }
  };

  const handleProcessBulkShipment = async (bulkShipment: BulkShipment) => {
    setProcessingBulk(bulkShipment);
    try {
      await dispatch(processBulkShipment(bulkShipment.id)).unwrap();
      dispatch(fetchBulkShipments());
      dispatch(fetchShipments(filters));
    } catch (error) {
      console.error('Failed to process bulk shipment:', error);
    } finally {
      setProcessingBulk(null);
    }
  };

  const handleSelectShipment = (shipmentId: number) => {
    setSelectedShipments(prev =>
      prev.includes(shipmentId)
        ? prev.filter(id => id !== shipmentId)
        : [...prev, shipmentId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <PendingIcon />;
      case 'processing': return <CircularProgress size={20} />;
      case 'completed': return <SuccessIcon />;
      case 'failed': return <ErrorIcon />;
      default: return <PendingIcon />;
    }
  };

  const getBulkProgress = (bulk: BulkShipment) => {
    if (bulk.status === 'completed') return 100;
    if (bulk.status === 'pending') return 0;
    if (bulk.shipments && bulk.shipments.length > 0) {
      return (bulk.shipments.filter((s: any) => s.status === 'completed' || s.status === 'delivered').length / bulk.shipments.length) * 100;
    }
    return 0;
  };

  const availableShipments = shipments.filter(s => s.status === 'pending');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Bulk Shipping Operations
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          disabled={availableShipments.length === 0}
        >
          Create Bulk Shipment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Bulk Shipments List */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bulk Shipment Operations
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Shipments</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bulkShipments.map((bulk) => (
                      <TableRow key={bulk.id} hover>
                        <TableCell>{bulk.name}</TableCell>
                        <TableCell>{bulk.shipments.length} shipments</TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getStatusIcon(bulk.status)}
                            <Chip
                              label={bulk.status}
                              color={getStatusColor(bulk.status)}
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: '100px' }}>
                              <LinearProgress
                                variant="determinate"
                                value={getBulkProgress(bulk)}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Typography variant="body2">
                              {Math.round(getBulkProgress(bulk))}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date(bulk.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {bulk.status === 'pending' && (
                            <Tooltip title="Start Processing">
                              <IconButton
                                size="small"
                                onClick={() => handleProcessBulkShipment(bulk)}
                                disabled={processingBulk?.id === bulk.id}
                                color="primary"
                              >
                                {processingBulk?.id === bulk.id ? (
                                  <CircularProgress size={20} />
                                ) : (
                                  <StartIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                          )}
                          {bulk.status === 'processing' && (
                            <Tooltip title="Stop Processing">
                              <IconButton
                                size="small"
                                onClick={() => setProcessingBulk(null)}
                                color="error"
                              >
                                <StopIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {bulkShipments.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No bulk shipments created yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Available Shipments */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Shipments ({availableShipments.length})
              </Typography>

              <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                <List dense>
                  {availableShipments.map((shipment) => (
                    <ListItem
                      key={shipment.id}
                      button
                      onClick={() => handleSelectShipment(shipment.id)}
                      selected={selectedShipments.includes(shipment.id)}
                      sx={{
                        border: selectedShipments.includes(shipment.id) ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    >
                      <ListItemIcon>
                        {selectedShipments.includes(shipment.id) ? (
                          <SuccessIcon color="primary" />
                        ) : (
                          <PendingIcon />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={`Order #${shipment.order_number}`}
                        secondary={`${shipment.carrier} - ${shipment.customer_name}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {availableShipments.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No pending shipments available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Create Bulk Shipment Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Bulk Shipment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Bulk Shipment Name"
              value={bulkName}
              onChange={(e) => setBulkName(e.target.value)}
              sx={{ mb: 3 }}
              placeholder="e.g., Daily UPS Shipments"
            />

            <Typography variant="h6" gutterBottom>
              Selected Shipments ({selectedShipments.length})
            </Typography>

            <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
              {selectedShipments.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No shipments selected. Click on shipments in the list to select them.
                </Typography>
              ) : (
                selectedShipments.map((shipmentId) => {
                  const shipment = shipments.find(s => s.id === shipmentId);
                  return (
                    <Box
                      key={shipmentId}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1,
                        mb: 1,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="body2">
                          Order #{shipment?.order_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {shipment?.carrier} - {shipment?.customer_name}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleSelectShipment(shipmentId)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateBulkShipment}
            variant="contained"
            disabled={selectedShipments.length === 0 || !bulkName.trim() || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Create Bulk Shipment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkShippingOperations;