'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');
  const amount = parseFloat(searchParams.get('amount'));
  const lockPeriod = parseInt(searchParams.get('lockPeriod')) || 90;

  const [loading, setLoading] = useState(true);
  const [savedAmount, setSavedAmount] = useState(0);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    async function recordPayment() {
      try {
        const res = await fetch('/api/stripe/save-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, amount, lockPeriod }),
        });
        const data = await res.json();
        if (res.ok) {
          setSavedAmount(data.savedAmount || amount);
          setToast({ open: true, message: 'Payment recorded and funds saved!', severity: 'success' });
        } else {
          setToast({ open: true, message: data.error || 'Failed to record payment.', severity: 'error' });
        }
      } catch (error) {
        setToast({ open: true, message: 'Network error. Please try again.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }

    if (userId && amount) {
      recordPayment();
    } else {
      setLoading(false);
      setToast({ open: true, message: 'Invalid payment details.', severity: 'error' });
    }
  }, [userId, amount, lockPeriod]);

  const handleClose = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Card sx={{ maxWidth: 480, width: '100%', p: 4 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          {loading ? (
            <>
              <CircularProgress />
              <Typography variant="body1" mt={2}>Processing your payment...</Typography>
            </>
          ) : (
            <>
              <Typography variant="h5" gutterBottom>
                🐷 Digital Gulak
              </Typography>
              <Typography variant="h6" color="primary" gutterBottom>
                ✅ Payment Successful!
              </Typography>
              <Typography variant="body1" mb={3}>
                ₹{savedAmount.toFixed(2)} has been locked for {lockPeriod} days.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push('/dashboard')}
              >
                Go to My Gulak
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
