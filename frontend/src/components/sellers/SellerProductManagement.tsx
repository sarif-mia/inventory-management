import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardMedia,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSellerProducts,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
} from '../../store/slices/sellerSlice';
import { SellerProduct, SellerProductCreate, SellerProductUpdate } from '../../types';
import { RootState } from '../../store';

interface SellerProductManagementProps {
  sellerId: number;
}

const SellerProductManagement: React.FC<SellerProductManagementProps> = ({ sellerId }) => {
  const dispatch = useDispatch();
  const { sellerProducts, loading, error } = useSelector((state: RootState) => state.sellers);

  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
      dispatch(fetchSellerProducts(sellerId));
    }
  }, [sellerId, dispatch]);

  const handleProductSubmit = async () => {
    if (!validateProductForm()) return;

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
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dispatch(deleteSellerProduct(productId));
      } catch (error) {
        // Error handled by slice
      }
    }
  };

  const validateProductForm = (): boolean => {
    if (!productFormData.name.trim()) {
      alert('Product name is required');
      return false;
    }
    if (!productFormData.description.trim()) {
      alert('Product description is required');
      return false;
    }
    if (!productFormData.category.trim()) {
      alert('Product category is required');
      return false;
    }
    if (productFormData.price <= 0) {
      alert('Product price must be greater than 0');
      return false;
    }
    if (productFormData.stock_quantity < 0) {
      alert('Stock quantity cannot be negative');
      return false;
    }
    if (productFormData.min_order_quantity < 1) {
      alert('Minimum order quantity must be at least 1');
      return false;
    }
    return true;
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

  const filteredProducts = sellerProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeProducts = sellerProducts.filter(p => p.is_active);
  const inactiveProducts = sellerProducts.filter(p => !p.is_active);
  const lowStockProducts = sellerProducts.filter(p => p.stock_quantity <= p.min_order_quantity);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Product Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openProductDialog()}
        >
          Add Product
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <Box p={3}>
              <Typography variant="h4" color="primary">
                {activeProducts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Products
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <Box p={3}>
              <Typography variant="h4" color="warning.main">
                {inactiveProducts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Inactive Products
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <Box p={3}>
              <Typography variant="h4" color="error.main">
                {lowStockProducts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Low Stock Items
              </Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <Box p={3}>
              <Typography variant="h4" color="info.main">
                {sellerProducts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Products
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search products by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Products Table */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {product.images.length > 0 ? (
                        <CardMedia
                          component="img"
                          sx={{ width: 50, height: 50, mr: 2, borderRadius: 1 }}
                          image={product.images[0]}
                          alt={product.name}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            mr: 2,
                            borderRadius: 1,
                            bgcolor: 'grey.200',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <ImageIcon />
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                          {product.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    <Box>
                      <Typography variant="body2">
                        {product.stock_quantity}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Min: {product.min_order_quantity}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={product.is_active ? 'Active' : 'Inactive'}
                      color={product.is_active ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => openProductDialog(product)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleProductDelete(product.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredProducts.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              {searchTerm ? 'No products found matching your search.' : 'No products found. Click "Add Product" to create your first product.'}
            </Typography>
          </Box>
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
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                value={productFormData.category}
                onChange={(e) => setProductFormData(prev => ({ ...prev, category: e.target.value }))}
                required
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
                required
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
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
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
                required
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
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleProductSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : (editingProduct ? 'Update Product' : 'Create Product')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerProductManagement;