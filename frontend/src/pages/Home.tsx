import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Inventory Management System
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" gutterBottom>
          Manage your products, orders, and warehouse efficiently
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" size="large" component={Link} to="/products" sx={{ mr: 2 }}>
            View Products
          </Button>
          <Button variant="outlined" size="large" component={Link} to="/orders">
            View Orders
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;