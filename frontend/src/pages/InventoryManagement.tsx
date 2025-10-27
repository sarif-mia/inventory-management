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
import { Link } from 'react-router-dom';
import {
  Inventory as InventoryIcon,
  List as ListIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  CloudUpload as UploadIcon,
  Warehouse as WarehouseIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

import ProductCatalog from '../components/inventory/ProductCatalog';
import ProductDetails from '../components/inventory/ProductDetails';
import InventoryLevels from '../components/inventory/InventoryLevels';
import LowStockAlerts from '../components/inventory/LowStockAlerts';
import BulkOperations from '../components/inventory/BulkOperations';
import WarehouseInventoryView from '../components/inventory/WarehouseInventoryView';
import InventoryHistory from '../components/inventory/InventoryHistory';

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
      id={`inventory-tabpanel-${index}`}
      aria-labelledby={`inventory-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `inventory-tab-${index}`,
    'aria-controls': `inventory-tabpanel-${index}`,
  };
}

const InventoryManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<number | undefined>();
  const [productDetailsMode, setProductDetailsMode] = useState<'view' | 'edit' | 'create'>('view');
  const [showProductDetails, setShowProductDetails] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProductId(product.id);
    setProductDetailsMode('edit');
    setShowProductDetails(true);
  };

  const handleViewInventory = (productId: number) => {
    setSelectedProductId(productId);
    setActiveTab(2); // Switch to Inventory Levels tab
  };

  const handleCreateProduct = () => {
    setSelectedProductId(undefined);
    setProductDetailsMode('create');
    setShowProductDetails(true);
  };

  const handleSaveProduct = (productData: any) => {
    // This would dispatch the appropriate action
    console.log('Saving product:', productData);
    setShowProductDetails(false);
  };

  const tabs = [
    {
      label: 'Product Catalog',
      icon: <ListIcon />,
      component: (
        <ProductCatalog
          onEditProduct={handleEditProduct}
          onViewInventory={handleViewInventory}
        />
      ),
    },
    {
      label: 'Inventory Levels',
      icon: <InventoryIcon />,
      component: <InventoryLevels />,
    },
    {
      label: 'Low Stock Alerts',
      icon: <WarningIcon />,
      component: <LowStockAlerts />,
    },
    {
      label: 'Bulk Operations',
      icon: <UploadIcon />,
      component: <BulkOperations />,
    },
    {
      label: 'Warehouse View',
      icon: <WarehouseIcon />,
      component: <WarehouseInventoryView />,
    },
    {
      label: 'History & Audit',
      icon: <HistoryIcon />,
      component: <InventoryHistory />,
    },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <MuiLink component={Link} to="/" underline="hover" color="inherit">
            Dashboard
          </MuiLink>
          <Typography color="text.primary">Inventory Management</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Inventory Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive inventory management system with product catalog, stock levels,
            alerts, bulk operations, and audit trails.
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', overflowX: 'auto' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="inventory management tabs"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                  {...a11yProps(index)}
                />
              ))}
            </Tabs>
          </Box>

          {/* Tab Panels */}
          {tabs.map((tab, index) => (
            <TabPanel key={index} value={activeTab} index={index}>
              {tab.component}
            </TabPanel>
          ))}
        </Paper>

        {/* Product Details Dialog */}
        <ProductDetails
          open={showProductDetails}
          onClose={() => setShowProductDetails(false)}
          productId={selectedProductId}
          mode={productDetailsMode}
          onSave={handleSaveProduct}
        />
      </Box>
    </Container>
  );
};

export default InventoryManagement;