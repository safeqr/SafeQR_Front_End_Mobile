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

export interface UserAttributes {
  email: string;
  email_verified: string;
  family_name: string;
  given_name: string;
  identities: string;
  name: string;
  sub: string;
}

export interface QRCodeType {
  data: {
    id: string;
    contents: string;
    info: {
      type: string;
      description: string;
    };
    createdAt: string;
    type: string;
  },
  bookmarked: boolean;
}


export const QRCodeContext = createContext<{
  qrCodes: QRCode[];
  setQrCodes: React.Dispatch<React.SetStateAction<QRCode[]>>;
} | null>(null);