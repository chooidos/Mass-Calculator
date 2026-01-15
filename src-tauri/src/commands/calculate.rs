use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};

use crate::chem::parse::{ordered_unique_elements, parse_formula};
use crate::commands::fetch_elements::get_elements;

#[derive(Deserialize)]
pub struct CalculationInput {
    pub target_formula: String,
    pub target_mass: serde_json::Value,
    pub starting_materials: Vec<String>,
}

#[derive(Serialize)]
pub struct ElementCoeff {
    pub element: String,
    pub coefficient: f64,
}

#[derive(Serialize)]
pub struct ReagentResult {
    pub reagent: String,
    pub moles: f64,
    pub molar_mass: f64,
    pub mass: f64,
}

#[derive(Serialize)]
pub struct MassCheck {
    pub target_mass: f64,
    pub total_reagent_mass: f64,
    pub delta: f64,
}

#[derive(Serialize)]
pub struct CalculationOutput {
    pub target_formula: String,
    pub parsed_formula: Vec<ElementCoeff>,
    pub molar_mass: f64,
    pub target_moles: f64,
    pub reagents: Vec<ReagentResult>,
    pub mass_check: MassCheck,
    pub explanation: Vec<String>,
}

#[derive(Clone)]
struct Reagent {
    name: String,
    composition: HashMap<String, f64>,
    molar_mass: f64,
}

fn parse_f64(value: &serde_json::Value) -> f64 {
    if let Some(n) = value.as_f64() {
        n
    } else if let Some(s) = value.as_str() {
        s.parse().unwrap_or(0.0)
    } else {
        0.0
    }
}

fn round_decimals(value: f64, decimals: u32) -> f64 {
    let factor = 10_f64.powi(decimals as i32);
    (value * factor).round() / factor
}

fn format_value(value: f64) -> String {
    format!("{:.8}", value)
}

fn collapse_formula(formula: &[(String, f64)]) -> HashMap<String, f64> {
    let mut map = HashMap::new();
    for (el, coeff) in formula {
        *map.entry(el.clone()).or_insert(0.0) += *coeff;
    }
    map
}

fn molar_mass(composition: &HashMap<String, f64>, masses: &HashMap<String, f64>) -> Result<f64, String> {
    let mut total = 0.0;
    for (el, coeff) in composition {
        let mass = masses
            .get(el)
            .ok_or_else(|| format!("Missing atomic mass for {}", el))?;
        total += coeff * mass;
    }
    Ok(total)
}

fn solve_square_system(a: Vec<Vec<f64>>, b: Vec<f64>) -> Result<Vec<f64>, String> {
    let n = a.len();
    let mut aug = vec![vec![0.0; n + 1]; n];
    for i in 0..n {
        for j in 0..n {
            aug[i][j] = a[i][j];
        }
        aug[i][n] = b[i];
    }

    for i in 0..n {
        let mut pivot_row = i;
        let mut pivot_val = aug[i][i].abs();
        for r in (i + 1)..n {
            if aug[r][i].abs() > pivot_val {
                pivot_val = aug[r][i].abs();
                pivot_row = r;
            }
        }
        if pivot_val < 1e-12 {
            return Err("Singular system; cannot solve uniquely".to_string());
        }
        if pivot_row != i {
            aug.swap(i, pivot_row);
        }
        let pivot = aug[i][i];
        for c in i..=n {
            aug[i][c] /= pivot;
        }
        for r in 0..n {
            if r == i {
                continue;
            }
            let factor = aug[r][i];
            if factor.abs() > 1e-12 {
                for c in i..=n {
                    aug[r][c] -= factor * aug[i][c];
                }
            }
        }
    }

    Ok(aug.iter().map(|row| row[n]).collect())
}

