import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
} from '@mui/material';
import QuickCommerceConnectionManagement from '../components/quickcommerce/QuickCommerceConnectionManagement';
import QuickCommerceInventorySync from '../components/quickcommerce/QuickCommerceInventorySync';
import QuickCommerceOrderManagement from '../components/quickcommerce/QuickCommerceOrderManagement';
import QuickCommercePricingManagement from '../components/quickcommerce/QuickCommercePricingManagement';
import QuickCommerceDeliverySlots from '../components/quickcommerce/QuickCommerceDeliverySlots';
import QuickCommerceAnalytics from '../components/quickcommerce/QuickCommerceAnalytics';
import QuickCommerceEmergencyStock from '../components/quickcommerce/QuickCommerceEmergencyStock';

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
      id={`quick-commerce-tabpanel-${index}`}
      aria-labelledby={`quick-commerce-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `quick-commerce-tab-${index}`,
    'aria-controls': `quick-commerce-tabpanel-${index}`,
  };
}

const QuickCommerceManagement: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="quick commerce management tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Connections" {...a11yProps(0)} />
            <Tab label="Inventory Sync" {...a11yProps(1)} />
            <Tab label="Order Management" {...a11yProps(2)} />
            <Tab label="Pricing" {...a11yProps(3)} />
            <Tab label="Delivery Slots" {...a11yProps(4)} />
            <Tab label="Analytics" {...a11yProps(5)} />
            <Tab label="Emergency Stock" {...a11yProps(6)} />
          </Tabs>
        </Box>
      </Paper>

      <TabPanel value={value} index={0}>
        <QuickCommerceConnectionManagement />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <QuickCommerceInventorySync />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <QuickCommerceOrderManagement />
      </TabPanel>
      <TabPanel value={value} index={3}>
        <QuickCommercePricingManagement />
      </TabPanel>
      <TabPanel value={value} index={4}>
        <QuickCommerceDeliverySlots />
      </TabPanel>
      <TabPanel value={value} index={5}>
        <QuickCommerceAnalytics />
      </TabPanel>
      <TabPanel value={value} index={6}>
        <QuickCommerceEmergencyStock />
      </TabPanel>
    </Box>
  );
};

export default QuickCommerceManagement;