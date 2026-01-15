import { SettingsPayload } from '../types';
import { SettingsState } from './slice';

export const applySettingsPayload = (
  state: SettingsState,
  payload: SettingsPayload,
) => {
  state.themeMode = payload.theme_mode;
  state.detailedReport = payload.detailed_report;
  state.autoFillStartingMaterials = payload.auto_fill_starting_materials;
  state.exportFormat = payload.export_format === 'excel' ? 'excel' : 'pdf';
};
