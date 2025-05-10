"use client";
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [income, setIncome] = useState("");
  const [goal, setGoal] = useState("");
  const [lockPreference, setLockPreference] = useState(90);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/user/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, income, goal, lockPreference }),
    });

    const data = await res.json();
    if (res.ok) {
      setToast({ open: true, message: "Profile updated!", severity: "success" });
      setTimeout(() => router.push("/locked_balance"), 1200);
    } else {
      setToast({ open: true, message: data.error || "Update failed", severity: "error" });
    }
  };

  const handleClose = () => setToast((prev) => ({ ...prev, open: false }));

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="90vh">
      <Card sx={{ padding: 4, width: 420 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={3} textAlign="center">
            👋 Welcome! Tell us a bit about yourself
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              label="Income Range (₹/month)"
              fullWidth
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="e.g., 20000 - 40000"
              sx={{ mb: 2 }}
            />

            <TextField
              label="Savings Goal (₹)"
              type="number"
              fullWidth
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              select
              fullWidth
              label="Preferred Lock-up Duration"
              value={lockPreference}
              onChange={(e) => setLockPreference(e.target.value)}
              sx={{ mb: 3 }}
            >
              {[30, 60, 90, 180].map((days) => (
                <MenuItem key={days} value={days}>{days} days</MenuItem>
              ))}
            </TextField>

            <Button type="submit" variant="contained" color="primary" fullWidth>
              Finish Setup
            </Button>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
