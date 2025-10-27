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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  AttachMoney as PricingIcon,
  Edit as EditIcon,
  TrendingUp as SurgeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuickCommercePricing,
  updateQuickCommercePricing,
  fetchQuickCommerceConnections,
} from '../../store/slices/quickCommerceSlice';
import { QuickCommercePricing, QuickCommerceConnection } from '../../types';
import { RootState } from '../../store';

const QuickCommercePricingManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { pricing, connections, loading, error } = useSelector((state: RootState) => state.quickCommerce);

  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<QuickCommercePricing | null>(null);
  const [formData, setFormData] = useState({
    dynamic_price: 0,
    min_price: 0,
    max_price: 0,
    pricing_strategy: 'fixed' as const,
    surge_multiplier: 1.0,
    is_active: true,
  });

  useEffect(() => {
    dispatch(fetchQuickCommerceConnections());
  }, [dispatch]);

  useEffect(() => {
    if (selectedConnection) {
      dispatch(fetchQuickCommercePricing(selectedConnection));
    }
  }, [dispatch, selectedConnection]);

  const handleEditPricing = (pricingItem: QuickCommercePricing) => {
    setSelectedPricing(pricingItem);
    setFormData({
      dynamic_price: pricingItem.dynamic_price,
      min_price: pricingItem.min_price,
      max_price: pricingItem.max_price,
      pricing_strategy: pricingItem.pricing_strategy,
      surge_multiplier: pricingItem.surge_multiplier,
      is_active: pricingItem.is_active,
    });
    setEditDialogOpen(true);
  };

  const handleSavePricing = async () => {
    if (!selectedPricing) return;

    try {
      await dispatch(updateQuickCommercePricing({
        id: selectedPricing.id,
        data: formData,
      }));
      setEditDialogOpen(false);
      setSelectedPricing(null);
      if (selectedConnection) {
        dispatch(fetchQuickCommercePricing(selectedConnection));
      }
    } catch (error) {
      console.error('Failed to update pricing:', error);
    }
  };

  const getPricingStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'dynamic':
        return 'primary';
      case 'surge':
        return 'warning';
      case 'fixed':
      default:
        return 'default';
    }
  };

  const getPricingStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'surge':
        return <SurgeIcon />;
      default:
        return <PricingIcon />;
    }
  };

  const filteredPricing = selectedConnection
    ? pricing.filter(p => p.connection === selectedConnection)
    : pricing;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Quick Commerce Pricing Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => selectedConnection && dispatch(fetchQuickCommercePricing(selectedConnection))}
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
          Please select a connection to view and manage pricing.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Base Price</TableCell>
                <TableCell>Dynamic Price</TableCell>
                <TableCell>Strategy</TableCell>
                <TableCell>Surge Multiplier</TableCell>
                <TableCell>Price Range</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredPricing.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No pricing data found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPricing.map((pricingItem) => (
                  <TableRow key={pricingItem.id}>
                    <TableCell>
                      Product #{pricingItem.product}
                    </TableCell>
                    <TableCell>${pricingItem.base_price.toFixed(2)}</TableCell>
                    <TableCell>${pricingItem.dynamic_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getPricingStrategyIcon(pricingItem.pricing_strategy)}
                        <Chip
                          label={pricingItem.pricing_strategy.toUpperCase()}
                          size="small"
                          color={getPricingStrategyColor(pricingItem.pricing_strategy) as any}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{pricingItem.surge_multiplier.toFixed(2)}x</TableCell>
                    <TableCell>
                      ${pricingItem.min_price.toFixed(2)} - ${pricingItem.max_price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pricingItem.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={pricingItem.is_active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(pricingItem.last_updated).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit Pricing">
                        <IconButton onClick={() => handleEditPricing(pricingItem)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Pricing</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {selectedPricing && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  Product #{selectedPricing.product}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Base Price: ${selectedPricing.base_price.toFixed(2)}
                </Typography>
              </Box>
            )}

            <FormControl fullWidth>
              <InputLabel>Pricing Strategy</InputLabel>
              <Select
                value={formData.pricing_strategy}
                label="Pricing Strategy"
                onChange={(e) => setFormData({ ...formData, pricing_strategy: e.target.value as any })}
              >
                <MenuItem value="fixed">Fixed Pricing</MenuItem>
                <MenuItem value="dynamic">Dynamic Pricing</MenuItem>
                <MenuItem value="surge">Surge Pricing</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Dynamic Price"
              type="number"
              value={formData.dynamic_price}
              onChange={(e) => setFormData({ ...formData, dynamic_price: Number(e.target.value) })}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Minimum Price"
                type="number"
                value={formData.min_price}
                onChange={(e) => setFormData({ ...formData, min_price: Number(e.target.value) })}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                label="Maximum Price"
                type="number"
                value={formData.max_price}
                onChange={(e) => setFormData({ ...formData, max_price: Number(e.target.value) })}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>

            <TextField
              label="Surge Multiplier"
              type="number"
              value={formData.surge_multiplier}
              onChange={(e) => setFormData({ ...formData, surge_multiplier: Number(e.target.value) })}
              fullWidth
              inputProps={{ min: 1, step: 0.1 }}
              helperText="Multiplier applied during surge pricing (e.g., 1.5 = 50% increase)"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSavePricing} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuickCommercePricingManagement;