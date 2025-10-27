import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { apiService } from '../services/api';
import { DashboardMetrics, DashboardFilters } from '../types';
import MetricsCards from '../components/dashboard/MetricsCards';
import MobileDashboard from '../components/dashboard/MobileDashboard';
import SalesReports from '../components/dashboard/SalesReports';
import InventoryReports from '../components/dashboard/InventoryReports';
import OrderAnalytics from '../components/dashboard/OrderAnalytics';
import PerformanceMetrics from '../components/dashboard/PerformanceMetrics';

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
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    },
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getDashboardMetrics();
      setMetrics(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    if (start && end) {
      setFilters(prev => ({
        ...prev,
        dateRange: { start, end },
      }));
    }
  };

  if (loading && !metrics) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Render mobile dashboard for mobile devices
  if (isMobile) {
    return <MobileDashboard />;
  }

  // Render desktop dashboard for larger screens
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            mb: { xs: 2, sm: 3 }
          }}
        >
          Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>
          <Box
            display="flex"
            gap={2}
            alignItems="center"
            flexWrap="wrap"
            sx={{
              flexDirection: { xs: 'column', sm: 'row' },
              '& > *': { width: { xs: '100%', sm: 'auto' } }
            }}
          >
            <DatePicker
              label="Start Date"
              value={filters.dateRange.start}
              onChange={(date) => handleDateRangeChange(date, filters.dateRange.end)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  sx: { minWidth: { xs: '100%', sm: '200px' } }
                }
              }}
            />
            <DatePicker
              label="End Date"
              value={filters.dateRange.end}
              onChange={(date) => handleDateRangeChange(filters.dateRange.start, date)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  sx: { minWidth: { xs: '100%', sm: '200px' } }
                }
              }}
            />
            {/* Additional filters can be added here */}
          </Box>
        </Paper>

        {/* Metrics Cards */}
        {metrics && <MetricsCards metrics={metrics} />}

        {/* Tabs for different reports */}
        <Paper sx={{ mt: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="dashboard tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: { xs: 48, sm: 64 },
                fontSize: { xs: '0.875rem', sm: '0.875rem' }
              }
            }}
          >
            <Tab label="Sales Reports" />
            <Tab label="Inventory Reports" />
            <Tab label="Order Analytics" />
            <Tab label="Performance Metrics" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <SalesReports filters={filters} />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <InventoryReports filters={filters} />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <OrderAnalytics filters={filters} />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <PerformanceMetrics filters={filters} />
          </TabPanel>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default Dashboard;