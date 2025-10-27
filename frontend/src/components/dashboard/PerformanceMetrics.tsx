import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  TrendingUp,
  ShoppingCart,
  People,
  Warning,
} from '@mui/icons-material';
import { Download } from '@mui/icons-material';
import { apiService } from '../../services/api';
import { PerformanceMetrics as PerformanceMetricsType, DashboardFilters } from '../../types';
import * as XLSX from 'xlsx';

interface PerformanceMetricsProps {
  filters: DashboardFilters;
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ filters }) => {
  const [performanceData, setPerformanceData] = useState<PerformanceMetricsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPerformanceData();
  }, [filters]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getPerformanceMetrics();
      setPerformanceData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load performance metrics');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!performanceData) return;

    const workbook = XLSX.utils.book_new();
    const metricsSheet = XLSX.utils.json_to_sheet([performanceData]);
    XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Performance Metrics');
    XLSX.writeFile(workbook, 'performance_metrics_report.xlsx');
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

  if (!performanceData) {
    return <Alert severity="info">No performance data available</Alert>;
  }

  const metrics = [
    {
      title: 'Conversion Rate',
      value: `${performanceData.conversionRate.toFixed(2)}%`,
      icon: <TrendingUp fontSize="large" color="primary" />,
      description: 'Percentage of visitors who make a purchase',
      color: 'primary.main',
    },
    {
      title: 'Average Order Value',
      value: `$${performanceData.averageOrderValue.toFixed(2)}`,
      icon: <ShoppingCart fontSize="large" color="secondary" />,
      description: 'Average value of each order',
      color: 'secondary.main',
    },
    {
      title: 'Customer Retention Rate',
      value: `${performanceData.customerRetentionRate.toFixed(2)}%`,
      icon: <People fontSize="large" color="success" />,
      description: 'Percentage of customers who return',
      color: 'success.main',
    },
    {
      title: 'Return Rate',
      value: `${performanceData.returnRate.toFixed(2)}%`,
      icon: <Warning fontSize="large" color="warning" />,
      description: 'Percentage of orders that are returned',
      color: 'warning.main',
    },
  ];

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Performance Metrics</Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={exportToExcel}
        >
          Export to Excel
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Key Metrics Cards */}
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {metric.icon}
                </Box>
                <Typography variant="h4" component="div" gutterBottom>
                  {metric.value}
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {metric.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metric.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Performance Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Performance Summary for {performanceData.period}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" paragraph>
                <strong>Conversion Rate:</strong> {performanceData.conversionRate.toFixed(2)}% - This indicates the effectiveness of your sales funnel and marketing efforts.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Average Order Value:</strong> ${performanceData.averageOrderValue.toFixed(2)} - Shows the typical spending per customer transaction.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Customer Retention:</strong> {performanceData.customerRetentionRate.toFixed(2)}% - Measures customer loyalty and repeat business.
              </Typography>
              <Typography variant="body1" paragraph>
                <strong>Return Rate:</strong> {performanceData.returnRate.toFixed(2)}% - Indicates product quality and customer satisfaction levels.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recommendations
            </Typography>
            <Box sx={{ mt: 2 }}>
              {performanceData.conversionRate < 2 && (
                <Typography variant="body1" paragraph color="warning.main">
                  • Consider optimizing your website's user experience and checkout process to improve conversion rates.
                </Typography>
              )}
              {performanceData.averageOrderValue < 50 && (
                <Typography variant="body1" paragraph color="info.main">
                  • Implement upselling and cross-selling strategies to increase average order value.
                </Typography>
              )}
              {performanceData.customerRetentionRate < 30 && (
                <Typography variant="body1" paragraph color="success.main">
                  • Focus on customer loyalty programs and personalized marketing to improve retention.
                </Typography>
              )}
              {performanceData.returnRate > 5 && (
                <Typography variant="body1" paragraph color="error.main">
                  • Review product quality and shipping processes to reduce return rates.
                </Typography>
              )}
              {performanceData.conversionRate >= 3 && performanceData.customerRetentionRate >= 40 && (
                <Typography variant="body1" paragraph color="success.main">
                  • Excellent performance! Continue current strategies and look for opportunities to scale.
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceMetrics;