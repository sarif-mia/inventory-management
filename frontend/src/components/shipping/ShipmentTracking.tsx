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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchShipments, updateShipmentTracking } from '../../store/slices/shippingSlice';
import { Shipment, ShippingFilters, ShipmentUpdateRequest } from '../../types';

const ShipmentTracking: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { shipments, loading, error } = useSelector((state: RootState) => state.shipping);

  const [filters, setFilters] = useState<ShippingFilters>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState<ShipmentUpdateRequest>({});

  useEffect(() => {
    dispatch(fetchShipments(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (key: keyof ShippingFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleSearch = () => {
    dispatch(fetchShipments({ ...filters, order_number: searchTerm }));
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'in_transit': return 'info';
      case 'delivered': return 'success';
      case 'returned': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <PendingIcon />;
      case 'in_transit': return <ShippingIcon />;
      case 'delivered': return <DeliveredIcon />;
      case 'returned': return <ErrorIcon />;
      default: return <PendingIcon />;
    }
  };

  const getTrackingSteps = (status: string) => {
    const steps = ['pending', 'in_transit', 'delivered'];
    const currentStep = steps.indexOf(status);
    return steps.map((step, index) => ({
      label: step.replace('_', ' ').toUpperCase(),
      completed: index <= currentStep,
    }));
  };

  const handleUpdateTracking = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setUpdateData({
      status: shipment.status,
      tracking_number: shipment.tracking_number,
      carrier: shipment.carrier,
    });
    setUpdateDialogOpen(true);
  };

  const handleUpdateSubmit = async () => {
    if (selectedShipment) {
      try {
        await dispatch(updateShipmentTracking({
          id: selectedShipment.id,
          data: updateData
        })).unwrap();
        setUpdateDialogOpen(false);
        setSelectedShipment(null);
        dispatch(fetchShipments(filters));
      } catch (error) {
        console.error('Failed to update shipment tracking:', error);
      }
    }
  };

  if (loading && shipments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Shipment Tracking & Status Monitoring
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          label="Search by Order Number"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          InputProps={{
            endAdornment: (
              <IconButton size="small" onClick={handleSearch}>
                <SearchIcon />
              </IconButton>
            ),
          }}
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
            <MenuItem value="in_transit">In Transit</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="returned">Returned</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Carrier</InputLabel>
          <Select
            value={filters.carrier || ''}
            onChange={(e) => handleFilterChange('carrier', e.target.value)}
            label="Carrier"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="UPS">UPS</MenuItem>
            <MenuItem value="FedEx">FedEx</MenuItem>
            <MenuItem value="USPS">USPS</MenuItem>
            <MenuItem value="DHL">DHL</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>

      {/* Shipments Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Tracking Number</TableCell>
              <TableCell>Carrier</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Shipped Date</TableCell>
              <TableCell>Delivered Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shipments.map((shipment: Shipment) => (
              <TableRow key={shipment.id} hover>
                <TableCell>#{shipment.order_number}</TableCell>
                <TableCell>{shipment.customer_name}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {shipment.tracking_number}
                  </Typography>
                </TableCell>
                <TableCell>{shipment.carrier}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getStatusIcon(shipment.status)}
                    <Chip
                      label={shipment.status.replace('_', ' ')}
                      color={getStatusColor(shipment.status)}
                      size="small"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  {shipment.shipped_at ? new Date(shipment.shipped_at).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  {shipment.delivered_at ? new Date(shipment.delivered_at).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  <Tooltip title="Update Tracking">
                    <IconButton
                      size="small"
                      onClick={() => handleUpdateTracking(shipment)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={100} // This should come from API
        page={page}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      {/* Update Tracking Dialog */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Shipment Tracking</DialogTitle>
        <DialogContent>
          {selectedShipment && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Order #{selectedShipment.order_number}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Customer: {selectedShipment.customer_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Current Tracking: {selectedShipment.tracking_number}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Stepper activeStep={getTrackingSteps(selectedShipment.status).findIndex(step => step.completed)} alternativeLabel>
                    {getTrackingSteps(selectedShipment.status).map((step) => (
                      <Step key={step.label} completed={step.completed}>
                        <StepLabel>{step.label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={updateData.status || ''}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value as any }))}
                      label="Status"
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="in_transit">In Transit</MenuItem>
                      <MenuItem value="delivered">Delivered</MenuItem>
                      <MenuItem value="returned">Returned</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Tracking Number"
                    value={updateData.tracking_number || ''}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, tracking_number: e.target.value }))}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Carrier</InputLabel>
                    <Select
                      value={updateData.carrier || ''}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, carrier: e.target.value }))}
                      label="Carrier"
                    >
                      <MenuItem value="UPS">UPS</MenuItem>
                      <MenuItem value="FedEx">FedEx</MenuItem>
                      <MenuItem value="USPS">USPS</MenuItem>
                      <MenuItem value="DHL">DHL</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShipmentTracking;