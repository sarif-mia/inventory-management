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
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Wifi,
  WifiOff,
  Settings,
  ExpandMore,
  CheckCircle,
  Error,
  Sync,
  Store
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  fetchMarketplaceConnections,
  createMarketplaceConnection,
  updateMarketplaceConnection,
  testMarketplaceConnection,
  deleteMarketplaceConnection
} from '../../store/slices/marketplaceSlice';
import { MarketplaceConnection } from '../../types';

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

const PLATFORM_OPTIONS = [
  { value: 'amazon', label: 'Amazon' },
  { value: 'ebay', label: 'eBay' },
  { value: 'etsy', label: 'Etsy' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'woocommerce', label: 'WooCommerce' },
  { value: 'custom', label: 'Custom API' },
];

const MarketplaceConnectionManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { connections, loading, error } = useSelector((state: RootState) => state.marketplace);

  const [tabValue, setTabValue] = useState(0);
  const [selectedConnection, setSelectedConnection] = useState<MarketplaceConnection | null>(null);
  const [connectionDialogOpen, setConnectionDialogOpen] = useState(false);
  const [testResults, setTestResults] = useState<{ [key: number]: { success: boolean; message: string } }>({});
  const [connectionData, setConnectionData] = useState<Partial<MarketplaceConnection>>({
    name: '',
    platform: 'amazon',
    status: 'inactive',
    configuration: {
      rate_limits: {
        requests_per_minute: 60,
        requests_per_hour: 1000,
      },
    },
  });

  useEffect(() => {
    dispatch(fetchMarketplaceConnections());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateConnection = () => {
    setSelectedConnection(null);
    setConnectionData({
      name: '',
      platform: 'amazon',
      status: 'inactive',
      configuration: {
        rate_limits: {
          requests_per_minute: 60,
          requests_per_hour: 1000,
        },
      },
    });
    setConnectionDialogOpen(true);
  };

  const handleEditConnection = (connection: MarketplaceConnection) => {
    setSelectedConnection(connection);
    setConnectionData({ ...connection });
    setConnectionDialogOpen(true);
  };

  const handleConnectionSubmit = async () => {
    try {
      if (selectedConnection) {
        await dispatch(updateMarketplaceConnection({
          connectionId: selectedConnection.id,
          data: connectionData
        })).unwrap();
      } else {
        await dispatch(createMarketplaceConnection(connectionData as Omit<MarketplaceConnection, 'id' | 'created_at' | 'updated_at'>)).unwrap();
      }
      setConnectionDialogOpen(false);
      setSelectedConnection(null);
      dispatch(fetchMarketplaceConnections());
    } catch (error) {
      console.error('Failed to save connection:', error);
    }
  };

  const handleTestConnection = async (connectionId: number) => {
    try {
      const result = await dispatch(testMarketplaceConnection(connectionId)).unwrap();
      setTestResults(prev => ({
        ...prev,
        [connectionId]: result
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [connectionId]: { success: false, message: 'Connection test failed' }
      }));
    }
  };

  const handleToggleActive = async (connection: MarketplaceConnection) => {
    try {
      await dispatch(updateMarketplaceConnection({
        connectionId: connection.id,
        data: { status: connection.status === 'active' ? 'inactive' : 'active' }
      })).unwrap();
    } catch (error) {
      console.error('Failed to toggle connection status:', error);
    }
  };

  const handleDeleteConnection = async (connectionId: number) => {
    if (window.confirm('Are you sure you want to delete this marketplace connection?')) {
      try {
        await dispatch(deleteMarketplaceConnection(connectionId)).unwrap();
        dispatch(fetchMarketplaceConnections());
      } catch (error) {
        console.error('Failed to delete connection:', error);
      }
    }
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getPlatformIcon = (platform: string) => {
    return <Store />;
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
          Marketplace Connection Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateConnection}
        >
          Add Connection
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Connections" />
          <Tab label="Configuration" />
          <Tab label="Testing" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Platform</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Sync</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connections.map((connection: MarketplaceConnection) => (
                  <TableRow key={connection.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {getPlatformIcon(connection.platform)}
                        <Typography fontWeight="bold">{connection.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={PLATFORM_OPTIONS.find(p => p.value === connection.platform)?.label || connection.platform}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={connection.status}
                        color={getConnectionStatusColor(connection.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {connection.last_sync ? new Date(connection.last_sync).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Test Connection">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleTestConnection(connection.id)}
                          >
                            <Wifi />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditConnection(connection)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Toggle Active">
                          <Switch
                            size="small"
                            checked={connection.status === 'active'}
                            onChange={() => handleToggleActive(connection)}
                          />
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteConnection(connection.id)}
                          >
                            <Delete />
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

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Connection Configuration
          </Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
            {connections.map((connection: MarketplaceConnection) => (
              <Card key={connection.id}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {connection.name} Configuration
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      label="Platform"
                      value={PLATFORM_OPTIONS.find(p => p.value === connection.platform)?.label || connection.platform}
                      InputProps={{ readOnly: true }}
                      size="small"
                    />
                    <TextField
                      label="Requests per Minute"
                      value={connection.configuration.rate_limits.requests_per_minute}
                      InputProps={{ readOnly: true }}
                      size="small"
                    />
                    <TextField
                      label="Requests per Hour"
                      value={connection.configuration.rate_limits.requests_per_hour}
                      InputProps={{ readOnly: true }}
                      size="small"
                    />
                    {connection.store_url && (
                      <TextField
                        label="Store URL"
                        value={connection.store_url}
                        InputProps={{ readOnly: true }}
                        size="small"
                      />
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<Settings />}
                      onClick={() => handleEditConnection(connection)}
                    >
                      Edit Configuration
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Connection Testing
          </Typography>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
            {connections.map((connection: MarketplaceConnection) => (
              <Card key={connection.id}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      {connection.name}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Sync />}
                      onClick={() => handleTestConnection(connection.id)}
                      disabled={loading}
                    >
                      Test Connection
                    </Button>
                  </Box>

                  {testResults[connection.id] && (
                    <Alert
                      severity={testResults[connection.id].success ? 'success' : 'error'}
                      sx={{ mb: 2 }}
                    >
                      {testResults[connection.id].message}
                    </Alert>
                  )}

                  <Box display="flex" flexDirection="column" gap={1}>
                    <Typography variant="body2" color="textSecondary">
                      Status: <Chip label={connection.status} size="small" color={getConnectionStatusColor(connection.status)} />
                    </Typography>
                    <Typography variant="body2">
                      Platform: {PLATFORM_OPTIONS.find(p => p.value === connection.platform)?.label || connection.platform}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Last Sync: {connection.last_sync ? new Date(connection.last_sync).toLocaleString() : 'Never'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>
      </Paper>

      {/* Connection Dialog */}
      <Dialog open={connectionDialogOpen} onClose={() => setConnectionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedConnection ? 'Edit Marketplace Connection' : 'Add Marketplace Connection'}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
              <TextField
                fullWidth
                label="Connection Name"
                value={connectionData.name}
                onChange={(e) => setConnectionData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Platform</InputLabel>
                <Select
                  value={connectionData.platform}
                  label="Platform"
                  onChange={(e) => setConnectionData(prev => ({ ...prev, platform: e.target.value }))}
                >
                  {PLATFORM_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={connectionData.status === 'active'}
                    onChange={(e) => setConnectionData(prev => ({
                      ...prev,
                      status: e.target.checked ? 'active' : 'inactive'
                    }))}
                  />
                }
                label="Active"
              />
              <TextField
                fullWidth
                label="Store URL"
                value={connectionData.store_url || ''}
                onChange={(e) => setConnectionData(prev => ({ ...prev, store_url: e.target.value }))}
              />
              <TextField
                fullWidth
                label="API Key"
                value={connectionData.api_key || ''}
                onChange={(e) => setConnectionData(prev => ({ ...prev, api_key: e.target.value }))}
                type="password"
              />
              <TextField
                fullWidth
                label="API Secret"
                value={connectionData.api_secret || ''}
                onChange={(e) => setConnectionData(prev => ({ ...prev, api_secret: e.target.value }))}
                type="password"
              />
              <TextField
                fullWidth
                label="Access Token"
                value={connectionData.access_token || ''}
                onChange={(e) => setConnectionData(prev => ({ ...prev, access_token: e.target.value }))}
                type="password"
              />
              <TextField
                fullWidth
                label="Refresh Token"
                value={connectionData.refresh_token || ''}
                onChange={(e) => setConnectionData(prev => ({ ...prev, refresh_token: e.target.value }))}
                type="password"
              />
              <Box gridColumn="1 / -1">
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>Rate Limiting Configuration</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Requests per Minute"
                        value={connectionData.configuration?.rate_limits.requests_per_minute}
                        onChange={(e) => setConnectionData(prev => ({
                          ...prev,
                          configuration: {
                            ...prev.configuration!,
                            rate_limits: {
                              ...prev.configuration!.rate_limits,
                              requests_per_minute: parseInt(e.target.value)
                            }
                          }
                        }))}
                      />
                      <TextField
                        fullWidth
                        type="number"
                        label="Requests per Hour"
                        value={connectionData.configuration?.rate_limits.requests_per_hour}
                        onChange={(e) => setConnectionData(prev => ({
                          ...prev,
                          configuration: {
                            ...prev.configuration!,
                            rate_limits: {
                              ...prev.configuration!.rate_limits,
                              requests_per_hour: parseInt(e.target.value)
                            }
                          }
                        }))}
                      />
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConnectionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConnectionSubmit} variant="contained" color="primary">
            {selectedConnection ? 'Update Connection' : 'Create Connection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarketplaceConnectionManagement;