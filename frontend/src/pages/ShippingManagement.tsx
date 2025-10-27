import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Container,
} from '@mui/material';
import ShipmentTracking from '../components/shipping/ShipmentTracking';
import CarrierIntegrationManagement from '../components/shipping/CarrierIntegrationManagement';
import ShippingLabelGeneration from '../components/shipping/ShippingLabelGeneration';
import ShippingCostCalculator from '../components/shipping/ShippingCostCalculator';
import BulkShippingOperations from '../components/shipping/BulkShippingOperations';
import DeliveryTracking from '../components/shipping/DeliveryTracking';
import ShippingAnalytics from '../components/shipping/ShippingAnalytics';

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
      id={`shipping-tabpanel-${index}`}
      aria-labelledby={`shipping-tab-${index}`}
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
    id: `shipping-tab-${index}`,
    'aria-controls': `shipping-tabpanel-${index}`,
  };
}

const ShippingManagement: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%', mt: 2 }}>
        <Typography variant="h4" gutterBottom>
          Shipping Management
        </Typography>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            aria-label="shipping management tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Shipment Tracking" {...a11yProps(0)} />
            <Tab label="Carrier Management" {...a11yProps(1)} />
            <Tab label="Label Generation" {...a11yProps(2)} />
            <Tab label="Cost Calculator" {...a11yProps(3)} />
            <Tab label="Bulk Operations" {...a11yProps(4)} />
            <Tab label="Delivery Tracking" {...a11yProps(5)} />
            <Tab label="Analytics & Reports" {...a11yProps(6)} />
          </Tabs>
        </Paper>

        <TabPanel value={value} index={0}>
          <ShipmentTracking />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <CarrierIntegrationManagement />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <ShippingLabelGeneration />
        </TabPanel>
        <TabPanel value={value} index={3}>
          <ShippingCostCalculator />
        </TabPanel>
        <TabPanel value={value} index={4}>
          <BulkShippingOperations />
        </TabPanel>
        <TabPanel value={value} index={5}>
          <DeliveryTracking />
        </TabPanel>
        <TabPanel value={value} index={6}>
          <ShippingAnalytics />
        </TabPanel>
      </Box>
    </Container>
  );
};

export default ShippingManagement;