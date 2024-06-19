import React, { useState, ReactNode } from 'react';
import { QRCodeContext } from '../types';

interface QRCodeProviderProps {
  children: ReactNode;
}

const testData = [
  {
    data: 'Type: URL\nData: https://Safe_website.com',
    bookmarked: false,
    scanResult: {
      secureConnection: true,
      virusTotalCheck: true,
      redirects: 0,
    },
  },
  {
    data: 'Type: URL\nData: https://unknown_website.com',
    bookmarked: false,
    scanResult: {
      secureConnection: true,
      virusTotalCheck: true,
      redirects: 2,
    },
  },
  {
    data: 'Type: URL\nData: http://danger_website.com',
    bookmarked: false,
    scanResult: {
      secureConnection: false,
      virusTotalCheck: false,
      redirects: 3,
    },
  },
];

export const QRCodeProvider: React.FC<QRCodeProviderProps> = ({ children }) => {
  const [qrCodes, setQrCodes] = useState(testData);
  const [currentScannedData, setCurrentScannedData] = useState<string>('');

  const toggleBookmark = (index: number) => {
    setQrCodes((prev) => {
      const newQrCodes = [...prev];
      newQrCodes[index].bookmarked = !newQrCodes[index].bookmarked;
      return newQrCodes;
    });
  };

  const deleteQRCode = (index: number) => {
    setQrCodes((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <QRCodeContext.Provider value={{ qrCodes, setQrCodes, setCurrentScannedData, toggleBookmark, deleteQRCode }}>
      {children}
    </QRCodeContext.Provider>
  );
};
