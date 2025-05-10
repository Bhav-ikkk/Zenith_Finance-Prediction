"use client";
import { useThemeContext } from "../context/ThemeContext";
import { FormControl, Select, MenuItem } from "@mui/material";

const ThemeSwitcher = () => {
  const { themeName, switchTheme } = useThemeContext();
  const themeNames = ["light", "dark", "blue", "green", "purple"];

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Select value={themeName} onChange={(e) => switchTheme(e.target.value)}>
        {themeNames.map((name) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default ThemeSwitcher;