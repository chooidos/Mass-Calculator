use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ReagentResult {
    pub reagent: String,
    pub moles: f64,
    pub molar_mass: f64,
    pub mass: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MassCheck {
    pub target_mass: f64,
    pub total_reagent_mass: f64,
    pub delta: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CalculationOutput {
    pub target_formula: String,
    pub molar_mass: f64,
    pub target_moles: f64,
    pub reagents: Vec<ReagentResult>,
    pub mass_check: MassCheck,
    pub explanation: Vec<String>,
}
