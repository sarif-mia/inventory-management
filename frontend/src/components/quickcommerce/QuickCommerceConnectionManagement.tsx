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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as TestIcon,
  CheckCircle as ActiveIcon,
  Error as ErrorIcon,
  Pause as InactiveIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuickCommerceConnections,
  createQuickCommerceConnection,
  updateQuickCommerceConnection,
  testQuickCommerceConnection,
} from '../../store/slices/quickCommerceSlice';
import { QuickCommerceConnection, QuickCommerceFilters } from '../../types';
import { RootState } from '../../store';

const QuickCommerceConnectionManagement: React.FC = () => {
  const dispatch = useDispatch();
  const { connections, loading, error } = useSelector((state: RootState) => state.quickCommerce);

  const [open, setOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<QuickCommerceConnection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'blinkit' as const,
    api_key: '',
    api_secret: '',
    access_token: '',
    refresh_token: '',
    store_url: '',
    status: 'active' as const,
  });
  const [testingConnection, setTestingConnection] = useState<number | null>(null);
  const [filters, setFilters] = useState<QuickCommerceFilters>({});

  useEffect(() => {
    dispatch(fetchQuickCommerceConnections(filters));
  }, [dispatch, filters]);

  const handleOpenDialog = (connection?: QuickCommerceConnection) => {
    if (connection) {
      setEditingConnection(connection);
      setFormData({
        name: connection.name,
        platform: connection.platform,
        api_key: connection.api_key || '',
        api_secret: connection.api_secret || '',
        access_token: connection.access_token || '',
        refresh_token: connection.refresh_token || '',
        store_url: connection.store_url || '',
        status: connection.status,
      });
    } else {
      setEditingConnection(null);
      setFormData({
        name: '',
        platform: 'blinkit',
        api_key: '',
        api_secret: '',
        access_token: '',
        refresh_token: '',
        store_url: '',
        status: 'active',
      });
    }
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setEditingConnection(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingConnection) {
        await dispatch(updateQuickCommerceConnection({
          id: editingConnection.id,
          data: formData
        }));
      } else {
        await dispatch(createQuickCommerceConnection(formData));
      }
      handleCloseDialog();
      dispatch(fetchQuickCommerceConnections(filters));
    } catch (error) {
      console.error('Failed to save connection:', error);
    }
  };

  const handleTestConnection = async (connectionId: number) => {
    setTestingConnection(connectionId);
    try {
      await dispatch(testQuickCommerceConnection(connectionId));
    } catch (error) {
      console.error('Failed to test connection:', error);
    } finally {
      setTestingConnection(null);
    }
  };

  const handleDeleteConnection = async (connectionId: number) => {
    if (window.confirm('Are you sure you want to delete this connection?')) {
      try {
        // Note: Delete functionality would need to be added to the slice
        dispatch(fetchQuickCommerceConnections(filters));
      } catch (error) {
        console.error('Failed to delete connection:', error);
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <ActiveIcon color="success" />;
      case 'inactive':
        return <InactiveIcon color="disabled" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InactiveIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Quick Commerce Connections
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Connection
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Platform</InputLabel>
          <Select
            value={filters.platform || ''}
            label="Platform"
            onChange={(e) => setFilters({ ...filters, platform: e.target.value || undefined })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="blinkit">Blinkit</MenuItem>
            <MenuItem value="swiggy_instamart">Swiggy Instamart</MenuItem>
            <MenuItem value="zepto">Zepto</MenuItem>
            <MenuItem value="bigbasket">BigBasket</MenuItem>
            <MenuItem value="custom">Custom</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || ''}
            label="Status"
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="error">Error</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : connections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No connections found
                </TableCell>
              </TableRow>
            ) : (
              connections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell>{connection.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={connection.platform.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(connection.status)}
                      <Chip
                        label={connection.status.toUpperCase()}
                        size="small"
                        color={getStatusColor(connection.status) as any}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    {connection.last_sync
                      ? new Date(connection.last_sync).toLocaleString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Test Connection">
                      <IconButton
                        onClick={() => handleTestConnection(connection.id)}
                        disabled={testingConnection === connection.id}
                      >
                        {testingConnection === connection.id ? (
                          <CircularProgress size={20} />
                        ) : (
                          <TestIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpenDialog(connection)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        onClick={() => handleDeleteConnection(connection.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingConnection ? 'Edit Connection' : 'Add New Connection'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Connection Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Platform</InputLabel>
              <Select
                value={formData.platform}
                label="Platform"
                onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
              >
                <MenuItem value="blinkit">Blinkit</MenuItem>
                <MenuItem value="swiggy_instamart">Swiggy Instamart</MenuItem>
                <MenuItem value="zepto">Zepto</MenuItem>
                <MenuItem value="bigbasket">BigBasket</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="API Key"
              value={formData.api_key}
              onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
              fullWidth
              type="password"
            />

            <TextField
              label="API Secret"
              value={formData.api_secret}
              onChange={(e) => setFormData({ ...formData, api_secret: e.target.value })}
              fullWidth
              type="password"
            />

            <TextField
              label="Access Token"
              value={formData.access_token}
              onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
              fullWidth
              type="password"
            />

            <TextField
              label="Refresh Token"
              value={formData.refresh_token}
              onChange={(e) => setFormData({ ...formData, refresh_token: e.target.value })}
              fullWidth
              type="password"
            />

            <TextField
              label="Store URL"
              value={formData.store_url}
              onChange={(e) => setFormData({ ...formData, store_url: e.target.value })}
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingConnection ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuickCommerceConnectionManagement;