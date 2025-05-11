'use client';
import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Fade,
  LinearProgress,
  Tooltip,
  Avatar,
  Modal,
  Container,
  AppBar,
  Toolbar,
  CssBaseline,
  ThemeProvider,
  createTheme,
  StyledEngineProvider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  styled // Add styled to the imports from @mui/material
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  ExpandMore,
  AttachMoney,
  TrendingUp,
  Close,
  Description,
  Language,
  CurrencyExchange,
  Warning,
  Info,
  ShowChart,
  RiskAssessment,
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

// Custom styled components
const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  background: theme.palette.background.paper,
  transition: 'all 0.3s ease',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const RiskBadge = styled(Chip)(({ theme, risklevel }) => ({
  fontWeight: 600,
  textTransform: 'uppercase',
  backgroundColor: 
    risklevel === 'High' ? theme.palette.error.light :
    risklevel === 'Medium' ? theme.palette.warning.light :
    theme.palette.success.light,
  color: 
    risklevel === 'High' ? theme.palette.error.dark :
    risklevel === 'Medium' ? theme.palette.warning.dark :
    theme.palette.success.dark,
}));

const UploadArea = styled(Paper)(({ theme }) => ({
  border: '2px dashed',
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover
  }
}));

export default function ForecastExpensesPage() {
  const theme = useTheme();
  const [file, setFile] = useState(null);
  const [currency, setCurrency] = useState('INR');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    forecast: true,
    risk: true,
    narrative: true
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const fileType = selectedFile.name.split('.').pop().toLowerCase();
    if (fileType !== 'xlsx') {
      setError(`Only .xlsx files are allowed.`);
      return;
    }
    if (selectedFile.size > 200 * 1024 * 1024) {
      setError(`File size exceeds 200MB limit`);
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please upload an Excel file first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mock API response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponse = {
        forecast_summary: {
          "1_month": 105070.59,
          "3_months": 258725.43,
          "6_months": 444761.84,
          "9_months": 610927.27,
          "1_year": 959677.14
        },
        confidence_intervals: {
          "1_month": [94146.56, 114443.14],
          "3_months": [227054.39, 287522.75],
          "6_months": [382973.93, 503000.43],
          "9_months": [520036.38, 698848.20],
          "1_year": [839923.67, 1076170.12]
        },
        risk_profile: {
          "risk_score": "High",
          "volatility": 0.54,
          "high_risk_categories": [],
          "recommendations": [
            "Build an emergency fund of 6-9 months of expenses (estimated: 224782.36-337173.55).",
            "Set monthly budgets for discretionary categories to stabilize spending."
          ],
          "average_monthly_expense": 37463.73
        },
        note: "Okay, let's analyze the provided monthly expense data and create a narrative forecast for the next 12 months (from May 2025 to April 2026).\n\n**Overall Trends:**\n\n*   **Variability:** The most striking aspect is the significant variability in monthly expenses. There isn't a steady, consistent upward or downward trend over the entire period. Expenses fluctuate considerably month-to-month and year-to-year.\n*   **Year-over-Year Consistency:** There's *some* suggestion that months within a given year have similar expense levels to the corresponding months of the previous year, but this is noisy. For example, January expenses in 2023, 2024, and 2025 are all in the 46-47k range. This warrants closer examination.\n\n**Seasonality:**\n\n*   **End-of-Year Dip & Rebound:** A very noticeable seasonal pattern is a steep drop in expenses starting in September/October of 2023, continuing through December. Expenses then rebound sharply in January. This pattern *partially* repeats in 2024, but the drop is less extreme.\n*   **Mid-Year Peak (July/August/September):** July and August are often months with higher expenses. September is more variable, but potentially high as well.\n*   **May/June Dip:** May and June seem to be relatively lower expense months, at least compared to the rest of the year, but expenses in 2024 were higher than in 2023.\n\n**Spending Patterns:**\n\n*   **Zero Expenses:** The sudden drop to zero expenses from October to December in 2023 requires investigation. This could signal a temporary halt in operations, a significant change in accounting practices, or perhaps a data entry issue.\n*   **High Variance:** The range between the lowest and highest monthly expenses is substantial. This indicates that expenses are heavily influenced by factors that change significantly from month to month."
      };

      setForecastData(mockResponse);
    } catch (err) {
      setError('Failed to generate forecast. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(language === 'en' ? 'en-IN' : language, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const parseNarrative = (note) => {
    if (!note) return [];
    return note.split('\n\n').filter(section => section.trim()).map(section => {
      const [title, ...content] = section.split('\n');
      return {
        title: title.replace('**', '').trim(),
        content: content.join('\n').trim()
      };
    });
  };

  const formatPeriod = (period) => {
    return period.replace(/_/g, ' ')
      .replace(/(^|\s)\w/g, l => l.toUpperCase())
      .replace('Month', 'Month')
      .replace('Months', 'Months');
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
              Expense Forecast
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
              <TrendingUp sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h4" sx={{ 
              fontWeight: 700, 
              mb: 2,
              color: 'primary.main',
              letterSpacing: '-0.5px'
            }}>
              Financial Forecast Analysis
            </Typography>
            <Typography variant="subtitle1" sx={{ 
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6
            }}>
              Upload your expense data to receive detailed forecasts and actionable insights
            </Typography>
          </Box>

          {/* Upload Card */}
          <Card sx={{ 
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: 3
          }}>
            <Grid container spacing={3}>
              {/* File Upload Section */}
              <Grid item xs={12} md={6}>
                {!file ? (
                  <label htmlFor="file-upload">
                    <UploadArea>
                      <CloudUpload sx={{ 
                        fontSize: 60, 
                        color: 'action.active', 
                        mb: 2,
                        opacity: 0.8
                      }} />
                      <Typography variant="body1" sx={{ 
                        mb: 1, 
                        fontWeight: 500,
                        color: 'text.primary'
                      }}>
                        Drag and drop your Excel file
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: 'text.secondary',
                        display: 'block',
                        mb: 2
                      }}>
                        Supported format: .xlsx (max 200MB)
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        component="span"
                        startIcon={<CloudUpload />}
                        sx={{ 
                          mt: 1,
                          textTransform: "none",
                          px: 3,
                          py: 1
                        }}
                      >
                        Browse Files
                      </Button>
                      <input 
                        id="file-upload" 
                        type="file" 
                        hidden 
                        accept=".xlsx" 
                        onChange={handleFileChange} 
                      />
                    </UploadArea>
                  </label>
                ) : (
                  <Paper sx={{ 
                    p: 2, 
                    display: 'flex', 
                    alignItems: 'center', 
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    <Description sx={{ 
                      mr: 2, 
                      color: 'primary.main',
                      fontSize: 32
                    }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(file.size / 1024).toFixed(1)} KB
                      </Typography>
                    </Box>
                    <Tooltip title="Remove file">
                      <IconButton 
                        onClick={() => setFile(null)} 
                        size="small"
                        sx={{ color: 'text.secondary' }}
                      >
                        <Close />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                )}
              </Grid>

              {/* Settings Section */}
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 3,
                  height: '100%'
                }}>
                  <TextField
                    select
                    fullWidth
                    label="Currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    variant="outlined"
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <CurrencyExchange sx={{ 
                          color: 'action.active', 
                          mr: 1,
                          opacity: 0.8
                        }} />
                      )
                    }}
                  >
                    {['INR', 'USD', 'EUR', 'GBP'].map((curr) => (
                      <MenuItem key={curr} value={curr}>{curr}</MenuItem>
                    ))}
                  </TextField>
                  
                  <TextField
                    select
                    fullWidth
                    label="Report Language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    variant="outlined"
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <Language sx={{ 
                          color: 'action.active', 
                          mr: 1,
                          opacity: 0.8
                        }} />
                      )
                    }}
                  >
                    {['en', 'es', 'fr', 'de'].map((lang) => (
                      <MenuItem key={lang} value={lang}>
                        {lang === 'en' ? 'English' : 
                         lang === 'es' ? 'Spanish' : 
                         lang === 'fr' ? 'French' : 'German'}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Grid>

              {/* Action Button */}
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading || !file}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{
                    height: 48,
                    fontWeight: 600,
                    fontSize: '1rem',
                    letterSpacing: '0.5px',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 'none',
                      backgroundColor: 'primary.dark'
                    }
                  }}
                >
                  {loading ? 'Analyzing...' : 'Generate Forecast'}
                </Button>
              </Grid>
            </Grid>

            {/* Error Message */}
            <Fade in={!!error}>
              <Alert 
                severity="error" 
                sx={{ mt: 3 }}
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => setError(null)}
                  >
                    <Close fontSize="inherit" />
                  </IconButton>
                }
              >
                {error}
              </Alert>
            </Fade>
          </Card>

          {/* Results Section */}
          {forecastData && (
            <Fade in={!!forecastData}>
              <Box>
                {/* Forecast Summary */}
                <Card sx={{ 
                  mb: 3, 
                  p: 3,
                  borderRadius: 3
                }}>
                  <Accordion 
                    expanded={expandedSections.forecast} 
                    onChange={() => toggleSection('forecast')}
                    elevation={0}
                    sx={{
                      '&:before': { display: 'none' },
                      backgroundColor: 'transparent'
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        p: 0,
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center',
                          gap: 1
                        }
                      }}
                    >
                      <Typography variant="h5" sx={{ 
                        fontWeight: 600, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: 'text.primary'
                      }}>
                        <ShowChart color="primary" />
                        Forecast Summary
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <Grid container spacing={3} sx={{ mt: 2 }}>
                        {Object.entries(forecastData.forecast_summary).map(([period, amount]) => (
                          <Grid item xs={12} sm={6} md={4} key={period}>
                            <StatCard>
                              <Typography variant="subtitle2" color="text.secondary">
                                {formatPeriod(period)}
                              </Typography>
                              <Typography variant="h5" sx={{ 
                                fontWeight: 700, 
                                my: 1,
                                color: 'text.primary'
                              }}>
                                {formatCurrency(amount)}
                              </Typography>
                              {forecastData.confidence_intervals && (
                                <Typography variant="caption" color="text.secondary">
                                  Range: {formatCurrency(forecastData.confidence_intervals[period][0])} - {formatCurrency(forecastData.confidence_intervals[period][1])}
                                </Typography>
                              )}
                            </StatCard>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Card>

                {/* Risk Profile */}
                <Card sx={{ 
                  mb: 3, 
                  p: 3,
                  borderRadius: 3
                }}>
                  <Accordion 
                    expanded={expandedSections.risk} 
                    onChange={() => toggleSection('risk')}
                    elevation={0}
                    sx={{
                      '&:before': { display: 'none' },
                      backgroundColor: 'transparent'
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        p: 0,
                        '& .MuiAccordionSummary-content': {
                          alignItems: 'center',
                          gap: 1
                        }
                      }}
                    >
                      <Typography variant="h5" sx={{ 
                        fontWeight: 600, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        color: 'text.primary'
                      }}>
                        Risk Analysis
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                      <Grid container spacing={3} sx={{ mt: 2 }}>
                        <Grid item xs={12} md={4}>
                          <StatCard>
                            <Typography variant="subtitle2" color="text.secondary">
                              Risk Score
                            </Typography>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2, 
                              my: 1,
                              flexWrap: 'wrap'
                            }}>
                              <RiskBadge 
                                label={forecastData.risk_profile.risk_score} 
                                risklevel={forecastData.risk_profile.risk_score} 
                                size="medium"
                              />
                              <Typography variant="body2" color="text.secondary">
                                Volatility: {(forecastData.risk_profile.volatility * 100).toFixed(0)}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={forecastData.risk_profile.volatility * 100} 
                              color={
                                forecastData.risk_profile.risk_score === 'High' ? 'error' :
                                forecastData.risk_profile.risk_score === 'Medium' ? 'warning' : 'success'
                              }
                              sx={{ 
                                height: 8, 
                                borderRadius: 4, 
                                mt: 2,
                                backgroundColor: theme.palette.action.disabledBackground
                              }}
                            />
                          </StatCard>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <StatCard>
                            <Typography variant="subtitle2" color="text.secondary">
                              Average Monthly Expense
                            </Typography>
                            <Typography variant="h5" sx={{ 
                              fontWeight: 700, 
                              my: 1,
                              color: 'text.primary'
                            }}>
                              {formatCurrency(forecastData.risk_profile.average_monthly_expense)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Based on historical data
                            </Typography>
                          </StatCard>
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <StatCard>
                            <Typography variant="subtitle2" color="text.secondary">
                              Emergency Fund Recommendation
                            </Typography>
                            <Typography variant="h6" sx={{ 
                              my: 1,
                              color: 'text.primary'
                            }}>
                              6-9 months of expenses
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatCurrency(forecastData.risk_profile.average_monthly_expense * 6)} - {formatCurrency(forecastData.risk_profile.average_monthly_expense * 9)}
                            </Typography>
                          </StatCard>
                        </Grid>

                        {forecastData.risk_profile.recommendations?.length > 0 && (
                          <Grid item xs={12}>
                            <StatCard>
                              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                Recommendations
                              </Typography>
                              <List dense sx={{ py: 0 }}>
                                {forecastData.risk_profile.recommendations.map((rec, index) => (
                                  <ListItem key={index} sx={{ px: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                      <Info color="primary" fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={rec} 
                                      primaryTypographyProps={{
                                        variant: 'body2',
                                        color: 'text.primary'
                                      }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </StatCard>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Card>

                {/* Narrative Insights */}
                {forecastData.note && (
                  <Card sx={{ 
                    p: 3,
                    borderRadius: 3
                  }}>
                    <Accordion 
                      expanded={expandedSections.narrative} 
                      onChange={() => toggleSection('narrative')}
                      elevation={0}
                      sx={{
                        '&:before': { display: 'none' },
                        backgroundColor: 'transparent'
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        sx={{
                          p: 0,
                          '& .MuiAccordionSummary-content': {
                            alignItems: 'center',
                            gap: 1
                          }
                        }}
                      >
                        <Typography variant="h5" sx={{ 
                          fontWeight: 600, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          color: 'text.primary'
                        }}>
                          <Description color="primary" />
                          Detailed Analysis
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        <Box sx={{ mt: 2 }}>
                          {parseNarrative(forecastData.note).map((section, index) => (
                            <Box key={index} sx={{ mb: 3 }}>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                mb: 1.5,
                                color: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                {section.title.includes('Trends') && <TrendingUp fontSize="small" />}
                                {section.title.includes('Seasonality') && <Warning fontSize="small" />}
                                {section.title}
                              </Typography>
                              <Paper elevation={0} sx={{ 
                                p: 3, 
                                backgroundColor: theme.palette.mode === 'dark' ? 
                                  theme.palette.grey[800] : 
                                  theme.palette.grey[50],
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`
                              }}>
                                <Typography variant="body1" sx={{ 
                                  whiteSpace: 'pre-line',
                                  lineHeight: 1.7,
                                  color: 'text.primary'
                                }}>
                                  {section.content}
                                </Typography>
                              </Paper>
                            </Box>
                          ))}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Card>
                )}
              </Box>
            </Fade>
          )}
        </Container>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}