import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchProduct } from '../../store/slices/productSlice';
import { Product } from '../../types';

interface ProductDetailsProps {
  open: boolean;
  onClose: () => void;
  productId?: number;
  onSave?: (product: Partial<Product>) => void;
  mode?: 'view' | 'edit' | 'create';
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  open,
  onClose,
  productId,
  onSave,
  mode = 'view',
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentProduct, loading, error } = useSelector(
    (state: RootState) => ({
      currentProduct: null, // We'll need to add this to the product slice
      loading: state.products.loading,
      error: state.products.error,
    })
  );

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock_quantity: 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && productId && mode !== 'create') {
      dispatch(fetchProduct(productId));
    }
  }, [open, productId, mode, dispatch]);

  useEffect(() => {
    if (currentProduct && mode !== 'create') {
      setFormData(currentProduct);
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        stock_quantity: 0,
      });
    }
  }, [currentProduct, mode]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = 'Product name is required';
    }
    if (!formData.description?.trim()) {
      errors.description = 'Description is required';
    }
    if (!formData.price || formData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    if (!formData.category?.trim()) {
      errors.category = 'Category is required';
    }
    if (formData.stock_quantity === undefined || formData.stock_quantity < 0) {
      errors.stock_quantity = 'Stock quantity cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (validateForm() && onSave) {
      onSave(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Create Product' : mode === 'edit' ? 'Edit Product' : 'Product Details'}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ pt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  InputProps={{ readOnly: isReadOnly }}
                  required
                  aria-label="Product name"
                />
                <TextField
                  fullWidth
                  label="Category"
                  value={formData.category || ''}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  error={!!formErrors.category}
                  helperText={formErrors.category}
                  InputProps={{ readOnly: isReadOnly }}
                  required
                  aria-label="Product category"
                />
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!formErrors.description}
                helperText={formErrors.description}
                InputProps={{ readOnly: isReadOnly }}
                required
                aria-label="Product description"
              />

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                  InputProps={{
                    readOnly: isReadOnly,
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                  aria-label="Product price"
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Stock Quantity"
                  value={formData.stock_quantity || ''}
                  onChange={(e) => handleInputChange('stock_quantity', parseInt(e.target.value) || 0)}
                  error={!!formErrors.stock_quantity}
                  helperText={formErrors.stock_quantity}
                  InputProps={{ readOnly: isReadOnly }}
                  inputProps={{ min: 0 }}
                  required
                  aria-label="Stock quantity"
                />
              </Box>

              {mode !== 'create' && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Created At"
                    value={formData.created_at ? new Date(formData.created_at).toLocaleDateString() : ''}
                    InputProps={{ readOnly: true }}
                    aria-label="Creation date"
                  />
                  <TextField
                    fullWidth
                    label="Updated At"
                    value={formData.updated_at ? new Date(formData.updated_at).toLocaleDateString() : ''}
                    InputProps={{ readOnly: true }}
                    aria-label="Last updated date"
                  />
                </Box>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {mode !== 'view' && (
          <Button onClick={handleSave} variant="contained" color="primary">
            {mode === 'create' ? 'Create' : 'Save Changes'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProductDetails;