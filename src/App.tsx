import { CssBaseline } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import './App.css';
import ElementsEditor from './components/ElementsEditor/ElementsEditor';
import ElementsForm from './components/ElementsForm/ElementsForm';
import ErrorNotification from './components/ErrorNotification/ErrorNotification';
import ExplanationDialog from './components/ExplanationDialog/ExplanationDialog';
import ResultingTable from './components/ResultingTable/ResultingTable';
import SettingsView from './components/SettingsView/SettingsView';
import ThemeWrapper from './components/ThemeWrapper/ThemeWrapper';
import { selectors as elementsSelectors } from './modules/elements/store';
import {
  actions as settingsActions,
  selectors as settingsSelectors,
} from './modules/settings/store';
import { AppDispatch } from './store';

function App() {
  const [view, setView] = useState<'main' | 'settings' | 'elements'>('main');
  const [explanationOpen, setExplanationOpen] = useState(false);
  const dispatch: AppDispatch = useDispatch();
  const themeMode = useSelector(settingsSelectors.selectThemeMode);
  const explanation =
    useSelector(elementsSelectors.selectResults)?.explanation ?? [];

  useEffect(() => {
    dispatch(settingsActions.getSettings());
  }, [dispatch]);

  return (
    <ThemeWrapper mode={themeMode}>
      <CssBaseline />
      <div className="app">
        {view === 'main' ? (
          <>
            <ElementsForm onOpenSettings={() => setView('settings')} />
            <ResultingTable
              onOpenExplanation={() => setExplanationOpen(true)}
            />
          </>
        ) : view === 'settings' ? (
          <SettingsView
            onBack={() => setView('main')}
            onOpenElementsEditor={() => setView('elements')}
          />
        ) : (
          <ElementsEditor onBack={() => setView('settings')} />
        )}
        <ExplanationDialog
          open={explanationOpen}
          explanation={explanation}
          onClose={() => setExplanationOpen(false)}
        />
        <ErrorNotification />
      </div>
    </ThemeWrapper>
  );
}

export default App;
