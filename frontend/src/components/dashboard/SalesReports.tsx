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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Download } from '@mui/icons-material';
import { apiService } from '../../services/api';
import { SalesData, TopProduct, CategorySales, DashboardFilters } from '../../types';
import * as XLSX from 'xlsx';

interface SalesReportsProps {
  filters: DashboardFilters;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SalesReports: React.FC<SalesReportsProps> = ({ filters }) => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    loadSalesData();
  }, [filters]);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      setError(null);

      const startDate = filters.dateRange.start.toISOString().split('T')[0];
      const endDate = filters.dateRange.end.toISOString().split('T')[0];

      const [salesResponse, topProductsResponse, categoryResponse] = await Promise.all([
        apiService.getSalesData(startDate, endDate),
        apiService.getTopProducts(),
        apiService.getCategorySales(),
      ]);

      setSalesData(salesResponse.data);
      setTopProducts(topProductsResponse.data);
      setCategorySales(categoryResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Sales data sheet
    const salesSheet = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales Trends');

    // Top products sheet
    const productsSheet = XLSX.utils.json_to_sheet(topProducts);
    XLSX.utils.book_append_sheet(workbook, productsSheet, 'Top Products');

    // Category sales sheet
    const categorySheet = XLSX.utils.json_to_sheet(categorySales);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Sales');

    XLSX.writeFile(workbook, 'sales_report.xlsx');
  };

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
        <Typography variant="h5">Sales Reports</Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={exportToExcel}
        >
          Export to Excel
        </Button>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Revenue Trends Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
              Revenue Trends
            </Typography>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  fontSize={isMobile ? 12 : 14}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 30}
                />
                <YAxis fontSize={isMobile ? 12 : 14} />
                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Sales by Category Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
              Sales by Category
            </Typography>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <PieChart>
                <Pie
                  data={categorySales}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={isMobile ? false : ({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={isMobile ? 60 : 80}
                  fill="#8884d8"
                  dataKey="sales"
                >
                  {categorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Products Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
              Top Products
            </Typography>
            <TableContainer sx={{ maxHeight: isMobile ? 300 : 'none' }}>
              <Table size={isMobile ? 'small' : 'medium'}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Product Name</TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Sales</TableCell>
                    <TableCell align="right" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Revenue</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{product.productName}</TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{product.sales}</TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>${product.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Category Sales Bar Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 } }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
              Category Sales Comparison
            </Typography>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <BarChart data={categorySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  fontSize={isMobile ? 12 : 14}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 30}
                />
                <YAxis fontSize={isMobile ? 12 : 14} />
                <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalesReports;