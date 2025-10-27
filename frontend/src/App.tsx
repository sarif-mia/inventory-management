import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { store } from './store';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InventoryManagement from './pages/InventoryManagement';
import OrderManagement from './pages/OrderManagement';
import SellerManagement from './pages/SellerManagement';
import ShippingManagement from './pages/ShippingManagement';
import PaymentManagement from './pages/PaymentManagement';
import MarketplaceManagement from './pages/MarketplaceManagement';
import QuickCommerceManagement from './pages/QuickCommerceManagement';
import MobileNavigation from './components/MobileNavigation';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44, // Touch-friendly button size
          '@media (max-width: 600px)': {
            fontSize: '0.875rem',
            padding: '8px 16px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            '& .MuiInputBase-root': {
              fontSize: '1rem', // Prevent zoom on iOS
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            margin: '8px',
            borderRadius: '12px',
          },
        },
      },
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ pb: { xs: 7, md: 0 } }}> {/* Add bottom padding for mobile nav */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<InventoryManagement />} />
              <Route path="/orders" element={<OrderManagement />} />
              <Route path="/shipping" element={<ShippingManagement />} />
              <Route path="/payments" element={<PaymentManagement />} />
              <Route path="/marketplace" element={<MarketplaceManagement />} />
              <Route path="/quick-commerce" element={<QuickCommerceManagement />} />
              <Route path="/sellers/:sellerId" element={<SellerManagement />} />
            </Routes>
          </Box>
          <MobileNavigation />
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
