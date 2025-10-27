import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Print as PrintIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchShipments, generateShippingLabel } from '../../store/slices/shippingSlice';
import { Shipment, ShippingLabel, ShippingFilters } from '../../types';

const ShippingLabelGeneration: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { shipments, shippingLabels, loading, error } = useSelector((state: RootState) => state.shipping);

  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [labelFormat, setLabelFormat] = useState<'pdf' | 'png' | 'zpl'>('pdf');
  const [filters, setFilters] = useState<ShippingFilters>({ status: 'pending' });
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewLabel, setPreviewLabel] = useState<ShippingLabel | null>(null);

  useEffect(() => {
    dispatch(fetchShipments(filters));
  }, [dispatch, filters]);

  const handleGenerateLabel = async () => {
    if (!selectedShipment) return;

    try {
      await dispatch(generateShippingLabel({
        shipmentId: selectedShipment.id,
        format: labelFormat
      })).unwrap();

      // Refresh shipments to get updated data
      dispatch(fetchShipments(filters));
    } catch (error) {
      console.error('Failed to generate shipping label:', error);
    }
  };

  const handleViewLabel = (label: ShippingLabel) => {
    setPreviewLabel(label);
    setPreviewDialogOpen(true);
  };

  const handleDownloadLabel = (label: ShippingLabel) => {
    // Create a download link for the label
    const link = document.createElement('a');
    link.href = `data:application/${label.format};base64,${label.label_data}`;
    link.download = `shipping-label-${label.shipment}.${label.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintLabel = (label: ShippingLabel) => {
    // For PDF labels, open in new window for printing
    if (label.format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Shipping Label</title></head>
            <body>
              <embed src="data:application/pdf;base64,${label.label_data}" width="100%" height="100%" />
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } else {
      // For image formats, create a printable version
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head><title>Shipping Label</title></head>
            <body>
              <img src="data:image/${label.format};base64,${label.label_data}" style="max-width: 100%; height: auto;" />
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const getShipmentLabels = (shipmentId: number) => {
    return shippingLabels.filter(label => label.shipment === shipmentId);
  };

  if (loading && shipments.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Shipping Label Generation & Printing
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Label Generation Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generate New Label
              </Typography>

              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Select Shipment</InputLabel>
                  <Select
                    value={selectedShipment?.id || ''}
                    onChange={(e) => {
                      const shipment = shipments.find(s => s.id === parseInt(e.target.value));
                      setSelectedShipment(shipment || null);
                    }}
                  >
                    {shipments
                      .filter(shipment => shipment.status === 'pending' || shipment.status === 'in_transit')
                      .map((shipment) => (
                        <MenuItem key={shipment.id} value={shipment.id}>
                          Order #{shipment.order_number} - {shipment.carrier}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Label Format</InputLabel>
                  <Select
                    value={labelFormat}
                    onChange={(e) => setLabelFormat(e.target.value as 'pdf' | 'png' | 'zpl')}
                  >
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="png">PNG</MenuItem>
                    <MenuItem value="zpl">ZPL (Thermal Printer)</MenuItem>
                  </Select>
                </FormControl>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleGenerateLabel}
                  disabled={!selectedShipment || loading}
                  startIcon={<PrintIcon />}
                >
                  {loading ? <CircularProgress size={20} /> : 'Generate Label'}
                </Button>
              </Box>

              {selectedShipment && (
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Shipment Details
                  </Typography>
                  <Typography variant="body2">
                    Order: #{selectedShipment.order_number}
                  </Typography>
                  <Typography variant="body2">
                    Customer: {selectedShipment.customer_name}
                  </Typography>
                  <Typography variant="body2">
                    Carrier: {selectedShipment.carrier}
                  </Typography>
                  <Typography variant="body2">
                    Tracking: {selectedShipment.tracking_number}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Generated Labels Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generated Labels
              </Typography>

              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Shipment</TableCell>
                      <TableCell>Format</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shippingLabels.map((label) => {
                      const shipment = shipments.find(s => s.id === label.shipment);
                      return (
                        <TableRow key={label.id} hover>
                          <TableCell>
                            {shipment ? `Order #${shipment.order_number}` : `Shipment ${label.shipment}`}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                              {label.format}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {new Date(label.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View Label">
                              <IconButton
                                size="small"
                                onClick={() => handleViewLabel(label)}
                                color="primary"
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Download Label">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadLabel(label)}
                                color="secondary"
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Print Label">
                              <IconButton
                                size="small"
                                onClick={() => handlePrintLabel(label)}
                                color="success"
                              >
                                <PrintIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {shippingLabels.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No shipping labels generated yet
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Label Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Shipping Label Preview
        </DialogTitle>
        <DialogContent>
          {previewLabel && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              {previewLabel.format === 'pdf' ? (
                <Box sx={{ height: 400 }}>
                  <embed
                    src={`data:application/pdf;base64,${previewLabel.label_data}`}
                    width="100%"
                    height="100%"
                    type="application/pdf"
                  />
                </Box>
              ) : (
                <img
                  src={`data:image/${previewLabel.format};base64,${previewLabel.label_data}`}
                  alt="Shipping Label"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
          {previewLabel && (
            <>
              <Button
                onClick={() => handleDownloadLabel(previewLabel)}
                startIcon={<DownloadIcon />}
              >
                Download
              </Button>
              <Button
                onClick={() => handlePrintLabel(previewLabel)}
                variant="contained"
                startIcon={<PrintIcon />}
              >
                Print
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShippingLabelGeneration;