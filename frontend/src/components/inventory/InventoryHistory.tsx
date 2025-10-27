import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  SwapHoriz as TransferIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchInventoryHistory } from '../../store/slices/inventorySlice';
import { fetchInventoryItems } from '../../store/slices/inventorySlice';
import { InventoryHistory as InventoryHistoryType } from '../../types';

const InventoryHistory: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { inventoryHistory, inventoryItems, loading, error } = useSelector((state: RootState) => ({
    inventoryHistory: state.inventory.inventoryHistory,
    inventoryItems: state.inventory.inventoryItems,
    loading: state.inventory.loading,
    error: state.inventory.error,
  }));

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<number | ''>('');

  useEffect(() => {
    dispatch(fetchInventoryItems());
    dispatch(fetchInventoryHistory());
  }, [dispatch]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'add':
        return <AddIcon color="success" />;
      case 'remove':
        return <RemoveIcon color="error" />;
      case 'transfer':
        return <TransferIcon color="primary" />;
      case 'adjust':
        return <EditIcon color="warning" />;
      default:
        return <EditIcon />;
    }
  };

  const getActionColor = (action: string): 'success' | 'error' | 'primary' | 'warning' | 'default' => {
    switch (action) {
      case 'add':
        return 'success';
      case 'remove':
        return 'error';
      case 'transfer':
        return 'primary';
      case 'adjust':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredHistory = inventoryHistory.filter((history) => {
    const inventoryItem = inventoryItems.find(item => item.id === history.inventory_item);
    const productName = inventoryItem?.product.name.toLowerCase() || '';
    const warehouseName = inventoryItem?.warehouse.name.toLowerCase() || '';

    const matchesSearch = !searchTerm ||
      productName.includes(searchTerm.toLowerCase()) ||
      warehouseName.includes(searchTerm.toLowerCase()) ||
      history.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = !actionFilter || history.action === actionFilter;
    const matchesInventoryItem = !selectedInventoryItem || history.inventory_item === selectedInventoryItem;

    return matchesSearch && matchesAction && matchesInventoryItem;
  });

  const paginatedHistory = filteredHistory.slice(
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

  if (loading) {
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
          Inventory History & Audit Trail
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <TextField
            label="Search"
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
            placeholder="Search by product, warehouse, or reason"
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Action Type</InputLabel>
            <Select
              value={actionFilter}
              label="Action Type"
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <MenuItem value="">All Actions</MenuItem>
              <MenuItem value="add">Add Stock</MenuItem>
              <MenuItem value="remove">Remove Stock</MenuItem>
              <MenuItem value="adjust">Adjust Stock</MenuItem>
              <MenuItem value="transfer">Transfer Stock</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Inventory Item</InputLabel>
            <Select
              value={selectedInventoryItem}
              label="Inventory Item"
              onChange={(e) => setSelectedInventoryItem(e.target.value as number)}
            >
              <MenuItem value="">All Items</MenuItem>
              {inventoryItems.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.product.name} - {item.warehouse.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Warehouse</TableCell>
                <TableCell>Action</TableCell>
                <TableCell align="right">Previous Qty</TableCell>
                <TableCell align="right">New Qty</TableCell>
                <TableCell align="right">Change</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>User</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedHistory.map((history) => {
                const inventoryItem = inventoryItems.find(item => item.id === history.inventory_item);
                const change = history.new_quantity - history.previous_quantity;

                return (
                  <TableRow key={history.id} hover>
                    <TableCell>
                      {new Date(history.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {inventoryItem?.product.name || 'Unknown Product'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {inventoryItem?.product.category}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {inventoryItem?.warehouse.name || 'Unknown Warehouse'}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getActionIcon(history.action)}
                        <Chip
                          label={history.action.charAt(0).toUpperCase() + history.action.slice(1)}
                          color={getActionColor(history.action)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">{history.previous_quantity}</TableCell>
                    <TableCell align="right">{history.new_quantity}</TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.secondary'}
                        fontWeight="medium"
                      >
                        {change > 0 ? '+' : ''}{change}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {history.reason}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      User #{history.user}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredHistory.length === 0 && !loading && (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="text.secondary">
              No inventory history found matching the current filters
            </Typography>
          </Box>
        )}

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredHistory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Paper>
  );
};

export default InventoryHistory;