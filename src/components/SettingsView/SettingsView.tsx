import { Box, Button, Container, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import AutoFillToggle from './AutoFillToggle';
import DetailedReportToggle from './DetailedReportToggle';
import ThemeToggleRow from './ThemeToggleRow';
import { actions, selectors } from '../../modules/settings/store';
import { SettingsPayload } from '../../modules/settings/types';
import { AppDispatch } from '../../store';

type SettingsViewProps = {
  onBack: () => void;
  onOpenElementsEditor: () => void;
};

const SettingsView = ({ onBack, onOpenElementsEditor }: SettingsViewProps) => {
  const dispatch: AppDispatch = useDispatch();
  const mode = useSelector(selectors.selectThemeMode);
  const detailedReport = useSelector(selectors.selectDetailedReport);
  const autoFillStartingMaterials = useSelector(
    selectors.selectAutoFillStartingMaterials,
  );

  const buildPayload = (
    overrides: Partial<SettingsPayload>,
  ): SettingsPayload => ({
    theme_mode: mode,
    detailed_report: detailedReport,
    auto_fill_starting_materials: autoFillStartingMaterials,
    ...overrides,
  });

  const handleToggleTheme = (next: 'light' | 'dark') => {
    dispatch(actions.updateSettings(buildPayload({ theme_mode: next })));
  };

  const handleToggleDetailedReport = () => {
    dispatch(
      actions.updateSettings(
        buildPayload({ detailed_report: !detailedReport }),
      ),
    );
  };

  const handleToggleAutoFill = () => {
    dispatch(
      actions.updateSettings(
        buildPayload({
          auto_fill_starting_materials: !autoFillStartingMaterials,
        }),
      ),
    );
  };

  return (
    <Container sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Settings
        </Typography>
        <ThemeToggleRow mode={mode} onToggle={handleToggleTheme} />
        <DetailedReportToggle
          enabled={detailedReport}
          onToggle={handleToggleDetailedReport}
        />
        <AutoFillToggle
          enabled={autoFillStartingMaterials}
          onToggle={handleToggleAutoFill}
        />
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={onOpenElementsEditor}>
            Edit atomic masses
          </Button>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={onBack}>
            Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SettingsView;
