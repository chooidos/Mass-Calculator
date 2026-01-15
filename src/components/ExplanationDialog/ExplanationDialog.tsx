import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';

type ExplanationDialogProps = {
  open: boolean;
  explanation: string[];
  onClose: () => void;
};

const ExplanationDialog = ({
  open,
  explanation,
  onClose,
}: ExplanationDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
        Explanation
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography
          variant="body2"
          sx={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}
        >
          {explanation.join('\n')}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default ExplanationDialog;
