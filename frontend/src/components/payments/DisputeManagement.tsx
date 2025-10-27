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
import { Edit, CheckCircle, Cancel, AttachFile, Refresh } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchDisputes, resolveDispute } from '../../store/slices/paymentSlice';
import { Dispute, DisputeFilters } from '../../types';

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

const DisputeManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { disputes, loading, error } = useSelector((state: RootState) => state.payments);

  const [tabValue, setTabValue] = useState(0);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolution, setResolution] = useState('');
  const [filters, setFilters] = useState<DisputeFilters>({});

  useEffect(() => {
    dispatch(fetchDisputes(filters));
  }, [dispatch, filters]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleResolveDispute = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setResolution('');
    setResolveDialogOpen(true);
  };

  const handleResolveSubmit = async () => {
    if (!selectedDispute) return;

    try {
      await dispatch(resolveDispute({
        disputeId: selectedDispute.id,
        resolution,
      })).unwrap();
      setResolveDialogOpen(false);
      setSelectedDispute(null);
      setResolution('');
      dispatch(fetchDisputes(filters));
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'investigating': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getSeverityColor = (amount: number) => {
    if (amount < 50) return 'warning';
    if (amount < 200) return 'orange';
    return 'error';
  };

  const openDisputes = disputes.filter(d => d.status === 'open');
  const investigatingDisputes = disputes.filter(d => d.status === 'investigating');
  const resolvedDisputes = disputes.filter(d => d.status === 'resolved');

  if (loading && disputes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Dispute Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="All Disputes" />
          <Tab label="Open Disputes" />
          <Tab label="Investigation" />
          <Tab label="Resolved" />
        </Tabs>

        {/* Summary Cards */}
        <Box p={3} borderBottom={1} borderColor="divider">
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Open Disputes
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {openDisputes.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Under Investigation
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {investigatingDisputes.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Resolved
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {resolvedDisputes.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Amount in Dispute
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    ${openDisputes.reduce((acc, dispute) => acc + dispute.amount, 0).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Filters */}
        <Box p={3} borderBottom={1} borderColor="divider">
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="investigating">Investigating</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Reason</InputLabel>
                <Select
                  value={filters.reason || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, reason: e.target.value }))}
                  label="Reason"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="unauthorized_charge">Unauthorized Charge</MenuItem>
                  <MenuItem value="duplicate_charge">Duplicate Charge</MenuItem>
                  <MenuItem value="product_not_received">Product Not Received</MenuItem>
                  <MenuItem value="product_defective">Product Defective</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Min Amount"
                type="number"
                size="small"
                value={filters.min_amount || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, min_amount: parseFloat(e.target.value) || undefined }))}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => dispatch(fetchDisputes(filters))}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <DisputeTable
            disputes={disputes}
            onResolve={handleResolveDispute}
            getStatusColor={getStatusColor}
            getSeverityColor={getSeverityColor}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DisputeTable
            disputes={openDisputes}
            onResolve={handleResolveDispute}
            getStatusColor={getStatusColor}
            getSeverityColor={getSeverityColor}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <DisputeTable
            disputes={investigatingDisputes}
            onResolve={handleResolveDispute}
            getStatusColor={getStatusColor}
            getSeverityColor={getSeverityColor}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <DisputeTable
            disputes={resolvedDisputes}
            onResolve={handleResolveDispute}
            getStatusColor={getStatusColor}
            getSeverityColor={getSeverityColor}
          />
        </TabPanel>
      </Paper>

      {/* Resolve Dispute Dialog */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Resolve Dispute</DialogTitle>
        <DialogContent>
          {selectedDispute && (
            <Box mt={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Dispute Amount"
                    value={`$${selectedDispute.amount.toFixed(2)}`}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Reason"
                    value={selectedDispute.reason}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={selectedDispute.description}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Resolution"
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Describe how this dispute was resolved..."
                    required
                  />
                </Grid>
                {selectedDispute.evidence.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Evidence Files
                    </Typography>
                    {selectedDispute.evidence.map((evidence, index) => (
                      <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
                        <AttachFile />
                        <Typography>{evidence.file_name}</Typography>
                      </Box>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleResolveSubmit}
            variant="contained"
            color="primary"
            disabled={!resolution.trim()}
          >
            Resolve Dispute
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface DisputeTableProps {
  disputes: Dispute[];
  onResolve: (dispute: Dispute) => void;
  getStatusColor: (status: string) => string;
  getSeverityColor: (amount: number) => string;
}

const DisputeTable: React.FC<DisputeTableProps> = ({ disputes, onResolve, getStatusColor, getSeverityColor }) => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Dispute ID</TableCell>
          <TableCell>Order ID</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Reason</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Created</TableCell>
          <TableCell>Evidence</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {disputes.map((dispute: Dispute) => (
          <TableRow key={dispute.id} hover>
            <TableCell>#{dispute.id}</TableCell>
            <TableCell>#{dispute.order}</TableCell>
            <TableCell>
              <Chip
                label={`$${dispute.amount.toFixed(2)}`}
                color={getSeverityColor(dispute.amount)}
                size="small"
                variant="outlined"
              />
            </TableCell>
            <TableCell>{dispute.reason.replace('_', ' ')}</TableCell>
            <TableCell>
              <Chip
                label={dispute.status}
                color={getStatusColor(dispute.status)}
                size="small"
              />
            </TableCell>
            <TableCell>{new Date(dispute.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              {dispute.evidence.length > 0 ? (
                <Tooltip title={`${dispute.evidence.length} files`}>
                  <IconButton size="small">
                    <AttachFile />
                  </IconButton>
                </Tooltip>
              ) : (
                <Typography variant="caption" color="textSecondary">None</Typography>
              )}
            </TableCell>
            <TableCell>
              {(dispute.status === 'open' || dispute.status === 'investigating') && (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => onResolve(dispute)}
                >
                  Resolve
                </Button>
              )}
              {dispute.status === 'resolved' && (
                <Tooltip title="Dispute resolved">
                  <IconButton size="small" color="success">
                    <CheckCircle />
                  </IconButton>
                </Tooltip>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default DisputeManagement;