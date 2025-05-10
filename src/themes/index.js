import { createTheme } from "@mui/material/styles";

export const getTheme = (mode = "light", primaryColor = "#1976d2") =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
      },
    },
  });