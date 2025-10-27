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
  ShoppingCart,
  ImportExport,
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
  fetchMarketplaceOrders,
  importMarketplaceOrder,
} from '../../store/slices/marketplaceSlice';
import { MarketplaceConnection, SyncOperation, MarketplaceOrder } from '../../types';

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

const OrderSynchronization: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { connections, syncOperations, marketplaceOrders, loading, error } = useSelector((state: RootState) => state.marketplace);

  const [tabValue, setTabValue] = useState(0);
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MarketplaceOrder | null>(null);

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
          operationType: 'orders',
          direction: 'import',
        })).unwrap();
        setSyncDialogOpen(false);
        dispatch(fetchSyncOperations());
      } catch (error) {
        console.error('Failed to start sync:', error);
      }
    }
  };

  const handleViewOrders = (connectionId: number) => {
    setSelectedConnection(connectionId);
    dispatch(fetchMarketplaceOrders(connectionId));
    setTabValue(1);
  };

  const handleImportOrder = (order: MarketplaceOrder) => {
    setSelectedOrder(order);
    setImportDialogOpen(true);
  };

  const handleImportSubmit = async () => {
    if (selectedOrder && selectedConnection) {
      try {
        await dispatch(importMarketplaceOrder({
          orderId: selectedOrder.external_id,
          connectionId: selectedConnection,
        })).unwrap();
        setImportDialogOpen(false);
        setSelectedOrder(null);
        dispatch(fetchMarketplaceOrders(selectedConnection));
      } catch (error) {
        console.error('Failed to import order:', error);
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

  const getOrderSyncStatusColor = (status: string) => {
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
          Order Synchronization
        </Typography>
        <Button
          variant="contained"
          startIcon={<ImportExport />}
          onClick={() => setSyncDialogOpen(true)}
        >
          Import Orders
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
          <Tab label="Order Management" />
          <Tab label="Import History" />
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
                  .filter(op => op.operation_type === 'orders')
                  .map((operation: SyncOperation) => (
                  <TableRow key={operation.id} hover>
                    <TableCell>
                      {connections.find(c => c.id === operation.connection)?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Orders"
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
                        <Tooltip title="View Orders">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewOrders(operation.connection)}
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
                  dispatch(fetchMarketplaceOrders(connId));
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
              onClick={() => selectedConnection && dispatch(fetchMarketplaceOrders(selectedConnection))}
            >
              Refresh
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Ordered At</TableCell>
                  <TableCell>Sync Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marketplaceOrders.map((order: MarketplaceOrder) => (
                  <TableRow key={order.id} hover>
                    <TableCell>{order.external_id}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{order.currency} {order.total_amount}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell>{new Date(order.ordered_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.sync_status}
                        color={getOrderSyncStatusColor(order.sync_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Import Order">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleImportOrder(order)}
                          >
                            <ShoppingCart />
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
            Order Import History
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
                      Import Orders
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
          Start Order Synchronization
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
              This will import new orders from the selected marketplace connection.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyncDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSyncSubmit} variant="contained" color="primary">
            Start Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Order Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Import Marketplace Order
        </DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box mt={2} display="flex" flexDirection="column" gap={2}>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
                <TextField
                  label="Order ID"
                  value={selectedOrder.external_id}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Customer"
                  value={selectedOrder.customer_name}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Total Amount"
                  value={`${selectedOrder.currency} ${selectedOrder.total_amount}`}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Status"
                  value={selectedOrder.status}
                  InputProps={{ readOnly: true }}
                />
              </Box>
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product.title}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{selectedOrder.currency} {item.unit_price}</TableCell>
                        <TableCell>{selectedOrder.currency} {item.total_price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleImportSubmit} variant="contained" color="primary">
            Import Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderSynchronization;