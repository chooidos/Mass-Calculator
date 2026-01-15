export interface ReagentResult {
  reagent: string;
  moles: number;
  molar_mass: number;
  mass: number;
}

export interface MassCheck {
  target_mass: number;
  total_reagent_mass: number;
  delta: number;
}

export interface CalculationResult {
  target_formula: string;
  parsed_formula: {
    element: string;
    coefficient: number;
  }[];
  molar_mass: number;
  target_moles: number;
  reagents: ReagentResult[];
  mass_check: MassCheck;
  explanation: string[];
}
