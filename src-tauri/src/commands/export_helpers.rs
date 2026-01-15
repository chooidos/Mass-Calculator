use rfd::FileDialog;
use std::path::PathBuf;

pub fn pick_save_path(
    title: &str,
    filter_label: &str,
    extension: &str,
    formula: &str,
) -> Result<PathBuf, String> {
    let mut compound = formula.trim().to_string();
    if compound.is_empty() {
        compound = "compound".to_string();
    }
    let safe_compound: String = compound
        .chars()
        .map(|ch| if ch.is_ascii_alphanumeric() { ch } else { '_' })
        .collect();
    let default_name = format!("report_{}.{}", safe_compound, extension);
    let save_path = FileDialog::new()
        .set_title(title)
        .add_filter(filter_label, &[extension])
        .set_file_name(default_name)
        .save_file();
    match save_path {
        Some(p) => Ok(p),
        None => Err("Save canceled".into()),
    }
}
