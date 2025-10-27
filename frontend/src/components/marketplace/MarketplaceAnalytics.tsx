import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  ShoppingCart,
  AttachMoney,
  BarChart,
  Refresh,
  Timeline,
  PieChart,
  ShowChart,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  fetchMarketplaceConnections,
  fetchMarketplaceAnalytics,
} from '../../store/slices/marketplaceSlice';
import { MarketplaceConnection } from '../../types';
import type { MarketplaceAnalytics } from '../../types';

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

const MarketplaceAnalyticsComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { connections, analytics, loading, error } = useSelector((state: RootState) => state.marketplace);

  const [tabValue, setTabValue] = useState(0);
  const [selectedConnection, setSelectedConnection] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    dispatch(fetchMarketplaceConnections());
  }, [dispatch]);

  useEffect(() => {
    if (selectedConnection) {
      dispatch(fetchMarketplaceAnalytics({ connectionId: selectedConnection, period: selectedPeriod }));
    }
  }, [dispatch, selectedConnection, selectedPeriod]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleConnectionSelect = (connectionId: number) => {
    setSelectedConnection(connectionId);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading && connections.length === 0) {
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
          Marketplace Analytics
        </Typography>
        <Box display="flex" gap={1}>
          {['7d', '30d', '90d', '1y'].map((period) => (
            <Chip
              key={period}
              label={period}
              clickable
              color={selectedPeriod === period ? 'primary' : 'default'}
              onClick={() => handlePeriodChange(period)}
              size="small"
            />
          ))}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Performance" />
          <Tab label="Products" />
          <Tab label="Geographic" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" gap={2} mb={3}>
            {connections.map((connection) => (
              <Chip
                key={connection.id}
                label={connection.name}
                clickable
                color={selectedConnection === connection.id ? 'primary' : 'default'}
                onClick={() => handleConnectionSelect(connection.id)}
                icon={<BarChart />}
              />
            ))}
          </Box>

          {analytics && (
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(4, 1fr)' }} gap={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Sales
                      </Typography>
                      <Typography variant="h4">
                        {formatNumber(analytics.total_sales)}
                      </Typography>
                    </Box>
                    <ShoppingCart color="primary" />
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Revenue
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(analytics.total_revenue)}
                      </Typography>
                    </Box>
                    <AttachMoney color="success" />
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Avg Order Value
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(analytics.average_order_value)}
                      </Typography>
                    </Box>
                    <TrendingUp color="info" />
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Conversion Rate
                      </Typography>
                      <Typography variant="h4">
                        {formatPercentage(analytics.conversion_rate)}
                      </Typography>
                    </Box>
                    <ShowChart color="warning" />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {analytics && (
            <Box display="flex" flexDirection="column" gap={3}>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Sales Trend
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Timeline color="action" sx={{ fontSize: 60 }} />
                      <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                        Sales trend chart would be displayed here
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Category Performance
                    </Typography>
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PieChart color="action" sx={{ fontSize: 60 }} />
                      <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                        Category performance chart would be displayed here
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Performing Products
                  </Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '8px' }}>Product</th>
                          <th style={{ textAlign: 'right', padding: '8px' }}>Sales</th>
                          <th style={{ textAlign: 'right', padding: '8px' }}>Revenue</th>
                          <th style={{ textAlign: 'right', padding: '8px' }}>Orders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.top_products.slice(0, 5).map((product, index) => (
                          <tr key={index}>
                            <td style={{ padding: '8px' }}>{product.product_name}</td>
                            <td style={{ textAlign: 'right', padding: '8px' }}>{formatNumber(product.sales)}</td>
                            <td style={{ textAlign: 'right', padding: '8px' }}>{formatCurrency(product.revenue)}</td>
                            <td style={{ textAlign: 'right', padding: '8px' }}>{formatNumber(product.orders)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {analytics && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Product Performance by Category
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '8px' }}>Category</th>
                        <th style={{ textAlign: 'right', padding: '8px' }}>Sales</th>
                        <th style={{ textAlign: 'right', padding: '8px' }}>Revenue</th>
                        <th style={{ textAlign: 'right', padding: '8px' }}>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.category_performance.map((category, index) => (
                        <tr key={index}>
                          <td style={{ padding: '8px' }}>{category.category}</td>
                          <td style={{ textAlign: 'right', padding: '8px' }}>{formatNumber(category.sales)}</td>
                          <td style={{ textAlign: 'right', padding: '8px' }}>{formatCurrency(category.revenue)}</td>
                          <td style={{ textAlign: 'right', padding: '8px' }}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LinearProgress
                                variant="determinate"
                                value={category.percentage}
                                sx={{ width: 60 }}
                              />
                              <Typography variant="body2">
                                {formatPercentage(category.percentage / 100)}
                              </Typography>
                            </Box>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </CardContent>
            </Card>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {analytics && (
            <Box display="flex" flexDirection="column" gap={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Geographic Sales Distribution
                  </Typography>
                  <Box sx={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', padding: '8px' }}>Region</th>
                          <th style={{ textAlign: 'left', padding: '8px' }}>Country</th>
                          <th style={{ textAlign: 'right', padding: '8px' }}>Sales</th>
                          <th style={{ textAlign: 'right', padding: '8px' }}>Revenue</th>
                          <th style={{ textAlign: 'right', padding: '8px' }}>Orders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.geographic_sales.map((region, index) => (
                          <tr key={index}>
                            <td style={{ padding: '8px' }}>{region.region}</td>
                            <td style={{ padding: '8px' }}>{region.country}</td>
                            <td style={{ textAlign: 'right', padding: '8px' }}>{formatNumber(region.sales)}</td>
                            <td style={{ textAlign: 'right', padding: '8px' }}>{formatCurrency(region.revenue)}</td>
                            <td style={{ textAlign: 'right', padding: '8px' }}>{formatNumber(region.orders)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                </CardContent>
              </Card>

              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Customer Demographics
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          Age Groups
                        </Typography>
                        {analytics.customer_demographics.age_groups.map((group, index) => (
                          <Box key={index} display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">{group.range}</Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <LinearProgress
                                variant="determinate"
                                value={group.percentage}
                                sx={{ width: 60 }}
                              />
                              <Typography variant="body2">{formatPercentage(group.percentage / 100)}</Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Gender Distribution
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={2}>
                      {analytics.customer_demographics.gender_distribution.map((gender, index) => (
                        <Box key={index} display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">{gender.gender}</Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LinearProgress
                              variant="determinate"
                              value={gender.percentage}
                              sx={{ width: 60 }}
                            />
                            <Typography variant="body2">{formatPercentage(gender.percentage / 100)}</Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </TabPanel>
      </Paper>

      {!selectedConnection && (
        <Box mt={3}>
          <Alert severity="info">
            Please select a marketplace connection to view analytics.
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default MarketplaceAnalyticsComponent;