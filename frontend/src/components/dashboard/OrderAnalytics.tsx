import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Download } from '@mui/icons-material';
import { apiService } from '../../services/api';
import { OrderStatusDistribution, FulfillmentRate, CustomerInsight, DashboardFilters } from '../../types';
import * as XLSX from 'xlsx';

interface OrderAnalyticsProps {
  filters: DashboardFilters;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const OrderAnalytics: React.FC<OrderAnalyticsProps> = ({ filters }) => {
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusDistribution[]>([]);
  const [fulfillmentRates, setFulfillmentRates] = useState<FulfillmentRate[]>([]);
  const [customerInsights, setCustomerInsights] = useState<CustomerInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrderData();
  }, [filters]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statusResponse, fulfillmentResponse, customerResponse] = await Promise.all([
        apiService.getOrderStatusDistribution(),
        apiService.getFulfillmentRates(),
        apiService.getCustomerInsights(),
      ]);

      setOrderStatusData(statusResponse.data);
      setFulfillmentRates(fulfillmentResponse.data);
      setCustomerInsights(customerResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load order analytics data');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Order status distribution sheet
    const statusSheet = XLSX.utils.json_to_sheet(orderStatusData);
    XLSX.utils.book_append_sheet(workbook, statusSheet, 'Order Status');

    // Fulfillment rates sheet
    const fulfillmentSheet = XLSX.utils.json_to_sheet(fulfillmentRates);
    XLSX.utils.book_append_sheet(workbook, fulfillmentSheet, 'Fulfillment Rates');

    // Customer insights sheet
    const customerSheet = XLSX.utils.json_to_sheet(customerInsights);
    XLSX.utils.book_append_sheet(workbook, customerSheet, 'Customer Insights');

    XLSX.writeFile(workbook, 'order_analytics_report.xlsx');
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' } = {
      'pending': 'warning',
      'processing': 'info',
      'shipped': 'primary',
      'delivered': 'success',
      'cancelled': 'error',
    };
    return colors[status.toLowerCase()] || 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Order Analytics</Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={exportToExcel}
        >
          Export to Excel
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Order Status Distribution */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData.map(s => ({ name: s.status, value: s.count }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, 'Orders']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Fulfillment Rates Trend */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Fulfillment Rates Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fulfillmentRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Fulfillment Rate']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Fulfillment Rate"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Order Status Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Status Summary
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Count</TableCell>
                    <TableCell align="right">Percentage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orderStatusData.map((status) => (
                    <TableRow key={status.status}>
                      <TableCell>
                        <Chip
                          label={status.status}
                          color={getStatusColor(status.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{status.count}</TableCell>
                      <TableCell align="right">{status.percentage.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Top Customers */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top Customers by Order Value
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Total Orders</TableCell>
                    <TableCell align="right">Total Spent</TableCell>
                    <TableCell>Last Order Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customerInsights.slice(0, 10).map((customer) => (
                    <TableRow key={customer.customerId}>
                      <TableCell>{customer.customerName}</TableCell>
                      <TableCell align="right">{customer.totalOrders}</TableCell>
                      <TableCell align="right">${customer.totalSpent.toLocaleString()}</TableCell>
                      <TableCell>{new Date(customer.lastOrderDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Fulfillment Rates Bar Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Fulfillment Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fulfillmentRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="fulfilled" fill="#8884d8" name="Fulfilled Orders" />
                <Bar dataKey="total" fill="#82ca9d" name="Total Orders" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderAnalytics;