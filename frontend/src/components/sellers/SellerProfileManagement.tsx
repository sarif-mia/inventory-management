import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSellerById,
  updateSellerProfile,
  fetchSellerProducts,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
} from '../../store/slices/sellerSlice';
import { Seller, SellerProduct, SellerProfileUpdate, SellerProductCreate, SellerProductUpdate } from '../../types';
import { RootState } from '../../store';

interface SellerProfileManagementProps {
  sellerId: number;
}

const SellerProfileManagement: React.FC<SellerProfileManagementProps> = ({ sellerId }) => {
  const dispatch = useDispatch();
  const { currentSeller, sellerProducts, loading, error } = useSelector((state: RootState) => state.sellers);

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<SellerProfileUpdate>({});
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [productFormData, setProductFormData] = useState<SellerProductCreate>({
    name: '',
    description: '',
    price: 0,
    category: '',
    images: [],
    stock_quantity: 0,
    min_order_quantity: 1,
  });

  useEffect(() => {
    if (sellerId) {
      dispatch(fetchSellerById(sellerId));
      dispatch(fetchSellerProducts(sellerId));
    }
  }, [sellerId, dispatch]);

  useEffect(() => {
    if (currentSeller) {
      setProfileData({
        business_name: currentSeller.business_name,
        business_description: currentSeller.business_description,
        business_address: currentSeller.business_address,
        phone_number: currentSeller.phone_number,
        tax_id: currentSeller.tax_id,
      });
    }
  }, [currentSeller]);

  const handleProfileUpdate = async () => {
    try {
      await dispatch(updateSellerProfile({ sellerId, data: profileData }));
      setIsEditing(false);
    } catch (error) {
      // Error handled by slice
    }
  };

  const handleProductSubmit = async () => {
    try {
      if (editingProduct) {
        await dispatch(updateSellerProduct({
          productId: editingProduct.id,
          data: productFormData as SellerProductUpdate
        }));
      } else {
        await dispatch(createSellerProduct({ sellerId, productData: productFormData }));
      }
      setProductDialogOpen(false);
      resetProductForm();
    } catch (error) {
      // Error handled by slice
    }
  };

  const handleProductDelete = async (productId: number) => {
    try {
      await dispatch(deleteSellerProduct(productId));
    } catch (error) {
      // Error handled by slice
    }
  };

  const resetProductForm = () => {
    setProductFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      images: [],
      stock_quantity: 0,
      min_order_quantity: 1,
    });
    setEditingProduct(null);
  };

  const openProductDialog = (product?: SellerProduct) => {
    if (product) {
      setEditingProduct(product);
      setProductFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        images: [], // Would need to handle existing images
        stock_quantity: product.stock_quantity,
        min_order_quantity: product.min_order_quantity,
      });
    } else {
      resetProductForm();
    }
    setProductDialogOpen(true);
  };

  if (loading && !currentSeller) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentSeller) {
    return (
      <Alert severity="error">
        Seller not found
      </Alert>
    );
  }

  return (
    <Box>
      {/* Seller Profile Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ width: 80, height: 80, mr: 3 }}>
              {currentSeller.business_name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h4">{currentSeller.business_name}</Typography>
              <Box display="flex" alignItems="center" gap={2} mt={1}>
                <Chip
                  label={currentSeller.verification_status}
                  color={currentSeller.verification_status === 'verified' ? 'success' : 'warning'}
                  size="small"
                />
                <Chip
                  label={currentSeller.is_active ? 'Active' : 'Inactive'}
                  color={currentSeller.is_active ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Business Name"
              value={isEditing ? profileData.business_name || '' : currentSeller.business_name}
              onChange={(e) => setProfileData(prev => ({ ...prev, business_name: e.target.value }))}
              disabled={!isEditing || loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={isEditing ? profileData.phone_number || '' : currentSeller.phone_number}
              onChange={(e) => setProfileData(prev => ({ ...prev, phone_number: e.target.value }))}
              disabled={!isEditing || loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Business Description"
              value={isEditing ? profileData.business_description || '' : currentSeller.business_description}
              onChange={(e) => setProfileData(prev => ({ ...prev, business_description: e.target.value }))}
              multiline
              rows={3}
              disabled={!isEditing || loading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Business Address"
              value={isEditing ? profileData.business_address || '' : currentSeller.business_address}
              onChange={(e) => setProfileData(prev => ({ ...prev, business_address: e.target.value }))}
              multiline
              rows={2}
              disabled={!isEditing || loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tax ID"
              value={isEditing ? profileData.tax_id || '' : currentSeller.tax_id || ''}
              onChange={(e) => setProfileData(prev => ({ ...prev, tax_id: e.target.value }))}
              disabled={!isEditing || loading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Commission Rate"
              value={`${currentSeller.commission_rate}%`}
              disabled
            />
          </Grid>
        </Grid>

        {isEditing && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleProfileUpdate}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Products Management Section */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h5">Products Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openProductDialog()}
          >
            Add Product
          </Button>
        </Box>

        <List>
          {sellerProducts.map((product) => (
            <ListItem
              key={product.id}
              divider
              secondaryAction={
                <Box>
                  <IconButton onClick={() => openProductDialog(product)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleProductDelete(product.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={product.name}
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {product.description}
                    </Typography>
                    <Box display="flex" gap={2} mt={1}>
                      <Chip label={`$${product.price}`} size="small" />
                      <Chip label={`Stock: ${product.stock_quantity}`} size="small" />
                      <Chip label={product.category} size="small" />
                      <Chip
                        label={product.is_active ? 'Active' : 'Inactive'}
                        color={product.is_active ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>

        {sellerProducts.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No products found. Click "Add Product" to create your first product.
          </Typography>
        )}
      </Paper>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onClose={() => setProductDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={productFormData.name}
                onChange={(e) => setProductFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                value={productFormData.category}
                onChange={(e) => setProductFormData(prev => ({ ...prev, category: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={productFormData.description}
                onChange={(e) => setProductFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={productFormData.price}
                onChange={(e) => setProductFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stock Quantity"
                type="number"
                value={productFormData.stock_quantity}
                onChange={(e) => setProductFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Minimum Order Quantity"
                type="number"
                value={productFormData.min_order_quantity}
                onChange={(e) => setProductFormData(prev => ({ ...prev, min_order_quantity: parseInt(e.target.value) || 1 }))}
                inputProps={{ min: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleProductSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : (editingProduct ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerProfileManagement;