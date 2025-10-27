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
  TextField,
  Button,
  Chip,
  TablePagination,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { History, Refresh } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchPaymentHistory } from '../../store/slices/paymentSlice';
import { PaymentHistory } from '../../types';

const PaymentHistoryComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { history, loading, error } = useSelector((state: RootState) => state.payments);

  const [paymentId, setPaymentId] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (paymentId) {
      dispatch(fetchPaymentHistory(parseInt(paymentId)));
    }
  }, [dispatch, paymentId]);

  const handleSearch = () => {
    if (paymentId) {
      dispatch(fetchPaymentHistory(parseInt(paymentId)));
      setPage(0);
    }
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created': return 'success';
      case 'updated': return 'info';
      case 'status_changed': return 'warning';
      case 'refunded': return 'error';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading && history.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Payment History & Audit Trail
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Box display="flex" gap={2} mb={3} alignItems="center">
        <TextField
          label="Payment Transaction ID"
          variant="outlined"
          size="small"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          type="number"
        />
        <Button variant="contained" onClick={handleSearch} disabled={!paymentId}>
          Search History
        </Button>
        <Tooltip title="Refresh">
          <IconButton onClick={handleSearch} disabled={!paymentId}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {!paymentId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Enter a Payment Transaction ID to view its history and audit trail.
        </Alert>
      )}

      {paymentId && history.length === 0 && !loading && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No history found for Payment Transaction #{paymentId}
        </Alert>
      )}

      {/* History Table */}
      {history.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Old Value</TableCell>
                  <TableCell>New Value</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((entry: PaymentHistory) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={formatAction(entry.action)}
                          color={getActionColor(entry.action)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>User {entry.user}</TableCell>
                      <TableCell>
                        {entry.old_value ? (
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {entry.old_value}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="textSecondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.new_value ? (
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {entry.new_value}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="textSecondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.notes ? (
                          <Typography variant="body2">
                            {entry.notes}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="textSecondary">-</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={history.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
      )}

      {/* Summary */}
      {history.length > 0 && (
        <Box mt={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              History Summary
            </Typography>
            <Box display="flex" gap={3} flexWrap="wrap">
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Total Events
                </Typography>
                <Typography variant="h6">
                  {history.length}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  First Event
                </Typography>
                <Typography variant="body2">
                  {new Date(Math.min(...history.map(h => new Date(h.timestamp).getTime()))).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Latest Event
                </Typography>
                <Typography variant="body2">
                  {new Date(Math.max(...history.map(h => new Date(h.timestamp).getTime()))).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Unique Users
                </Typography>
                <Typography variant="h6">
                  {new Set(history.map(h => h.user)).size}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default PaymentHistoryComponent;