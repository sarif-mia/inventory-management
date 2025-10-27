import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  ExpandMore as ExpandMoreIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getShippingRates } from '../../store/slices/shippingSlice';
import { ShippingRate, ShippingRateRequest, Address, Package } from '../../types';

const ShippingCostCalculator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { shippingRates, loading, error } = useSelector((state: RootState) => state.shipping);

  const [origin, setOrigin] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
  });

  const [destination, setDestination] = useState<Address>({
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US',
  });

  const [packages, setPackages] = useState<Package[]>([{
    weight: 1,
    dimensions: {
      length: 10,
      width: 8,
      height: 6,
    },
    value: 0,
  }]);

  const [selectedCarrier, setSelectedCarrier] = useState<string>('');

  const handleGetRates = async () => {
    const rateRequest: ShippingRateRequest = {
      origin,
      destination,
      packages,
      carrier: selectedCarrier || undefined,
    };

    try {
      await dispatch(getShippingRates(rateRequest)).unwrap();
    } catch (error) {
      console.error('Failed to get shipping rates:', error);
    }
  };

  const handleAddPackage = () => {
    setPackages([...packages, {
      weight: 1,
      dimensions: {
        length: 10,
        width: 8,
        height: 6,
      },
      value: 0,
    }]);
  };

  const handleUpdatePackage = (index: number, field: string, value: any) => {
    const updatedPackages = [...packages];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedPackages[index][parent][child] = value;
    } else {
      updatedPackages[index][field] = value;
    }
    setPackages(updatedPackages);
  };

  const handleRemovePackage = (index: number) => {
    if (packages.length > 1) {
      setPackages(packages.filter((_, i) => i !== index));
    }
  };

  const getBestRate = () => {
    if (shippingRates.length === 0) return null;
    return shippingRates.reduce((best, current) =>
      current.cost < best.cost ? current : best
    );
  };

  const getRateByCarrier = (carrier: string) => {
    return shippingRates.filter(rate => rate.carrier === carrier);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Shipping Cost Calculator & Rate Shopping
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Rate Calculator Form */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Calculate Shipping Rates
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Origin Address</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Street Address"
                          value={origin.street}
                          onChange={(e) => setOrigin({ ...origin, street: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="City"
                          value={origin.city}
                          onChange={(e) => setOrigin({ ...origin, city: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="State"
                          value={origin.state}
                          onChange={(e) => setOrigin({ ...origin, state: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="ZIP Code"
                          value={origin.zip_code}
                          onChange={(e) => setOrigin({ ...origin, zip_code: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Country"
                          value={origin.country}
                          onChange={(e) => setOrigin({ ...origin, country: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Destination Address</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Street Address"
                          value={destination.street}
                          onChange={(e) => setDestination({ ...destination, street: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="City"
                          value={destination.city}
                          onChange={(e) => setDestination({ ...destination, city: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="State"
                          value={destination.state}
                          onChange={(e) => setDestination({ ...destination, state: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="ZIP Code"
                          value={destination.zip_code}
                          onChange={(e) => setDestination({ ...destination, zip_code: e.target.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Country"
                          value={destination.country}
                          onChange={(e) => setDestination({ ...destination, country: e.target.value })}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Package Details</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {packages.map((pkg, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Package {index + 1}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6} md={3}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Weight (lbs)"
                              value={pkg.weight}
                              onChange={(e) => handleUpdatePackage(index, 'weight', parseFloat(e.target.value))}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Length (in)"
                              value={pkg.dimensions.length}
                              onChange={(e) => handleUpdatePackage(index, 'dimensions.length', parseFloat(e.target.value))}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Width (in)"
                              value={pkg.dimensions.width}
                              onChange={(e) => handleUpdatePackage(index, 'dimensions.width', parseFloat(e.target.value))}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Height (in)"
                              value={pkg.dimensions.height}
                              onChange={(e) => handleUpdatePackage(index, 'dimensions.height', parseFloat(e.target.value))}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Value ($)"
                              value={pkg.value}
                              onChange={(e) => handleUpdatePackage(index, 'value', parseFloat(e.target.value))}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box display="flex" gap={1}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={handleAddPackage}
                              >
                                Add Package
                              </Button>
                              {packages.length > 1 && (
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => handleRemovePackage(index)}
                                >
                                  Remove
                                </Button>
                              )}
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>

                <Box sx={{ mt: 2 }}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Preferred Carrier (Optional)</InputLabel>
                    <Select
                      value={selectedCarrier}
                      onChange={(e) => setSelectedCarrier(e.target.value)}
                      label="Preferred Carrier (Optional)"
                    >
                      <MenuItem value="">All Carriers</MenuItem>
                      <MenuItem value="UPS">UPS</MenuItem>
                      <MenuItem value="FedEx">FedEx</MenuItem>
                      <MenuItem value="USPS">USPS</MenuItem>
                      <MenuItem value="DHL">DHL</MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleGetRates}
                    disabled={loading}
                    startIcon={<CalculateIcon />}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Get Shipping Rates'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Rates Results */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shipping Rate Results
              </Typography>

              {shippingRates.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <ShippingIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Enter shipping details and click "Get Shipping Rates" to see available options
                  </Typography>
                </Box>
              ) : (
                <>
                  {getBestRate() && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Best Rate:</strong> {getBestRate()?.carrier} - {getBestRate()?.service} - ${getBestRate()?.cost.toFixed(2)}
                      </Typography>
                    </Alert>
                  )}

                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Carrier</TableCell>
                          <TableCell>Service</TableCell>
                          <TableCell>Cost</TableCell>
                          <TableCell>Delivery</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {shippingRates.map((rate, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Chip
                                label={rate.carrier}
                                size="small"
                                color={rate.carrier === getBestRate()?.carrier ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell>{rate.service}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                ${rate.cost.toFixed(2)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(rate.estimated_delivery).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShippingCostCalculator;