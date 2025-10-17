import { configureStore, combineReducers } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { appStateReducer } from '@pagopa/selfcare-common-frontend/lib/redux/slices/appStateSlice';
import { userReducer } from '@pagopa/selfcare-common-frontend/lib/redux/slices/userSlice';
import { LOG_REDUX_ACTIONS } from '../utils/constants';


const persistConfig = {
  key: 'root',
  storage,
};

const rootReducer = combineReducers({
  user: userReducer,
  appState: appStateReducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

const additionalMiddlewares = [LOG_REDUX_ACTIONS ? logger : undefined];

export const createStore = () =>
  configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware: (arg0: { serializableCheck: boolean }) => any) =>
      additionalMiddlewares.reduce(
        (array, middleware) => (middleware ? array.concat(middleware) : array),
        getDefaultMiddleware({ serializableCheck: false })
      ),
  });

export const store = createStore();
export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
