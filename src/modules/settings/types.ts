export type ThemeMode = 'light' | 'dark' | 'system';

export type SettingsPayload = {
  theme_mode: ThemeMode;
  detailed_report: boolean;
  auto_fill_starting_materials: boolean;
};

export const defaultSettings: SettingsPayload = {
  theme_mode: 'system',
  detailed_report: false,
  auto_fill_starting_materials: true,
};
