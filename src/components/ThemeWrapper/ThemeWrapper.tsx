import { createTheme, ThemeProvider, useMediaQuery } from '@mui/material';
import { FC, useMemo } from 'react';

interface ThemeWrapperProps {
  children: React.ReactNode;
  mode?: 'light' | 'dark' | 'system';
}

const ThemeWrapper: FC<ThemeWrapperProps> = ({ children, mode }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const paletteMode =
    mode === 'system' || !mode ? (prefersDarkMode ? 'dark' : 'light') : mode;
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: paletteMode,
        },
      }),
    [paletteMode],
  );
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default ThemeWrapper;
