import { RootState } from '../../../store';

export const selectThemeMode = (state: RootState) => state.settings.themeMode;
export const selectDetailedReport = (state: RootState) =>
  state.settings.detailedReport;
export const selectAutoFillStartingMaterials = (state: RootState) =>
  state.settings.autoFillStartingMaterials;
