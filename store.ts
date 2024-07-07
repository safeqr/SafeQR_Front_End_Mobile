import { configureStore } from '@reduxjs/toolkit';
import qrCodesReducer from './reducers/qrCodesReducer';

const store = configureStore({
  reducer: {
    qrCodes: qrCodesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export default store;