import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CloudDownload as DownloadIcon,
  Edit as EditIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  PlayArrow as ProcessingIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  bulkImportInventory,
  bulkExportInventory,
  bulkUpdateInventory,
  getBulkOperationStatus,
} from '../../store/slices/inventorySlice';
import { BulkOperation, InventoryFilters } from '../../types';

const BulkOperations: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { bulkOperations, loading } = useSelector((state: RootState) => state.inventory);

  const [importDialog, setImportDialog] = useState(false);
  const [exportDialog, setExportDialog] = useState(false);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [exportFilters, setExportFilters] = useState<InventoryFilters>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      await dispatch(bulkImportInventory(selectedFile)).unwrap();
      setSnackbar({
        open: true,
        message: 'Import started successfully. Check progress below.',
        severity: 'success',
      });
      setImportDialog(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Import failed to start',
        severity: 'error',
      });
    }
  };

  const handleExport = async () => {
    try {
      const response = await dispatch(bulkExportInventory(exportFilters)).unwrap();
      // Create download link
      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSnackbar({
        open: true,
        message: 'Export completed successfully',
        severity: 'success',
      });
      setExportDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Export failed',
        severity: 'error',
      });
    }
  };

  const handleBulkUpdate = async () => {
    // This would typically involve collecting update data from a form
    // For now, we'll show a placeholder
    setSnackbar({
      open: true,
      message: 'Bulk update functionality would be implemented here',
      severity: 'info',
    });
    setUpdateDialog(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <SuccessIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'processing':
        return <ProcessingIcon color="primary" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'primary' | 'default' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'processing':
        return 'primary';
      default:
        return 'warning';
    }
  };

  const refreshOperationStatus = async (operationId: number) => {
    try {
      await dispatch(getBulkOperationStatus(operationId)).unwrap();
    } catch (error) {
      console.error('Failed to refresh operation status:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Bulk Operations
      </Typography>

      {/* Action Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <UploadIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Import Inventory</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Upload an Excel file to bulk import inventory data
              </Typography>
              <Button
                variant="contained"
                fullWidth
                startIcon={<UploadIcon />}
                onClick={() => setImportDialog(true)}
              >
                Start Import
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DownloadIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Export Inventory</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Download current inventory data as Excel file
              </Typography>
              <Button
                variant="contained"
                fullWidth
                startIcon={<DownloadIcon />}
                onClick={() => setExportDialog(true)}
              >
                Start Export
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <EditIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Bulk Update</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Update multiple inventory items at once
              </Typography>
              <Button
                variant="contained"
                fullWidth
                startIcon={<EditIcon />}
                onClick={() => setUpdateDialog(true)}
              >
                Start Update
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Operations History */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box p={3}>
          <Typography variant="h6" gutterBottom>
            Operation History
          </Typography>

          {bulkOperations.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                No bulk operations have been performed yet
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Operation</TableCell>
                    <TableCell align="right">Total Items</TableCell>
                    <TableCell align="right">Processed</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bulkOperations.map((operation) => (
                    <TableRow key={operation.id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {operation.operation_type.charAt(0).toUpperCase() + operation.operation_type.slice(1)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{operation.total_items}</TableCell>
                      <TableCell align="right">{operation.processed_items}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {getStatusIcon(operation.status)}
                          <Chip
                            label={operation.status}
                            color={getStatusColor(operation.status)}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                        {operation.status === 'processing' && (
                          <LinearProgress
                            variant="determinate"
                            value={(operation.processed_items / operation.total_items) * 100}
                            sx={{ mt: 1, width: 100 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(operation.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {operation.completed_at
                          ? new Date(operation.completed_at).toLocaleString()
                          : '-'
                        }
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Refresh Status">
                          <IconButton
                            size="small"
                            onClick={() => refreshOperationStatus(operation.id)}
                            disabled={operation.status === 'completed' || operation.status === 'failed'}
                          >
                            <PendingIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Import Dialog */}
      <Dialog open={importDialog} onClose={() => setImportDialog(false)}>
        <DialogTitle>Import Inventory Data</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, minWidth: 400 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select an Excel file (.xlsx) containing inventory data to import.
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              The file should have columns: product_name, warehouse_name, stock_quantity, min_stock_level, max_stock_level
            </Typography>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              fullWidth
              onClick={() => fileInputRef.current?.click()}
              sx={{ mt: 2 }}
            >
              {selectedFile ? selectedFile.name : 'Choose File'}
            </Button>

            {selectedFile && (
              <Alert severity="info" sx={{ mt: 2 }}>
                File selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialog(false)}>Cancel</Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!selectedFile || loading}
          >
            Start Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialog} onClose={() => setExportDialog(false)}>
        <DialogTitle>Export Inventory Data</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, minWidth: 400 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Export current inventory data to Excel format.
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              You can apply filters to export specific data.
            </Typography>

            {/* Add filter options here if needed */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialog(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained">
            Start Export
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Update Dialog */}
      <Dialog open={updateDialog} onClose={() => setUpdateDialog(false)}>
        <DialogTitle>Bulk Update Inventory</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, minWidth: 400 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Update multiple inventory items with the same changes.
            </Typography>
            {/* Add bulk update form fields here */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkUpdate} variant="contained">
            Start Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BulkOperations;