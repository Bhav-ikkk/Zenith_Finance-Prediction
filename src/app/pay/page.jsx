'use client';
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';

export default function PayPage() {
  const [amount, setAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState(90);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/stripe/checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user-123',
        amount: parseFloat(amount),
        lockPeriod: parseInt(lockPeriod),
      }),
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Card sx={{ p: 4, maxWidth: 420, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={2}>
            🐷 Start Your Digital Gulak
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="number"
              label="Amount to Save (INR)"
              variant="outlined"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              select
              label="Lock-up Period"
              value={lockPeriod}
              onChange={(e) => setLockPeriod(e.target.value)}
              sx={{ mb: 3 }}
            >
              {[30, 60, 90, 180].map((days) => (
                <MenuItem key={days} value={days}>
                  {days} Days
                </MenuItem>
              ))}
            </TextField>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ fontWeight: 'bold' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Save to Gulak 💰'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
