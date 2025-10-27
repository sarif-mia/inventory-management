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
  Card,
  CardContent,
} from '@mui/material';
import {
  Warning as EmergencyIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as ExpiredIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmergencyStockAllocations,
  createEmergencyStockAllocation,
  fetchQuickCommerceConnections,
} from '../../store/slices/quickCommerceSlice';
import { EmergencyStockAllocation, QuickCommerceConnection } from '../../types';
import { RootState } from '../../store';

const QuickCommerceEmergencyStock: React.FC = () => {
  const dispatch = useDispatch();
  const { emergencyAllocations, connections, loading, error } = useSelector((state: RootState) => state.quickCommerce);

  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    product: '',
    allocated_quantity: 0,
    reason: 'high_demand' as const,
    priority: 'medium' as const,
    expires_at: '',
  });

  useEffect(() => {
    dispatch(fetchQuickCommerceConnections());
  }, [dispatch]);

  useEffect(() => {
    if (selectedConnection) {
      dispatch(fetchEmergencyStockAllocations(selectedConnection));
    }
  }, [dispatch, selectedConnection]);

  const handleCreateAllocation = async () => {
    if (!selectedConnection) return;

    try {
      await dispatch(createEmergencyStockAllocation({
        ...formData,
        connection: selectedConnection,
        product: Number(formData.product),
      }));
      setCreateDialogOpen(false);
      setFormData({
        product: '',
        allocated_quantity: 0,
        reason: 'high_demand',
        priority: 'medium',
        expires_at: '',
      });
      dispatch(fetchEmergencyStockAllocations(selectedConnection));
    } catch (error) {
      console.error('Failed to create emergency allocation:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
      default:
        return 'default';
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'emergency':
        return 'error';
      case 'high_demand':
        return 'warning';
      case 'low_stock':
        return 'info';
      case 'promotion':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <ActiveIcon color="success" />;
      case 'expired':
      case 'cancelled':
        return <ExpiredIcon color="error" />;
      default:
        return <ExpiredIcon color="disabled" />;
    }
  };

  const filteredAllocations = selectedConnection
    ? emergencyAllocations.filter(a => a.connection === selectedConnection)
    : emergencyAllocations;

  const allocationStats = {
    active: filteredAllocations.filter(a => a.status === 'active').length,
    expired: filteredAllocations.filter(a => a.status === 'expired').length,
    totalAllocated: filteredAllocations
      .filter(a => a.status === 'active')
      .reduce((sum, a) => sum + a.allocated_quantity, 0),
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Emergency Stock Allocation
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          disabled={!selectedConnection}
        >
          Create Allocation
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
          Please select a connection to view emergency stock allocations.
        </Alert>
      ) : (
        <>
          {/* Stats Cards */}
          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Allocations
                </Typography>
                <Typography variant="h4" color="success.main">
                  {allocationStats.active}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Expired Allocations
                </Typography>
                <Typography variant="h4" color="error.main">
                  {allocationStats.expired}
                </Typography>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Allocated Stock
                </Typography>
                <Typography variant="h4" color="info.main">
                  {allocationStats.totalAllocated.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Allocated Quantity</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Expires At</TableCell>
                  <TableCell>Allocated At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredAllocations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No emergency allocations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAllocations.map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell>Product #{allocation.product}</TableCell>
                      <TableCell>{allocation.allocated_quantity.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={allocation.reason.replace('_', ' ').toUpperCase()}
                          size="small"
                          color={getReasonColor(allocation.reason) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={allocation.priority.toUpperCase()}
                          size="small"
                          color={getPriorityColor(allocation.priority) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(allocation.status)}
                          <Chip
                            label={allocation.status.toUpperCase()}
                            size="small"
                            color={getStatusColor(allocation.status) as any}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        {allocation.expires_at
                          ? new Date(allocation.expires_at).toLocaleString()
                          : 'No expiry'
                        }
                      </TableCell>
                      <TableCell>
                        {new Date(allocation.allocated_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel Allocation">
                          <IconButton color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Emergency Stock Allocation</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Emergency stock allocation will reserve inventory for critical situations.
                This allocation takes precedence over regular inventory distribution.
              </Typography>
            </Alert>

            <TextField
              label="Product ID"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              fullWidth
              required
              helperText="Enter the product ID to allocate stock for"
            />

            <TextField
              label="Allocated Quantity"
              type="number"
              value={formData.allocated_quantity}
              onChange={(e) => setFormData({ ...formData, allocated_quantity: Number(e.target.value) })}
              fullWidth
              required
              inputProps={{ min: 1 }}
              helperText="Quantity to reserve for emergency allocation"
            />

            <FormControl fullWidth required>
              <InputLabel>Reason</InputLabel>
              <Select
                value={formData.reason}
                label="Reason"
                onChange={(e) => setFormData({ ...formData, reason: e.target.value as any })}
              >
                <MenuItem value="high_demand">High Demand</MenuItem>
                <MenuItem value="low_stock">Low Stock Alert</MenuItem>
                <MenuItem value="promotion">Promotion Campaign</MenuItem>
                <MenuItem value="emergency">Emergency Situation</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority}
                label="Priority"
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Expires At"
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              helperText="Optional: When this allocation should expire"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCreateAllocation}
            variant="contained"
            disabled={!formData.product || formData.allocated_quantity <= 0}
          >
            Create Allocation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuickCommerceEmergencyStock;