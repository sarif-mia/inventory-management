import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  ShoppingCart,
  AttachMoney,
  Inventory,
  Warning,
  CheckCircle,
  Pending,
} from '@mui/icons-material';
import { DashboardMetrics } from '../../types';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Sales',
      value: `$${metrics.totalSales.toLocaleString()}`,
      icon: <AttachMoney fontSize="large" color="primary" />,
      color: 'primary.main',
    },
    {
      title: 'Total Orders',
      value: metrics.totalOrders.toLocaleString(),
      icon: <ShoppingCart fontSize="large" color="secondary" />,
      color: 'secondary.main',
    },
    {
      title: 'Total Inventory',
      value: metrics.totalInventory.toLocaleString(),
      icon: <Inventory fontSize="large" color="success" />,
      color: 'success.main',
    },
    {
      title: 'Low Stock Alerts',
      value: metrics.lowStockAlerts.toString(),
      icon: <Warning fontSize="large" color="warning" />,
      color: 'warning.main',
    },
    {
      title: 'Pending Orders',
      value: metrics.pendingOrders.toString(),
      icon: <Pending fontSize="large" color="info" />,
      color: 'info.main',
    },
    {
      title: 'Completed Orders',
      value: metrics.completedOrders.toString(),
      icon: <CheckCircle fontSize="large" color="success" />,
      color: 'success.main',
    },
  ];

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
      {cards.map((card, index) => (
        <Grid item xs={6} sm={6} md={4} key={index}>
          <Card
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
              cursor: 'pointer',
              '&:hover': {
                transform: { xs: 'none', sm: 'translateY(-4px)' },
                boxShadow: { xs: 1, sm: 3 },
              },
              '&:active': {
                transform: { xs: 'scale(0.98)', sm: 'translateY(-4px)' },
              },
            }}
          >
            <CardContent
              sx={{
                flexGrow: 1,
                textAlign: 'center',
                p: { xs: 2, sm: 3 },
                '&:last-child': { pb: { xs: 2, sm: 3 } }
              }}
            >
              <Box sx={{ mb: { xs: 1, sm: 2 } }}>
                {React.cloneElement(card.icon, {
                  fontSize: 'large' as const,
                  sx: { fontSize: { xs: '2rem', sm: '2.5rem' } }
                })}
              </Box>
              <Typography
                variant="h4"
                component="div"
                gutterBottom
                sx={{
                  fontSize: { xs: '1.5rem', sm: '2.125rem' },
                  fontWeight: 'bold'
                }}
              >
                {card.value}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {card.title}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default MetricsCards;