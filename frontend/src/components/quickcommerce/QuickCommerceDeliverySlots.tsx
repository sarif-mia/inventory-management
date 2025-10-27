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
  LinearProgress,
} from '@mui/material';
import {
  Schedule as SlotIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  CheckCircle as AvailableIcon,
  Cancel as UnavailableIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDeliverySlots,
  updateDeliverySlot,
  fetchQuickCommerceConnections,
} from '../../store/slices/quickCommerceSlice';
import { DeliverySlot, QuickCommerceConnection } from '../../types';
import { RootState } from '../../store';

const QuickCommerceDeliverySlots: React.FC = () => {
  const dispatch = useDispatch();
  const { deliverySlots, connections, loading, error } = useSelector((state: RootState) => state.quickCommerce);

  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<DeliverySlot | null>(null);
  const [formData, setFormData] = useState({
    available_capacity: 0,
    total_capacity: 0,
    pricing_multiplier: 1.0,
    is_available: true,
  });

  useEffect(() => {
    dispatch(fetchQuickCommerceConnections());
  }, [dispatch]);

  useEffect(() => {
    if (selectedConnection) {
      dispatch(fetchDeliverySlots(selectedConnection));
    }
  }, [dispatch, selectedConnection]);

  const handleEditSlot = (slot: DeliverySlot) => {
    setSelectedSlot(slot);
    setFormData({
      available_capacity: slot.available_capacity,
      total_capacity: slot.total_capacity,
      pricing_multiplier: slot.pricing_multiplier,
      is_available: slot.is_available,
    });
    setEditDialogOpen(true);
  };

  const handleSaveSlot = async () => {
    if (!selectedSlot) return;

    try {
      await dispatch(updateDeliverySlot({
        id: selectedSlot.id,
        data: formData,
      }));
      setEditDialogOpen(false);
      setSelectedSlot(null);
      if (selectedConnection) {
        dispatch(fetchDeliverySlots(selectedConnection));
      }
    } catch (error) {
      console.error('Failed to update delivery slot:', error);
    }
  };

  const getAvailabilityIcon = (isAvailable: boolean) => {
    return isAvailable ? <AvailableIcon color="success" /> : <UnavailableIcon color="error" />;
  };

  const getAvailabilityColor = (isAvailable: boolean) => {
    return isAvailable ? 'success' : 'error';
  };

  const getUtilizationPercentage = (available: number, total: number) => {
    if (total === 0) return 0;
    return ((total - available) / total) * 100;
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  const filteredSlots = selectedConnection
    ? deliverySlots.filter(s => s.connection === selectedConnection)
    : deliverySlots;

  // Group slots by date
  const groupedSlots = filteredSlots.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, DeliverySlot[]>);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Delivery Slot Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => selectedConnection && dispatch(fetchDeliverySlots(selectedConnection))}
          disabled={!selectedConnection || loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 300 }}>
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
      </Box>

      {!selectedConnection ? (
        <Alert severity="info">
          Please select a connection to view delivery slots.
        </Alert>
      ) : (
        Object.entries(groupedSlots).map(([date, slots]) => (
          <Paper key={date} sx={{ mb: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Time Slot</TableCell>
                    <TableCell>Capacity</TableCell>
                    <TableCell>Utilization</TableCell>
                    <TableCell>Pricing Multiplier</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : slots.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No slots available for this date
                      </TableCell>
                    </TableRow>
                  ) : (
                    slots.map((slot) => {
                      const utilization = getUtilizationPercentage(slot.available_capacity, slot.total_capacity);
                      return (
                        <TableRow key={slot.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SlotIcon />
                              <Box>
                                <Typography variant="body2">
                                  {new Date(slot.start_time).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })} - {new Date(slot.end_time).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {slot.available_capacity} / {slot.total_capacity}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={utilization}
                                color={getUtilizationColor(utilization) as any}
                                sx={{ width: 60, height: 6 }}
                              />
                              <Typography variant="body2">
                                {utilization.toFixed(0)}%
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{slot.pricing_multiplier.toFixed(2)}x</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getAvailabilityIcon(slot.is_available)}
                              <Chip
                                label={slot.is_available ? 'Available' : 'Unavailable'}
                                size="small"
                                color={getAvailabilityColor(slot.is_available) as any}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Edit Slot">
                              <IconButton onClick={() => handleEditSlot(slot)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ))
      )}

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Delivery Slot</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {selectedSlot && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  {new Date(selectedSlot.date).toLocaleDateString()} - {' '}
                  {new Date(selectedSlot.start_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} - {new Date(selectedSlot.end_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Available Capacity"
                type="number"
                value={formData.available_capacity}
                onChange={(e) => setFormData({ ...formData, available_capacity: Number(e.target.value) })}
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Total Capacity"
                type="number"
                value={formData.total_capacity}
                onChange={(e) => setFormData({ ...formData, total_capacity: Number(e.target.value) })}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Box>

            <TextField
              label="Pricing Multiplier"
              type="number"
              value={formData.pricing_multiplier}
              onChange={(e) => setFormData({ ...formData, pricing_multiplier: Number(e.target.value) })}
              fullWidth
              inputProps={{ min: 1, step: 0.1 }}
              helperText="Multiplier for delivery pricing during this slot"
            />

            <FormControl fullWidth>
              <InputLabel>Availability</InputLabel>
              <Select
                value={formData.is_available}
                label="Availability"
                onChange={(e) => setFormData({ ...formData, is_available: e.target.value === 'true' })}
              >
                <MenuItem value="true">Available</MenuItem>
                <MenuItem value="false">Unavailable</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSlot} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuickCommerceDeliverySlots;