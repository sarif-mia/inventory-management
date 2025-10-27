import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { createOrder, updateOrder } from '../../store/slices/orderSlice';
import { Order, Product } from '../../types';

interface OrderCreateEditFormProps {
  order?: Order;
  open: boolean;
  onClose: () => void;
}

interface OrderItemForm {
  product: Product | null;
  quantity: number;
  price: number;
}

const OrderCreateEditForm: React.FC<OrderCreateEditFormProps> = ({
  order,
  open,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { products } = useSelector((state: RootState) => state.products as any);

  const [customerId, setCustomerId] = useState(order?.user || '');
  const [items, setItems] = useState<OrderItemForm[]>(
    order?.products.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price,
    })) || []
  );
  const [loading, setLoading] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { product: null, quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof OrderItemForm, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const handleSubmit = async () => {
    if (!customerId || items.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        user: customerId,
        products: items.map(item => ({
          product: item.product?.id,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: calculateTotal(),
      };

      if (order) {
        await dispatch(updateOrder({ id: order.id, data: orderData }));
      } else {
        await dispatch(createOrder(orderData));
      }
      onClose();
    } catch (error) {
      console.error('Failed to save order:', error);
    } finally {
      setLoading(false);
    }
  };

  const isValid = customerId && items.length > 0 && items.every(item => item.product && item.quantity > 0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {order ? 'Edit Order' : 'Create New Order'} - #{order?.id}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Customer ID"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            sx={{ mb: 2 }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Order Items</Typography>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddItem}
              variant="outlined"
              size="small"
            >
              Add Item
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ minWidth: 200 }}>
                      <Autocomplete
                        options={products || []}
                        getOptionLabel={(option) => option.name}
                        value={item.product}
                        onChange={(_, newValue) => handleItemChange(index, 'product', newValue)}
                        renderInput={(params) => (
                          <TextField {...params} size="small" placeholder="Select product" />
                        )}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        inputProps={{ min: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </TableCell>
                    <TableCell>
                      ${(item.quantity * item.price).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        No items added yet. Click "Add Item" to get started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" align="right">
              Total: ${calculateTotal().toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          variant="contained"
        >
          {order ? 'Update Order' : 'Create Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderCreateEditForm;