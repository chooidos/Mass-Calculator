import {
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import { useSelector } from 'react-redux';

import { selectors } from '../../modules/elements/store';

type ResultingTableProps = {
  onOpenExplanation: () => void;
};

const ResultingTable = ({ onOpenExplanation }: ResultingTableProps) => {
  const results = useSelector(selectors.selectResults);

  const savePDF = async () => {
    try {
      await invoke('export_to_pdf', { output: results });
      console.log('PDF saved!');
    } catch (e) {
      console.error('Save cancelled or error:', e);
    }
  };

  return (
    <Container
      sx={{
        mb: 2,
        display: 'flex',
        justifyContent: 'space-between',
        position: 'relative',
        flex: 1,
        minHeight: 0,
        boxSizing: 'border-box',
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          width: '55%',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ backgroundColor: 'background.paper' }}>
                Reagent
              </TableCell>
              <TableCell sx={{ backgroundColor: 'background.paper' }}>
                Moles
              </TableCell>
              <TableCell sx={{ backgroundColor: 'background.paper' }}>
                Mass (g)
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results?.reagents?.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.reagent}</TableCell>
                <TableCell>{row.moles.toFixed(10)}</TableCell>
                <TableCell>{row.mass.toFixed(6)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div style={{ position: 'relative', width: '40%', height: '100%' }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: 'background.paper' }}>
                  Molar Mass
                </TableCell>
                <TableCell sx={{ backgroundColor: 'background.paper' }}>
                  Target Moles
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(results?.molar_mass ?? 0) > 0 && (
                <TableRow>
                  <TableCell>{results?.molar_mass.toFixed(6)}</TableCell>
                  <TableCell>{results?.target_moles.toFixed(8)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {(results?.mass_check?.target_mass ?? 0) > 0 && (
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ backgroundColor: 'background.paper' }}>
                    Target Mass
                  </TableCell>
                  <TableCell sx={{ backgroundColor: 'background.paper' }}>
                    Reagents Total
                  </TableCell>
                  <TableCell sx={{ backgroundColor: 'background.paper' }}>
                    Delta
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{results?.mass_check?.target_mass}</TableCell>
                  <TableCell>
                    {results?.mass_check?.total_reagent_mass.toFixed(8)}
                  </TableCell>
                  <TableCell>{results?.mass_check?.delta}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
      {(results?.reagents?.length ?? 0) > 0 && (
        <>
          <Button
            variant="contained"
            size="large"
            sx={{
              p: '5px',
              position: 'absolute',
              bottom: '0px',
              right: '24px',
              zIndex: 2,
            }}
            onClick={savePDF}
          >
            Save PDF
          </Button>
          {(results?.explanation?.length ?? 0) > 0 && (
            <Button
              variant="outlined"
              size="large"
              sx={{
                p: '5px',
                position: 'absolute',
                bottom: '-1px',
                right: '130px',
                zIndex: 2,
              }}
              onClick={onOpenExplanation}
            >
              Explanation
            </Button>
          )}
        </>
      )}
    </Container>
  );
};

export default ResultingTable;
