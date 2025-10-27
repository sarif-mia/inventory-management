import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchShippingAnalytics } from '../../store/slices/shippingSlice';
import { ShippingAnalytics, CarrierPerformance, ShippingCostData, DeliveryTimeData } from '../../types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ShippingAnalyticsComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { analytics, loading, error } = useSelector((state: RootState) => state.shipping);

  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    dispatch(fetchShippingAnalytics(period));
  }, [dispatch, period]);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    dispatch(fetchShippingAnalytics(newPeriod));
  };

  if (loading && !analytics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analytics) {
    return (
      <Alert severity="info">
        No analytics data available
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Shipping Analytics & Performance Reports
        </Typography>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Period</InputLabel>
          <Select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            label="Period"
          >
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
            <MenuItem value="1y">Last year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Shipments
              </Typography>
              <Typography variant="h4">
                {analytics.total_shipments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                On-Time Delivery Rate
              </Typography>
              <Typography variant="h4" color="success.main">
                {Math.round(analytics.on_time_delivery_rate * 100)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Shipping Cost
              </Typography>
              <Typography variant="h4">
                ${analytics.average_shipping_cost.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Period
              </Typography>
              <Typography variant="h6">
                {period}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Shipping Cost Trend */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shipping Cost Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.shipping_cost_trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Cost']} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Shipping Cost"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Delivery Time Distribution */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Delivery Time Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.delivery_time_distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.delivery_time_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Carrier Performance */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Carrier Performance
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Carrier</TableCell>
                      <TableCell align="right">Total Shipments</TableCell>
                      <TableCell align="right">On-Time Deliveries</TableCell>
                      <TableCell align="right">On-Time Rate (%)</TableCell>
                      <TableCell align="right">Average Cost</TableCell>
                      <TableCell align="right">Avg Delivery Time (days)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.carrier_performance.map((carrier) => (
                      <TableRow key={carrier.carrier} hover>
                        <TableCell>{carrier.carrier}</TableCell>
                        <TableCell align="right">{carrier.total_shipments}</TableCell>
                        <TableCell align="right">{carrier.on_time_deliveries}</TableCell>
                        <TableCell align="right">
                          {carrier.total_shipments > 0
                            ? Math.round((carrier.on_time_deliveries / carrier.total_shipments) * 100)
                            : 0
                          }%
                        </TableCell>
                        <TableCell align="right">${carrier.average_cost.toFixed(2)}</TableCell>
                        <TableCell align="right">{carrier.average_delivery_time.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Shipping Cost by Carrier */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shipping Cost by Carrier
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.carrier_performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="carrier" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Average Cost']} />
                  <Legend />
                  <Bar dataKey="average_cost" fill="#8884d8" name="Average Cost" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Delivery Performance */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Delivery Performance by Carrier
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.carrier_performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="carrier" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}%`, 'On-Time Rate']} />
                  <Legend />
                  <Bar
                    dataKey={(entry) => entry.total_shipments > 0 ? Math.round((entry.on_time_deliveries / entry.total_shipments) * 100) : 0}
                    fill="#82ca9d"
                    name="On-Time Rate (%)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShippingAnalyticsComponent;