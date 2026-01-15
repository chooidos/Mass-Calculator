import reducer, { elementsSlice } from './slice';

export * as selectors from './selectors';
export const actions = { ...elementsSlice.actions };
export { elementsSlice } from './slice';
export { reducer as default };
