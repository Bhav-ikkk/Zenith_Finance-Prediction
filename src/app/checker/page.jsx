// checker/page.jsx
"use client";
import { useState, useContext } from "react";
import {
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List as DrawerList,
  ListItem as DrawerListItem,
  ListItemText,
  TextField,
  Button,
  CircularProgress,
  LinearProgress,
  Card,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  Snackbar,
  Autocomplete,
  InputAdornment,
  Tooltip,
  Avatar,
  Modal,
  Fade,
  Grow,
  LinearProgress as Progress,
  FormControl,
  FormHelperText,
  Divider,
  styled,
} from "@mui/material";
import {
  Menu as MenuIcon,
  MonetizationOn as MonetizationOnIcon,
  TrendingUp as TrendingUpIcon,
  Flag as TargetIcon,
  Insights as InsightsIcon,
  Lightbulb as LightbulbIcon,
  Map as MapIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, BarElement, LinearScale, CategoryScale, Title, Tooltip as ChartJSTooltip, Legend as ChartLegend } from "chart.js";
import { SidebarContext } from '../layout'; 

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, LinearScale, CategoryScale, Title, ChartJSTooltip, ChartLegend);

// Custom theme
const theme = createTheme({
  palette: {
    primary: { main: "#1e3a8a", contrastText: "#fff" },
    secondary: { main: "#2dd4bf" },
    background: { default: "#f8fafc", paper: "#fff" },
    success: { main: "#16a34a" },
    warning: { main: "#f59e0b" },
    text: { primary: "#1f2937", secondary: "#6b7280" },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
    h1: { fontSize: "2.25rem", fontWeight: 600, letterSpacing: "-0.02em" },
    h2: { fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.01em" },
    h3: { fontSize: "1.125rem", fontWeight: 500 },
    body1: { fontSize: "0.875rem", color: "#1f2937" },
    body2: { fontSize: "0.75rem", color: "#6b7280" },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          transition: "box-shadow 0.3s ease, transform 0.3s ease",
          "&:hover": { boxShadow: "0 6px 16px rgba(0,0,0,0.15)", transform: "translateY(-2px)" },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          padding: "8px 20px",
          fontWeight: 500,
          fontSize: "0.875rem",
        },
        containedPrimary: {
          background: "linear-gradient(45deg, #1e3a8a 30%, #3b82f6 90%)",
          "&:hover": { background: "linear-gradient(45deg, #1e40af 30%, #60a5fa 90%)" },
        },
        outlined: {
          borderColor: "#e5e7eb",
          "&:hover": { borderColor: "#1e3a8a", backgroundColor: "#f8fafc" },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "&:hover fieldset": { borderColor: "#1e3a8a" },
            "&.Mui-focused fieldset": { borderColor: "#1e3a8a", borderWidth: 2 },
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "none",
          border: "1px solid #e5e7eb",
          "&:before": { display: "none" },
          "&.Mui-expanded": { margin: 0 },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: "#e5e7eb", margin: "20px 0" },
      },
    },
  },
});

// Goal options for Autocomplete
const goalOptions = [
  "Save for Travel",
  "Buy a Car",
  "Home Down Payment",
  "Emergency Fund",
  "Retirement",
];

// Styled components
const SectionCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(6),
  background: "#fff",
}));

const ModalContent = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 600,
  backgroundColor: theme.palette.background.paper,
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  boxShadow: theme.shadows[24],
  padding: theme.spacing(2.5),
}));

// Chart colors
const chartColors = ["#1e3a8a", "#2dd4bf", "#f59e0b", "#e11d48", "#16a34a"];

