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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Download, TrendingUp, TrendingDown, AccountBalance, Receipt, Payment } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchFinancialReports, generateFinancialReport } from '../../store/slices/paymentSlice';
import { FinancialReport } from '../../types';

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

const FinancialReports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { financialReports, loading, error } = useSelector((state: RootState) => state.payments);

  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');

  useEffect(() => {
    dispatch(fetchFinancialReports());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) return;

    try {
      await dispatch(generateFinancialReport({
        reportType,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      })).unwrap();
      dispatch(fetchFinancialReports());
    } catch (error) {
      console.error('Failed to generate financial report:', error);
    }
  };

  const handleExportReport = async (reportId: number, format: 'pdf' | 'excel' | 'csv' = 'pdf') => {
    try {
      // This would trigger a download
      console.log(`Exporting financial report ${reportId} as ${format}`);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading && financialReports.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Financial Reports & Analytics
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Reports List" />
          <Tab label="Generate Report" />
          <Tab label="Analytics Dashboard" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Type</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Total Revenue</TableCell>
                  <TableCell>Total Payments</TableCell>
                  <TableCell>Refunds</TableCell>
                  <TableCell>Fees</TableCell>
                  <TableCell>Net Revenue</TableCell>
                  <TableCell>Generated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {financialReports.map((report: FinancialReport) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Chip
                        label={report.report_type}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(report.period_start).toLocaleDateString()} - {new Date(report.period_end).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{formatCurrency(report.total_revenue)}</TableCell>
                    <TableCell>{formatCurrency(report.total_payments)}</TableCell>
                    <TableCell color="error.main">{formatCurrency(report.total_refunds)}</TableCell>
                    <TableCell color="warning.main">{formatCurrency(report.total_fees)}</TableCell>
                    <TableCell fontWeight="bold" color={report.net_revenue >= 0 ? 'success.main' : 'error.main'}>
                      {formatCurrency(report.net_revenue)}
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
                      <Tooltip title="Export PDF">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleExportReport(report.id, 'pdf')}
                        >
                          <Download />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleGenerateReport}
                  disabled={!startDate || !endDate}
                  sx={{ height: '56px' }}
                >
                  Generate {reportType} Report
                </Button>
              </Grid>
            </Grid>

            <Box display="flex" gap={2} flexWrap="wrap">
              {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as const).map((type) => (
                <Chip
                  key={type}
                  label={type.charAt(0).toUpperCase() + type.slice(1)}
                  onClick={() => setReportType(type)}
                  color={reportType === type ? 'primary' : 'default'}
                  variant={reportType === type ? 'filled' : 'outlined'}
                  clickable
                />
              ))}
            </Box>

            <Alert severity="info">
              Generate comprehensive financial reports including revenue analysis, payment gateway performance, and transaction breakdowns.
            </Alert>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {/* Summary Cards */}
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AccountBalance color="primary" />
                    <Typography color="textSecondary" gutterBottom>
                      Total Revenue
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(financialReports.reduce((acc, report) => acc + report.total_revenue, 0))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Payment color="secondary" />
                    <Typography color="textSecondary" gutterBottom>
                      Total Payments
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {formatCurrency(financialReports.reduce((acc, report) => acc + report.total_payments, 0))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Receipt color="error" />
                    <Typography color="textSecondary" gutterBottom>
                      Total Refunds
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="error.main">
                    {formatCurrency(financialReports.reduce((acc, report) => acc + report.total_refunds, 0))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingUp color="warning" />
                    <Typography color="textSecondary" gutterBottom>
                      Net Revenue
                    </Typography>
                  </Box>
                  <Typography variant="h4" color="primary.main">
                    {formatCurrency(financialReports.reduce((acc, report) => acc + report.net_revenue, 0))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Gateway Performance */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Gateway Performance
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Gateway</TableCell>
                          <TableCell>Transactions</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Fees</TableCell>
                          <TableCell>Success Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {financialReports.length > 0 && financialReports[0].breakdown_by_gateway?.map((gateway, index) => (
                          <TableRow key={index}>
                            <TableCell>{gateway.gateway}</TableCell>
                            <TableCell>{gateway.transactions}</TableCell>
                            <TableCell>{formatCurrency(gateway.amount)}</TableCell>
                            <TableCell>{formatCurrency(gateway.fees)}</TableCell>
                            <TableCell>
                              <Chip
                                label={`${gateway.success_rate.toFixed(1)}%`}
                                color={gateway.success_rate >= 95 ? 'success' : gateway.success_rate >= 90 ? 'warning' : 'error'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default FinancialReports;