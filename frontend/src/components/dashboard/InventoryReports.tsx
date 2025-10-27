import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download, Warning } from '@mui/icons-material';
import { apiService } from '../../services/api';
import { InventoryLevel, WarehouseUtilization, DashboardFilters } from '../../types';
import * as XLSX from 'xlsx';

interface InventoryReportsProps {
  filters: DashboardFilters;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const InventoryReports: React.FC<InventoryReportsProps> = ({ filters }) => {
  const [inventoryLevels, setInventoryLevels] = useState<InventoryLevel[]>([]);
  const [warehouseUtilization, setWarehouseUtilization] = useState<WarehouseUtilization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInventoryData();
  }, [filters]);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [inventoryResponse, warehouseResponse] = await Promise.all([
        apiService.getInventoryLevels(),
        apiService.getWarehouseUtilization(),
      ]);

      setInventoryLevels(inventoryResponse.data);
      setWarehouseUtilization(warehouseResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Inventory levels sheet
    const inventorySheet = XLSX.utils.json_to_sheet(inventoryLevels);
    XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventory Levels');

    // Warehouse utilization sheet
    const warehouseSheet = XLSX.utils.json_to_sheet(warehouseUtilization);
    XLSX.utils.book_append_sheet(workbook, warehouseSheet, 'Warehouse Utilization');

    XLSX.writeFile(workbook, 'inventory_report.xlsx');
  };

  const getStockStatus = (current: number, min: number) => {
    if (current <= min) return { label: 'Low Stock', color: 'error' as const };
    if (current <= min * 1.5) return { label: 'Medium', color: 'warning' as const };
    return { label: 'Good', color: 'success' as const };
  };

  const lowStockItems = inventoryLevels.filter(item => item.currentStock <= item.minStock);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Inventory Reports</Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={exportToExcel}
        >
          Export to Excel
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Low Stock Alerts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Warning color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">
                Low Stock Alerts ({lowStockItems.length} items)
              </Typography>
            </Box>
            {lowStockItems.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Current Stock</TableCell>
                      <TableCell align="right">Min Stock</TableCell>
                      <TableCell>Warehouse</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lowStockItems.map((item) => {
                      const status = getStockStatus(item.currentStock, item.minStock);
                      return (
                        <TableRow key={item.productId}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell align="right">{item.currentStock}</TableCell>
                          <TableCell align="right">{item.minStock}</TableCell>
                          <TableCell>{item.warehouse}</TableCell>
                          <TableCell>
                            <Chip
                              label={status.label}
                              color={status.color}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">No low stock items</Typography>
            )}
          </Paper>
        </Grid>

        {/* Warehouse Utilization */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Warehouse Utilization
            </Typography>
            {warehouseUtilization.map((warehouse) => (
              <Box key={warehouse.warehouseId} mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">{warehouse.warehouseName}</Typography>
                  <Typography variant="body2">
                    {warehouse.utilizationPercentage.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={warehouse.utilizationPercentage}
                  color={warehouse.utilizationPercentage > 90 ? 'error' : warehouse.utilizationPercentage > 70 ? 'warning' : 'success'}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Warehouse Utilization Pie Chart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Warehouse Capacity Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={warehouseUtilization.map(w => ({ name: w.warehouseName, value: w.utilizationPercentage }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {warehouseUtilization.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Utilization']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Inventory Levels Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              All Inventory Levels
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Current Stock</TableCell>
                    <TableCell align="right">Min Stock</TableCell>
                    <TableCell align="right">Max Stock</TableCell>
                    <TableCell>Warehouse</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryLevels.map((item) => {
                    const status = getStockStatus(item.currentStock, item.minStock);
                    return (
                      <TableRow key={item.productId}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell align="right">{item.currentStock}</TableCell>
                        <TableCell align="right">{item.minStock}</TableCell>
                        <TableCell align="right">{item.maxStock}</TableCell>
                        <TableCell>{item.warehouse}</TableCell>
                        <TableCell>
                          <Chip
                            label={status.label}
                            color={status.color}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Stock Level Distribution Bar Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Stock Level Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={inventoryLevels.slice(0, 20)}> {/* Limit to first 20 for readability */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="currentStock" fill="#8884d8" name="Current Stock" />
                <Bar dataKey="minStock" fill="#82ca9d" name="Min Stock" />
                <Bar dataKey="maxStock" fill="#ffc658" name="Max Stock" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryReports;