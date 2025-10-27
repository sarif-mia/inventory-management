import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Alert,
} from '@mui/material';
import {
  ShoppingCart as OrdersIcon,
  AttachMoney as RevenueIcon,
  Star as RatingIcon,
  Inventory as ProductsIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSellerDashboardMetrics,
  fetchSellerOrders,
  fetchSellerCommissions,
} from '../../store/slices/sellerSlice';
import { RootState } from '../../store';

interface SellerDashboardProps {
  sellerId: number;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ sellerId }) => {
  const dispatch = useDispatch();
  const {
    dashboardMetrics,
    sellerOrders,
    sellerCommissions,
    loading,
    error,
  } = useSelector((state: RootState) => state.sellers);

  useEffect(() => {
    if (sellerId) {
      dispatch(fetchSellerDashboardMetrics(sellerId));
      dispatch(fetchSellerOrders(sellerId));
      dispatch(fetchSellerCommissions(sellerId));
    }
  }, [sellerId, dispatch]);

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

  if (!dashboardMetrics) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        No dashboard data available
      </Alert>
    );
  }

  const recentOrders = dashboardMetrics.recent_orders.slice(0, 5);
  const lowStockProducts = dashboardMetrics.low_stock_products.slice(0, 5);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Seller Dashboard
      </Typography>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="primary">
                    {dashboardMetrics.total_products}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Products
                  </Typography>
                </Box>
                <ProductsIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                {dashboardMetrics.active_products} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="primary">
                    {dashboardMetrics.total_orders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
                <OrdersIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                {dashboardMetrics.pending_orders} pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="primary">
                    ${dashboardMetrics.total_revenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
                <RevenueIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                Commission: ${dashboardMetrics.commission_earned.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="primary">
                    {dashboardMetrics.average_rating.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Rating
                  </Typography>
                </Box>
                <RatingIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <Box display="flex" sx={{ mt: 1 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <RatingIcon
                    key={star}
                    sx={{
                      fontSize: 16,
                      color: star <= Math.floor(dashboardMetrics.average_rating) ? 'gold' : 'grey.300'
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <List>
              {recentOrders.map((order) => (
                <ListItem key={order.id} divider>
                  <ListItemAvatar>
                    <Avatar>
                      <OrdersIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`Order #${order.id}`}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          {new Date(order.created_at).toLocaleDateString()}
                        </Typography>
                        <Chip
                          label={order.status}
                          size="small"
                          color={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'pending' ? 'warning' :
                            order.status === 'cancelled' ? 'error' : 'default'
                          }
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    }
                  />
                  <Typography variant="body1" fontWeight="bold">
                    ${order.seller_earnings.toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
            {recentOrders.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No recent orders
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Low Stock Alerts */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Low Stock Alerts
            </Typography>
            <List>
              {lowStockProducts.map((product) => (
                <ListItem key={product.id} divider>
                  <ListItemAvatar>
                    <Avatar>
                      <WarningIcon color="warning" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={product.name}
                    secondary={`Stock: ${product.stock_quantity} | Min: ${product.min_order_quantity}`}
                  />
                  <Chip
                    label="Low Stock"
                    color="warning"
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
            {lowStockProducts.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                All products are well stocked
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Commission Summary */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Commission Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h5" color="success.main">
                    ${dashboardMetrics.commission_earned.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Commission Earned
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h5" color="warning.main">
                    ${dashboardMetrics.commission_pending.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Commission Pending
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h5" color="info.main">
                    ${(dashboardMetrics.commission_earned + dashboardMetrics.commission_pending).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Commission
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" gutterBottom>
              Recent Commission Payments
            </Typography>
            <List>
              {sellerCommissions.slice(0, 3).map((commission) => (
                <ListItem key={commission.id} divider>
                  <ListItemText
                    primary={`Order #${commission.order}`}
                    secondary={`Date: ${new Date(commission.created_at).toLocaleDateString()}`}
                  />
                  <Box textAlign="right">
                    <Typography variant="body1" fontWeight="bold">
                      ${commission.commission_amount.toFixed(2)}
                    </Typography>
                    <Chip
                      label={commission.paid ? 'Paid' : 'Pending'}
                      size="small"
                      color={commission.paid ? 'success' : 'warning'}
                    />
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SellerDashboard;