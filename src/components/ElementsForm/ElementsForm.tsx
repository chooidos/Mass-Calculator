import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  Button,
  Container,
  Grid2,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { actions, selectors } from '../../modules/elements/store';
import { selectors as settingsSelectors } from '../../modules/settings/store';
import { AppDispatch } from '../../store';

type ElementsFormProps = {
  onOpenSettings: () => void;
};

const ElementsForm = ({ onOpenSettings }: ElementsFormProps) => {
  const dispatch: AppDispatch = useDispatch();

  const targetFormula = useSelector(selectors.selectTargetFormula);
  const targetMass = useSelector(selectors.selectTargetMass);
  const startingMaterials = useSelector(selectors.selectStartingMaterials);
  const autoFillStartingMaterials = useSelector(
    settingsSelectors.selectAutoFillStartingMaterials,
  );

  const handleTargetFormulaChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    dispatch(actions.updateTargetFormula(event.target.value));
  };

  const handleTargetMassChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    dispatch(actions.updateTargetMass(event.target.value));
  };

  const handleStartingMaterialChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
  ) => {
    dispatch(
      actions.updateStartingMaterial({
        index,
        value: event.target.value,
      }),
    );
  };

  useEffect(() => {
    let active = true;
    const fetchParsed = async () => {
      const trimmed = targetFormula.trim();
      if (!trimmed || !autoFillStartingMaterials) {
        return;
      }
      try {
        const parsed = await invoke<string[]>('parse_formula', {
          input: { formula: trimmed },
        });
        if (!active || parsed.length === 0) {
          return;
        }
        dispatch(actions.setStartingMaterials(parsed.slice(0, 18)));
      } catch (error) {
        dispatch(actions.updateError(`Error parsing formula ${error}`));
      }
    };
    fetchParsed();
    return () => {
      active = false;
    };
  }, [dispatch, targetFormula, autoFillStartingMaterials]);

  const sendDataToCalculate = async () => {
    const materials = startingMaterials
      .map((value) => value.trim())
      .filter(Boolean);

    try {
      dispatch(actions.clearError());
      const result = await invoke('calculate', {
        input: {
          target_formula: targetFormula,
          target_mass: targetMass,
          starting_materials: materials,
        },
      });

      dispatch(actions.updateResults(result));
    } catch (error) {
      dispatch(
        actions.updateError(
          `Calculation failed. Check target formula, target mass, and starting materials. Details: ${String(
            error,
          )}`,
        ),
      );
    }
  };

  return (
    <Container
      sx={{
        maxHeight: '50%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Grid2
        container
        spacing={2}
        paddingBlockStart={2}
        paddingBlockEnd={2}
        sx={{ flex: 1, minHeight: 0 }}
      >
        <Grid2
          size={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="body1">Target formula</Typography>
        </Grid2>
        <Grid2 size={9} display="flex" alignItems="center">
          <TextField
            id="target-formula"
            autoComplete="false"
            variant="outlined"
            size="small"
            fullWidth
            slotProps={{ htmlInput: { sx: { padding: '5px' } } }}
            value={targetFormula}
            onChange={handleTargetFormulaChange}
          />
        </Grid2>
        <Grid2
          size={1}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <IconButton aria-label="settings" onClick={onOpenSettings}>
            <SettingsIcon />
          </IconButton>
        </Grid2>
        <Grid2
          size={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="body1">Target mass (g)</Typography>
        </Grid2>
        <Grid2 size={4} display="flex" alignItems="center">
          <TextField
            id="target-mass"
            autoComplete="false"
            variant="outlined"
            size="small"
            slotProps={{ htmlInput: { sx: { padding: '5px' } } }}
            value={targetMass}
            onChange={handleTargetMassChange}
          />
        </Grid2>
        <Grid2 size={6} />
        <Grid2
          size={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="body1">Starting materials</Typography>
        </Grid2>
        <Grid2 size={10} display="flex" alignItems="center">
          <Box
            display="flex"
            alignItems="flex-start"
            gap={1}
            sx={{ flexWrap: 'nowrap' }}
          >
            <Box
              sx={{
                flex: 1,
                maxHeight: 'calc(50vh - 180px)',
                overflow: 'auto',
              }}
            >
              <Box
                display="grid"
                gap={1}
                sx={{
                  gridTemplateColumns: 'repeat(6, minmax(60px, 1fr))',
                }}
              >
                {startingMaterials.map((value, index) => (
                  <TextField
                    key={index}
                    autoComplete="false"
                    variant="outlined"
                    size="small"
                    slotProps={{ htmlInput: { sx: { padding: '5px' } } }}
                    value={value}
                    onChange={(event) =>
                      handleStartingMaterialChange(event, index)
                    }
                  />
                ))}
              </Box>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              sx={{ position: 'sticky', top: 0 }}
            >
              <Button
                aria-label="remove"
                size="small"
                variant="outlined"
                sx={{ minWidth: '32px', paddingInline: '6px' }}
                disabled={startingMaterials.length <= 1}
                onClick={() =>
                  dispatch(
                    actions.removeStartingMaterial(
                      startingMaterials.length - 1,
                    ),
                  )
                }
              >
                -
              </Button>
              <Button
                aria-label="add"
                size="small"
                variant="outlined"
                sx={{ ml: 1, minWidth: '32px', paddingInline: '6px' }}
                disabled={startingMaterials.length >= 18}
                onClick={() => dispatch(actions.addStartingMaterial())}
              >
                +
              </Button>
            </Box>
          </Box>
        </Grid2>
        <Grid2 size={10} />
        <Grid2 size={2} display="flex" justifyContent="right">
          <Button
            variant="contained"
            onClick={sendDataToCalculate}
            size="large"
            sx={{ p: '5px' }}
          >
            Calculate
          </Button>
        </Grid2>
      </Grid2>
    </Container>
  );
};

export default ElementsForm;
