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
  Sync,
  SyncAlt,
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
  fetchMarketplaceProducts,
  syncProductToMarketplace,
} from '../../store/slices/marketplaceSlice';
import { MarketplaceConnection, SyncOperation, MarketplaceProduct } from '../../types';

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

const SYNC_TYPES = [
  { value: 'products', label: 'Products' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'orders', label: 'Orders' },
];

const DIRECTIONS = [
  { value: 'import', label: 'Import from Marketplace' },
  { value: 'export', label: 'Export to Marketplace' },
  { value: 'sync', label: 'Bidirectional Sync' },
];

const ProductSynchronization: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { connections, syncOperations, marketplaceProducts, loading, error } = useSelector((state: RootState) => state.marketplace);

  const [tabValue, setTabValue] = useState(0);
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncData, setSyncData] = useState({
    operation_type: 'products',
    direction: 'sync',
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
          operationType: syncData.operation_type,
          direction: syncData.direction,
        })).unwrap();
        setSyncDialogOpen(false);
        dispatch(fetchSyncOperations());
      } catch (error) {
        console.error('Failed to start sync:', error);
      }
    }
  };

  const handleViewProducts = (connectionId: number) => {
    setSelectedConnection(connectionId);
    dispatch(fetchMarketplaceProducts(connectionId));
    setTabValue(1);
  };

  const handleSyncProduct = async (productId: number, connectionId: number) => {
    try {
      await dispatch(syncProductToMarketplace({ productId, connectionId })).unwrap();
      dispatch(fetchMarketplaceProducts(connectionId));
    } catch (error) {
      console.error('Failed to sync product:', error);
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

  const getProductSyncStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getProgressValue = (operation: SyncOperation) => {
    if (operation.total_items === 0) return 0;
    return (operation.processed_items / operation.total_items) * 100;
  };

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
          Product Synchronization
        </Typography>
        <Button
          variant="contained"
          startIcon={<Sync />}
          onClick={() => setSyncDialogOpen(true)}
        >
          Start Sync
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
          <Tab label="Product Management" />
          <Tab label="Sync History" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Connection</TableCell>
                  <TableCell>Operation Type</TableCell>
                  <TableCell>Direction</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {syncOperations
                  .filter(op => op.operation_type === 'products')
                  .map((operation: SyncOperation) => (
                  <TableRow key={operation.id} hover>
                    <TableCell>
                      {connections.find(c => c.id === operation.connection)?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={SYNC_TYPES.find(t => t.value === operation.operation_type)?.label || operation.operation_type}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {DIRECTIONS.find(d => d.value === operation.direction)?.label || operation.direction}
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
                        <Tooltip title="View Products">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewProducts(operation.connection)}
                          >
                            <Settings />
                          </IconButton>
                        </Tooltip>
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
                onChange={(e) => {
                  const connId = parseInt(e.target.value as unknown as string);
                  setSelectedConnection(connId);
                  dispatch(fetchMarketplaceProducts(connId));
                }}
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
              onClick={() => selectedConnection && dispatch(fetchMarketplaceProducts(selectedConnection))}
            >
              Refresh
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Sync Status</TableCell>
                  <TableCell>Last Sync</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marketplaceProducts.map((product: MarketplaceProduct) => (
                  <TableRow key={product.id} hover>
                    <TableCell>{product.title}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.currency} {product.price}</TableCell>
                    <TableCell>{product.stock_quantity}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.sync_status}
                        color={getProductSyncStatusColor(product.sync_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(product.last_sync).toLocaleString()}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Sync Product">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleSyncProduct(product.internal_product, product.connection)}
                          >
                            <Sync />
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
            Synchronization History
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
                      Start Sync
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
          Start Product Synchronization
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
            <FormControl fullWidth>
              <InputLabel>Operation Type</InputLabel>
              <Select
                value={syncData.operation_type}
                label="Operation Type"
                onChange={(e) => setSyncData(prev => ({ ...prev, operation_type: e.target.value }))}
              >
                {SYNC_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Direction</InputLabel>
              <Select
                value={syncData.direction}
                label="Direction"
                onChange={(e) => setSyncData(prev => ({ ...prev, direction: e.target.value }))}
              >
                {DIRECTIONS.map((direction) => (
                  <MenuItem key={direction.value} value={direction.value}>
                    {direction.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyncDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSyncSubmit} variant="contained" color="primary">
            Start Sync
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductSynchronization;