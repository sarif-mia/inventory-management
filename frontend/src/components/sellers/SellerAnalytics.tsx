import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  ShoppingCart as OrdersIcon,
  AttachMoney as RevenueIcon,
  Star as RatingIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSellerAnalytics } from '../../store/slices/sellerSlice';
import { SellerAnalytics as SellerAnalyticsType } from '../../types';
import { RootState } from '../../store';

interface SellerAnalyticsProps {
  sellerId: number;
}

const SellerAnalytics: React.FC<SellerAnalyticsProps> = ({ sellerId }) => {
  const dispatch = useDispatch();
  const { sellerAnalytics, loading, error } = useSelector((state: RootState) => state.sellers);

  const [period, setPeriod] = useState('30d'); // 7d, 30d, 90d, 1y

  useEffect(() => {
    if (sellerId) {
      dispatch(fetchSellerAnalytics({ sellerId, period }));
    }
  }, [sellerId, period, dispatch]);

  const handleExport = () => {
    // In a real app, this would call an API to export analytics data
    const data = {
      period,
      analytics: sellerAnalytics,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seller-analytics-${period}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!sellerAnalytics) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No analytics data available for the selected period.
      </Alert>
    );
  }

  const periodLabels = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    '1y': 'Last year',
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Analytics & Reports
        </Typography>
        <Box display="flex" gap={2}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Period</InputLabel>
            <Select
              value={period}
              label="Period"
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="7d">Last 7 days</MenuItem>
              <MenuItem value="30d">Last 30 days</MenuItem>
              <MenuItem value="90d">Last 90 days</MenuItem>
              <MenuItem value="1y">Last year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export
          </Button>
        </Box>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {periodLabels[period as keyof typeof periodLabels]}
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="primary">
                    {sellerAnalytics.total_sales}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sales
                  </Typography>
                </Box>
                <OrdersIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="success.main">
                    ${sellerAnalytics.total_revenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
                <RevenueIcon color="success" sx={{ fontSize: 40 }} />
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
                    {sellerAnalytics.total_orders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
                <OrdersIcon color="info" sx={{ fontSize: 40 }} />
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
                    ${sellerAnalytics.average_order_value.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Order Value
                  </Typography>
                </Box>
                <TrendingIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Commission Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Commission Summary
            </Typography>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body2">Commission Earned</Typography>
              <Typography variant="body1" fontWeight="bold" color="success.main">
                ${sellerAnalytics.commission_earned.toFixed(2)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body2">Commission Paid</Typography>
              <Typography variant="body1" fontWeight="bold" color="info.main">
                ${sellerAnalytics.commission_paid.toFixed(2)}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2">Pending Commission</Typography>
              <Typography variant="body1" fontWeight="bold" color="warning.main">
                ${(sellerAnalytics.commission_earned - sellerAnalytics.commission_paid).toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Performing Products
            </Typography>
            {sellerAnalytics.top_products.slice(0, 5).map((product, index) => (
              <Box key={product.id} display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                  {index + 1}. {product.name}
                </Typography>
                <Typography variant="body2" color="success.main">
                  ${product.revenue.toFixed(2)}
                </Typography>
              </Box>
            ))}
            {sellerAnalytics.top_products.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No product data available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Sales Trend Chart Placeholder */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Sales Trend
        </Typography>
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Sales trend chart would be displayed here
          </Typography>
          <TrendingIcon sx={{ ml: 1, fontSize: 40, color: 'grey.400' }} />
        </Box>
        {/* In a real app, you would integrate a charting library like Chart.js or Recharts */}
        <Box sx={{ mt: 2 }}>
          {sellerAnalytics.sales_trend.map((data, index) => (
            <Box key={index} display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="body2">{data.date}</Typography>
              <Typography variant="body2">${data.revenue.toFixed(2)}</Typography>
              <Typography variant="body2">{data.orders} orders</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Performance Insights */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Performance Insights
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Revenue Growth
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sellerAnalytics.sales_trend.length > 1
                  ? (() => {
                      const first = sellerAnalytics.sales_trend[0]?.revenue || 0;
                      const last = sellerAnalytics.sales_trend[sellerAnalytics.sales_trend.length - 1]?.revenue || 0;
                      const growth = first > 0 ? ((last - first) / first) * 100 : 0;
                      return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
                    })()
                  : 'N/A'
                }
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Order Conversion Rate
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sellerAnalytics.total_orders > 0
                  ? `${((sellerAnalytics.total_sales / sellerAnalytics.total_orders) * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Average Commission Rate
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sellerAnalytics.total_revenue > 0
                  ? `${((sellerAnalytics.commission_earned / sellerAnalytics.total_revenue) * 100).toFixed(1)}%`
                  : 'N/A'
                }
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Best Performing Day
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sellerAnalytics.sales_trend.length > 0
                  ? sellerAnalytics.sales_trend.reduce((best, current) =>
                      current.revenue > best.revenue ? current : best
                    ).date
                  : 'N/A'
                }
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SellerAnalytics;