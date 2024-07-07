import { createContext } from 'react';

export interface QRCode {
  data: string;
  type: string;
  bookmarked: boolean;
  scanResult: {
    secureConnection: boolean;
    virusTotalCheck: boolean;
    redirects: number;
  };
}

export const QRCodeContext = createContext<{
  qrCodes: QRCode[];
  setQrCodes: React.Dispatch<React.SetStateAction<QRCode[]>>;
} | null>(null);