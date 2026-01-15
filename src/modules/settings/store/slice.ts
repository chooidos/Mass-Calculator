import { createSlice } from '@reduxjs/toolkit';

import { defaultSettings } from '../types';
import { getSettings, updateSettings } from './actions';
import { applySettingsPayload } from './mappers';

export type SettingsState = {
  themeMode: 'light' | 'dark' | 'system';
  detailedReport: boolean;
  autoFillStartingMaterials: boolean;
};

const initialState: SettingsState = {
  themeMode: defaultSettings.theme_mode,
  detailedReport: defaultSettings.detailed_report,
  autoFillStartingMaterials: defaultSettings.auto_fill_starting_materials,
};

export const settingsSlice = createSlice({
  name: 'settingsSlice',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getSettings.fulfilled, (state, action) => {
      applySettingsPayload(state, action.payload);
    });
    builder.addCase(updateSettings.fulfilled, (state, action) => {
      applySettingsPayload(state, action.payload);
    });
  },
});

export default settingsSlice.reducer;
