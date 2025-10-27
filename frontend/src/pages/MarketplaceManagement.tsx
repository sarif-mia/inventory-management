import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Store,
  Sync,
  ShoppingCart,
  Inventory,
  BarChart,
  Error,
  GroupWork,
  Refresh,
  Settings,
} from '@mui/icons-material';
import MarketplaceConnectionManagement from '../components/marketplace/MarketplaceConnectionManagement';
import ProductSynchronization from '../components/marketplace/ProductSynchronization';
import OrderSynchronization from '../components/marketplace/OrderSynchronization';
import InventorySynchronization from '../components/marketplace/InventorySynchronization';
import MarketplaceAnalytics from '../components/marketplace/MarketplaceAnalytics';
import ErrorHandlingAndRetry from '../components/marketplace/ErrorHandlingAndRetry';
import BulkOperations from '../components/marketplace/BulkOperations';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

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

const MarketplaceManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const { connections, syncOperations } = useSelector((state: RootState) => state.marketplace);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getActiveConnectionsCount = () => {
    return connections.filter(c => c.status === 'active').length;
  };

  const getFailedOperationsCount = () => {
    return syncOperations.filter(op => op.status === 'failed').length;
  };

  const getRunningOperationsCount = () => {
    return syncOperations.filter(op => op.status === 'running').length;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Marketplace Management
        </Typography>
        <Box display="flex" gap={1}>
          <Chip
            label={`${getActiveConnectionsCount()} Active`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`${getRunningOperationsCount()} Running`}
            color="info"
            variant="outlined"
          />
          <Chip
            label={`${getFailedOperationsCount()} Failed`}
            color="error"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Connections
                  </Typography>
                  <Typography variant="h4">
                    {connections.length}
                  </Typography>
                </Box>
                <Store color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Syncs
                  </Typography>
                  <Typography variant="h4">
                    {getRunningOperationsCount()}
                  </Typography>
                </Box>
                <Sync color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Failed Operations
                  </Typography>
                  <Typography variant="h4">
                    {getFailedOperationsCount()}
                  </Typography>
                </Box>
                <Error color="error" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="h4">
                    {syncOperations.length > 0
                      ? Math.round(((syncOperations.length - getFailedOperationsCount()) / syncOperations.length) * 100)
                      : 100
                    }%
                  </Typography>
                </Box>
                <BarChart color="success" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
              },
            }}
          >
            <Tab
              icon={<Store />}
              label="Connections"
              iconPosition="start"
            />
            <Tab
              icon={<Sync />}
              label="Products"
              iconPosition="start"
            />
            <Tab
              icon={<ShoppingCart />}
              label="Orders"
              iconPosition="start"
            />
            <Tab
              icon={<Inventory />}
              label="Inventory"
              iconPosition="start"
            />
            <Tab
              icon={<BarChart />}
              label="Analytics"
              iconPosition="start"
            />
            <Tab
              icon={<Error />}
              label="Errors"
              iconPosition="start"
            />
            <Tab
              icon={<GroupWork />}
              label="Bulk Ops"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <MarketplaceConnectionManagement />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <ProductSynchronization />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <OrderSynchronization />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <InventorySynchronization />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <MarketplaceAnalytics />
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <ErrorHandlingAndRetry />
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <BulkOperations />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default MarketplaceManagement;