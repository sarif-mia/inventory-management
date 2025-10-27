import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
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
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  Inventory,
  Sync,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  PlayArrow,
  Stop,
  Settings,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  fetchMarketplaceConnections,
  fetchSyncOperations,
  startSyncOperation,
  syncInventoryToMarketplace,
} from '../../store/slices/marketplaceSlice';
import { MarketplaceConnection, SyncOperation } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const InventorySynchronization: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { connections, syncOperations, loading, error } = useSelector((state: RootState) => state.marketplace);

  const [tabValue, setTabValue] = useState(0);
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [inventoryDialogOpen, setInventoryDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string; currentStock: number } | null>(null);
  const [inventoryData, setInventoryData] = useState({
    productId: 0,
    quantity: 0,
  });

  useEffect(() => {
    dispatch(fetchMarketplaceConnections());
    dispatch(fetchSyncOperations());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStartSync = (connectionId: number) => {
    setSelectedConnection(connectionId);
    setSyncDialogOpen(true);
  };

  const handleSyncSubmit = async () => {
    if (selectedConnection) {
      try {
        await dispatch(startSyncOperation({
          connectionId: selectedConnection,
          operationType: 'inventory',
          direction: 'export',
        })).unwrap();
        setSyncDialogOpen(false);
        dispatch(fetchSyncOperations());
      } catch (error) {
        console.error('Failed to start sync:', error);
      }
    }
  };

  const handleSyncInventory = (product: { id: number; name: string; currentStock: number }) => {
    setSelectedProduct(product);
    setInventoryData({
      productId: product.id,
      quantity: product.currentStock,
    });
    setInventoryDialogOpen(true);
  };

  const handleInventorySubmit = async () => {
    if (selectedConnection && selectedProduct) {
      try {
        await dispatch(syncInventoryToMarketplace({
          productId: selectedProduct.id,
          connectionId: selectedConnection,
          quantity: inventoryData.quantity,
        })).unwrap();
        setInventoryDialogOpen(false);
        setSelectedProduct(null);
      } catch (error) {
        console.error('Failed to sync inventory:', error);
      }
    }
  };

  const getSyncStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'failed': return 'error';
      case 'retrying': return 'warning';
      default: return 'default';
    }
  };

  const getProgressValue = (operation: SyncOperation) => {
    if (operation.total_items === 0) return 0;
    return (operation.processed_items / operation.total_items) * 100;
  };

  // Mock inventory data - in real app this would come from Redux
  const mockInventoryData = [
    { id: 1, name: 'Product A', currentStock: 50, minStock: 10, maxStock: 100 },
    { id: 2, name: 'Product B', currentStock: 25, minStock: 5, maxStock: 80 },
    { id: 3, name: 'Product C', currentStock: 75, minStock: 15, maxStock: 120 },
    { id: 4, name: 'Product D', currentStock: 5, minStock: 10, maxStock: 60 },
  ];

  if (loading && connections.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Inventory Synchronization
        </Typography>
        <Button
          variant="contained"
          startIcon={<Sync />}
          onClick={() => setSyncDialogOpen(true)}
        >
          Sync All Inventory
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Sync Operations" />
          <Tab label="Inventory Management" />
          <Tab label="Stock Levels" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Connection</TableCell>
                  <TableCell>Operation Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {syncOperations
                  .filter(op => op.operation_type === 'inventory')
                  .map((operation: SyncOperation) => (
                  <TableRow key={operation.id} hover>
                    <TableCell>
                      {connections.find(c => c.id === operation.connection)?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Inventory"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={operation.status}
                        color={getSyncStatusColor(operation.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={getProgressValue(operation)}
                          sx={{ width: 100 }}
                        />
                        <Typography variant="body2">
                          {operation.processed_items}/{operation.total_items}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(operation.started_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {operation.status === 'running' && (
                          <Tooltip title="Stop Sync">
                            <IconButton size="small" color="error">
                              <Stop />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box display="flex" gap={2} mb={3}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Connection</InputLabel>
              <Select
                value={selectedConnection || ''}
                label="Connection"
                onChange={(e) => setSelectedConnection(parseInt(e.target.value as unknown as string))}
              >
                {connections.map((connection) => (
                  <MenuItem key={connection.id} value={connection.id}>
                    {connection.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => dispatch(fetchSyncOperations())}
            >
              Refresh
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Current Stock</TableCell>
                  <TableCell>Min Stock</TableCell>
                  <TableCell>Max Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockInventoryData.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.currentStock}</TableCell>
                    <TableCell>{product.minStock}</TableCell>
                    <TableCell>{product.maxStock}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          product.currentStock <= product.minStock
                            ? 'Low Stock'
                            : product.currentStock >= product.maxStock
                            ? 'Overstock'
                            : 'Normal'
                        }
                        color={
                          product.currentStock <= product.minStock
                            ? 'error'
                            : product.currentStock >= product.maxStock
                            ? 'warning'
                            : 'success'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Sync to Marketplace">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleSyncInventory(product)}
                            disabled={!selectedConnection}
                          >
                            <Inventory />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Stock Level Overview
          </Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
            {connections.map((connection: MarketplaceConnection) => (
              <Card key={connection.id}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {connection.name}
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Typography variant="body2" color="textSecondary">
                      Platform: {connection.platform}
                    </Typography>
                    <Typography variant="body2">
                      Last Sync: {connection.last_sync ? new Date(connection.last_sync).toLocaleString() : 'Never'}
                    </Typography>
                    <Typography variant="body2">
                      Status: <Chip label={connection.status} size="small" color={getSyncStatusColor(connection.status)} />
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => handleStartSync(connection.id)}
                    >
                      Sync Inventory
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>
      </Paper>

      {/* Sync Dialog */}
      <Dialog open={syncDialogOpen} onClose={() => setSyncDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Start Inventory Synchronization
        </DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <FormControl fullWidth>
              <InputLabel>Connection</InputLabel>
              <Select
                value={selectedConnection || ''}
                label="Connection"
                onChange={(e) => setSelectedConnection(parseInt(e.target.value as unknown as string))}
              >
                {connections.map((connection) => (
                  <MenuItem key={connection.id} value={connection.id}>
                    {connection.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="textSecondary">
              This will synchronize inventory levels for all products to the selected marketplace.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyncDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSyncSubmit} variant="contained" color="primary">
            Start Sync
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inventory Sync Dialog */}
      <Dialog open={inventoryDialogOpen} onClose={() => setInventoryDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Sync Product Inventory
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box mt={2} display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Product"
                value={selectedProduct.name}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Current Stock"
                value={selectedProduct.currentStock}
                InputProps={{ readOnly: true }}
                fullWidth
              />
              <TextField
                label="Sync Quantity"
                type="number"
                value={inventoryData.quantity}
                onChange={(e) => setInventoryData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                fullWidth
                helperText="Enter the quantity to sync to the marketplace"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInventoryDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleInventorySubmit} variant="contained" color="primary">
            Sync Inventory
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventorySynchronization;