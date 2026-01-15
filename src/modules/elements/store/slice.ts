import { createSlice, current } from '@reduxjs/toolkit';

import { CalculationResult } from '../types/elements';

export type ElementsState = {
  targetFormula: string;
  targetMass: string;
  startingMaterials: string[];
  results?: CalculationResult;
  error?: string | undefined;
};

const initialState: ElementsState = {
  targetFormula: '',
  targetMass: '',
  startingMaterials: ['', ''],
};

export const elementsSlice = createSlice({
  name: 'elementsSlice',
  initialState: initialState,
  reducers: {
    updateTargetFormula: (state, action) => {
      state.targetFormula = action.payload;
    },
    updateTargetMass: (state, action) => {
      state.targetMass = action.payload;
    },
    updateStartingMaterial: (state, action) => {
      const { index, value } = action.payload as {
        index: number;
        value: string;
      };
      if (index >= 0 && index < state.startingMaterials.length) {
        state.startingMaterials[index] = value;
      }
    },
    setStartingMaterials: (state, action) => {
      const next = action.payload as string[];
      state.startingMaterials = next.slice(0, 18);
    },
    addStartingMaterial: (state) => {
      if (state.startingMaterials.length >= 18) {
        return;
      }
      state.startingMaterials.push('');
    },
    removeStartingMaterial: (state, action) => {
      const index = action.payload as number;
      if (state.startingMaterials.length <= 1) {
        return;
      }
      state.startingMaterials.splice(index, 1);
    },
    deb: (state) => {
      console.log(current(state));
    },
    updateResults: (state, action) => {
      state.results = action.payload;
      state.error = undefined;
    },
    updateError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = undefined;
    },
  },
});

export default elementsSlice.reducer;
