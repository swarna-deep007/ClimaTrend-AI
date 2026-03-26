import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const theme = {
    darkMode,
    toggleTheme,
    colors: darkMode ? {
      bg: '#1a1a2e',
      secondaryBg: '#16213e',
      tertiary: '#0f3460',
      navbar: 'rgba(26, 26, 46, 0.95)',
      formBg: 'rgba(30, 30, 50, 0.9)',
      text: 'white',
      textSecondary: '#b0b0b0',
      textMuted: '#707070',
      cyan: '#00d4ff',
      purple: '#7c3aed',
      dark: '#1a1a2e',
    } : {
      bg: '#f5f7fa',
      secondaryBg: '#e8ecf1',
      tertiary: '#d0dae8',
      navbar: 'rgba(255, 255, 255, 0.95)',
      formBg: 'rgba(255, 255, 255, 0.9)',
      text: '#1a1a2e',
      textSecondary: '#4a5568',
      textMuted: '#a0aec0',
      cyan: '#0284c7',
      purple: '#9333ea',
      dark: '#ffffff',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}