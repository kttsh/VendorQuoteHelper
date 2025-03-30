#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::fs;
use std::path::Path;
use tauri::{Manager, Runtime};

#[tauri::command]
fn get_app_data_dir<R: Runtime>(app_handle: tauri::AppHandle<R>) -> Result<String, String> {
    let app_data_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| "Failed to get app data directory".to_string())?;
    
    // Create the directory if it doesn't exist
    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;
    }
    
    app_data_dir
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Invalid path".to_string())
}

// Command to ensure that the templates directory exists
#[tauri::command]
fn ensure_templates_dir<R: Runtime>(app_handle: tauri::AppHandle<R>) -> Result<String, String> {
    let app_data_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| "Failed to get app data directory".to_string())?;
    
    let templates_dir = app_data_dir.join("templates");
    
    if !templates_dir.exists() {
        fs::create_dir_all(&templates_dir).map_err(|e| e.to_string())?;
    }
    
    templates_dir
        .to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Invalid templates path".to_string())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_app_data_dir,
            ensure_templates_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
