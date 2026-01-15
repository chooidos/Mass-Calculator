use serde::Deserialize;

use crate::chem::parse::{ordered_unique_elements, parse_formula as parse_formula_inner};

#[derive(Deserialize)]
pub struct ParseFormulaInput {
    pub formula: String,
}

#[tauri::command]
pub fn parse_formula(input: ParseFormulaInput) -> Result<Vec<String>, String> {
    let trimmed = input.formula.trim();
    if trimmed.is_empty() {
        return Ok(Vec::new());
    }
    let parsed = parse_formula_inner(trimmed)?;
    Ok(ordered_unique_elements(&parsed))
}
