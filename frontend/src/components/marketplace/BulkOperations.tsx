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
  Checkbox,
  FormControlLabel,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Settings,
  GroupWork,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  fetchMarketplaceConnections,
  fetchBulkOperations,
  startBulkOperation,
} from '../../store/slices/marketplaceSlice';
import { MarketplaceConnection, BulkMarketplaceOperation } from '../../types';

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

const OPERATION_TYPES = [
  { value: 'sync_all', label: 'Sync All Data', description: 'Synchronize products, orders, and inventory' },
  { value: 'update_prices', label: 'Update Prices', description: 'Update product prices across marketplaces' },
  { value: 'update_inventory', label: 'Update Inventory', description: 'Sync inventory levels' },
  { value: 'import_orders', label: 'Import Orders', description: 'Import new orders from marketplaces' },
];

const BulkOperations: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { connections, bulkOperations, loading, error } = useSelector((state: RootState) => state.marketplace);

  const [tabValue, setTabValue] = useState(0);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedConnections, setSelectedConnections] = useState<number[]>([]);
  const [selectedOperationType, setSelectedOperationType] = useState('sync_all');

  useEffect(() => {
    dispatch(fetchMarketplaceConnections());
    dispatch(fetchBulkOperations());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStartBulkOperation = () => {
    setBulkDialogOpen(true);
  };

  const handleBulkSubmit = async () => {
    if (selectedConnections.length > 0) {
      try {
        await dispatch(startBulkOperation({
          operationType: selectedOperationType,
          connections: selectedConnections,
        })).unwrap();
        setBulkDialogOpen(false);
        setSelectedConnections([]);
        dispatch(fetchBulkOperations());
      } catch (error) {
        console.error('Failed to start bulk operation:', error);
      }
    }
  };

  const handleConnectionToggle = (connectionId: number) => {
    setSelectedConnections(prev =>
      prev.includes(connectionId)
        ? prev.filter(id => id !== connectionId)
        : [...prev, connectionId]
    );
  };

  const handleSelectAllConnections = () => {
    if (selectedConnections.length === connections.length) {
      setSelectedConnections([]);
    } else {
      setSelectedConnections(connections.map(c => c.id));
    }
  };

  const getOperationStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getOperationTypeLabel = (type: string) => {
    return OPERATION_TYPES.find(op => op.value === type)?.label || type;
  };

  const getProgressValue = (operation: BulkMarketplaceOperation) => {
    if (operation.total_operations === 0) return 0;
    return (operation.completed_operations / operation.total_operations) * 100;
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
          Bulk Marketplace Operations
        </Typography>
        <Button
          variant="contained"
          startIcon={<GroupWork />}
          onClick={handleStartBulkOperation}
        >
          Start Bulk Operation
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Operations History" />
          <Tab label="Operation Templates" />
          <Tab label="Scheduled Operations" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Operation Type</TableCell>
                  <TableCell>Connections</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Completed</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bulkOperations.map((operation: BulkMarketplaceOperation) => (
                  <TableRow key={operation.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {getOperationTypeLabel(operation.operation_type)}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {operation.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {operation.connections.length} connections
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={operation.status}
                        color={getOperationStatusColor(operation.status)}
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
                          {operation.completed_operations}/{operation.total_operations}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{new Date(operation.started_at).toLocaleString()}</TableCell>
                    <TableCell>
                      {operation.completed_at ? new Date(operation.completed_at).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {operation.status === 'running' && (
                          <Tooltip title="Stop Operation">
                            <IconButton size="small" color="error">
                              <Stop />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="View Details">
                          <IconButton size="small" color="info">
                            <Settings />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {bulkOperations.length === 0 && (
            <Box textAlign="center" py={4}>
              <GroupWork color="action" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No bulk operations yet
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Start your first bulk operation to manage multiple marketplaces
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Operation Templates
          </Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
            {OPERATION_TYPES.map((operationType) => (
              <Card key={operationType.value}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {operationType.label}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {operationType.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setSelectedOperationType(operationType.value);
                      setBulkDialogOpen(true);
                    }}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Scheduled Operations
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Scheduled operations feature is coming soon. You'll be able to automate regular sync operations.
          </Alert>

          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Inventory Sync
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Automatically sync inventory levels every day at 2 AM
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} disabled>
                  Schedule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hourly Order Import
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Import new orders every hour during business hours
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} disabled>
                  Schedule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Weekly Price Update
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Update prices across all marketplaces every Monday
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} disabled>
                  Schedule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Monthly Analytics Report
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Generate comprehensive analytics report on the 1st of each month
                </Typography>
                <Button variant="outlined" sx={{ mt: 2 }} disabled>
                  Schedule
                </Button>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Paper>

      {/* Bulk Operation Dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Start Bulk Marketplace Operation
        </DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6" gutterBottom>
              Select Operation Type
            </Typography>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
              {OPERATION_TYPES.map((operationType) => (
                <Card
                  key={operationType.value}
                  sx={{
                    cursor: 'pointer',
                    border: selectedOperationType === operationType.value ? 2 : 1,
                    borderColor: selectedOperationType === operationType.value ? 'primary.main' : 'divider',
                  }}
                  onClick={() => setSelectedOperationType(operationType.value)}
                >
                  <CardContent>
                    <Typography variant="body2" fontWeight="bold">
                      {operationType.label}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {operationType.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Select Connections ({selectedConnections.length} selected)
            </Typography>

            <Box display="flex" alignItems="center" mb={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedConnections.length === connections.length && connections.length > 0}
                    indeterminate={selectedConnections.length > 0 && selectedConnections.length < connections.length}
                    onChange={handleSelectAllConnections}
                  />
                }
                label="Select All"
              />
            </Box>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={1}>
              {connections.map((connection: MarketplaceConnection) => (
                <FormControlLabel
                  key={connection.id}
                  control={
                    <Checkbox
                      checked={selectedConnections.includes(connection.id)}
                      onChange={() => handleConnectionToggle(connection.id)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">{connection.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {connection.platform} • {connection.status}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </Box>

            {selectedConnections.length === 0 && (
              <Alert severity="warning">
                Please select at least one marketplace connection.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleBulkSubmit}
            variant="contained"
            color="primary"
            disabled={selectedConnections.length === 0}
          >
            Start Bulk Operation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BulkOperations;