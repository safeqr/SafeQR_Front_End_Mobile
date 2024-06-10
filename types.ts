import { createContext } from 'react';

export type QRCodeContextType = {
  qrCodes: string[];
  setQrCodes: (codes: string[]) => void;
};

export const QRCodeContext = createContext<QRCodeContextType | null>(null);
