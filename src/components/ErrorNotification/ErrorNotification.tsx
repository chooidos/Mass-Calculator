import { Alert, Snackbar } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import { actions, selectors } from '../../modules/elements/store';
import { AppDispatch } from '../../store';

const ErrorNotification = () => {
  const dispatch: AppDispatch = useDispatch();
  const errorMessage = useSelector(selectors.selectError);

  const handleClose = () => {
    dispatch(actions.clearError());
  };

  return (
    <Snackbar
      open={Boolean(errorMessage)}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity="error" variant="filled" onClose={handleClose}>
        {errorMessage}
      </Alert>
    </Snackbar>
  );
};

export default ErrorNotification;
