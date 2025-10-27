import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TrendingUp as SalesIcon,
  ShoppingCart as OrdersIcon,
  AttachMoney as RevenueIcon,
  Star as RatingIcon,
  LocalShipping as DeliveryIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchQuickCommerceAnalytics,
  fetchQuickCommerceConnections,
} from '../../store/slices/quickCommerceSlice';
import { QuickCommerceAnalytics as AnalyticsType, QuickCommerceConnection } from '../../types';
import { RootState } from '../../store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const QuickCommerceAnalytics: React.FC = () => {
  const dispatch = useDispatch();
  const { analytics, connections, loading, error } = useSelector((state: RootState) => state.quickCommerce);

  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    dispatch(fetchQuickCommerceConnections());
  }, [dispatch]);

  useEffect(() => {
    if (selectedConnection) {
      dispatch(fetchQuickCommerceAnalytics({ connectionId: selectedConnection, period: selectedPeriod }));
    }
  }, [dispatch, selectedConnection, selectedPeriod]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Quick Commerce Analytics
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Quick Commerce Platform</InputLabel>
          <Select
            value={selectedConnection || ''}
            label="Quick Commerce Platform"
            onChange={(e) => setSelectedConnection(Number(e.target.value) || null)}
          >
            {connections.map((connection) => (
              <MenuItem key={connection.id} value={connection.id}>
                {connection.name} ({connection.platform})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={selectedPeriod}
            label="Period"
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
            <MenuItem value="1y">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {!selectedConnection ? (
        <Alert severity="info">
          Please select a connection to view analytics.
        </Alert>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : !analytics ? (
        <Alert severity="info">
          No analytics data available for the selected period.
        </Alert>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SalesIcon color="primary" sx={{ mr: 1 }} />
                    <Typography color="textSecondary" variant="body2">
                      Total Sales
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {analytics.total_sales.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <OrdersIcon color="secondary" sx={{ mr: 1 }} />
                    <Typography color="textSecondary" variant="body2">
                      Total Orders
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {analytics.total_orders.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <RevenueIcon color="success" sx={{ mr: 1 }} />
                    <Typography color="textSecondary" variant="body2">
                      Total Revenue
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {formatCurrency(analytics.total_revenue)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DeliveryIcon color="info" sx={{ mr: 1 }} />
                    <Typography color="textSecondary" variant="body2">
                      Avg Order Value
                    </Typography>
                  </Box>
                  <Typography variant="h4">
                    {formatCurrency(analytics.average_order_value)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            {/* Sales Trend */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Sales Trend
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.sales_trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Delivery Performance */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Delivery Performance
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      On-Time Delivery Rate
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatPercentage(analytics.delivery_performance.on_time_delivery_rate)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Average Delivery Time
                    </Typography>
                    <Typography variant="h6">
                      {analytics.delivery_performance.average_delivery_time.toFixed(1)} mins
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      Customer Satisfaction
                    </Typography>
                    <Typography variant="h6">
                      {analytics.delivery_performance.customer_satisfaction_score.toFixed(1)}/5
                      <RatingIcon sx={{ ml: 1, verticalAlign: 'middle' }} />
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Top Products */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Top Products
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.top_products.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="product_name" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(value) => [value, 'Sales']} />
                      <Bar dataKey="sales" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Category Performance */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Category Performance
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.category_performance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sales"
                      >
                        {analytics.category_performance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Sales']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Slot Utilization */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Delivery Slot Utilization
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.slot_utilization}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="slot_id" />
                      <YAxis />
                      <Tooltip
                        formatter={(value, name) => [
                          name === 'utilization_percentage' ? `${value}%` : formatCurrency(value as number),
                          name === 'utilization_percentage' ? 'Utilization' : 'Revenue'
                        ]}
                      />
                      <Bar dataKey="utilization_percentage" fill="#8884d8" name="utilization_percentage" />
                      <Bar dataKey="revenue_generated" fill="#82ca9d" name="revenue_generated" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default QuickCommerceAnalytics;