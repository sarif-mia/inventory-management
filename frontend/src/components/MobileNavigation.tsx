import React, { useState } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  ShoppingCart as OrdersIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Store as MarketplaceIcon,
  ShoppingBasket as QuickCommerceIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileNavigationProps {
  isAuthenticated?: boolean;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ isAuthenticated = true }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigationItems = [
    { label: 'Home', path: '/', icon: <HomeIcon />, requiresAuth: false },
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon />, requiresAuth: true },
    { label: 'Inventory', path: '/inventory', icon: <InventoryIcon />, requiresAuth: true },
    { label: 'Orders', path: '/orders', icon: <OrdersIcon />, requiresAuth: true },
    { label: 'Shipping', path: '/shipping', icon: <ShippingIcon />, requiresAuth: true },
    { label: 'Payments', path: '/payments', icon: <PaymentIcon />, requiresAuth: true },
    { label: 'Marketplace', path: '/marketplace', icon: <MarketplaceIcon />, requiresAuth: true },
    { label: 'Quick Commerce', path: '/quick-commerce', icon: <QuickCommerceIcon />, requiresAuth: true },
    { label: 'Login', path: '/login', icon: <LoginIcon />, requiresAuth: false },
  ];

  const filteredItems = navigationItems.filter(item =>
    !item.requiresAuth || isAuthenticated
  );

  const bottomNavItems = filteredItems.slice(0, 5); // Show first 5 items in bottom nav
  const drawerItems = filteredItems; // Show all items in drawer

  const handleNavigation = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const getCurrentValue = () => {
    const currentItem = bottomNavItems.find(item => item.path === location.pathname);
    return currentItem ? bottomNavItems.indexOf(currentItem) : 0;
  };

  if (!isMobile) {
    return null; // Don't render mobile navigation on desktop
  }

  return (
    <>
      {/* Bottom Navigation */}
      <BottomNavigation
        value={getCurrentValue()}
        onChange={(_, newValue) => {
          if (bottomNavItems[newValue]) {
            handleNavigation(bottomNavItems[newValue].path);
          }
        }}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: 1,
          borderColor: 'divider',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            maxWidth: 'none',
            flex: 1,
          },
        }}
      >
        {bottomNavItems.map((item, index) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            sx={{
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                '&.Mui-selected': {
                  fontSize: '0.75rem',
                },
              },
            }}
          />
        ))}
        {/* Menu button for drawer */}
        <BottomNavigationAction
          label="More"
          icon={<MenuIcon />}
          onClick={() => setDrawerOpen(true)}
          sx={{
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
            },
          }}
        />
      </BottomNavigation>

      {/* Drawer for additional navigation */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '70vh',
          },
        }}
      >
        <List sx={{ pt: 2 }}>
          {drawerItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default MobileNavigation;