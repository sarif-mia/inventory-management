import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  MarkAsUnread as MarkReadIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSellerNotifications,
  markNotificationAsRead,
} from '../../store/slices/sellerSlice';
import { SellerNotification } from '../../types';
import { RootState } from '../../store';

interface SellerNotificationsProps {
  sellerId: number;
}

const SellerNotifications: React.FC<SellerNotificationsProps> = ({ sellerId }) => {
  const dispatch = useDispatch();
  const { sellerNotifications, loading, error } = useSelector((state: RootState) => state.sellers);

  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'warning' | 'error' | 'success',
  });

  useEffect(() => {
    if (sellerId) {
      dispatch(fetchSellerNotifications(sellerId));
    }
  }, [sellerId, dispatch]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await dispatch(markNotificationAsRead(notificationId));
    } catch (error) {
      // Error handled by slice
    }
  };

  const handleSendNotification = () => {
    // In a real app, this would dispatch an action to send a notification
    // For now, we'll just close the dialog
    setSendDialogOpen(false);
    setNewNotification({ title: '', message: '', type: 'info' });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <InfoIcon color="info" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'success':
        return <SuccessIcon color="success" />;
      default:
        return <NotificationIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      default:
        return 'default';
    }
  };

  const unreadCount = sellerNotifications.filter(n => !n.read).length;
  const readNotifications = sellerNotifications.filter(n => n.read);
  const unreadNotifications = sellerNotifications.filter(n => !n.read);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={() => setSendDialogOpen(true)}
        >
          Send Notification
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Unread Notifications */}
      {unreadNotifications.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom color="warning.main">
            Unread Notifications ({unreadNotifications.length})
          </Typography>
          <List>
            {unreadNotifications.map((notification) => (
              <ListItem
                key={notification.id}
                divider
                secondaryAction={
                  <IconButton
                    onClick={() => handleMarkAsRead(notification.id)}
                    color="primary"
                  >
                    <MarkReadIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.light' }}>
                    {getNotificationIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {notification.title}
                      </Typography>
                      <Chip
                        label={notification.type}
                        size="small"
                        color={getNotificationColor(notification.type) as any}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Read Notifications */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          All Notifications
        </Typography>
        <List>
          {sellerNotifications.map((notification) => (
            <ListItem key={notification.id} divider>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: notification.read ? 'grey.200' : 'warning.light' }}>
                  {getNotificationIcon(notification.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={notification.read ? 'normal' : 'bold'}
                    >
                      {notification.title}
                    </Typography>
                    <Chip
                      label={notification.type}
                      size="small"
                      color={getNotificationColor(notification.type) as any}
                    />
                    {notification.read && (
                      <Chip label="Read" size="small" variant="outlined" />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                }
              />
              {!notification.read && (
                <IconButton
                  onClick={() => handleMarkAsRead(notification.id)}
                  color="primary"
                  size="small"
                >
                  <MarkReadIcon />
                </IconButton>
              )}
            </ListItem>
          ))}
        </List>

        {sellerNotifications.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You'll receive notifications about orders, payments, and important updates here.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Send Notification Dialog */}
      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={newNotification.title}
              onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Message"
              value={newNotification.message}
              onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newNotification.type}
                label="Type"
                onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value as any }))}
              >
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
                <MenuItem value="success">Success</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSendNotification}
            variant="contained"
            disabled={!newNotification.title.trim() || !newNotification.message.trim()}
          >
            Send Notification
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerNotifications;