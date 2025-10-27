import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { updateOrderStatus, addOrderNote } from '../../store/slices/orderSlice';
import { Order } from '../../types';

interface OrderStatusManagementProps {
  order: Order;
  open: boolean;
  onClose: () => void;
}

const OrderStatusManagement: React.FC<OrderStatusManagementProps> = ({
  order,
  open,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [status, setStatus] = useState(order.status);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async () => {
    setLoading(true);
    try {
      await dispatch(updateOrderStatus({ id: order.id, status, note: note || undefined }));
      onClose();
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setLoading(true);
    try {
      await dispatch(addOrderNote({ orderId: order.id, note }));
      setNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'processing': return 'primary';
      case 'shipped': return 'secondary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Order Status - #{order.id}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Status
          </Typography>
          <Chip
            label={order.status}
            color={getStatusColor(order.status)}
            size="medium"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Update Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              label="Update Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Status Change Note (Optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note about this status change..."
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Order Notes
          </Typography>
          {order.notes && order.notes.length > 0 ? (
            order.notes.map((note: any) => (
              <Box key={note.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2">{note.note}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(note.created_at).toLocaleString()} by User {note.created_by}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No notes yet
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleAddNote}
          disabled={!note.trim() || loading}
          variant="outlined"
        >
          Add Note
        </Button>
        <Button
          onClick={handleStatusChange}
          disabled={status === order.status || loading}
          variant="contained"
        >
          Update Status
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderStatusManagement;