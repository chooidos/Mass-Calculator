import { invoke } from '@tauri-apps/api/core';

import { SettingsPayload } from '../types';

export const loadSettings = async () => {
  const settings = await invoke<SettingsPayload>('get_settings');
  return settings;
};
