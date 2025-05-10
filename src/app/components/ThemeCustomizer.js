'use client';

import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Select,
  MenuItem,
} from '@mui/material';
import ColorOptions from '../utils/coloroptions';

export default function ThemeCustomizer({
  mode,
  setMode,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  typographyVariant,
  setTypographyVariant,
  borderRadius,
  setBorderRadius,
}) {
  return (
    <Box sx={{ p: 2, flexGrow: 1 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Customize Theme
      </Typography>

      {/* Mode Selection */}
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
          Mode
        </FormLabel>
        <RadioGroup
          row
          value={mode}
          onChange={(e) => setMode(e.target.value)}
        >
          <FormControlLabel value="light" control={<Radio />} label="Light" />
          <FormControlLabel value="dark" control={<Radio />} label="Dark" />
        </RadioGroup>
      </FormControl>

      {/* Primary Color Selection */}
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
          Primary Color
        </FormLabel>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {ColorOptions.map((color) => (
            <Box
              key={color.value}
              sx={{
                width: 40,
                height: 40,
                bgcolor: color.value,
                cursor: 'pointer',
                borderRadius: 1,
                border: primaryColor === color.value ? '2px solid #000' : 'none',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
              onClick={() => setPrimaryColor(color.value)}
            />
          ))}
        </Box>
      </FormControl>

      {/* Secondary Color Selection */}
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
          Secondary Color
        </FormLabel>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {ColorOptions.map((color) => (
            <Box
              key={color.value}
              sx={{
                width: 40,
                height: 40,
                bgcolor: color.value,
                cursor: 'pointer',
                borderRadius: 1,
                border: secondaryColor === color.value ? '2px solid #000' : 'none',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
              onClick={() => setSecondaryColor(color.value)}
            />
          ))}
        </Box>
      </FormControl>

      {/* Typography Variant Selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
          Typography Size
        </FormLabel>
        <Select
          value={typographyVariant}
          onChange={(e) => setTypographyVariant(e.target.value)}
          size="small"
        >
          <MenuItem value="small">Small</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="large">Large</MenuItem>
        </Select>
      </FormControl>

      {/* Border Radius Selection */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
          Border Radius ({borderRadius}px)
        </FormLabel>
        <Slider
          value={borderRadius}
          onChange={(e, newValue) => setBorderRadius(newValue)}
          min={4}
          max={16}
          step={1}
          marks
          valueLabelDisplay="auto"
        />
      </FormControl>
    </Box>
  );
}