import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
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
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
} from '@mui/material';
import {
  Error,
  Refresh,
  CheckCircle,
  Warning,
  ExpandMore,
  PlayArrow,
  Stop,
  Settings,
  Info,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
  fetchSyncOperations,
  retrySyncOperation,
  cancelSyncOperation,
} from '../../store/slices/marketplaceSlice';
import { SyncOperation, SyncError } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const ErrorHandlingAndRetry: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { syncOperations, loading, error } = useSelector((state: RootState) => state.marketplace);

  const [tabValue, setTabValue] = useState(0);
  const [selectedOperation, setSelectedOperation] = useState<SyncOperation | null>(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [retryConfig, setRetryConfig] = useState({
    maxRetries: 3,
    retryDelay: 300,
    exponentialBackoff: true,
  });

  useEffect(() => {
    dispatch(fetchSyncOperations());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewErrors = (operation: SyncOperation) => {
    setSelectedOperation(operation);
    setErrorDialogOpen(true);
  };

  const handleRetryOperation = async (operationId: number) => {
    try {
      await dispatch(retrySyncOperation(operationId)).unwrap();
      dispatch(fetchSyncOperations());
    } catch (error) {
      console.error('Failed to retry operation:', error);
    }
  };

  const handleCancelOperation = async (operationId: number) => {
    if (window.confirm('Are you sure you want to cancel this operation?')) {
      try {
        await dispatch(cancelSyncOperation(operationId)).unwrap();
        dispatch(fetchSyncOperations());
      } catch (error) {
        console.error('Failed to cancel operation:', error);
      }
    }
  };

  const getErrorSeverityColor = (errorType: string) => {
    switch (errorType.toLowerCase()) {
      case 'critical':
      case 'authentication':
      case 'connection':
        return 'error';
      case 'warning':
      case 'timeout':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getOperationStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'failed': return 'error';
      case 'retrying': return 'warning';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const failedOperations = syncOperations.filter(op => op.status === 'failed');
  const retryingOperations = syncOperations.filter(op => op.status === 'retrying');

  if (loading && syncOperations.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          Error Handling & Retry Management
        </Typography>
        <Box display="flex" gap={2}>
          <Chip
            label={`${failedOperations.length} Failed`}
            color="error"
            variant="outlined"
          />
          <Chip
            label={`${retryingOperations.length} Retrying`}
            color="warning"
            variant="outlined"
          />
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Failed Operations" />
          <Tab label="Retry Configuration" />
          <Tab label="Error Logs" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Operation</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Errors</TableCell>
                  <TableCell>Retry Count</TableCell>
                  <TableCell>Last Attempt</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {failedOperations.map((operation: SyncOperation) => (
                  <TableRow key={operation.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {operation.operation_type}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {operation.id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={operation.direction}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={operation.status}
                        color={getOperationStatusColor(operation.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Error color="error" />
                        <Typography variant="body2">
                          {operation.errors.length} errors
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {operation.retry_count}/{operation.max_retries}
                      </Typography>
                    </TableCell>
                    <TableCell>{new Date(operation.started_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="View Errors">
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleViewErrors(operation)}
                          >
                            <Info />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Retry">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleRetryOperation(operation.id)}
                            disabled={operation.retry_count >= operation.max_retries}
                          >
                            <Refresh />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleCancelOperation(operation.id)}
                          >
                            <Stop />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {failedOperations.length === 0 && (
            <Box textAlign="center" py={4}>
              <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No failed operations
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All sync operations are running successfully
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box display="flex" flexDirection="column" gap={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Global Retry Configuration
                </Typography>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr 1fr' }} gap={2}>
                  <TextField
                    label="Max Retries"
                    type="number"
                    value={retryConfig.maxRetries}
                    onChange={(e) => setRetryConfig(prev => ({ ...prev, maxRetries: parseInt(e.target.value) }))}
                    size="small"
                  />
                  <TextField
                    label="Retry Delay (seconds)"
                    type="number"
                    value={retryConfig.retryDelay}
                    onChange={(e) => setRetryConfig(prev => ({ ...prev, retryDelay: parseInt(e.target.value) }))}
                    size="small"
                  />
                  <TextField
                    label="Exponential Backoff"
                    select
                    value={retryConfig.exponentialBackoff.toString()}
                    onChange={(e) => setRetryConfig(prev => ({ ...prev, exponentialBackoff: e.target.value === 'true' }))}
                    size="small"
                  >
                    <MenuItem value="true">Enabled</MenuItem>
                    <MenuItem value="false">Disabled</MenuItem>
                  </TextField>
                </Box>
                <Button variant="contained" sx={{ mt: 2 }}>
                  Update Configuration
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Error Type Handling
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  {[
                    { type: 'Authentication', retryable: false, description: 'API key or token issues' },
                    { type: 'Rate Limit', retryable: true, description: 'Too many requests' },
                    { type: 'Network', retryable: true, description: 'Connection or timeout issues' },
                    { type: 'Validation', retryable: false, description: 'Data validation errors' },
                    { type: 'Server Error', retryable: true, description: 'Marketplace server issues' },
                  ].map((errorType, index) => (
                    <Box key={index} display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {errorType.type}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {errorType.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={errorType.retryable ? 'Retryable' : 'Non-retryable'}
                        color={errorType.retryable ? 'success' : 'error'}
                        size="small"
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Recent Error Logs
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            {syncOperations
              .filter(op => op.errors.length > 0)
              .flatMap(op =>
                op.errors.map((error, errorIndex) => (
                  <Card key={`${op.id}-${errorIndex}`}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            Operation {op.id} - {op.operation_type}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {new Date(error.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                        <Chip
                          label={error.error_type}
                          color={getErrorSeverityColor(error.error_type)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="error">
                        {error.error_message}
                      </Typography>
                      {error.error_details && (
                        <Accordion sx={{ mt: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="caption">Error Details</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <pre style={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(error.error_details, null, 2)}
                            </pre>
                          </AccordionDetails>
                        </Accordion>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
          </Box>

          {syncOperations.filter(op => op.errors.length > 0).length === 0 && (
            <Box textAlign="center" py={4}>
              <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                No errors found
              </Typography>
              <Typography variant="body2" color="textSecondary">
                All operations completed successfully
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Error Details Dialog */}
      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Operation Errors - {selectedOperation?.id}
        </DialogTitle>
        <DialogContent>
          {selectedOperation && (
            <Box mt={2}>
              <Box display="flex" gap={2} mb={3}>
                <Chip label={`Type: ${selectedOperation.operation_type}`} />
                <Chip label={`Direction: ${selectedOperation.direction}`} />
                <Chip label={`Status: ${selectedOperation.status}`} color={getOperationStatusColor(selectedOperation.status)} />
              </Box>

              <Typography variant="h6" gutterBottom>
                Error Details
              </Typography>

              {selectedOperation.errors.map((error: SyncError, index: number) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="body2" fontWeight="bold">
                        {error.error_type}
                      </Typography>
                      <Box display="flex" gap={1}>
                        <Chip
                          label={error.retryable ? 'Retryable' : 'Non-retryable'}
                          color={error.retryable ? 'success' : 'error'}
                          size="small"
                        />
                        <Typography variant="caption" color="textSecondary">
                          {new Date(error.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                      {error.error_message}
                    </Typography>
                    {error.error_details && (
                      <details>
                        <summary style={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                          Technical Details
                        </summary>
                        <pre style={{ fontSize: '0.75rem', marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(error.error_details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrorDialogOpen(false)}>Close</Button>
          {selectedOperation && selectedOperation.status === 'failed' && (
            <Button
              variant="contained"
              onClick={() => {
                handleRetryOperation(selectedOperation.id);
                setErrorDialogOpen(false);
              }}
              disabled={selectedOperation.retry_count >= selectedOperation.max_retries}
            >
              Retry Operation
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ErrorHandlingAndRetry;