export default function FinancialAdvisor() {
  const { sidebarOpen } = useContext(SidebarContext); // Use context to get sidebar state
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState({ open: false, content: null });
  const [form, setForm] = useState({
    income: 5000,
    expenses: 3000,
    goals: [{ description: "Buy a Car", cost: 20000, priority: 1 }],
    duration_months: 12,
    currency: "INR",
    spending_categories: { Food: 1000, Rent: 1500 },
    transaction_file: null,
  });
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!form.income || form.income <= 0) errors.income = "Income must be a positive number";
    if (!form.expenses || form.expenses < 0) errors.expenses = "Expenses cannot be negative";
    if (!form.goals || form.goals.length === 0 || !form.goals[0].description)
      errors.goals = "At least one goal with a description is required";
    if (!form.duration_months || form.duration_months <= 0)
      errors.duration_months = "Duration must be a positive number";
    if (form.transaction_file && !form.transaction_file.name.match(/\.(xlsx|xls)$/i))
      errors.transaction_file = "File must be an Excel file (.xlsx or .xls)";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({ open: true, message: "Please fix the form errors", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("income", form.income);
      formData.append("expenses", form.expenses);
      formData.append("goals", JSON.stringify(form.goals));
      formData.append("duration_months", form.duration_months);
      formData.append("currency", form.currency);
      formData.append("spending_categories", JSON.stringify(form.spending_categories));
      if (form.transaction_file) {
        formData.append("transaction_file", form.transaction_file);
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Failed to fetch analysis");
      }
      const data = await res.json();
      setResponse(data);
      setSnackbar({ open: true, message: "Analysis completed successfully!", severity: "success" });
    } catch (error) {
      console.error("Failed to fetch:", error);
      setSnackbar({ open: true, message: "Failed to fetch analysis. Please try again.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const openModal = (content) => {
    setModalOpen({ open: true, content });
  };

  const closeModal = () => {
    setModalOpen({ open: false, content: null });
  };

  // Mock savings trend data
  const savingsTrendData = {
    labels: Array.from({ length: form.duration_months }, (_, i) => `Month ${i + 1}`),
    datasets: [
      {
        label: "Projected Savings",
        data: Array.from({ length: form.duration_months }, (_, i) => (response ? response.analysis.monthly_savings * (i + 1) : 0)),
        backgroundColor: "#1e3a8a",
        borderColor: "#1e3a8a",
        borderWidth: 1,
      },
    ],
  };

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* AppBar */}
        <AppBar position="fixed" sx={{ background: "linear-gradient(45deg, #1e3a8a 30%, #3b82f6 90%)", top: 0 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h1" sx={{ flexGrow: 1, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
              WealthWise AI
            </Typography>
          </Toolbar>
          {loading && <LinearProgress />}
        </AppBar>

        {/* Drawer for mobile navigation */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          sx={{ "& .MuiDrawer-paper": { width: { xs: 240, md: 300 }, bgcolor: "#fff", pt: 8, px: 2, borderRight: "1px solid #e5e7eb" } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h2" sx={{ mb: 2 }}>
              Navigation
            </Typography>
            <DrawerList>
              <DrawerListItem button onClick={toggleDrawer(false)}>
                <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 500, color: "primary.main" }} />
              </DrawerListItem>
              <DrawerListItem button onClick={toggleDrawer(false)}>
                <ListItemText primary="Settings" primaryTypographyProps={{ fontWeight: 500, color: "primary.main" }} />
              </DrawerListItem>
            </DrawerList>
          </Box>
        </Drawer>

        <Container maxWidth="xl" sx={{ mt: 10, mb: 8 }}>
          {/* Main Content */}
          <Box>
            {/* Header */}
            <SectionCard sx={{ textAlign: "center" }}>
              <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64, mx: "auto", mb: 2 }}>
                <MonetizationOnIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h1" color="text.primary">
                Your Financial Future, Optimized
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 600, mx: "auto" }}>
                Unlock personalized, AI-driven financial insights to achieve your goals with precision and confidence.
              </Typography>
            </SectionCard>

            {/* Input Form */}
            <SectionCard>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h2" color="text.primary">
                  Financial Profile
                </Typography>
              </Box>
              <Box component="form">
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h3">Income & Expenses</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!formErrors.income}>
                          <Tooltip title="Your total monthly income in INR">
                            <TextField
                              label="Monthly Income"
                              type="number"
                              value={form.income}
                              onChange={(e) => setForm({ ...form, income: Number(e.target.value) })}
                              variant="outlined"
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              }}
                              aria-describedby="income-helper-text"
                              error={!!formErrors.income}
                            />
                          </Tooltip>
                          <FormHelperText id="income-helper-text">
                            {formErrors.income || "Total monthly income in INR"}
                          </FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!formErrors.expenses}>
                          <Tooltip title="Your total monthly expenses in INR">
                            <TextField
                              label="Monthly Expenses"
                              type="number"
                              value={form.expenses}
                              onChange={(e) => setForm({ ...form, expenses: Number(e.target.value) })}
                              variant="outlined"
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              }}
                              aria-describedby="expenses-helper-text"
                              error={!!formErrors.expenses}
                            />
                          </Tooltip>
                          <FormHelperText id="expenses-helper-text">
                            {formErrors.expenses || "Total monthly expenses in INR"}
                          </FormHelperText>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
                <Accordion defaultExpanded sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h3">Financial Goals</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth error={!!formErrors.goals}>
                          <Tooltip title="Select or type your financial goal">
                            <Autocomplete
                              options={goalOptions}
                              value={form.goals[0]?.description || ""}
                              onChange={(e, newValue) =>
                                setForm({
                                  ...form,
                                  goals: newValue ? [{ description: newValue, cost: form.goals[0]?.cost || 0, priority: form.goals[0]?.priority || 1 }] : [],
                                })
                              }
                              freeSolo
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Financial Goal"
                                  variant="outlined"
                                  error={!!formErrors.goals}
                                />
                              )}
                            />
                          </Tooltip>
                          <FormHelperText>{formErrors.goals || "Select or enter your financial goal"}</FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={!!formErrors.goals}>
                          <Tooltip title="Cost of your goal in INR">
                            <TextField
                              label="Goal Cost"
                              type="number"
                              value={form.goals[0]?.cost || ""}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  goals: [{ ...form.goals[0], cost: Number(e.target.value) }],
                                })
                              }
                              variant="outlined"
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              }}
                              aria-describedby="goal-cost-helper-text"
                            />
                          </Tooltip>
                          <FormHelperText id="goal-cost-helper-text">Cost of the goal in INR</FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <Tooltip title="Priority of your goal (1 is highest)">
                            <TextField
                              label="Goal Priority"
                              type="number"
                              value={form.goals[0]?.priority || 1}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  goals: [{ ...form.goals[0], priority: Number(e.target.value) }],
                                })
                              }
                              variant="outlined"
                              aria-describedby="goal-priority-helper-text"
                            />
                          </Tooltip>
                          <FormHelperText id="goal-priority-helper-text">Priority (1 is highest)</FormHelperText>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth error={!!formErrors.duration_months}>
                          <Tooltip title="Duration in months to achieve your goal">
                            <TextField
                              label="Goal Duration (Months)"
                              type="number"
                              value={form.duration_months}
                              onChange={(e) => setForm({ ...form, duration_months: Number(e.target.value) })}
                              variant="outlined"
                              aria-describedby="duration-helper-text"
                              error={!!formErrors.duration_months}
                            />
                          </Tooltip>
                          <FormHelperText id="duration-helper-text">
                            {formErrors.duration_months || "Duration in months"}
                          </FormHelperText>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h3">Transaction Records</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <FormControl fullWidth error={!!formErrors.transaction_file}>
                      <Tooltip title="Optionally upload an Excel file with transaction records">
                        <TextField
                          label="Transaction Records (Optional)"
                          type="file"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{ accept: ".xlsx,.xls" }}
                          onChange={(e) => setForm({ ...form, transaction_file: e.target.files[0] })}
                          variant="outlined"
                          aria-describedby="transaction-file-helper-text"
                          error={!!formErrors.transaction_file}
                        />
                      </Tooltip>
                      <FormHelperText id="transaction-file-helper-text">
                        {formErrors.transaction_file || "Upload an Excel file (.xlsx or .xls) with transaction data"}
                      </FormHelperText>
                    </FormControl>
                  </AccordionDetails>
                </Accordion>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{ mt: 3, py: 1 }}
                >
                  {loading ? "Analyzing..." : "Generate Financial Plan"}
                </Button>
              </Box>
            </SectionCard>

            {/* Response Output */}
            {response && (
              <Box>
                {/* Overview */}
                <SectionCard>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", mr: 2, width: 36, height: 36 }}>
                      <MonetizationOnIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="h2">Financial Overview</Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={6} sm={6} md={3} lg={3}>
                      <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                        <Typography variant="body2" color="text.secondary">Monthly Income</Typography>
                        <Typography variant="h3" color="primary">
                          ₹{response.overview.monthly_income.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={3} lg={3}>
                      <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                        <Typography variant="body2" color="text.secondary">Monthly Expenses</Typography>
                        <Typography variant="h3" color="primary">
                          ₹{response.overview.monthly_expenses.toLocaleString()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={3} lg={3}>
                      <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                        <Typography variant="body2" color="text.secondary">Goal</Typography>
                        <Typography variant="h3" color="primary">
                          {response.overview.goals[0]?.description}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={3} lg={3}>
                      <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                        <Typography variant="body2" color="text.secondary">Duration</Typography>
                        <Typography variant="h3" color="primary">
                          {response.overview.target_months} months
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </SectionCard>

                {/* Analysis */}
                <SectionCard>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", mr: 2, width: 36, height: 36 }}>
                      <TrendingUpIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="h2">Financial Analysis</Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={6}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="h3" gutterBottom>
                          Spending Breakdown
                        </Typography>
                        <Pie
                          data={{
                            labels: Object.keys(response.analysis.category_insights),
                            datasets: [
                              {
                                data: Object.values(response.analysis.category_insights).map((i) => i.amount),
                                backgroundColor: chartColors,
                                borderColor: chartColors.map((c) => c.replace("1.0", "0.8")),
                                borderWidth: 1,
                              },
                            ],
                          }}
                          options={{
                            plugins: {
                              legend: { position: "bottom", labels: { font: { size: 10 } } },
                              tooltip: {
                                callbacks: {
                                  label: (context) => `₹${context.raw.toLocaleString()} (${((context.raw / Object.values(response.analysis.category_insights).reduce((sum, i) => sum + i.amount, 0)) * 100).toFixed(2)}%)`,
                                },
                              },
                            },
                          }}
                          height={220}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="h3" gutterBottom>
                          Key Metrics
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                              <Typography variant="body2" color="text.secondary">Monthly Savings</Typography>
                              <Typography variant="h3" color="primary">
                                ₹{response.analysis.monthly_savings.toLocaleString()}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                              <Typography variant="body2" color="text.secondary">Savings Ratio</Typography>
                              <Typography variant="h3" color="primary">
                                {response.analysis.saving_ratio}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: 8, border: "1px solid #e5e7eb" }}>
                              <Typography variant="body2" color="text.secondary">Grade</Typography>
                              <Chip label={response.analysis.grade} color="success" sx={{ mt: 1 }} />
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                      <Box sx={{ p: 2 }}>
                        <Typography variant="h3" gutterBottom>
                          Category Insights
                        </Typography>
                        <Grid container spacing={3}>
                          {Object.entries(response.analysis.category_insights).map(([category, insight]) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={category}>
                              <Card
                                sx={{ p: 2, cursor: "pointer" }}
                                onClick={() =>
                                  openModal(
                                    <Box>
                                      <Typography variant="h3">{category} Details</Typography>
                                      <Typography variant="body1" sx={{ mt: 2 }}>
                                        <strong>Amount:</strong> ₹{insight.amount.toLocaleString()}
                                      </Typography>
                                      <Typography variant="body1">
                                        <strong>Percentage:</strong> {insight.percentage}%
                                      </Typography>
                                      <Typography variant="body1">
                                        <strong>Tip:</strong> {insight.tip}
                                      </Typography>
                                      <Button onClick={closeModal} sx={{ mt: 2 }} variant="contained">
                                        Close
                                      </Button>
                                    </Box>
                                  )
                                }
                              >
                                <Typography variant="h3">{category}</Typography>
                                <Typography variant="body1" sx={{ mt: 1 }}>
                                  ₹{insight.amount.toLocaleString()} ({insight.percentage}%)
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                  {insight.tip}
                                </Typography>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </SectionCard>

                {/* Goal Feasibility */}
                <SectionCard>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", mr: 2, width: 36, height: 36 }}>
                      <TargetIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="h2">Goal Feasibility</Typography>
                  </Box>
                  <Grid container spacing={3}>
                    {response.goal_feasibility.map((goal, index) => (
                      <Grid item xs={12} md={6} lg={4} key={index}>
                        <Card sx={{ p: 2 }}>
                          <Typography variant="h2" gutterBottom>
                            {goal.goal}
                          </Typography>
                          <Typography variant="body1">
                            <strong>Estimated Savings:</strong> ₹{goal.feasibility.estimated_savings.toLocaleString()}
                          </Typography>
                          <Typography variant="body1">
                            <strong>Goal Cost:</strong> ₹{goal.feasibility.goal_cost.toLocaleString()}
                          </Typography>
                          <Typography variant="body1">
                            <strong>Inflation Adjusted Cost:</strong> ₹{response.enhancements.inflation_adjusted_goal_cost.toLocaleString()}
                          </Typography>
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary">Progress to Goal</Typography>
                            <Progress
                              variant="determinate"
                              value={Math.min((goal.feasibility.estimated_savings / goal.feasibility.goal_cost) * 100, 100)}
                              sx={{ mt: 1, height: 8, borderRadius: 4, bgcolor: "#e5e7eb" }}
                            />
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {((goal.feasibility.estimated_savings / goal.feasibility.goal_cost) * 100).toFixed(2)}%
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            sx={{ mt: 2 }}
                            onClick={() =>
                              openModal(
                                <Box>
                                  <Typography variant="h3">{goal.goal} Feasibility</Typography>
                                  <Typography variant="body1" sx={{ mt: 2 }}>
                                    <strong>Status:</strong> {goal.feasibility.feasibility}
                                  </Typography>
                                  <Typography variant="body1">
                                    <strong>Risk Level:</strong> {goal.feasibility.risk_level}
                                  </Typography>
                                  <Typography variant="body1">
                                    <strong>Message:</strong> {goal.feasibility.message}
                                  </Typography>
                                  <Button onClick={closeModal} sx={{ mt: 2 }} variant="contained">
                                    Close
                                  </Button>
                                </Box>
                              )
                            }
                          >
                            View Details
                          </Button>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </SectionCard>

                {/* Insights */}
                <SectionCard>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", mr: 2, width: 36, height: 36 }}>
                      <InsightsIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="h2">Additional Insights</Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={6}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="h3" gutterBottom>
                          Financial Insights
                        </Typography>
                        <Typography variant="body1">
                          <strong>Projected Savings:</strong> ₹{response.enhancements.projected_savings.toLocaleString()}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          <strong>Behavioral Insight:</strong> {response.enhancements.behavioral_insight}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={6}>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="h3" gutterBottom>
                          FAQ & Terms
                        </Typography>
                        <Typography variant="body1">
                          <strong>Term Explanation:</strong> {response.enhancements.term_explanation}
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          <strong>FAQ:</strong> {response.enhancements.faq}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                      <Box sx={{ p: 2 }}>
                        <Typography variant="h3" gutterBottom>
                          Savings Trend
                        </Typography>
                        <Bar
                          data={savingsTrendData}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { position: "top", labels: { font: { size: 10 } } },
                              tooltip: {
                                callbacks: {
                                  label: (context) => `₹${context.raw.toLocaleString()}`,
                                },
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                title: { display: true, text: "Savings (₹)", font: { size: 10 } },
                              },
                              x: {
                                title: { display: true, text: "Time", font: { size: 10 } },
                              },
                            },
                          }}
                          height={140}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </SectionCard>

                {/* Advice */}
                <SectionCard>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", mr: 2, width: 36, height: 36 }}>
                      <LightbulbIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="h2">AI Financial Advice</Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {Object.entries(response.advisor_summary).map(([model, advice], index) => (
                        advice && !advice.startsWith("Error") && (
                          <Card key={index} sx={{ p: 2, mb: 2 }}>
                            <Typography variant="h3" gutterBottom>
                              {model.toUpperCase()} Advice
                            </Typography>
                            {advice.split('\n\n').map((paragraph, i) => {
                              if (paragraph.startsWith('*')) {
                                return (
                                  <Box component="ul" sx={{ pl: 3, listStyleType: "disc" }} key={i}>
                                    {paragraph.split('\n').map((item, j) => (
                                      item.startsWith('*') && (
                                        <Typography component="li" key={j} variant="body1">
                                          {item.replace(/^\*\s*/, '')}
                                        </Typography>
                                      )
                                    ))}
                                  </Box>
                                );
                              } else if (paragraph.match(/^\*\*.*\*\*:/)) {
                                return (
                                  <Typography variant="h3" key={i} sx={{ mt: 2 }}>
                                    {paragraph.replace(/^\*\*(.*)\*\*:/, '$1')}
                                  </Typography>
                                );
                              } else {
                                return (
                                  <Typography key={i} variant="body1" sx={{ mt: 1 }}>
                                    {paragraph}
                                  </Typography>
                                );
                              }
                            })}
                            <Button
                              variant="outlined"
                              sx={{ mt: 2 }}
                              onClick={() =>
                                openModal(
                                  <Box>
                                    <Typography variant="h3">{model.toUpperCase()} Advice</Typography>
                                    <Typography variant="body1" sx={{ mt: 2, whiteSpace: "pre-wrap" }}>
                                      {advice}
                                    </Typography>
                                    <Button onClick={closeModal} sx={{ mt: 2 }} variant="contained">
                                      Close
                                    </Button>
                                  </Box>
                                )
                              }
                            >
                              View Full Advice
                            </Button>
                          </Card>
                        )
                      ))}
                    </Grid>
                  </Grid>
                </SectionCard>

                {/* Plan */}
                <SectionCard>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", mr: 2, width: 36, height: 36 }}>
                      <MapIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Typography variant="h2">Step-by-Step Plan</Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Box sx={{ position: "relative", pl: 5 }}>
                        {response.step_by_step_plan.map((step, index) => (
                          <Grow in timeout={500 + index * 200} key={index}>
                            <Box sx={{ display: "flex", mb: 2, alignItems: "center" }}>
                              <Avatar
                                sx={{
                                  bgcolor: "primary.main",
                                  width: 28,
                                  height: 28,
                                  mr: 2,
                                  position: "absolute",
                                  left: 0,
                                  fontSize: "0.75rem",
                                }}
                              >
                                {index + 1}
                              </Avatar>
                              <Card sx={{ p: 2, flex: 1 }}>
                                <Typography variant="body1">{step}</Typography>
                              </Card>
                            </Box>
                          </Grow>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </SectionCard>
              </Box>
            )}

            {/* Modal for Details */}
            <Modal open={modalOpen.open} onClose={closeModal} aria-labelledby="modal-title">
              <Fade in={modalOpen.open}>
                <ModalContent>{modalOpen.content}</ModalContent>
              </Fade>
            </Modal>

            {/* Snackbar for Feedback */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
              <Alert
                onClose={handleSnackbarClose}
                severity={snackbar.severity}
                sx={{ width: "100%", borderRadius: 8 }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Box>
        </Container>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}