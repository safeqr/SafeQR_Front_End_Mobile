import React, { useState } from 'react';
import AppNavigator from './navigation/AppNavigator';
import { QRCodeContext } from './types';

const App: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<string[]>([]);

  return (
    <QRCodeContext.Provider value={{ qrCodes, setQrCodes }}>
      <AppNavigator />
    </QRCodeContext.Provider>
  );
};

export default App;
