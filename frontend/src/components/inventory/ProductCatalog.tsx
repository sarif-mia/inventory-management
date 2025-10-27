import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchProducts } from '../../store/slices/productSlice';
import { fetchInventoryItems } from '../../store/slices/inventorySlice';
import { Product, InventoryItem, InventoryFilters } from '../../types';

interface ProductCatalogProps {
  onEditProduct?: (product: Product) => void;
  onViewInventory?: (productId: number) => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  onEditProduct,
  onViewInventory,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading: productsLoading } = useSelector(
    (state: RootState) => state.products
  );
  const { inventoryItems, loading: inventoryLoading } = useSelector(
    (state: RootState) => state.inventory
  );

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState('');

  const categories = Array.from(new Set(products.map((p: Product) => p.category)));

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchInventoryItems());
  }, [dispatch]);

  const getStockStatus = (productId: number): { status: string; color: 'success' | 'warning' | 'error' } => {
    const inventoryItem = inventoryItems.find((item: InventoryItem) => item.product.id === productId);
    if (!inventoryItem) return { status: 'No Data', color: 'warning' };

    const { stock_quantity, min_stock_level } = inventoryItem;
    if (stock_quantity === 0) return { status: 'Out of Stock', color: 'error' };
    if (stock_quantity <= min_stock_level) return { status: 'Low Stock', color: 'warning' };
    return { status: 'In Stock', color: 'success' };
  };

  const getTotalStock = (productId: number): number => {
    const inventoryItem = inventoryItems.find((item: InventoryItem) => item.product.id === productId);
    return inventoryItem?.stock_quantity || 0;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const stockStatus = getStockStatus(product.id).status.toLowerCase();
    const matchesStockStatus = !stockStatusFilter ||
                              stockStatus.includes(stockStatusFilter.toLowerCase());

    return matchesSearch && matchesCategory && matchesStockStatus;
  });

  const paginatedProducts = filteredProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (productsLoading || inventoryLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box p={3}>
        <Typography variant="h5" gutterBottom>
          Product Catalog
        </Typography>

        {/* Filters */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <TextField
            label="Search Products"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Stock Status</InputLabel>
            <Select
              value={stockStatusFilter}
              label="Stock Status"
              onChange={(e) => setStockStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="in stock">In Stock</MenuItem>
              <MenuItem value="low stock">Low Stock</MenuItem>
              <MenuItem value="out of stock">Out of Stock</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Table */}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>Stock Quantity</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Stock Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.map((product) => {
                const stockStatus = getStockStatus(product.id);
                const totalStock = getTotalStock(product.id);

                return (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell align="right">${product.price.toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', md: 'table-cell' } }}>{totalStock}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      <Chip
                        label={stockStatus.status}
                        color={stockStatus.color}
                        size="small"
                        icon={stockStatus.color === 'warning' ? <WarningIcon /> : undefined}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit Product">
                        <IconButton
                          size="small"
                          onClick={() => onEditProduct?.(product)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Inventory">
                        <IconButton
                          size="small"
                          onClick={() => onViewInventory?.(product.id)}
                        >
                          <InventoryIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Paper>
  );
};

export default ProductCatalog;