#[tauri::command]
pub async fn calculate(input: CalculationInput) -> Result<CalculationOutput, String> {
    let target_mass = parse_f64(&input.target_mass);
    if target_mass <= 0.0 {
        return Err("Target mass must be positive".to_string());
    }

    let elements = get_elements().await?;
    let masses: HashMap<String, f64> = elements
        .into_iter()
        .map(|el| (el.symbol, el.atomic_mass))
        .collect();

    let parsed_target = parse_formula(input.target_formula.trim())?;
    let target_composition = collapse_formula(&parsed_target);
    let target_order = ordered_unique_elements(&parsed_target);
    let target_molar_mass = molar_mass(&target_composition, &masses)?;

    if target_molar_mass <= 0.0 {
        return Err("Target molar mass is zero".to_string());
    }

    let target_moles = target_mass / target_molar_mass;
    let mut required: HashMap<String, f64> = target_composition
        .iter()
        .map(|(el, coeff)| (el.clone(), coeff * target_moles))
        .collect();

    let mut reagents = Vec::new();
    for name in input.starting_materials.iter() {
        let trimmed = name.trim();
        if trimmed.is_empty() {
            continue;
        }
        let parsed = parse_formula(trimmed)?;
        let composition = collapse_formula(&parsed);
        let reagent_molar_mass = molar_mass(&composition, &masses)?;
        reagents.push(Reagent {
            name: trimmed.to_string(),
            composition,
            molar_mass: reagent_molar_mass,
        });
    }

    if reagents.is_empty() {
        return Err("No starting materials provided".to_string());
    }

    let mut explanation = Vec::new();
    explanation.push(format!(
        "Parsed target formula: {}",
        parsed_target
            .iter()
            .map(|(el, coeff)| format!("{}={}", el, coeff))
            .collect::<Vec<_>>()
            .join(", ")
    ));
    explanation.push(format!(
        "Atomic masses (g/mol): {}",
        target_order
            .iter()
            .map(|el| format!("{}={}", el, masses.get(el).unwrap()))
            .collect::<Vec<_>>()
            .join(", ")
    ));
    explanation.push(format!(
        "Target molar mass: {} g/mol",
        format_value(target_molar_mass)
    ));
    explanation.push(format!(
        "Target moles: {} mol",
        format_value(target_moles)
    ));

    explanation.push(format!(
        "Starting materials: {}",
        reagents
            .iter()
            .map(|r| {
                let mut keys: Vec<&String> = r.composition.keys().collect();
                keys.sort();
                let parts = keys
                    .iter()
                    .map(|el| format!("{}{}", el, r.composition.get(*el).unwrap()))
                    .collect::<Vec<_>>()
                    .join(" ");
                format!("{} [{}; {} g/mol]", r.name, parts, format_value(r.molar_mass))
            })
            .collect::<Vec<_>>()
            .join("; ")
    ));

    explanation.push(format!(
        "Element requirements (mol): {}",
        target_order
            .iter()
            .map(|el| format!("{}={}", el, format_value(*required.get(el).unwrap_or(&0.0))))
            .collect::<Vec<_>>()
            .join(", ")
    ));

    let tol = 1e-10;
    let mut fixed: Vec<Option<f64>> = vec![None; reagents.len()];

    loop {
        let remaining_indices: Vec<usize> = fixed
            .iter()
            .enumerate()
            .filter_map(|(i, v)| if v.is_none() { Some(i) } else { None })
            .collect();
        let mut changed = false;
        let remaining_elements: Vec<String> = target_order
            .iter()
            .filter_map(|el| {
                if required.get(el).copied().unwrap_or(0.0).abs() > tol {
                    Some(el.clone())
                } else {
                    None
                }
            })
            .collect();

        for element in remaining_elements {
            let providers: Vec<usize> = remaining_indices
                .iter()
                .cloned()
                .filter(|idx| {
                    reagents[*idx]
                        .composition
                        .get(&element)
                        .map(|v| *v > 0.0)
                        .unwrap_or(false)
                })
                .collect();
            if providers.len() == 1 {
                let idx = providers[0];
                let coeff = reagents[idx]
                    .composition
                    .get(&element)
                    .copied()
                    .unwrap_or(0.0);
                if coeff.abs() < tol {
                    return Err(format!("Invalid coefficient for {}", element));
                }
                let amount = required.get(&element).copied().unwrap_or(0.0) / coeff;
                if let Some(existing) = fixed[idx] {
                    if (existing - amount).abs() > 1e-8 {
                        return Err(format!(
                            "Inconsistent requirement for {} in {}",
                            element, reagents[idx].name
                        ));
                    }
                } else {
                    fixed[idx] = Some(amount);
                    changed = true;
                    explanation.push(format!(
                        "Unique supplier: {} only in {} -> n({}) = {} mol",
                        element,
                        reagents[idx].name,
                        reagents[idx].name,
                        format_value(amount)
                    ));
                    for (el, coeff) in reagents[idx].composition.iter() {
                        let entry = required.entry(el.clone()).or_insert(0.0);
                        *entry -= amount * coeff;
                    }
                }
            }
        }
        if !changed {
            break;
        }
    }

    for (el, remaining) in required.iter() {
        if remaining.abs() > 1e-6 {
            let providers = reagents
                .iter()
                .enumerate()
                .filter(|(idx, _)| fixed[*idx].is_none())
                .filter(|(_, reagent)| reagent.composition.contains_key(el))
                .count();
            if providers == 0 {
                return Err(format!("No remaining reagent provides {}", el));
            }
        }
    }

    let remaining_indices: Vec<usize> = fixed
        .iter()
        .enumerate()
        .filter_map(|(i, v)| if v.is_none() { Some(i) } else { None })
        .collect();

    let remaining_elements: Vec<String> = target_order
        .iter()
        .filter_map(|el| {
            if required.get(el).copied().unwrap_or(0.0).abs() > 1e-8 {
                Some(el.clone())
            } else {
                None
            }
        })
        .collect();

    if !remaining_elements.is_empty() && !remaining_indices.is_empty() {
        if remaining_indices.len() < remaining_elements.len() {
            return Err("Not enough independent reagents to solve".to_string());
        }

        let mut priority: Vec<usize> = remaining_indices.clone();
        priority.sort_by(|a, b| {
            let a_elemental = reagents[*a].composition.len() == 1;
            let b_elemental = reagents[*b].composition.len() == 1;
            match (a_elemental, b_elemental) {
                (false, true) => std::cmp::Ordering::Less,
                (true, false) => std::cmp::Ordering::Greater,
                _ => a.cmp(b),
            }
        });

        let mut selected = Vec::new();
        let mut covered: HashSet<String> = HashSet::new();
        for idx in &priority {
            let contributes = reagents[*idx]
                .composition
                .keys()
                .any(|el| remaining_elements.contains(el));
            if contributes {
                selected.push(*idx);
                for el in reagents[*idx].composition.keys() {
                    covered.insert(el.clone());
                }
                if remaining_elements.iter().all(|el| covered.contains(el)) {
                    break;
                }
            }
        }

        if !remaining_elements.iter().all(|el| covered.contains(el)) {
            return Err("Could not cover all remaining elements".to_string());
        }

        while selected.len() < remaining_elements.len() {
            if let Some(next) = priority.iter().find(|idx| !selected.contains(idx)) {
                selected.push(*next);
            } else {
                break;
            }
        }

        if selected.len() != remaining_elements.len() {
            return Err("Ambiguous system; provide additional constraints".to_string());
        }

        let mut matrix = Vec::new();
        let mut rhs = Vec::new();
        for element in &remaining_elements {
            let mut row = Vec::new();
            for idx in &selected {
                row.push(
                    reagents[*idx]
                        .composition
                        .get(element)
                        .copied()
                        .unwrap_or(0.0),
                );
            }
            matrix.push(row);
            rhs.push(required.get(element).copied().unwrap_or(0.0));
        }

        let solved = solve_square_system(matrix, rhs)?;
        for (idx, amount) in selected.iter().zip(solved.iter()) {
            fixed[*idx] = Some(*amount);
        }

        for idx in &remaining_indices {
            if fixed[*idx].is_none() {
                fixed[*idx] = Some(0.0);
            }
        }
    } else {
        for idx in &remaining_indices {
            fixed[*idx] = Some(0.0);
        }
    }

    let mut totals: HashMap<String, f64> = HashMap::new();
    for (idx, reagent) in reagents.iter().enumerate() {
        let amount = fixed[idx].unwrap_or(0.0);
        for (el, coeff) in reagent.composition.iter() {
            *totals.entry(el.clone()).or_insert(0.0) += amount * coeff;
        }
    }

    for (el, actual) in totals.iter() {
        if !target_composition.contains_key(el) && actual.abs() > 1e-8 {
            return Err(format!(
                "Reagent introduces element not in target: {}",
                el
            ));
        }
    }

    for (el, required_mol) in target_composition.iter().map(|(el, coeff)| {
        let required_mol = coeff * target_moles;
        (el.clone(), required_mol)
    }) {
        let actual = totals.get(&el).copied().unwrap_or(0.0);
        if (actual - required_mol).abs() > 1e-6 {
            return Err(format!(
                "Element balance mismatch for {} (required {}, got {})",
                el,
                format_value(required_mol),
                format_value(actual)
            ));
        }
    }

    let mut equation_lines = Vec::new();
    for el in &target_order {
        let coeff = target_composition.get(el).copied().unwrap_or(0.0);
        let required_mol = coeff * target_moles;
        let mut terms = Vec::new();
        for (idx, reagent) in reagents.iter().enumerate() {
            if let Some(r_coeff) = reagent.composition.get(el) {
                let amount = fixed[idx].unwrap_or(0.0);
                if amount.abs() > tol {
                    terms.push(format!(
                        "{}*n({})",
                        r_coeff,
                        reagent.name
                    ));
                }
            }
        }
        if terms.is_empty() {
            terms.push("0".to_string());
        }
        equation_lines.push(format!(
            "{}: {} = {} mol",
            el,
            terms.join(" + "),
            format_value(required_mol)
        ));
    }
    explanation.push(format!(
        "Elemental balance equations: {}",
        equation_lines.join(" | ")
    ));

    let mut reagent_results = Vec::new();
    let mut total_reagent_mass = 0.0;
    for (idx, reagent) in reagents.iter().enumerate() {
        let mut moles = fixed[idx].unwrap_or(0.0);
        if moles.abs() < tol {
            moles = 0.0;
        }
        if moles < -1e-8 {
            return Err(format!("Negative amount for {}", reagent.name));
        }
        let mass = moles * reagent.molar_mass;
        total_reagent_mass += mass;
        reagent_results.push(ReagentResult {
            reagent: reagent.name.clone(),
            moles,
            molar_mass: reagent.molar_mass,
            mass: round_decimals(mass, 6),
        });
    }

    explanation.push(format!(
        "Reagent moles: {}",
        reagent_results
            .iter()
            .map(|r| format!("{}={}", r.reagent, format_value(r.moles)))
            .collect::<Vec<_>>()
            .join(", ")
    ));
    explanation.push(format!(
        "Reagent masses (g, 6 decimals): {}",
        reagent_results
            .iter()
            .map(|r| format!("{}={:.6}", r.reagent, r.mass))
            .collect::<Vec<_>>()
            .join(", ")
    ));

    let mass_check = MassCheck {
        target_mass,
        total_reagent_mass,
        delta: total_reagent_mass - target_mass,
    };

    explanation.push(format!(
        "Mass check: total reagents {} g vs target {} g (delta {})",
        format_value(total_reagent_mass),
        format_value(target_mass),
        format_value(mass_check.delta)
    ));

    let parsed_formula = parsed_target
        .iter()
        .map(|(el, coeff)| ElementCoeff {
            element: el.clone(),
            coefficient: *coeff,
        })
        .collect();

    Ok(CalculationOutput {
        target_formula: input.target_formula.trim().to_string(),
        parsed_formula,
        molar_mass: target_molar_mass,
        target_moles,
        reagents: reagent_results,
        mass_check,
        explanation,
    })
}
