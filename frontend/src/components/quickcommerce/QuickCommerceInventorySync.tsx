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
  Grid,
} from '@mui/material';
import {
  Sync as SyncIcon,
  Refresh as RefreshIcon,
  CheckCircle as SyncedIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuickCommerceProducts,
  syncQuickCommerceInventory,
  fetchQuickCommerceConnections,
} from '../../store/slices/quickCommerceSlice';
import { QuickCommerceProduct, QuickCommerceConnection } from '../../types';
import { RootState } from '../../store';

const QuickCommerceInventorySync: React.FC = () => {
  const dispatch = useDispatch();
  const { products, connections, loading, error } = useSelector((state: RootState) => state.quickCommerce);

  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<QuickCommerceProduct | null>(null);
  const [syncQuantity, setSyncQuantity] = useState<number>(0);
  const [syncingProducts, setSyncingProducts] = useState<Set<number>>(new Set());

  useEffect(() => {
    dispatch(fetchQuickCommerceConnections());
  }, [dispatch]);

  useEffect(() => {
    if (selectedConnection) {
      dispatch(fetchQuickCommerceProducts(selectedConnection));
    }
  }, [dispatch, selectedConnection]);

  const handleSyncInventory = async (product: QuickCommerceProduct) => {
    if (!selectedConnection) return;

    setSelectedProduct(product);
    setSyncQuantity(product.stock_quantity);
    setSyncDialogOpen(true);
  };

  const handleConfirmSync = async () => {
    if (!selectedProduct || !selectedConnection) return;

    setSyncingProducts(prev => new Set(prev).add(selectedProduct.id));
    try {
      await dispatch(syncQuickCommerceInventory({
        productId: selectedProduct.id,
        connectionId: selectedConnection,
        quantity: syncQuantity,
      }));
      // Refresh products after sync
      dispatch(fetchQuickCommerceProducts(selectedConnection));
    } catch (error) {
      console.error('Failed to sync inventory:', error);
    } finally {
      setSyncingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedProduct.id);
        return newSet;
      });
    }
    setSyncDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleBulkSync = async () => {
    if (!selectedConnection) return;

    const productsToSync = products.filter(p => p.sync_status !== 'synced');
    setSyncingProducts(new Set(productsToSync.map(p => p.id)));

    try {
      for (const product of productsToSync) {
        await dispatch(syncQuickCommerceInventory({
          productId: product.id,
          connectionId: selectedConnection,
          quantity: product.stock_quantity,
        }));
      }
      dispatch(fetchQuickCommerceProducts(selectedConnection));
    } catch (error) {
      console.error('Failed to bulk sync inventory:', error);
    } finally {
      setSyncingProducts(new Set());
    }
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <SyncedIcon color="success" />;
      case 'pending':
        return <PendingIcon color="warning" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredProducts = selectedConnection
    ? products.filter(p => p.connection === selectedConnection)
    : products;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Quick Commerce Inventory Sync
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => selectedConnection && dispatch(fetchQuickCommerceProducts(selectedConnection))}
            disabled={!selectedConnection || loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<SyncIcon />}
            onClick={handleBulkSync}
            disabled={!selectedConnection || loading || filteredProducts.length === 0}
          >
            Bulk Sync
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Select Connection
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
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
            {!selectedConnection && (
              <Alert severity="info">
                Please select a connection to view and sync inventory.
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Inventory Items
            </Typography>

            {selectedConnection ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>SKU</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell>Sync Status</TableCell>
                      <TableCell>Last Sync</TableCell>
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
                    ) : filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No products found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.title}</TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>{product.stock_quantity}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getSyncStatusIcon(product.sync_status)}
                              <Chip
                                label={product.sync_status.toUpperCase()}
                                size="small"
                                color={getSyncStatusColor(product.sync_status) as any}
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            {product.last_sync
                              ? new Date(product.last_sync).toLocaleString()
                              : 'Never'
                            }
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Sync Inventory">
                              <IconButton
                                onClick={() => handleSyncInventory(product)}
                                disabled={syncingProducts.has(product.id)}
                                size="small"
                              >
                                {syncingProducts.has(product.id) ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <SyncIcon />
                                )}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                Select a connection to view inventory items.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={syncDialogOpen} onClose={() => setSyncDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sync Inventory</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedProduct.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Stock: {selectedProduct.stock_quantity}
              </Typography>
              <TextField
                label="Sync Quantity"
                type="number"
                value={syncQuantity}
                onChange={(e) => setSyncQuantity(Number(e.target.value))}
                fullWidth
                sx={{ mt: 2 }}
                inputProps={{ min: 0 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyncDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmSync} variant="contained">
            Sync
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuickCommerceInventorySync;