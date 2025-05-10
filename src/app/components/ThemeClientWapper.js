'use client';

import { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, IconButton, Typography } from '@mui/material';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import CloseIcon from '@mui/icons-material/Close';
import ThemeCustomizer from './ThemeCustomizer';

export default function ThemeClientWrapper({ children }) {
  const [mode, setMode] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#F06292'); // New: Secondary color
  const [typographyVariant, setTypographyVariant] = useState('medium'); // New: Typography scale
  const [borderRadius, setBorderRadius] = useState(8); // New: Border radius in px
  const [open, setOpen] = useState(false);

  // Memoize theme to prevent unnecessary re-renders
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: primaryColor,
          },
          secondary: {
            main: secondaryColor,
          },
        },
        typography: {
          // Adjust font sizes based on variant
          fontSize: typographyVariant === 'small' ? 12 : typographyVariant === 'medium' ? 14 : 16,
          h1: { fontSize: typographyVariant === 'small' ? '1.8rem' : typographyVariant === 'medium' ? '2rem' : '2.2rem' },
          h2: { fontSize: typographyVariant === 'small' ? '1.5rem' : typographyVariant === 'medium' ? '1.7rem' : '1.9rem' },
        },
        shape: {
          borderRadius, // Apply custom border radius
        },
      }),
    [mode, primaryColor, secondaryColor, typographyVariant, borderRadius]
  );

  // Toggle customizer panel
  const handleToggleCustomizer = () => {
    setOpen((prev) => !prev);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ position: 'relative' }}>
        {/* Theme Customizer Toggle Button */}
        <IconButton
          onClick={handleToggleCustomizer}
          aria-label="Toggle theme customizer page"
          sx={{
            position: 'fixed',
            top: '50%',
            right: 0,
            transform: 'translateY(-50%)',
            bgcolor: 'grey.200',
            color: 'text.primary',
            zIndex: 1400,
            borderRadius: '4px 0 0 4px',
            width: '40px',
            height: '60px',
            boxShadow: 2,
            borderRight: 'none',
            transition: 'transform 0.2s, bgcolor 0.2s',
            '&:hover': {
              bgcolor: 'grey.300',
              transform: 'scale(1.05)',
            },
          }}
        >
          <ViewSidebarIcon />
        </IconButton>

        {/* Sliding Theme Customizer Page */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: open ? 0 : '-300px',
            width: 300,
            height: '100%',
            bgcolor: 'background.paper',
            borderLeft: '1px solid',
            borderColor: 'divider',
            boxShadow: open ? 6 : 0,
            zIndex: 1300,
            transition: 'right 0.3s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {/* Page Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Theme Settings
            </Typography>
            <IconButton
              onClick={handleToggleCustomizer}
              aria-label="Close theme customizer"
              sx={{ color: 'text.primary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Theme Customizer Content */}
          <ThemeCustomizer
            mode={mode}
            setMode={setMode}
            primaryColor={primaryColor}
            setPrimaryColor={setPrimaryColor}
            secondaryColor={secondaryColor}
            setSecondaryColor={setSecondaryColor}
            typographyVariant={typographyVariant}
            setTypographyVariant={setTypographyVariant}
            borderRadius={borderRadius}
            setBorderRadius={setBorderRadius}
          />
        </Box>

        {/* Render children */}
        {children}
      </Box>
    </ThemeProvider>
  );
}