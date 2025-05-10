"use client";
import { createContext, useContext, useState } from "react";
import { getTheme } from "../themes";

const ThemeContext = createContext();

export const ThemeProviderCustom = ({ children, primaryColor }) => {
  const [themeName, setThemeName] = useState("light");

  const switchTheme = (name) => {
    setThemeName(name);
  };

  const theme = getTheme(themeName, primaryColor);

  return (
    <ThemeContext.Provider value={{ theme, themeName, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);