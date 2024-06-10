import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import QRScannerScreen from './screens/QRScannerScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import { QRCodeContext } from './types';
import CustomTabBar from './components/CustomTabBar';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<string[]>([]);
  const [scannedData, setScannedData] = useState<string>('');

  const clearScanData = () => {
    setScannedData('');
  };

  return (
    <QRCodeContext.Provider value={{ qrCodes, setQrCodes }}>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="QRScanner"
          tabBar={(props) => <CustomTabBar {...props} clearScanData={clearScanData} />}
        >
          <Tab.Screen name="History" component={HistoryScreen} />
          <Tab.Screen name="QRScanner">
            {(props) => <QRScannerScreen {...props} clearScanData={clearScanData} />}
          </Tab.Screen>
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </QRCodeContext.Provider>
  );
};

export default App;
