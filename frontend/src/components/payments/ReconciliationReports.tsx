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
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Download, Visibility, Refresh } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchReconciliationReports, generateReconciliationReport } from '../../store/slices/paymentSlice';
import { ReconciliationReport } from '../../types';

const ReconciliationReports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { reports, loading, error } = useSelector((state: RootState) => state.payments);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchReconciliationReports());
  }, [dispatch]);

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) return;

    try {
      await dispatch(generateReconciliationReport({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })).unwrap();
      setGenerateDialogOpen(false);
      setStartDate(null);
      setEndDate(null);
      dispatch(fetchReconciliationReports());
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleExportReport = async (reportId: number, format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
    try {
      // This would trigger a download
      console.log(`Exporting report ${reportId} as ${format}`);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const getStatusColor = (totalDiscrepancy: number) => {
    if (totalDiscrepancy === 0) return 'success';
    if (totalDiscrepancy < 100) return 'warning';
    return 'error';
  };

  const calculateSuccessRate = (matched: number, total: number) => {
    return total > 0 ? ((matched / total) * 100).toFixed(1) : '0.0';
  };

  if (loading && reports.length === 0) {
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
          Reconciliation Reports
        </Typography>
        <Button
          variant="contained"
          onClick={() => setGenerateDialogOpen(true)}
        >
          Generate New Report
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Reports
              </Typography>
              <Typography variant="h4">
                {reports.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Match Rate
              </Typography>
              <Typography variant="h4" color="success.main">
                {reports.length > 0
                  ? (reports.reduce((acc, report) =>
                      acc + (report.matched_transactions / report.total_transactions * 100), 0) / reports.length).toFixed(1)
                  : '0.0'}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Discrepancies
              </Typography>
              <Typography variant="h4" color="warning.main">
                {reports.reduce((acc, report) => acc + report.discrepancy_transactions, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Discrepancy Amount
              </Typography>
              <Typography variant="h4" color="error.main">
                ${reports.reduce((acc, report) => acc + report.total_discrepancy_amount, 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reports Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Report Period</TableCell>
              <TableCell>Total Transactions</TableCell>
              <TableCell>Matched</TableCell>
              <TableCell>Discrepancies</TableCell>
              <TableCell>Discrepancy Amount</TableCell>
              <TableCell>Match Rate</TableCell>
              <TableCell>Generated</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report: ReconciliationReport) => (
              <TableRow key={report.id} hover>
                <TableCell>
                  {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                </TableCell>
                <TableCell>{report.total_transactions}</TableCell>
                <TableCell>
                  <Typography color="success.main" fontWeight="bold">
                    {report.matched_transactions}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography color={report.discrepancy_transactions > 0 ? 'warning.main' : 'success.main'} fontWeight="bold">
                    {report.discrepancy_transactions}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography color={report.total_discrepancy_amount > 0 ? 'error.main' : 'success.main'} fontWeight="bold">
                    ${report.total_discrepancy_amount.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${calculateSuccessRate(report.matched_transactions, report.total_transactions)}%`}
                    color={getStatusColor(report.total_discrepancy_amount)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      {new Date(report.generated_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      by User {report.generated_by}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="View Details">
                      <IconButton size="small" color="primary">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export PDF">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleExportReport(report.id, 'pdf')}
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Generate Report Dialog */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Reconciliation Report</DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <Alert severity="info">
              This will generate a reconciliation report for the selected date range, analyzing all payment transactions and identifying any discrepancies.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateReport}
            variant="contained"
            color="primary"
            disabled={!startDate || !endDate}
          >
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReconciliationReports;