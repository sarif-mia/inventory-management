import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SwipeableViews from 'react-swipeable-views';
import PullToRefresh from '../PullToRefresh';
import { useOffline } from '../../hooks/useOffline';
import {
  TrendingUp,
  ShoppingCart,
  Inventory,
  Warning,
  Refresh,
} from '@mui/icons-material';
import { useGesture } from '@use-gesture/react';
import { apiService } from '../../services/api';
import { DashboardMetrics, DashboardFilters } from '../../types';
import MetricsCards from './MetricsCards';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mobile-dashboard-tabpanel-${index}`}
      aria-labelledby={`mobile-dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const MobileDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isOnline, getPendingRequestCount } = useOffline();

  const filters: DashboardFilters = {
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
  };

  useEffect(() => {
    if (isMobile) {
      loadDashboardData();
    }
  }, [isMobile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardMetrics();
      setMetrics(response.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const bind = useGesture({
    onDrag: ({ down, movement: [mx], direction: [xDir], cancel }) => {
      if (down && Math.abs(mx) > 100) {
        if (xDir > 0 && tabValue > 0) {
          setTabValue(tabValue - 1);
        } else if (xDir < 0 && tabValue < 2) {
          setTabValue(tabValue + 1);
        }
        cancel();
      }
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (!isMobile) {
    return null; // Don't render mobile dashboard on desktop
  }

  if (loading && !metrics) {
    return (
      <Container maxWidth="sm" sx={{ mt: 2, mb: 2 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} disabled={!isOnline}>
      <Container maxWidth="sm" sx={{ mt: 2, mb: 2 }}>
        {/* Offline indicator */}
        {!isOnline && (
          <Box
            sx={{
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              p: 1,
              mb: 2,
              borderRadius: 1,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2">
              You're offline. Some features may be limited.
              {getPendingRequestCount() > 0 && ` (${getPendingRequestCount()} pending actions)`}
            </Typography>
          </Box>
        )}

        {/* Header */}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="h1">
            Dashboard
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {isOnline ? (
              <Box sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }} />
            ) : (
              <Box sx={{ width: 8, height: 8, bgcolor: 'error.main', borderRadius: '50%' }} />
            )}
            <Typography variant="caption" color="text.secondary">
              {isOnline ? 'Online' : 'Offline'}
            </Typography>
          </Box>
        </Box>

      {/* Metrics Overview */}
      {metrics && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingUp />
                    <Box>
                      <Typography variant="h6">${metrics.totalSales.toLocaleString()}</Typography>
                      <Typography variant="caption">Total Sales</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <ShoppingCart />
                    <Box>
                      <Typography variant="h6">{metrics.totalOrders.toLocaleString()}</Typography>
                      <Typography variant="caption">Total Orders</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Inventory />
                    <Box>
                      <Typography variant="h6">{metrics.totalInventory.toLocaleString()}</Typography>
                      <Typography variant="caption">Total Inventory</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Warning />
                    <Box>
                      <Typography variant="h6">{metrics.lowStockAlerts}</Typography>
                      <Typography variant="caption">Low Stock Alerts</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Swipeable Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 48,
              fontSize: '0.875rem',
            },
          }}
        >
          <Tab label="Overview" />
          <Tab label="Analytics" />
          <Tab label="Alerts" />
        </Tabs>
      </Paper>

      <Box {...bind()}>
        <SwipeableViews
          index={tabValue}
          onChangeIndex={setTabValue}
          enableMouseEvents
          style={{ overflow: 'hidden' }}
        >
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Quick Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome to your inventory management dashboard. Swipe left or right to navigate between different views.
            </Typography>
            {metrics && <MetricsCards metrics={metrics} />}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Detailed analytics and insights will be displayed here.
            </Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Alerts & Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Important alerts and notifications will appear here.
            </Typography>
          </TabPanel>
        </SwipeableViews>
      </Box>
    </Container>
    </PullToRefresh>
  );
};

export default MobileDashboard;