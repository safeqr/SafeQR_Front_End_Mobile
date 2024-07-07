import { createAction } from '@reduxjs/toolkit';
import { QRCode } from '../types';

export const addQRCode = createAction<QRCode>('qrCodes/addQRCode');
export const toggleBookmark = createAction<number>('qrCodes/toggleBookmark');
export const deleteQRCode = createAction<number | null>('qrCodes/deleteQRCode');
