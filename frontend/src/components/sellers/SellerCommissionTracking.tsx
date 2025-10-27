import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  CheckCircle as PaidIcon,
  Pending as PendingIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerCommissions } from '../../store/slices/sellerSlice';
import { SellerCommission } from '../../types';
import { RootState } from '../../store';

interface SellerCommissionTrackingProps {
  sellerId: number;
}

const SellerCommissionTracking: React.FC<SellerCommissionTrackingProps> = ({ sellerId }) => {
  const dispatch = useDispatch();
  const { sellerCommissions, loading, error } = useSelector((state: RootState) => state.sellers);

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (sellerId) {
      dispatch(fetchSellerCommissions(sellerId));
    }
  }, [sellerId, dispatch]);

  const filteredCommissions = sellerCommissions.filter(commission => {
    const matchesSearch = commission.order.toString().includes(searchTerm) ||
                         commission.commission_amount.toString().includes(searchTerm);
    const matchesDate = !dateFilter || commission.created_at.startsWith(dateFilter);
    return matchesSearch && matchesDate;
  });

  const totalEarned = sellerCommissions
    .filter(c => c.paid)
    .reduce((sum, c) => sum + c.commission_amount, 0);

  const totalPending = sellerCommissions
    .filter(c => !c.paid)
    .reduce((sum, c) => sum + c.commission_amount, 0);

  const paidCommissions = sellerCommissions.filter(c => c.paid).length;
  const pendingCommissions = sellerCommissions.filter(c => !c.paid).length;

  const handleExport = () => {
    // In a real app, this would call an API to export data
    const csvContent = [
      ['Order ID', 'Commission Amount', 'Paid', 'Paid Date', 'Created Date'],
      ...filteredCommissions.map(c => [
        c.order.toString(),
        c.commission_amount.toString(),
        c.paid ? 'Yes' : 'No',
        c.paid_at || '',
        c.created_at
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seller-commissions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Commission Tracking
        </Typography>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={filteredCommissions.length === 0}
        >
          Export CSV
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="success.main">
                    ${totalEarned.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Earned
                  </Typography>
                </Box>
                <MoneyIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="warning.main">
                    ${totalPending.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Payment
                  </Typography>
                </Box>
                <PendingIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="info.main">
                    {paidCommissions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paid Commissions
                  </Typography>
                </Box>
                <PaidIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="error.main">
                    {pendingCommissions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Commissions
                  </Typography>
                </Box>
                <PendingIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by order ID or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="month"
              label="Filter by month"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Commissions Table */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Commission Rate</TableCell>
                <TableCell align="right">Commission Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Paid Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCommissions.map((commission) => (
                <TableRow key={commission.id} hover>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      #{commission.order}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {commission.commission_rate}%
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      ${commission.commission_amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={commission.paid ? <PaidIcon /> : <PendingIcon />}
                      label={commission.paid ? 'Paid' : 'Pending'}
                      color={commission.paid ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(commission.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {commission.paid_at ? new Date(commission.paid_at).toLocaleDateString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredCommissions.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm || dateFilter ? 'No commissions found matching your filters.' : 'No commission records found.'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Summary Footer */}
      {filteredCommissions.length > 0 && (
        <Paper sx={{ p: 3, mt: 3, bgcolor: 'grey.50' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Filtered Results Summary
              </Typography>
              <Typography variant="body2">
                Total Commissions: {filteredCommissions.length}
              </Typography>
              <Typography variant="body2">
                Paid: {filteredCommissions.filter(c => c.paid).length}
              </Typography>
              <Typography variant="body2">
                Pending: {filteredCommissions.filter(c => !c.paid).length}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Amount Summary
              </Typography>
              <Typography variant="body2">
                Total Earned: ${filteredCommissions.filter(c => c.paid).reduce((sum, c) => sum + c.commission_amount, 0).toFixed(2)}
              </Typography>
              <Typography variant="body2">
                Total Pending: ${filteredCommissions.filter(c => !c.paid).reduce((sum, c) => sum + c.commission_amount, 0).toFixed(2)}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                Grand Total: ${(filteredCommissions.reduce((sum, c) => sum + c.commission_amount, 0)).toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default SellerCommissionTracking;