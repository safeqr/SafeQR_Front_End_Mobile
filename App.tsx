import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { QRCode, QRCodeContext } from './types';
import AppNavigator from './navigation/AppNavigator';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [scannedData, setScannedData] = useState<string>('');

  const clearScanData = () => {
    setScannedData('');
  };

  return (
    <QRCodeContext.Provider value={{ qrCodes, setQrCodes }}>
      <AppNavigator clearScanData={clearScanData}/>
    </QRCodeContext.Provider>
  );
};

export default App;
