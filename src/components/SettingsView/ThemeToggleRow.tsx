import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { Box, Switch, Typography, useMediaQuery } from '@mui/material';

type ThemeToggleRowProps = {
  mode: 'light' | 'dark' | 'system';
  onToggle: (next: 'light' | 'dark') => void;
};

const ThemeToggleRow = ({ mode, onToggle }: ThemeToggleRowProps) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const resolvedMode =
    mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode;
  const isDark = resolvedMode === 'dark';

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Typography variant="body1">Theme</Typography>
      <LightModeIcon fontSize="small" />
      <Switch
        checked={isDark}
        onChange={() => onToggle(isDark ? 'light' : 'dark')}
      />
      <DarkModeIcon fontSize="small" />
    </Box>
  );
};

export default ThemeToggleRow;
