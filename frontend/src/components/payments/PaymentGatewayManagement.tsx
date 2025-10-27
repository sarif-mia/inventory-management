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
} from '@mui/material';
import { Edit, Delete, Add, Wifi, WifiOff, Settings } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchPaymentGateways, updatePaymentGateway, testPaymentGatewayConnection } from '../../store/slices/paymentSlice';
import { PaymentGateway } from '../../types';

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

const PaymentGatewayManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { gateways, loading, error } = useSelector((state: RootState) => state.payments);

  const [tabValue, setTabValue] = useState(0);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [gatewayDialogOpen, setGatewayDialogOpen] = useState(false);
  const [gatewayData, setGatewayData] = useState<Partial<PaymentGateway>>({
    name: '',
    code: '',
    is_active: true,
    supported_currencies: ['USD'],
    supported_methods: ['credit_card'],
    configuration: {
      base_url: '',
      timeout: 30,
      retry_attempts: 3,
    },
  });

  useEffect(() => {
    dispatch(fetchPaymentGateways());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateGateway = () => {
    setSelectedGateway(null);
    setGatewayData({
      name: '',
      code: '',
      is_active: true,
      supported_currencies: ['USD'],
      supported_methods: ['credit_card'],
      configuration: {
        base_url: '',
        timeout: 30,
        retry_attempts: 3,
      },
    });
    setGatewayDialogOpen(true);
  };

  const handleEditGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setGatewayData({ ...gateway });
    setGatewayDialogOpen(true);
  };

  const handleGatewaySubmit = async () => {
    try {
      if (selectedGateway) {
        await dispatch(updatePaymentGateway({ gatewayId: selectedGateway.id, data: gatewayData })).unwrap();
      } else {
        // Create new gateway - would need to add create action
        console.log('Create gateway:', gatewayData);
      }
      setGatewayDialogOpen(false);
      setSelectedGateway(null);
      dispatch(fetchPaymentGateways());
    } catch (error) {
      console.error('Failed to save gateway:', error);
    }
  };

  const handleTestConnection = async (gatewayId: number) => {
    try {
      const result = await dispatch(testPaymentGatewayConnection(gatewayId)).unwrap();
      // Show success/error message
      console.log('Connection test result:', result);
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };

  const handleToggleActive = async (gateway: PaymentGateway) => {
    try {
      await dispatch(updatePaymentGateway({
        gatewayId: gateway.id,
        data: { is_active: !gateway.is_active }
      })).unwrap();
    } catch (error) {
      console.error('Failed to toggle gateway status:', error);
    }
  };

  const getGatewayStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  if (loading && gateways.length === 0) {
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
          Payment Gateway Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateGateway}
        >
          Add Gateway
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Gateway List" />
          <Tab label="Configuration" />
          <Tab label="Analytics" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Supported Currencies</TableCell>
                  <TableCell>Supported Methods</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gateways.map((gateway: PaymentGateway) => (
                  <TableRow key={gateway.id} hover>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {gateway.is_active ? <Wifi color="success" /> : <WifiOff color="error" />}
                        <Typography fontWeight="bold">{gateway.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{gateway.code}</TableCell>
                    <TableCell>
                      <Chip
                        label={gateway.is_active ? 'Active' : 'Inactive'}
                        color={getGatewayStatusColor(gateway.is_active)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {gateway.supported_currencies.join(', ')}
                    </TableCell>
                    <TableCell>
                      {gateway.supported_methods.map(method => method.replace('_', ' ')).join(', ')}
                    </TableCell>
                    <TableCell>{new Date(gateway.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Test Connection">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleTestConnection(gateway.id)}
                          >
                            <Wifi />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditGateway(gateway)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Toggle Active">
                          <Switch
                            size="small"
                            checked={gateway.is_active}
                            onChange={() => handleToggleActive(gateway)}
                          />
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
            Gateway Configuration
          </Typography>
          <Grid container spacing={3}>
            {gateways.map((gateway: PaymentGateway) => (
              <Grid item xs={12} md={6} key={gateway.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {gateway.name} Configuration
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <TextField
                        label="Base URL"
                        value={gateway.configuration.base_url}
                        InputProps={{ readOnly: true }}
                        size="small"
                      />
                      <TextField
                        label="Timeout (seconds)"
                        value={gateway.configuration.timeout}
                        InputProps={{ readOnly: true }}
                        size="small"
                      />
                      <TextField
                        label="Retry Attempts"
                        value={gateway.configuration.retry_attempts}
                        InputProps={{ readOnly: true }}
                        size="small"
                      />
                      <Button
                        variant="outlined"
                        startIcon={<Settings />}
                        onClick={() => handleEditGateway(gateway)}
                      >
                        Edit Configuration
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Gateway Analytics
          </Typography>
          <Grid container spacing={3}>
            {gateways.map((gateway: PaymentGateway) => (
              <Grid item xs={12} md={4} key={gateway.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {gateway.name}
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      <Typography variant="body2" color="textSecondary">
                        Status: <Chip label={gateway.is_active ? 'Active' : 'Inactive'} size="small" color={getGatewayStatusColor(gateway.is_active)} />
                      </Typography>
                      <Typography variant="body2">
                        Supported Currencies: {gateway.supported_currencies.length}
                      </Typography>
                      <Typography variant="body2">
                        Supported Methods: {gateway.supported_methods.length}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Last Updated: {new Date(gateway.updated_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Paper>

      {/* Gateway Dialog */}
      <Dialog open={gatewayDialogOpen} onClose={() => setGatewayDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedGateway ? 'Edit Payment Gateway' : 'Add Payment Gateway'}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Gateway Name"
                  value={gatewayData.name}
                  onChange={(e) => setGatewayData(prev => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Gateway Code"
                  value={gatewayData.code}
                  onChange={(e) => setGatewayData(prev => ({ ...prev, code: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={gatewayData.is_active}
                      onChange={(e) => setGatewayData(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                  }
                  label="Active"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Base URL"
                  value={gatewayData.configuration?.base_url}
                  onChange={(e) => setGatewayData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration!, base_url: e.target.value }
                  }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Timeout (seconds)"
                  value={gatewayData.configuration?.timeout}
                  onChange={(e) => setGatewayData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration!, timeout: parseInt(e.target.value) }
                  }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Retry Attempts"
                  value={gatewayData.configuration?.retry_attempts}
                  onChange={(e) => setGatewayData(prev => ({
                    ...prev,
                    configuration: { ...prev.configuration!, retry_attempts: parseInt(e.target.value) }
                  }))}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGatewayDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleGatewaySubmit} variant="contained" color="primary">
            {selectedGateway ? 'Update Gateway' : 'Create Gateway'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentGatewayManagement;