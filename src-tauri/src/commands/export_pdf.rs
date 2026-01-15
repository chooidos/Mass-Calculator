use chrono::Local;
use printpdf::{BuiltinFont, Line, Mm, PdfDocument, Point};
use std::{fs::File, io::BufWriter};

use crate::commands::export_helpers::pick_save_path;
use crate::commands::export_types::CalculationOutput;
use crate::commands::settings::read_settings;

fn wrap_text(line: &str, max_chars: usize) -> Vec<String> {
    let mut out = Vec::new();
    let mut current = String::new();
    for word in line.split_whitespace() {
        if current.is_empty() {
            current.push_str(word);
            continue;
        }
        if current.len() + 1 + word.len() <= max_chars {
            current.push(' ');
            current.push_str(word);
        } else {
            out.push(current);
            current = word.to_string();
        }
    }
    if !current.is_empty() {
        out.push(current);
    }
    if out.is_empty() {
        out.push(String::new());
    }
    out
}

#[tauri::command]
pub fn export_to_pdf(output: CalculationOutput) -> Result<(), String> {
    let detailed_report = read_settings()
        .map(|settings| settings.detailed_report)
        .unwrap_or(false);
    let path = pick_save_path(
        "Save PDF Report",
        "PDF Document",
        "pdf",
        &output.target_formula,
    )?;

    let (doc, page1, layer1) =
        PdfDocument::new("Stoichiometry Report", Mm(210.0), Mm(297.0), "Layer 1");
    let mut layer = doc.get_page(page1).get_layer(layer1);

    let font = doc
        .add_builtin_font(BuiltinFont::Helvetica)
        .map_err(|e| e.to_string())?;

    let now = Local::now().format("%Y-%m-%d %H:%M").to_string();
    layer.use_text("Stoichiometry Report", 18.0, Mm(60.0), Mm(280.0), &font);
    layer.use_text(format!("Date: {}", now), 12.0, Mm(20.0), Mm(270.0), &font);

    let formula_text = output.target_formula.trim().to_string();
    if !formula_text.is_empty() {
        layer.use_text(format!("Formula: {}", formula_text), 12.0, Mm(20.0), Mm(260.0), &font);
    }

    let mut y = Mm(245.0);
    let x_reagent = Mm(20.0);
    let x_moles = Mm(90.0);
    let x_mass = Mm(140.0);
    let x_right = Mm(190.0);
    layer.use_text("Reagent", 14.0, x_reagent, y, &font);
    layer.use_text("Moles", 14.0, x_moles, y, &font);
    layer.use_text("Mass (g)", 14.0, x_mass, y, &font);
    y -= Mm(6.0);
    let line = Line {
        points: vec![
            (Point::new(x_reagent, y), false),
            (Point::new(x_right, y), false),
        ],
        is_closed: false,
        has_fill: false,
        has_stroke: true,
        is_clipping_path: false,
    };
    layer.add_shape(line);
    y -= Mm(8.0);

    for item in &output.reagents {
        if y.0 < 20.0 {
            let (new_page, new_layer) = doc.add_page(Mm(210.0), Mm(297.0), "Layer 1");
            layer = doc.get_page(new_page).get_layer(new_layer);
            y = Mm(280.0);
        }
        layer.use_text(&item.reagent, 12.0, x_reagent, y, &font);
        layer.use_text(format!("{:.10}", item.moles), 12.0, x_moles, y, &font);
        layer.use_text(format!("{:.6}", item.mass), 12.0, x_mass, y, &font);
        y -= Mm(8.0);
    }

    y -= Mm(10.0);
    layer.use_text(
        format!("Target molar mass: {:.6} g/mol", output.molar_mass),
        12.0,
        Mm(20.0),
        y,
        &font,
    );
    if detailed_report {
        y -= Mm(8.0);
        layer.use_text(
            format!("Target moles: {:.6} mol", output.target_moles),
            12.0,
            Mm(20.0),
            y,
            &font,
        );
        y -= Mm(8.0);
        layer.use_text(
            format!(
                "Mass check: total {:.6} g, target {:.6} g, delta {:.6} g",
                output.mass_check.total_reagent_mass,
                output.mass_check.target_mass,
                output.mass_check.delta
            ),
            12.0,
            Mm(20.0),
            y,
            &font,
        );

        y -= Mm(14.0);
        if y.0 < 30.0 {
            let (new_page, new_layer) = doc.add_page(Mm(210.0), Mm(297.0), "Layer 1");
            layer = doc.get_page(new_page).get_layer(new_layer);
            y = Mm(280.0);
        }
        layer.use_text("Explanation:", 12.0, Mm(20.0), y, &font);
        y -= Mm(8.0);
        let max_chars = 90;
        for line in &output.explanation {
            for wrapped in wrap_text(line, max_chars) {
                if y.0 < 20.0 {
                    let (new_page, new_layer) =
                        doc.add_page(Mm(210.0), Mm(297.0), "Layer 1");
                    layer = doc.get_page(new_page).get_layer(new_layer);
                    y = Mm(280.0);
                }
                layer.use_text(wrapped, 10.0, Mm(20.0), y, &font);
                y -= Mm(6.0);
            }
        }
    }

    let file = File::create(&path).map_err(|e| e.to_string())?;
    doc.save(&mut BufWriter::new(file))
        .map_err(|e| e.to_string())?;

    Ok(())
}
