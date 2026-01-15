use directories::ProjectDirs;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Debug)]
pub struct AppSettings {
    pub theme_mode: String,
    pub detailed_report: bool,
    pub auto_fill_starting_materials: bool,
}

fn get_settings_path() -> PathBuf {
    let proj_dirs =
        ProjectDirs::from("com", "chooinet", "MassCalc").expect("Cannot get project directories");
    let data_dir = proj_dirs.data_local_dir();
    fs::create_dir_all(data_dir).expect("Cannot create data directory");
    data_dir.join("settings.json")
}

fn default_settings() -> AppSettings {
    AppSettings {
        theme_mode: "system".to_string(),
        detailed_report: false,
        auto_fill_starting_materials: true,
    }
}

pub fn read_settings() -> Result<AppSettings, String> {
    let path = get_settings_path();
    if !path.exists() {
        return Ok(default_settings());
    }
    let raw = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let settings: AppSettings = serde_json::from_str(&raw).map_err(|e| e.to_string())?;
    Ok(settings)
}

#[tauri::command]
pub fn get_settings() -> Result<AppSettings, String> {
    read_settings()
}

#[tauri::command]
pub fn save_settings(input: AppSettings) -> Result<(), String> {
    let path = get_settings_path();
    let data = serde_json::to_string_pretty(&input).map_err(|e| e.to_string())?;
    fs::write(&path, data).map_err(|e| e.to_string())?;
    Ok(())
}
