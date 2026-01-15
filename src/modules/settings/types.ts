export type ThemeMode = 'light' | 'dark' | 'system';
export type ExportFormat = 'pdf' | 'excel';

export type SettingsPayload = {
  theme_mode: ThemeMode;
  detailed_report: boolean;
  auto_fill_starting_materials: boolean;
  export_format: ExportFormat;
};

export const defaultSettings: SettingsPayload = {
  theme_mode: 'system',
  detailed_report: false,
  auto_fill_starting_materials: true,
  export_format: 'pdf',
};
