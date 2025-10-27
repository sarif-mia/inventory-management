import React from 'react';
import { Container, Box } from '@mui/material';
import PaymentReconciliation from '../components/payments/PaymentReconciliation';

const PaymentManagement: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <PaymentReconciliation />
      </Box>
    </Container>
  );
};

export default PaymentManagement;