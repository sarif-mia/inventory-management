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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  SwapHoriz as TransferIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchInventoryItems, updateInventoryItem, adjustStock, transferStock } from '../../store/slices/inventorySlice';
import { fetchWarehouses } from '../../store/slices/warehouseSlice';
import { InventoryItem, Warehouse, StockAdjustment, WarehouseTransfer } from '../../types';

const InventoryLevels: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { inventoryItems, loading, error } = useSelector((state: RootState) => state.inventory);
  const { warehouses } = useSelector((state: RootState) => state.warehouse);

  const [adjustmentDialog, setAdjustmentDialog] = useState<{
    open: boolean;
    item: InventoryItem | null;
    type: 'add' | 'remove' | 'set';
  }>({ open: false, item: null, type: 'add' });

  const [transferDialog, setTransferDialog] = useState<{
    open: boolean;
    item: InventoryItem | null;
  }>({ open: false, item: null });

  const [adjustmentForm, setAdjustmentForm] = useState({
    quantity: 0,
    reason: '',
  });

  const [transferForm, setTransferForm] = useState({
    toWarehouseId: '',
    quantity: 0,
    reason: '',
  });

  useEffect(() => {
    dispatch(fetchInventoryItems());
    dispatch(fetchWarehouses());
  }, [dispatch]);

  const handleAdjustment = (item: InventoryItem, type: 'add' | 'remove' | 'set') => {
    setAdjustmentDialog({ open: true, item, type });
    setAdjustmentForm({ quantity: 0, reason: '' });
  };

  const handleTransfer = (item: InventoryItem) => {
    setTransferDialog({ open: true, item });
    setTransferForm({ toWarehouseId: '', quantity: 0, reason: '' });
  };

  const submitAdjustment = async () => {
    if (!adjustmentDialog.item) return;

    const adjustment: StockAdjustment = {
      product_id: adjustmentDialog.item.product.id,
      warehouse_id: adjustmentDialog.item.warehouse.id,
      adjustment_type: adjustmentDialog.type,
      quantity: adjustmentForm.quantity,
      reason: adjustmentForm.reason,
    };

    try {
      await dispatch(adjustStock(adjustment)).unwrap();
      setAdjustmentDialog({ open: false, item: null, type: 'add' });
      dispatch(fetchInventoryItems()); // Refresh data
    } catch (error) {
      console.error('Adjustment failed:', error);
    }
  };

  const submitTransfer = async () => {
    if (!transferDialog.item) return;

    const transfer: WarehouseTransfer = {
      from_warehouse_id: transferDialog.item.warehouse.id,
      to_warehouse_id: parseInt(transferForm.toWarehouseId),
      product_id: transferDialog.item.product.id,
      quantity: transferForm.quantity,
      reason: transferForm.reason,
    };

    try {
      await dispatch(transferStock(transfer)).unwrap();
      setTransferDialog({ open: false, item: null });
      dispatch(fetchInventoryItems()); // Refresh data
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    const { stock_quantity, min_stock_level, max_stock_level } = item;
    if (stock_quantity === 0) return { status: 'Out of Stock', color: 'error' as const };
    if (stock_quantity <= min_stock_level) return { status: 'Low Stock', color: 'warning' as const };
    if (stock_quantity >= max_stock_level) return { status: 'Overstock', color: 'info' as const };
    return { status: 'Normal', color: 'success' as const };
  };

  const getAvailableWarehouses = (currentWarehouseId: number) => {
    return warehouses.filter(w => w.id !== currentWarehouseId);
  };

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
        <Typography variant="h5" gutterBottom>
          Inventory Levels Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Warehouse</TableCell>
                <TableCell align="right">Current Stock</TableCell>
                <TableCell align="right">Min Level</TableCell>
                <TableCell align="right">Max Level</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventoryItems.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <TableRow key={`${item.product.id}-${item.warehouse.id}`} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {item.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.product.category}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{item.warehouse.name}</TableCell>
                    <TableCell align="right">{item.stock_quantity}</TableCell>
                    <TableCell align="right">{item.min_stock_level}</TableCell>
                    <TableCell align="right">{item.max_stock_level}</TableCell>
                    <TableCell>
                      <Chip
                        label={stockStatus.status}
                        color={stockStatus.color}
                        size="small"
                        icon={stockStatus.color === 'warning' ? <WarningIcon /> : undefined}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Add Stock">
                        <IconButton
                          size="small"
                          onClick={() => handleAdjustment(item, 'add')}
                          color="success"
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove Stock">
                        <IconButton
                          size="small"
                          onClick={() => handleAdjustment(item, 'remove')}
                          color="error"
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Transfer Stock">
                        <IconButton
                          size="small"
                          onClick={() => handleTransfer(item)}
                          color="primary"
                        >
                          <TransferIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Levels">
                        <IconButton
                          size="small"
                          onClick={() => dispatch(updateInventoryItem({
                            id: item.id,
                            data: { min_stock_level: item.min_stock_level, max_stock_level: item.max_stock_level }
                          }))}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustmentDialog.open} onClose={() => setAdjustmentDialog({ open: false, item: null, type: 'add' })}>
        <DialogTitle>
          {adjustmentDialog.type === 'add' ? 'Add Stock' :
           adjustmentDialog.type === 'remove' ? 'Remove Stock' : 'Set Stock Level'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, minWidth: 300 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Product: {adjustmentDialog.item?.product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Warehouse: {adjustmentDialog.item?.warehouse.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Stock: {adjustmentDialog.item?.stock_quantity}
            </Typography>

            <TextField
              fullWidth
              type="number"
              label="Quantity"
              value={adjustmentForm.quantity}
              onChange={(e) => setAdjustmentForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
              sx={{ mt: 2 }}
              inputProps={{ min: 0 }}
            />

            <TextField
              fullWidth
              label="Reason"
              value={adjustmentForm.reason}
              onChange={(e) => setAdjustmentForm(prev => ({ ...prev, reason: e.target.value }))}
              sx={{ mt: 2 }}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustmentDialog({ open: false, item: null, type: 'add' })}>
            Cancel
          </Button>
          <Button onClick={submitAdjustment} variant="contained">
            {adjustmentDialog.type === 'add' ? 'Add' :
             adjustmentDialog.type === 'remove' ? 'Remove' : 'Set'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Transfer Dialog */}
      <Dialog open={transferDialog.open} onClose={() => setTransferDialog({ open: false, item: null })}>
        <DialogTitle>Transfer Stock</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, minWidth: 300 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Product: {transferDialog.item?.product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              From Warehouse: {transferDialog.item?.warehouse.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Available Stock: {transferDialog.item?.stock_quantity}
            </Typography>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>To Warehouse</InputLabel>
              <Select
                value={transferForm.toWarehouseId}
                label="To Warehouse"
                onChange={(e) => setTransferForm(prev => ({ ...prev, toWarehouseId: e.target.value }))}
              >
                {transferDialog.item && getAvailableWarehouses(transferDialog.item.warehouse.id).map((warehouse) => (
                  <MenuItem key={warehouse.id} value={warehouse.id.toString()}>
                    {warehouse.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label="Quantity to Transfer"
              value={transferForm.quantity}
              onChange={(e) => setTransferForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
              sx={{ mt: 2 }}
              inputProps={{ min: 1, max: transferDialog.item?.stock_quantity }}
            />

            <TextField
              fullWidth
              label="Reason"
              value={transferForm.reason}
              onChange={(e) => setTransferForm(prev => ({ ...prev, reason: e.target.value }))}
              sx={{ mt: 2 }}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialog({ open: false, item: null })}>
            Cancel
          </Button>
          <Button onClick={submitTransfer} variant="contained">
            Transfer
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default InventoryLevels;