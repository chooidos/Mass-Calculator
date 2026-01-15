use rust_xlsxwriter::Workbook;

use crate::commands::export_helpers::pick_save_path;
use crate::commands::export_types::CalculationOutput;

#[tauri::command]
pub fn export_to_excel(output: CalculationOutput) -> Result<(), String> {
    let path = pick_save_path(
        "Save Excel Report",
        "Excel Workbook",
        "xlsx",
        &output.target_formula,
    )?;

    let mut workbook = Workbook::new();
    let worksheet = workbook.add_worksheet();

    worksheet
        .write_string(0, 0, "Formula")
        .map_err(|e| e.to_string())?;
    worksheet
        .write_string(0, 1, output.target_formula.trim())
        .map_err(|e| e.to_string())?;
    worksheet
        .write_string(0, 2, "Target mass")
        .map_err(|e| e.to_string())?;
    worksheet
        .write_number(0, 3, output.mass_check.target_mass)
        .map_err(|e| e.to_string())?;

    worksheet
        .write_string(1, 0, "compound")
        .map_err(|e| e.to_string())?;
    worksheet
        .write_string(1, 1, "calculated mass")
        .map_err(|e| e.to_string())?;
    worksheet
        .write_string(1, 2, "weighed mass")
        .map_err(|e| e.to_string())?;

    for (index, item) in output.reagents.iter().enumerate() {
        let row = (index + 2) as u32;
        worksheet
            .write_string(row, 0, &item.reagent)
            .map_err(|e| e.to_string())?;
        worksheet
            .write_number(row, 1, item.mass)
            .map_err(|e| e.to_string())?;
        worksheet
            .write_string(row, 2, "")
            .map_err(|e| e.to_string())?;
    }

    workbook.save(path).map_err(|e| e.to_string())?;

    Ok(())
}
