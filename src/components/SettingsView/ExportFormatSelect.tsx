import { Box, MenuItem, Select, Typography } from '@mui/material';

type ExportFormatSelectProps = {
  value: 'pdf' | 'excel';
  onChange: (next: 'pdf' | 'excel') => void;
};

const ExportFormatSelect = ({ value, onChange }: ExportFormatSelectProps) => {
  return (
    <Box display="flex" alignItems="center" gap={1} sx={{ mt: 2 }}>
      <Typography variant="body1">Export format</Typography>
      <Select
        size="small"
        value={value}
        onChange={(event) => onChange(event.target.value as 'pdf' | 'excel')}
      >
        <MenuItem value="pdf">PDF</MenuItem>
        <MenuItem value="excel">Excel</MenuItem>
      </Select>
    </Box>
  );
};

export default ExportFormatSelect;
