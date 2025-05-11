'use client';
import { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Divider, 
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  CssBaseline,
  ThemeProvider,
  createTheme,
  StyledEngineProvider,
  LinearProgress,
  Fade,
  Avatar
} from '@mui/material';
import { 
  Savings, 
  AttachMoney, 
  ShowChart, 
  ErrorOutline, 
  Menu as MenuIcon,
  TrendingUp,
  MonetizationOn
} from '@mui/icons-material';

// Custom theme matching checker page
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
      },
    },
  },
});

export default function InvestPage() {
  const defaultData = {
    income: 50000,
    expenses: 30000,
    currency: 'INR',
    duration_months: 12,
    goals: [{ description: 'Emergency Fund', cost: 100000, priority: 1 }],
    spending_categories: { Food: 5000, Rent: 15000, Shopping: 3000 },
    transactions: [
      { date: '2024-01-01', amount: 5000, category: 'Food' },
      { date: '2024-01-15', amount: 15000, category: 'Rent' },
      { date: '2024-02-10', amount: 3000, category: 'Shopping' },
      { date: '2024-02-28', amount: 2000, category: 'Misc' },
      { date: '2024-03-01', amount: 7000, category: 'Transport' },
    ]
  };

  const [income, setIncome] = useState(defaultData.income.toString());
  const [expenses, setExpenses] = useState(defaultData.expenses.toString());
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleInvest = async () => {
    setError(null);
    setResponse(null);
    setLoading(true);

    const body = {
      ...defaultData,
      income: parseFloat(income) || defaultData.income,
      expenses: parseFloat(expenses) || defaultData.expenses
    };

    try {
      const res = await fetch('/api/invest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Something went wrong');
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
              Investment Advisor
            </Typography>
          </Toolbar>
          {loading && <LinearProgress />}
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 10, mb: 8 }}>
          {/* Header Section */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Avatar sx={{ 
              bgcolor: "primary.main", 
              width: 64, 
              height: 64, 
              mx: "auto", 
              mb: 2 
            }}>
              <MonetizationOn sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              mb: 2,
              color: 'primary.main',
              letterSpacing: '-0.5px'
            }}>
              Smart Investment Recommendations
            </Typography>
            <Typography variant="subtitle1" sx={{ 
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6
            }}>
              Get personalized investment suggestions based on your financial profile
            </Typography>
          </Box>

          {/* Form Section */}
          <Card sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Monthly Income (INR)"
                  variant="outlined"
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  InputProps={{
                    startAdornment: <AttachMoney color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Monthly Expenses (INR)"
                  variant="outlined"
                  type="number"
                  value={expenses}
                  onChange={(e) => setExpenses(e.target.value)}
                  InputProps={{
                    startAdornment: <AttachMoney color="action" sx={{ mr: 1 }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleInvest}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Savings />}
                  sx={{ 
                    py: 2,
                    background: "linear-gradient(45deg, #1e3a8a 30%, #3b82f6 90%)",
                    "&:hover": { background: "linear-gradient(45deg, #1e40af 30%, #60a5fa 90%)" }
                  }}
                >
                  {loading ? 'Analyzing...' : 'Get Investment Suggestions'}
                </Button>
              </Grid>
            </Grid>
          </Card>

          {/* Error */}
          {error && (
            <Fade in={!!error}>
              <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                {error}
              </Alert>
            </Fade>
          )}

          {/* Results */}
          {response && (
            <Fade in={!!response}>
              <Box>
                {/* AI Commentary */}
                <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <TrendingUp />
                      </Avatar>
                      <Typography variant="h5" fontWeight="bold" color="primary">
                        AI Investment Analysis
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                      {response.ai_commentary}
                    </Typography>
                  </CardContent>
                </Card>

                {/* Recommended Investments */}
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h5" component="h2" fontWeight="bold" mb={3}>
                      Recommended Investments
                    </Typography>
                    
                    <List component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                      {Object.entries(response.investment_suggestions).map(([ticker, info], index) => (
                        <Box key={ticker}>
                          <ListItem alignItems="flex-start">
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center">
                                  <Typography fontWeight="bold" sx={{ mr: 1 }}>
                                    {ticker}
                                  </Typography>
                                  <Chip label={info.sector} size="small" color="secondary" />
                                </Box>
                              }
                              secondary={
                                <>
                                  <Typography component="span" variant="body2">
                                    {info.name}
                                  </Typography>
                                  <Typography component="span" variant="body2" display="block" fontWeight="medium">
                                    ₹{info.price.toLocaleString()}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                          {index < Object.keys(response.investment_suggestions).length - 1 && <Divider />}
                        </Box>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          )}
        </Container>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}