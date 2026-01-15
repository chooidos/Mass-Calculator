use std::collections::HashSet;

pub fn parse_formula(formula: &str) -> Result<Vec<(String, f64)>, String> {
    let chars: Vec<char> = formula.chars().collect();
    if chars.is_empty() {
        return Err("Formula is empty".to_string());
    }
    let mut idx = 0usize;
    let mut out = Vec::new();
    while idx < chars.len() {
        let c = chars[idx];
        if !c.is_ascii_uppercase() {
            return Err(format!(
                "Invalid formula at position {} in {}",
                idx + 1,
                formula
            ));
        }
        let mut symbol = String::new();
        symbol.push(c);
        idx += 1;
        if idx < chars.len() && chars[idx].is_ascii_lowercase() {
            symbol.push(chars[idx]);
            idx += 1;
        }
        let mut num = String::new();
        while idx < chars.len() && (chars[idx].is_ascii_digit() || chars[idx] == '.') {
            num.push(chars[idx]);
            idx += 1;
        }
        let coefficient = if num.is_empty() {
            1.0
        } else {
            num.parse::<f64>()
                .map_err(|_| format!("Invalid number in {}", formula))?
        };
        out.push((symbol, coefficient));
    }
    Ok(out)
}

pub fn ordered_unique_elements(parsed: &[(String, f64)]) -> Vec<String> {
    let mut seen = HashSet::new();
    let mut out = Vec::new();
    for (el, _) in parsed {
        if seen.insert(el.clone()) {
            out.push(el.clone());
        }
    }
    out
}
