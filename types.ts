import { createContext } from 'react';

interface QRCodeContextProps {
  qrCodes: { data: string, bookmarked: boolean }[];
  setQrCodes: (codes: { data: string, bookmarked: boolean }[]) => void;
  setCurrentScannedData: (data: string) => void;
  toggleBookmark: (index: number) => void;
  deleteQRCode: (index: number) => void;
}

export const QRCodeContext = createContext<QRCodeContextProps | null>(null);
