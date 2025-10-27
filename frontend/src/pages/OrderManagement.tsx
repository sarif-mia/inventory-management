import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Dialog,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import OrderList from '../components/orders/OrderList';
import OrderDetails from '../components/orders/OrderDetails';
import OrderStatusManagement from '../components/orders/OrderStatusManagement';
import OrderCreateEditForm from '../components/orders/OrderCreateEditForm';
import OrderFulfillmentWorkflow from '../components/orders/OrderFulfillmentWorkflow';
import OrderHistory from '../components/orders/OrderHistory';
import CustomerOrderHistory from '../components/orders/CustomerOrderHistory';
import { Order } from '../types';

const OrderManagement: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setActiveTab(1); // Switch to details tab
  };

  const handleCustomerSelect = (customerId: number) => {
    setSelectedCustomerId(customerId);
    setActiveTab(3); // Switch to customer history tab
  };

  const handleCreateOrder = () => {
    setCreateDialogOpen(true);
  };

  const handleStatusUpdate = (order: Order) => {
    setSelectedOrder(order);
    setStatusDialogOpen(true);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            Order Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateOrder}
          >
            Create Order
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="order management tabs">
            <Tab label="Order List" />
            <Tab label="Order Details" disabled={!selectedOrder} />
            <Tab label="Fulfillment" disabled={!selectedOrder} />
            <Tab label="Customer History" disabled={!selectedCustomerId} />
          </Tabs>
        </Box>

        <Box sx={{ mt: 3 }}>
          {activeTab === 0 && (
            <OrderList
              onOrderSelect={handleOrderSelect}
              onCustomerSelect={handleCustomerSelect}
              onStatusUpdate={handleStatusUpdate}
            />
          )}
          {activeTab === 1 && selectedOrder && (
            <Box>
              <OrderDetails orderId={selectedOrder.id} />
              <Box sx={{ mt: 3 }}>
                <OrderHistory orderId={selectedOrder.id} />
              </Box>
            </Box>
          )}
          {activeTab === 2 && selectedOrder && (
            <OrderFulfillmentWorkflow order={selectedOrder} />
          )}
          {activeTab === 3 && selectedCustomerId && (
            <CustomerOrderHistory customerId={selectedCustomerId} />
          )}
        </Box>
      </Box>

      {/* Create/Edit Order Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <OrderCreateEditForm
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
        />
      </Dialog>

      {/* Status Management Dialog */}
      {selectedOrder && (
        <OrderStatusManagement
          order={selectedOrder}
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
        />
      )}
    </Container>
  );
};

export default OrderManagement;