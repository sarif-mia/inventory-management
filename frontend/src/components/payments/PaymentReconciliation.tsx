import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Payment,
  CompareArrows,
  Settings,
  Assessment,
  ReportProblem,
  History,
  AccountBalance,
} from '@mui/icons-material';

// Import all payment components
import PaymentTransactionList from './PaymentTransactionList';
import PaymentReconciliationWorkflow from './PaymentReconciliationWorkflow';
import PaymentGatewayManagement from './PaymentGatewayManagement';
import ReconciliationReports from './ReconciliationReports';
import DisputeManagement from './DisputeManagement';
import PaymentHistory from './PaymentHistory';
import FinancialReports from './FinancialReports';

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

const PaymentReconciliation: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const tabs = [
    {
      label: 'Transactions',
      icon: <Payment />,
      component: <PaymentTransactionList />,
      description: 'View and manage payment transactions',
    },
    {
      label: 'Reconciliation',
      icon: <CompareArrows />,
      component: <PaymentReconciliationWorkflow />,
      description: 'Match payments to orders and resolve discrepancies',
    },
    {
      label: 'Gateways',
      icon: <Settings />,
      component: <PaymentGatewayManagement />,
      description: 'Configure and manage payment gateways',
    },
    {
      label: 'Reports',
      icon: <Assessment />,
      component: <ReconciliationReports />,
      description: 'Generate and view reconciliation reports',
    },
    {
      label: 'Disputes',
      icon: <ReportProblem />,
      component: <DisputeManagement />,
      description: 'Manage payment disputes and resolutions',
    },
    {
      label: 'History',
      icon: <History />,
      component: <PaymentHistory />,
      description: 'Audit trail and payment history',
    },
    {
      label: 'Financial',
      icon: <AccountBalance />,
      component: <FinancialReports />,
      description: 'Financial reports and analytics',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Payment Reconciliation & Management
      </Typography>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Comprehensive payment processing, reconciliation, and financial management system
      </Typography>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Transactions
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    1,247
                  </Typography>
                </Box>
                <Payment color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Reconciliation
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    23
                  </Typography>
                </Box>
                <CompareArrows color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Open Disputes
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    7
                  </Typography>
                </Box>
                <ReportProblem color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    98.5%
                  </Typography>
                </Box>
                <Assessment color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 72,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 1,
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {tab.label}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {tab.description}
                    </Typography>
                  </Box>
                }
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>

        {tabs.map((tab, index) => (
          <TabPanel key={index} value={tabValue} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Paper>
    </Box>
  );
};

export default PaymentReconciliation;