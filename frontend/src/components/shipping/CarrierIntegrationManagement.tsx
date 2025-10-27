import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Switch,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as TestIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchCarriers, createCarrier, updateCarrier, deleteCarrier, testCarrierConnection } from '../../store/slices/shippingSlice';
import { Carrier, CarrierCreateRequest, CarrierUpdateRequest } from '../../types';

const CarrierIntegrationManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { carriers, loading, error } = useSelector((state: RootState) => state.shipping);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [formData, setFormData] = useState<CarrierCreateRequest>({
    name: '',
    code: '',
    configuration: {
      base_url: '',
      tracking_url_template: '',
      label_formats: ['pdf'],
      supported_services: [],
      rate_shopping_enabled: false,
    },
  });
  const [testResults, setTestResults] = useState<{ [key: number]: { success: boolean; message: string } }>({});

  useEffect(() => {
    dispatch(fetchCarriers());
  }, [dispatch]);

  const handleOpenDialog = (carrier?: Carrier) => {
    if (carrier) {
      setEditingCarrier(carrier);
      setFormData({
        name: carrier.name,
        code: carrier.code,
        api_key: carrier.api_key,
        api_secret: carrier.api_secret,
        configuration: carrier.configuration,
      });
    } else {
      setEditingCarrier(null);
      setFormData({
        name: '',
        code: '',
        configuration: {
          base_url: '',
          tracking_url_template: '',
          label_formats: ['pdf'],
          supported_services: [],
          rate_shopping_enabled: false,
        },
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCarrier(null);
    setFormData({
      name: '',
      code: '',
      configuration: {
        base_url: '',
        tracking_url_template: '',
        label_formats: ['pdf'],
        supported_services: [],
        rate_shopping_enabled: false,
      },
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingCarrier) {
        await dispatch(updateCarrier({ id: editingCarrier.id, data: formData })).unwrap();
      } else {
        await dispatch(createCarrier(formData)).unwrap();
      }
      handleCloseDialog();
      dispatch(fetchCarriers());
    } catch (error) {
      console.error('Failed to save carrier:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this carrier?')) {
      try {
        await dispatch(deleteCarrier(id)).unwrap();
        dispatch(fetchCarriers());
      } catch (error) {
        console.error('Failed to delete carrier:', error);
      }
    }
  };

  const handleTestConnection = async (carrier: Carrier) => {
    try {
      const result = await dispatch(testCarrierConnection(carrier.id)).unwrap();
      setTestResults(prev => ({
        ...prev,
        [carrier.id]: result,
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [carrier.id]: { success: false, message: 'Connection test failed' },
      }));
    }
  };

  const handleToggleActive = async (carrier: Carrier) => {
    try {
      await dispatch(updateCarrier({
        id: carrier.id,
        data: { is_active: !carrier.is_active }
      })).unwrap();
      dispatch(fetchCarriers());
    } catch (error) {
      console.error('Failed to toggle carrier status:', error);
    }
  };

  const handleConfigurationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [field]: value,
      },
    }));
  };

  if (loading && carriers.length === 0) {
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
          Carrier Integration Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Carrier
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Code</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>API Configured</TableCell>
              <TableCell>Test Connection</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {carriers.map((carrier: Carrier) => (
              <TableRow key={carrier.id} hover>
                <TableCell>{carrier.name}</TableCell>
                <TableCell>
                  <Chip label={carrier.code} size="small" />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={carrier.is_active}
                    onChange={() => handleToggleActive(carrier)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  {carrier.api_key && carrier.api_secret ? (
                    <Chip label="Configured" color="success" size="small" />
                  ) : (
                    <Chip label="Not Configured" color="warning" size="small" />
                  )}
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<TestIcon />}
                      onClick={() => handleTestConnection(carrier)}
                      disabled={loading}
                    >
                      Test
                    </Button>
                    {testResults[carrier.id] && (
                      testResults[carrier.id].success ? (
                        <SuccessIcon color="success" />
                      ) : (
                        <ErrorIcon color="error" />
                      )
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit Carrier">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(carrier)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Carrier">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(carrier.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Carrier Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCarrier ? 'Edit Carrier' : 'Add New Carrier'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Carrier Name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Carrier Code"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  required
                  helperText="Unique identifier for the carrier"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="API Key"
                  type="password"
                  value={formData.api_key || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="API Secret"
                  type="password"
                  value={formData.api_secret || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, api_secret: e.target.value }))}
                />
              </Grid>
            </Grid>

            <Accordion sx={{ mt: 3 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Advanced Configuration</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Base URL"
                      value={formData.configuration.base_url}
                      onChange={(e) => handleConfigurationChange('base_url', e.target.value)}
                      placeholder="https://api.carrier.com"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Tracking URL Template"
                      value={formData.configuration.tracking_url_template}
                      onChange={(e) => handleConfigurationChange('tracking_url_template', e.target.value)}
                      placeholder="https://track.carrier.com/{tracking_number}"
                      helperText="Use {tracking_number} as placeholder"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Label Formats</InputLabel>
                      <Select
                        multiple
                        value={formData.configuration.label_formats}
                        onChange={(e) => handleConfigurationChange('label_formats', e.target.value)}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                      >
                        <MenuItem value="pdf">PDF</MenuItem>
                        <MenuItem value="png">PNG</MenuItem>
                        <MenuItem value="zpl">ZPL</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Supported Services"
                      value={formData.configuration.supported_services.join(', ')}
                      onChange={(e) => handleConfigurationChange('supported_services', e.target.value.split(',').map(s => s.trim()))}
                      helperText="Comma-separated list of services"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center">
                      <Typography>Enable Rate Shopping</Typography>
                      <Switch
                        checked={formData.configuration.rate_shopping_enabled}
                        onChange={(e) => handleConfigurationChange('rate_shopping_enabled', e.target.checked)}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : (editingCarrier ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CarrierIntegrationManagement;