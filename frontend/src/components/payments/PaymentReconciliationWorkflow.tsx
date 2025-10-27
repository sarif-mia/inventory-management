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
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { CheckCircle, Cancel, Warning, Info, Refresh } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchReconciliationRecords, reconcilePayment, fetchPaymentTransactions } from '../../store/slices/paymentSlice';
import { ReconciliationRecord, PaymentTransaction, ReconciliationFilters } from '../../types';

const PaymentReconciliationWorkflow: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { reconciliationRecords, transactions, loading, error } = useSelector((state: RootState) => state.payments);

  const [selectedRecord, setSelectedRecord] = useState<ReconciliationRecord | null>(null);
  const [reconcileDialogOpen, setReconcileDialogOpen] = useState(false);
  const [reconciliationData, setReconciliationData] = useState({
    status: 'matched',
    notes: '',
  });
  const [filters, setFilters] = useState<ReconciliationFilters>({});

  useEffect(() => {
    dispatch(fetchReconciliationRecords(filters));
    dispatch(fetchPaymentTransactions());
  }, [dispatch, filters]);

  const handleReconcile = (record: ReconciliationRecord) => {
    setSelectedRecord(record);
    setReconciliationData({
      status: record.status,
      notes: record.notes || '',
    });
    setReconcileDialogOpen(true);
  };

  const handleReconcileSubmit = async () => {
    if (!selectedRecord) return;

    try {
      await dispatch(reconcilePayment({
        paymentId: selectedRecord.payment_transaction,
        reconciliationData: {
          status: reconciliationData.status as any,
          notes: reconciliationData.notes,
        },
      })).unwrap();
      setReconcileDialogOpen(false);
      setSelectedRecord(null);
      dispatch(fetchReconciliationRecords(filters));
    } catch (error) {
      console.error('Failed to reconcile payment:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'matched': return 'success';
      case 'discrepancy': return 'warning';
      case 'resolved': return 'info';
      case 'escalated': return 'error';
      default: return 'default';
    }
  };

  const getDiscrepancySeverity = (amount: number) => {
    if (amount === 0) return 'none';
    if (Math.abs(amount) < 10) return 'low';
    if (Math.abs(amount) < 100) return 'medium';
    return 'high';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'warning';
      case 'medium': return 'orange';
      case 'high': return 'error';
      default: return 'default';
    }
  };

  const pendingRecords = reconciliationRecords.filter(r => r.status === 'discrepancy');
  const matchedRecords = reconciliationRecords.filter(r => r.status === 'matched');
  const resolvedRecords = reconciliationRecords.filter(r => r.status === 'resolved');

  if (loading && reconciliationRecords.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Payment Reconciliation Workflow
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Reconciliation
              </Typography>
              <Typography variant="h4" color="warning.main">
                {pendingRecords.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Matched Payments
              </Typography>
              <Typography variant="h4" color="success.main">
                {matchedRecords.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Resolved Issues
              </Typography>
              <Typography variant="h4" color="info.main">
                {resolvedRecords.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filters.status || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            label="Status"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="matched">Matched</MenuItem>
            <MenuItem value="discrepancy">Discrepancy</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="escalated">Escalated</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Min Discrepancy"
          type="number"
          variant="outlined"
          size="small"
          value={filters.min_discrepancy || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, min_discrepancy: parseFloat(e.target.value) || undefined }))}
        />

        <TextField
          label="Max Discrepancy"
          type="number"
          variant="outlined"
          size="small"
          value={filters.max_discrepancy || ''}
          onChange={(e) => setFilters(prev => ({ ...prev, max_discrepancy: parseFloat(e.target.value) || undefined }))}
        />

        <Button variant="outlined" startIcon={<Refresh />} onClick={() => dispatch(fetchReconciliationRecords(filters))}>
          Refresh
        </Button>
      </Box>

      {/* Reconciliation Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Payment ID</TableCell>
              <TableCell>Order Amount</TableCell>
              <TableCell>Payment Amount</TableCell>
              <TableCell>Discrepancy</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Reconciled By</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reconciliationRecords.map((record: ReconciliationRecord) => {
              const severity = getDiscrepancySeverity(record.discrepancy_amount);
              return (
                <TableRow key={record.id} hover>
                  <TableCell>#{record.payment_transaction}</TableCell>
                  <TableCell>${record.order_amount.toFixed(2)}</TableCell>
                  <TableCell>${record.payment_amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        color={record.discrepancy_amount !== 0 ? 'error' : 'success'}
                        fontWeight="bold"
                      >
                        ${record.discrepancy_amount.toFixed(2)}
                      </Typography>
                      {severity !== 'none' && (
                        <Chip
                          label={severity.toUpperCase()}
                          color={getSeverityColor(severity)}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      color={getStatusColor(record.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{record.discrepancy_reason || 'N/A'}</TableCell>
                  <TableCell>
                    {record.reconciled_by ? `User ${record.reconciled_by}` : 'Auto'}
                  </TableCell>
                  <TableCell>
                    {record.status === 'discrepancy' && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => handleReconcile(record)}
                      >
                        Reconcile
                      </Button>
                    )}
                    {record.status === 'matched' && (
                      <Tooltip title="Payment matched successfully">
                        <IconButton size="small" color="success">
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                    )}
                    {record.status === 'escalated' && (
                      <Tooltip title="Issue escalated for review">
                        <IconButton size="small" color="warning">
                          <Warning />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Reconciliation Dialog */}
      <Dialog open={reconcileDialogOpen} onClose={() => setReconcileDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Reconcile Payment</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box mt={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Order Amount"
                    value={`$${selectedRecord.order_amount.toFixed(2)}`}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Payment Amount"
                    value={`$${selectedRecord.payment_amount.toFixed(2)}`}
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Discrepancy"
                    value={`$${selectedRecord.discrepancy_amount.toFixed(2)}`}
                    InputProps={{ readOnly: true }}
                    color={selectedRecord.discrepancy_amount !== 0 ? 'error' : 'success'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={reconciliationData.status}
                      onChange={(e) => setReconciliationData(prev => ({ ...prev, status: e.target.value }))}
                      label="Status"
                    >
                      <MenuItem value="matched">Matched</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                      <MenuItem value="escalated">Escalate</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes"
                    value={reconciliationData.notes}
                    onChange={(e) => setReconciliationData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add reconciliation notes..."
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReconcileDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReconcileSubmit} variant="contained" color="primary">
            Reconcile Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentReconciliationWorkflow;