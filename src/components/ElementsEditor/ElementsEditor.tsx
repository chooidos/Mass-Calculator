import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { actions as elementsActions } from '../../modules/elements/store';
import { AppDispatch } from '../../store';

type ElementRow = {
  name: string;
  symbol: string;
  atomic_mass: string;
};

type ElementsEditorProps = {
  onBack: () => void;
};

const ElementsEditor = ({ onBack }: ElementsEditorProps) => {
  const dispatch: AppDispatch = useDispatch();
  const [rows, setRows] = useState<ElementRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const elements =
          await invoke<{ name: string; symbol: string; atomic_mass: number }[]>(
            'get_elements',
          );
        const mapped = elements.map((el) => ({
          name: el.name,
          symbol: el.symbol,
          atomic_mass: String(el.atomic_mass),
        }));
        setRows(mapped);
      } catch (error) {
        dispatch(
          elementsActions.updateError(
            `Failed to load elements. Details: ${String(error)}`,
          ),
        );
      }
    };
    load();
  }, [dispatch]);

  const updateAtomicMass = (index: number, value: string) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], atomic_mass: value };
      return next;
    });
  };

  const handleSave = async () => {
    const parsed = rows.map((row) => ({
      name: row.name,
      symbol: row.symbol,
      atomic_mass: Number(row.atomic_mass),
    }));
    if (parsed.some((row) => Number.isNaN(row.atomic_mass))) {
      dispatch(
        elementsActions.updateError(
          'Invalid atomic mass value. Please enter valid numbers.',
        ),
      );
      return;
    }
    try {
      const saved = await invoke<
        { name: string; symbol: string; atomic_mass: number }[]
      >('save_elements', { elements: parsed });
      const mapped = saved.map((el) => ({
        name: el.name,
        symbol: el.symbol,
        atomic_mass: String(el.atomic_mass),
      }));
      setRows(mapped);
    } catch (error) {
      dispatch(
        elementsActions.updateError(
          `Failed to save elements. Details: ${String(error)}`,
        ),
      );
    }
  };

  const handleRestore = async () => {
    try {
      const restored =
        await invoke<{ name: string; symbol: string; atomic_mass: number }[]>(
          'restore_elements',
        );
      const mapped = restored.map((el) => ({
        name: el.name,
        symbol: el.symbol,
        atomic_mass: String(el.atomic_mass),
      }));
      setRows(mapped);
    } catch (error) {
      dispatch(
        elementsActions.updateError(
          `Failed to restore elements. Details: ${String(error)}`,
        ),
      );
    }
  };

  return (
    <Container
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        py: 2,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Atomic masses</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={handleRestore}>
            Restore all
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Box>
      <TableContainer component={Paper} sx={{ flex: 1, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell>Atomic mass</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={`${row.symbol}-${index}`}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.symbol}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={row.atomic_mass}
                    onChange={(event) =>
                      updateAtomicMass(index, event.target.value)
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
      </Box>
    </Container>
  );
};

export default ElementsEditor;
