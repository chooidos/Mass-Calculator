import * as asyncActions from './actions';
import reducer, { settingsSlice } from './slice';

export * as selectors from './selectors';
export const actions = { ...asyncActions, ...settingsSlice.actions };
export { reducer as default };
