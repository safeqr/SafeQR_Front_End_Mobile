import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { QRCode, QRCodeType, UserAttributes } from "../types";
import { deleteBookmark, deleteScannedHistory, setBookmark } from "../api/qrCodeAPI";
import { RootState } from '../store';

interface QRCodeState {
    qrCodes: QRCode[];
    histories: QRCodeType[] | null;
    bookmarks: QRCodeType[] | null;
    userAttributes: UserAttributes;
}
const initialState: QRCodeState = {
    qrCodes: [],
    histories: [],
    bookmarks: [],
    userAttributes: null,
};

export const toggleBookmark = createAsyncThunk(
  'qrCodes/toggleBookmark',
  async ({ userId, qrCode }: { userId: string, qrCode: QRCodeType }, { dispatch, rejectWithValue }) => {
    try {
      await (qrCode.bookmarked ? deleteBookmark(userId, qrCode.data.id) : setBookmark(userId, qrCode.data.id));
      // Dispatch the action to update local state
      dispatch(toggleBookmarkInState(qrCode));
      return qrCode;

    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const deleteQRCode = createAsyncThunk(
  'qrCodes/deleteQRCode',
  async ({ userId, qrCodeId }: { userId: string, qrCodeId: string }, { dispatch, rejectWithValue }) => {
    try {
      await deleteScannedHistory(userId, qrCodeId);
      dispatch(deleteQRCodeInState(qrCodeId));
      return qrCodeId;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

const qrCodesSlice = createSlice({
    name: "qrCodes",
    initialState,
    reducers: {
        addQRCode(state, action: PayloadAction<QRCode>) {
            console.log("add qrcode action payload:", action.payload);

            state.qrCodes.push(action.payload);
            console.log("Added QR code to state:", action.payload);
        },
        toggleBookmarkInState(state, action: PayloadAction<QRCodeType>) {
          const qrCode = action.payload;
         
          state.histories = state.histories!.map(b => b.data.id === qrCode.data.id ? { ...b, bookmarked: !qrCode.bookmarked } : b);
        },
        deleteQRCodeInState(state, action: PayloadAction<string | null>) {
          state.histories = state.histories!.filter(qr => qr.data.id !== action.payload);
        },
        setUserAttributes(state, action: PayloadAction<UserAttributes>) {
            state.userAttributes = action.payload;
            console.log("(Store)Set user attributes:", action.payload);
        },
        setScannedHistories(state, action: PayloadAction<QRCodeType[]>) {
            state.histories = action.payload;
        },
        setBookmarks(state, action: PayloadAction<QRCodeType[]>) {
            state.bookmarks = action.payload;
        },
    }
});

export const {
    addQRCode,
    toggleBookmarkInState,
    deleteQRCodeInState,
    setUserAttributes,
    setScannedHistories,
} = qrCodesSlice.actions;

export default qrCodesSlice.reducer;
