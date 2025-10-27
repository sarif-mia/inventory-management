import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Avatar,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  CheckCircle as VerifiedIcon,
  Cancel as RejectedIcon,
  Pending as PendingIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSellers,
  verifySeller,
  fetchSellerById,
} from '../../store/slices/sellerSlice';
import { Seller, SellerVerificationRequest, SellerFilters } from '../../types';
import { RootState } from '../../store';

const SellerVerificationWorkflow: React.FC = () => {
  const dispatch = useDispatch();
  const { sellers, currentSeller, loading, error } = useSelector((state: RootState) => state.sellers);

  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationAction, setVerificationAction] = useState<'verified' | 'rejected'>('verified');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [filters, setFilters] = useState<SellerFilters>({
    verification_status: 'pending',
  });

  useEffect(() => {
    dispatch(fetchSellers(filters));
  }, [dispatch, filters]);

  const handleVerificationClick = (seller: Seller, action: 'verified' | 'rejected') => {
    setSelectedSeller(seller);
    setVerificationAction(action);
    setVerificationNotes('');
    setVerificationDialogOpen(true);
  };

  const handleVerificationConfirm = async () => {
    if (!selectedSeller) return;

    const verificationData: SellerVerificationRequest = {
      seller_id: selectedSeller.id,
      status: verificationAction,
      notes: verificationNotes.trim() || undefined,
    };

    try {
      await dispatch(verifySeller(verificationData));
      setVerificationDialogOpen(false);
      setSelectedSeller(null);
      // Refresh the list
      dispatch(fetchSellers(filters));
    } catch (error) {
      // Error handled by slice
    }
  };

  const handleViewDetails = async (seller: Seller) => {
    setSelectedSeller(seller);
    await dispatch(fetchSellerById(seller.id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <VerifiedIcon />;
      case 'rejected':
        return <RejectedIcon />;
      case 'pending':
        return <PendingIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const pendingSellers = sellers.filter(seller => seller.verification_status === 'pending');

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Seller Verification Workflow
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PendingIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{pendingSellers.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Verification
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <VerifiedIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {sellers.filter(s => s.verification_status === 'verified').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verified Sellers
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <RejectedIcon color="error" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">
                    {sellers.filter(s => s.verification_status === 'rejected').length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Rejected Applications
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sellers Table */}
      <Paper elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Seller</TableCell>
                <TableCell>Business Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Commission Rate</TableCell>
                <TableCell>Registered</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sellers.map((seller) => (
                <TableRow key={seller.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ mr: 2 }}>
                        {seller.business_name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1">
                          {seller.user.first_name} {seller.user.last_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {seller.user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{seller.business_name}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(seller.verification_status)}
                      label={seller.verification_status}
                      color={getStatusColor(seller.verification_status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{seller.commission_rate}%</TableCell>
                  <TableCell>
                    {new Date(seller.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewDetails(seller)}
                      >
                        View Details
                      </Button>
                      {seller.verification_status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleVerificationClick(seller, 'verified')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleVerificationClick(seller, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {sellers.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No sellers found matching the current filters.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Seller Details Dialog */}
      <Dialog
        open={!!selectedSeller && !verificationDialogOpen}
        onClose={() => setSelectedSeller(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Seller Details - {selectedSeller?.business_name}
        </DialogTitle>
        <DialogContent>
          {currentSeller && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <BusinessIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Business Name"
                        secondary={currentSeller.business_name}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PhoneIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Phone Number"
                        secondary={currentSeller.phone_number}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Business Address"
                        secondary={currentSeller.business_address}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <DescriptionIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Business Description"
                        secondary={currentSeller.business_description}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Commission Rate"
                        secondary={`${currentSeller.commission_rate}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Tax ID"
                        secondary={currentSeller.tax_id || 'Not provided'}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Verification Documents
              </Typography>
              <List>
                {currentSeller.verification_documents.map((doc) => (
                  <ListItem key={doc.id}>
                    <ListItemText
                      primary={doc.document_type.replace('_', ' ').toUpperCase()}
                      secondary={`Uploaded: ${new Date(doc.uploaded_at).toLocaleDateString()}`}
                    />
                    <Chip
                      label={doc.verified ? 'Verified' : 'Pending'}
                      color={doc.verified ? 'success' : 'warning'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedSeller(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Verification Confirmation Dialog */}
      <Dialog open={verificationDialogOpen} onClose={() => setVerificationDialogOpen(false)}>
        <DialogTitle>
          {verificationAction === 'verified' ? 'Approve' : 'Reject'} Seller Application
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to {verificationAction === 'verified' ? 'approve' : 'reject'} the application for{' '}
            <strong>{selectedSeller?.business_name}</strong>?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (Optional)"
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
            placeholder="Add any notes about this decision..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerificationDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleVerificationConfirm}
            variant="contained"
            color={verificationAction === 'verified' ? 'success' : 'error'}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : `Confirm ${verificationAction === 'verified' ? 'Approval' : 'Rejection'}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerVerificationWorkflow;