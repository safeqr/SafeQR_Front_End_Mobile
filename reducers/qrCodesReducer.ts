import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { QRCode, UserAttributes } from '../types';

const initialState: QRCodeState = {
  qrCodes: [],
  userAttributes: null,
};

const qrCodesSlice = createSlice({
  name: 'qrCodes',
  initialState,
  reducers: {
    addQRCode(state, action: PayloadAction<QRCode>) {
      state.qrCodes.push(action.payload);
      console.log('Added QR code to state:', action.payload);
    },
    toggleBookmark(state, action: PayloadAction<number>) {
      const index = state.qrCodes.length - 1 - action.payload;
      if (state.qrCodes[index]) {
        state.qrCodes[index].bookmarked = !state.qrCodes[index].bookmarked;
        console.log('Toggled bookmark for QR code at index:', index);
      }
    },
    deleteQRCode(state, action: PayloadAction<number | null>) {
      const index = state.qrCodes.length - 1 - (action.payload as number);
      if (state.qrCodes[index]) {
        console.log('Deleting QR code at index:', index);
        state.qrCodes.splice(index, 1);
      }
    },
    setUserAttributes(state, action: PayloadAction<UserAttributes>) {
      state.userAttributes = action.payload;
      console.log('(Store)Set user attributes:', action.payload);
    },
  },
});

export const { addQRCode, toggleBookmark, deleteQRCode, setUserAttributes } = qrCodesSlice.actions;
export default qrCodesSlice.reducer;
