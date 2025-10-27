import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  Warehouse as WarehouseIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchInventoryItems } from '../../store/slices/inventorySlice';
import { fetchWarehouses } from '../../store/slices/warehouseSlice';
import { InventoryItem, Warehouse } from '../../types';

const WarehouseInventoryView: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { inventoryItems, loading: inventoryLoading } = useSelector((state: RootState) => state.inventory);
  const { warehouses, loading: warehousesLoading } = useSelector((state: RootState) => state.warehouse);

  const [selectedWarehouse, setSelectedWarehouse] = useState<number | ''>('');

  useEffect(() => {
    dispatch(fetchWarehouses());
    dispatch(fetchInventoryItems());
  }, [dispatch]);

  const getWarehouseInventory = (warehouseId: number) => {
    return inventoryItems.filter(item => item.warehouse.id === warehouseId);
  };

  const getWarehouseStats = (warehouseId: number) => {
    const warehouseInventory = getWarehouseInventory(warehouseId);
    const totalProducts = warehouseInventory.length;
    const lowStockItems = warehouseInventory.filter(item => item.stock_quantity <= item.min_stock_level).length;
    const outOfStockItems = warehouseInventory.filter(item => item.stock_quantity === 0).length;
    const totalValue = warehouseInventory.reduce((sum, item) => sum + (item.stock_quantity * item.product.price), 0);

    return {
      totalProducts,
      lowStockItems,
      outOfStockItems,
      totalValue,
    };
  };

  const getStockStatus = (item: InventoryItem) => {
    const { stock_quantity, min_stock_level } = item;
    if (stock_quantity === 0) return { status: 'Out of Stock', color: 'error' as const };
    if (stock_quantity <= min_stock_level) return { status: 'Low Stock', color: 'warning' as const };
    return { status: 'In Stock', color: 'success' as const };
  };

  const selectedWarehouseData = selectedWarehouse ? warehouses.find(w => w.id === selectedWarehouse) : null;
  const warehouseInventory = selectedWarehouse ? getWarehouseInventory(selectedWarehouse) : [];
  const warehouseStats = selectedWarehouse ? getWarehouseStats(selectedWarehouse) : null;

  if (warehousesLoading || inventoryLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Warehouse Inventory View
      </Typography>

      {/* Warehouse Selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth sx={{ maxWidth: 400 }}>
          <InputLabel>Select Warehouse</InputLabel>
          <Select
            value={selectedWarehouse}
            label="Select Warehouse"
            onChange={(e) => setSelectedWarehouse(e.target.value as number)}
          >
            {warehouses.map((warehouse) => (
              <MenuItem key={warehouse.id} value={warehouse.id}>
                <Box>
                  <Typography variant="body1">{warehouse.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {warehouse.location}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {selectedWarehouse && selectedWarehouseData && warehouseStats && (
        <>
          {/* Warehouse Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <WarehouseIcon color="primary" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="h6">{warehouseStats.totalProducts}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Products
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <InventoryIcon color="success" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="h6">${warehouseStats.totalValue.toFixed(2)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Value
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <WarningIcon color="warning" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="h6">{warehouseStats.lowStockItems}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Low Stock Items
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <CheckCircleIcon color="error" sx={{ mr: 1 }} />
                    <Box>
                      <Typography variant="h6">{warehouseStats.outOfStockItems}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Out of Stock
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Warehouse Details */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Warehouse Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="medium">
                {selectedWarehouseData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Location: {selectedWarehouseData.location}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Capacity: {selectedWarehouseData.capacity} units
              </Typography>
            </Box>
          </Paper>

          {/* Inventory Table */}
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <Box p={3}>
              <Typography variant="h6" gutterBottom>
                Inventory Details
              </Typography>

              {warehouseInventory.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">
                    No inventory items found for this warehouse
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Current Stock</TableCell>
                        <TableCell align="right">Min Level</TableCell>
                        <TableCell align="right">Max Level</TableCell>
                        <TableCell align="right">Unit Value</TableCell>
                        <TableCell align="right">Total Value</TableCell>
                        <TableCell>Stock Status</TableCell>
                        <TableCell>Last Updated</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {warehouseInventory.map((item) => {
                        const stockStatus = getStockStatus(item);
                        const totalValue = item.stock_quantity * item.product.price;

                        return (
                          <TableRow key={item.id} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body1" fontWeight="medium">
                                  {item.product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  ID: {item.product.id}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{item.product.category}</TableCell>
                            <TableCell align="right">{item.stock_quantity}</TableCell>
                            <TableCell align="right">{item.min_stock_level}</TableCell>
                            <TableCell align="right">{item.max_stock_level}</TableCell>
                            <TableCell align="right">${item.product.price.toFixed(2)}</TableCell>
                            <TableCell align="right">${totalValue.toFixed(2)}</TableCell>
                            <TableCell>
                              <Chip
                                label={stockStatus.status}
                                color={stockStatus.color}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(item.last_updated).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Paper>
        </>
      )}

      {!selectedWarehouse && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <WarehouseIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Select a warehouse to view inventory details
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default WarehouseInventoryView;