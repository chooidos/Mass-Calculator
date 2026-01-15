// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri::{Builder, LogicalSize, Manager, Size, WindowEvent};

mod chem;
mod commands {
    pub mod calculate;
    pub mod export_excel;
    pub mod export_helpers;
    pub mod export_pdf;
    pub mod export_types;
    pub mod fetch_elements;
    pub mod parse_formula;
    pub mod settings;
}

use commands::{
    calculate::calculate,
    export_excel::export_to_excel,
    export_pdf::export_to_pdf,
    fetch_elements::{get_elements, restore_elements, save_elements},
    parse_formula::parse_formula,
    settings::{get_settings, save_settings},
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            get_elements,
            calculate,
            export_to_excel,
            export_to_pdf,
            parse_formula,
            get_settings,
            save_settings,
            save_elements,
            restore_elements,
        ])
        .setup(|app| {
            // Use the Manager trait to access the window by its label
            if let Some(window) = app.get_webview_window("main") {
                // Prevent resizing when moving between monitors with different DPI settings
                let window_ = window.clone();
                window_.on_window_event(move |event| {
                    if let WindowEvent::ScaleFactorChanged { .. } = event {
                        window
                            .set_size(Size::Logical(LogicalSize {
                                width: 800.0,
                                height: 600.0,
                            }))
                            .unwrap();
                    }
                });
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
