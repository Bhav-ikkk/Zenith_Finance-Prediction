'use client';
import { useState, useContext } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Avatar,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
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
  Grow
} from '@mui/material';
import {
  Send,
  AccountBalanceWallet,
  ReceiptLong,
  SmartToy,
  Psychology,
  ErrorOutline,
  HelpOutline,
  Lightbulb,
  WarningAmber,
  CheckCircleOutline,
  Menu as MenuIcon
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

function formatHuggingFaceAdvice(text) {
  const blocks = text
    .split(/\n{2,}/)
    .map(b => b.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const match = block.match(/^\*\*(.+?)\*\*[:\-]?\s*/);
    const title = match?.[1]?.toLowerCase();
    const body = match ? block.replace(match[0], '') : block;

    let label = '';
    let icon = null;
    let color = 'default';

    if (title?.includes('tip')) {
      label = 'Pro Tip';
      icon = <Lightbulb fontSize="small" />;
      color = 'info';
    } else if (title?.includes('risk') || title?.includes('warning')) {
      label = 'Warning';
      icon = <WarningAmber fontSize="small" />;
      color = 'warning';
    } else if (title?.includes('strategy')) {
      label = 'Strategy';
      icon = <CheckCircleOutline fontSize="small" />;
      color = 'primary';
    } else if (title?.includes('plan')) {
      label = 'Plan';
      icon = <CheckCircleOutline fontSize="small" />;
      color = 'success';
    } else if (title?.includes('automate') || title?.includes('track')) {
      label = 'Action Step';
      icon = <CheckCircleOutline fontSize="small" />;
      color = 'secondary';
    }

    return (
      <Box key={index} sx={{ mb: 4 }}>
        {label && (
          <Chip
            label={label}
            color={color}
            icon={icon}
            sx={{ mb: 1, fontWeight: 500 }}
            size="small"
          />
        )}
        <Typography
          variant="body2"
          sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
        >
          {highlightKeywords(body)}
        </Typography>
      </Box>
    );
  });
}

function highlightKeywords(text) {
  const parts = text.split(
    /(\₹[\d,]+(?:\.\d+)?|\b(emergency fund|automate|strategy|save|goal|invest|plan|track|tip|warning|check)\b)/gi
  );

  return parts.map((part, i) => {
    if (/₹[\d,]+/.test(part)) {
      return (
        <Box
          key={i}
          component="span"
          sx={{
            color: '#2e7d32',
            fontWeight: 700,
            mx: 0.25
          }}
        >
          {part}
        </Box>
      );
    }
    if (
      /\b(emergency fund|automate|strategy|save|goal|invest|plan|track|tip|warning|check)\b/i.test(
        part
      )
    ) {
      return (
        <Box
          key={i}
          component="span"
          sx={{
            fontWeight: 600,
            color: '#1565c0',
            mx: 0.25
          }}
        >
          {part}
        </Box>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function formatGeminiAdvice(text) {
  const lines = text
    .split(/[\n•\-]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return (
    <Stack component="ul" sx={{ pl: 3, mt: 1 }} spacing={1}>
      {lines.map((line, i) => (
        <li key={i}>
          <Typography variant="body2">{line}</Typography>
        </li>
      ))}
    </Stack>
  );
}

export default function FinancialChatbot() {
  const defaultData = {
    income: 50000,
    expenses: 30000,
    currency: 'INR',
    duration_months: 12,
    goals: [{ description: 'Emergency Fund', cost: 100000, priority: 1 }],
    spending_categories: { Food: 5000, Rent: 15000, Shopping: 3000 },
    transactions: []
  };

  const [question, setQuestion] = useState(
    'How should I allocate my savings between emergency funds and investments?'
  );
  const [income, setIncome] = useState(defaultData.income.toString());
  const [expenses, setExpenses] = useState(defaultData.expenses.toString());
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResponse(null);
    setLoading(true);

    const user_data = {
      ...defaultData,
      income: parseFloat(income) || defaultData.income,
      expenses: parseFloat(expenses) || defaultData.expenses
    };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, user_data })
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
              Financial Advisor
            </Typography>
          </Toolbar>
          {loading && <LinearProgress />}
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 10, mb: 8 }}>
          {/* Header Section */}
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              mb: 2,
              color: 'primary.main',
              letterSpacing: '-0.5px'
            }}>
              AI Financial Assistant
            </Typography>
            <Typography variant="subtitle1" sx={{ 
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6
            }}>
              Get personalized financial advice based on your income, expenses, and goals
            </Typography>
          </Box>

          {/* Form Section */}
          <Card sx={{ p: 4, mb: 4, borderRadius: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight={600}>
                Your Financial Profile
              </Typography>
              
              <TextField
                label="Your Question"
                multiline
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Should I save more or invest?"
                fullWidth
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Monthly Income (₹)"
                    value={income}
                    type="number"
                    onChange={(e) => setIncome(e.target.value)}
                    fullWidth
                    InputProps={{ startAdornment: <AccountBalanceWallet sx={{ mr: 1 }} /> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Monthly Expenses (₹)"
                    value={expenses}
                    type="number"
                    onChange={(e) => setExpenses(e.target.value)}
                    fullWidth
                    InputProps={{ startAdornment: <ReceiptLong sx={{ mr: 1 }} /> }}
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ textAlign: 'right' }}>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  endIcon={!loading && <Send />}
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    borderRadius: 2,
                    background: "linear-gradient(45deg, #1e3a8a 30%, #3b82f6 90%)",
                    "&:hover": { background: "linear-gradient(45deg, #1e40af 30%, #60a5fa 90%)" }
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} /> Analyzing...
                    </>
                  ) : (
                    'Get Advice'
                  )}
                </Button>
              </Box>
            </Stack>
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
                {/* User Question */}
                <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
                  <CardContent>
                    <Stack direction="row" spacing={2}>
                      <Avatar sx={{ bgcolor: 'grey.100' }}>
                        <HelpOutline color="action" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                          Your Question
                        </Typography>
                        <Typography variant="body1" mt={0.5}>
                          {question}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* HuggingFace Answer */}
                <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <SmartToy color="primary" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                          AI Financial Insight
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    {formatHuggingFaceAdvice(response.huggingface_answer)}
                  </CardContent>
                </Card>

                {/* Gemini Commentary */}
                <Card variant="outlined" sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} mb={2}>
                      <Avatar sx={{ bgcolor: 'success.light' }}>
                        <Psychology color="success" />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                          Expert Commentary
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    {formatGeminiAdvice(response.gemini_commentary)}
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