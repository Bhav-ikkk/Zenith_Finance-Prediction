'use client';
import React from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import SavingsIcon from '@mui/icons-material/Savings';

export default function Navbar() {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#6a1b9a' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SavingsIcon />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Digital Gulak
            </Typography>
          </Box>
        </Link>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link href="/" passHref>
            <Button color="inherit">Home</Button>
          </Link>
          
          <Link href="/pay" passHref>
            <Button variant="contained" color="secondary" sx={{ fontWeight: 600 }}>
              ➕ Start Gulak
            </Button>
          </Link>

            <Link href="/checker" passHref>
            <Button color="inherit">Analyzer</Button>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
