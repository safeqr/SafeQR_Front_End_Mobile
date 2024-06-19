import { createContext } from "react";

interface QRCode {
  data: string;
  bookmarked: boolean;
  scanResult: {
    secureConnection: boolean;
    virusTotalCheck: boolean;
    redirects: number;
  };
}

interface QRCodeContextProps {
  qrCodes: QRCode[];
  setQrCodes: (codes: QRCode[]) => void;
  setCurrentScannedData?: (data: string) => void;
  toggleBookmark?: (index: number) => void;
  deleteQRCode?: (index: number) => void;
}

export const QRCodeContext = createContext<QRCodeContextProps | null>(null);
