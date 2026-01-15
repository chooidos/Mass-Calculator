import { configureStore } from '@reduxjs/toolkit';

import elementsSlise from './modules/elements/store/slice';
import settingsSlice from './modules/settings/store/slice';

export const store = configureStore({
  reducer: {
    elements: elementsSlise,
    settings: settingsSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
