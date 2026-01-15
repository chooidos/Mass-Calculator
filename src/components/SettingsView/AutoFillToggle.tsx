import { Box, Switch, Typography } from '@mui/material';

type AutoFillToggleProps = {
  enabled: boolean;
  onToggle: () => void;
};

const AutoFillToggle = ({ enabled, onToggle }: AutoFillToggleProps) => {
  return (
    <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2 }}>
      <Typography variant="body1">Auto-fill materials</Typography>
      <Switch checked={enabled} onChange={onToggle} />
    </Box>
  );
};

export default AutoFillToggle;
