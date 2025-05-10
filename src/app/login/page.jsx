"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res.ok) {
      setToast({ open: true, message: "Login successful!", severity: "success" });
      setTimeout(() => router.push("/locked_balance"), 1000);
    } else {
      setToast({ open: true, message: "Invalid email or password", severity: "error" });
    }
  };

  const handleClose = () => setToast((prev) => ({ ...prev, open: false }));

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="90vh">
      <Card sx={{ padding: 4, width: 420 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} mb={3} textAlign="center">
            🔐 Login to Digital Gulak
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
            />

            <Button type="submit" variant="contained" color="primary" fullWidth>
              Login
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
