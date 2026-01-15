import { invoke } from '@tauri-apps/api/core';

import { SettingsPayload } from '../types';

export const saveSettings = async (input: SettingsPayload) => {
  await invoke('save_settings', { input });
  return input;
};
