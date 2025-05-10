// dashboard/page.jsx
"use client";
import React from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Divider,
  Avatar,
  Button,
  LinearProgress,
} from "@mui/material";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Chart as ChartJS,
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  LineElement,
  BarElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

// Modern, clean theme
const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
    },
    primary: {
      main: "#3b82f6",
    },
    success: {
      main: "#10b981",
    },
    error: {
      main: "#ef4444",
    },
    warning: {
      main: "#f59e0b",
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

// Styled components
const StyledCard = styled(Card)({
  height: "100%",
  display: "flex",
  flexDirection: "column",
});

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

const ValueText = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  fontWeight: 700,
  color: theme.palette.text.primary,
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: 4,
  },
}));

// Chart data
const lineChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "Income",
      data: [10000, 12000, 15000, 13000, 14000, 16000, 17000],
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.05)",
      borderWidth: 2,
      tension: 0.3,
      fill: true,
    },
    {
      label: "Expenses",
      data: [8000, 9000, 8500, 9500, 10000, 11000, 12000],
      borderColor: "#ef4444",
      backgroundColor: "rgba(239, 68, 68, 0.05)",
      borderWidth: 2,
      tension: 0.3,
      fill: true,
    },
  ],
};

const spendingByCategoryData = {
  labels: ["Housing", "Food", "Transport", "Entertainment", "Utilities"],
  datasets: [
    {
      data: [3452, 1500, 2190, 800, 500],
      backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#64748b"],
      borderWidth: 0,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        usePointStyle: true,
        padding: 20,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      grid: {
        color: "#e2e8f0",
      },
    },
  },
};

const Dashboard = () => {
  const monthlyProgress = (2450 / 3276) * 100;
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          p: 3,
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back, Simon
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>SK</Avatar>
            <Box>
              <Typography variant="body1">Simon K. Jimmy</Typography>
              <Typography variant="body2" color="text.secondary">
                Mortgage Consultant
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={3}>
            <StyledCard>
              <CardContent>
                <SectionTitle>Available Balance</SectionTitle>
                <ValueText>$14,822</ValueText>
                <Typography variant="body2" color="text.secondary">
                  +12% from last month
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <StyledCard>
              <CardContent>
                <SectionTitle>Total Net Worth</SectionTitle>
                <ValueText>$27,878</ValueText>
                <Typography variant="body2" color="text.secondary">
                  +8% from last quarter
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <StyledCard>
              <CardContent>
                <SectionTitle>Monthly Spending</SectionTitle>
                <ValueText>$928</ValueText>
                <Typography variant="body2" color="text.secondary">
                  -5% from last month
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
          <Grid item xs={12} md={3}>
            <StyledCard>
              <CardContent>
                <SectionTitle>Monthly Budget</SectionTitle>
                <ValueText>$2,450 / $3,276</ValueText>
                <Box sx={{ mt: 1 }}>
                  <ProgressBar
                    variant="determinate"
                    value={monthlyProgress}
                    color={
                      monthlyProgress > 90
                        ? "error"
                        : monthlyProgress > 75
                        ? "warning"
                        : "primary"
                    }
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {Math.round(monthlyProgress)}% of budget used
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Income vs Expenses */}
          <Grid item xs={12} md={8}>
            <StyledCard>
              <CardContent>
                <SectionTitle>Income vs Expenses</SectionTitle>
                <Box sx={{ height: 300 }}>
                  <Line
                    data={lineChartData}
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        tooltip: {
                          mode: "index",
                          intersect: false,
                        },
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Spending Breakdown */}
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <SectionTitle>Spending by Category</SectionTitle>
                <Box sx={{ height: 250, mb: 2 }}>
                  <Doughnut
                    data={spendingByCategoryData}
                    options={chartOptions}
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="subtitle2" mb={1}>
                    Top Expenses
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Rent</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      $1,200
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Groceries</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      $450
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Transportation</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      $300
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Bills and Notifications */}
          <Grid item xs={12} md={8}>
            <StyledCard>
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <SectionTitle>Pending Bills</SectionTitle>
                  <Button size="small" variant="contained">
                    Pay All
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {[
                    { name: "Electric Bill", amount: 120, due: "May 15" },
                    { name: "Internet", amount: 75, due: "May 18" },
                    { name: "Car Insurance", amount: 150, due: "May 20" },
                  ].map((bill, index) => (
                    <Grid item xs={12} key={index}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: "8px",
                          backgroundColor: theme.palette.grey[100],
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {bill.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Due {bill.due}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            ${bill.amount}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </StyledCard>
          </Grid>

          {/* Recent Transactions */}
          <Grid item xs={12} md={4}>
            <StyledCard>
              <CardContent>
                <SectionTitle>Recent Transactions</SectionTitle>
                <Box mt={2}>
                  {[
                    { name: "Amazon", amount: 89.99, date: "May 10" },
                    { name: "Starbucks", amount: 4.95, date: "May 9" },
                    { name: "Whole Foods", amount: 76.32, date: "May 8" },
                  ].map((transaction, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 1.5,
                        borderBottom:
                          index < 2
                            ? `1px solid ${theme.palette.divider}`
                            : "none",
                      }}
                    >
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {transaction.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {transaction.date}
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={600}>
                        -${transaction.amount}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;