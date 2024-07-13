import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { QRCode } from '../types';

const qrCodesSlice = createSlice({
  name: 'qrCodes',
  initialState: [] as QRCode[],
  reducers: {
    addQRCode(state, action: PayloadAction<QRCode>) {
      state.push(action.payload);
      console.log('Added QR code to state:', action.payload);
    },
    toggleBookmark(state, action: PayloadAction<number>) {
      const index = state.length - 1 - action.payload;
      if (state[index]) {
        state[index].bookmarked = !state[index].bookmarked;
        console.log('Toggled bookmark for QR code at index:', index);
      }
    },
    deleteQRCode(state, action: PayloadAction<number | null>) {
      const index = state.length - 1 - (action.payload as number);
      if (state[index]) {
        console.log('Deleting QR code at index:', index);
        state.splice(index, 1);
      }
    },
  },
});

export const { addQRCode, toggleBookmark, deleteQRCode } = qrCodesSlice.actions;
export default qrCodesSlice.reducer;
