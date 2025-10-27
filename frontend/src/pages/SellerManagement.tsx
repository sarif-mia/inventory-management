import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import SellerDashboard from '../components/sellers/SellerDashboard';
import SellerProfileManagement from '../components/sellers/SellerProfileManagement';
import SellerProductManagement from '../components/sellers/SellerProductManagement';
import SellerCommissionTracking from '../components/sellers/SellerCommissionTracking';
import SellerNotifications from '../components/sellers/SellerNotifications';
import SellerAnalytics from '../components/sellers/SellerAnalytics';

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
      id={`seller-tabpanel-${index}`}
      aria-labelledby={`seller-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `seller-tab-${index}`,
    'aria-controls': `seller-tabpanel-${index}`,
  };
}

const SellerManagement: React.FC = () => {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [activeTab, setActiveTab] = useState(0);

  const sellerIdNum = sellerId ? parseInt(sellerId, 10) : 0;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (!sellerIdNum) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" color="error">
          Invalid seller ID
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" underline="hover">
          Home
        </MuiLink>
        <MuiLink component={Link} to="/sellers" underline="hover">
          Sellers
        </MuiLink>
        <Typography color="text.primary">Seller #{sellerId}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Seller Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage seller profile, products, commissions, and analytics
        </Typography>
      </Box>

      {/* Navigation Tabs */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minWidth: 120,
              textTransform: 'none',
            },
          }}
        >
          <Tab label="Dashboard" {...a11yProps(0)} />
          <Tab label="Profile" {...a11yProps(1)} />
          <Tab label="Products" {...a11yProps(2)} />
          <Tab label="Commissions" {...a11yProps(3)} />
          <Tab label="Notifications" {...a11yProps(4)} />
          <Tab label="Analytics" {...a11yProps(5)} />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        <SellerDashboard sellerId={sellerIdNum} />
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <SellerProfileManagement sellerId={sellerIdNum} />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <SellerProductManagement sellerId={sellerIdNum} />
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <SellerCommissionTracking sellerId={sellerIdNum} />
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <SellerNotifications sellerId={sellerIdNum} />
      </TabPanel>

      <TabPanel value={activeTab} index={5}>
        <SellerAnalytics sellerId={sellerIdNum} />
      </TabPanel>
    </Container>
  );
};

export default SellerManagement;