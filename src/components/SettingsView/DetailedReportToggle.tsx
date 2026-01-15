import { Box, Switch, Typography } from '@mui/material';

type DetailedReportToggleProps = {
  enabled: boolean;
  onToggle: () => void;
};

const DetailedReportToggle = ({
  enabled,
  onToggle,
}: DetailedReportToggleProps) => {
  return (
    <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2 }}>
      <Typography variant="body1">Detailed report</Typography>
      <Switch checked={enabled} onChange={onToggle} />
    </Box>
  );
};

export default DetailedReportToggle;
