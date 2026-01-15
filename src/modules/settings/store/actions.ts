import { createAsyncThunk } from '@reduxjs/toolkit';

import { loadSettings, saveSettings } from '../async-layer';

export const getSettings = createAsyncThunk(
  'settings/getSettings',
  loadSettings,
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  saveSettings,
);
