import { RootState } from '../../../store';

export const selectTargetFormula = (state: RootState) =>
  state.elements.targetFormula;
export const selectTargetMass = (state: RootState) => state.elements.targetMass;
export const selectStartingMaterials = (state: RootState) =>
  state.elements.startingMaterials;
export const selectResults = (state: RootState) => state.elements.results;
export const selectError = (state: RootState) => state.elements.error;
