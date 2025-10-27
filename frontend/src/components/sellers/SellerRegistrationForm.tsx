import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { registerSeller } from '../../store/slices/sellerSlice';
import { SellerRegistrationRequest } from '../../types';
import { RootState } from '../../store';

const SellerRegistrationForm: React.FC = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.sellers);

  const [formData, setFormData] = useState<SellerRegistrationRequest>({
    business_name: '',
    business_description: '',
    business_address: '',
    phone_number: '',
    tax_id: '',
    commission_rate: 0,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof SellerRegistrationRequest) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'commission_rate' ? parseFloat(event.target.value) || 0 : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.business_name.trim()) {
      errors.business_name = 'Business name is required';
    }
    if (!formData.business_description.trim()) {
      errors.business_description = 'Business description is required';
    }
    if (!formData.business_address.trim()) {
      errors.business_address = 'Business address is required';
    }
    if (!formData.phone_number.trim()) {
      errors.phone_number = 'Phone number is required';
    }
    if (formData.commission_rate < 0 || formData.commission_rate > 100) {
      errors.commission_rate = 'Commission rate must be between 0 and 100';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      await dispatch(registerSeller(formData));
      // Reset form on success
      setFormData({
        business_name: '',
        business_description: '',
        business_address: '',
        phone_number: '',
        tax_id: '',
        commission_rate: 0,
      });
    } catch (error) {
      // Error is handled by the slice
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        maxWidth: 800,
        mx: 'auto',
        width: '100%'
      }}
      role="main"
      aria-labelledby="seller-registration-title"
    >
      <Typography
        id="seller-registration-title"
        variant="h4"
        component="h1"
        gutterBottom
        align="center"
        sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
      >
        Seller Registration
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        align="center"
        sx={{ mb: 4, fontSize: { xs: '0.875rem', sm: '1rem' } }}
      >
        Join our marketplace as a seller and start growing your business
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        role="form"
        aria-labelledby="seller-registration-title"
      >
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Business Name"
              value={formData.business_name}
              onChange={handleInputChange('business_name')}
              error={!!formErrors.business_name}
              helperText={formErrors.business_name}
              required
              disabled={loading}
              inputProps={{ 'aria-describedby': 'business-name-helper' }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone_number}
              onChange={handleInputChange('phone_number')}
              error={!!formErrors.phone_number}
              helperText={formErrors.phone_number}
              required
              disabled={loading}
              inputProps={{ 'aria-describedby': 'phone-number-helper' }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Business Description"
              value={formData.business_description}
              onChange={handleInputChange('business_description')}
              error={!!formErrors.business_description}
              helperText={formErrors.business_description}
              multiline
              rows={3}
              required
              disabled={loading}
              inputProps={{ 'aria-describedby': 'business-description-helper' }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Business Address"
              value={formData.business_address}
              onChange={handleInputChange('business_address')}
              error={!!formErrors.business_address}
              helperText={formErrors.business_address}
              multiline
              rows={2}
              required
              disabled={loading}
              inputProps={{ 'aria-describedby': 'business-address-helper' }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tax ID (Optional)"
              value={formData.tax_id}
              onChange={handleInputChange('tax_id')}
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Commission Rate (%)"
              type="number"
              value={formData.commission_rate}
              onChange={handleInputChange('commission_rate')}
              error={!!formErrors.commission_rate}
              helperText={formErrors.commission_rate}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              inputProps={{
                min: 0,
                max: 100,
                step: 0.1,
                'aria-describedby': 'commission-rate-helper'
              }}
              required
              disabled={loading}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  minWidth: { xs: 150, sm: 200 },
                  py: 1.5,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
                aria-describedby="register-button-description"
              >
                {loading ? <CircularProgress size={24} /> : 'Register as Seller'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mt: 3, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
        id="register-button-description"
      >
        By registering, you agree to our terms of service and seller agreement.
        Your application will be reviewed before approval.
      </Typography>
    </Paper>
  );
};

export default SellerRegistrationForm;