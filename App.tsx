import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import QRScannerScreen from './screens/QRScannerScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import { QRCodeContext } from './types';
import CustomTabBar from './components/CustomTabBar';

import { withAuthenticator } from '@aws-amplify/ui-react-native';
import { Amplify } from 'aws-amplify';
import config from './src/aws-exports';
import { enableScreens } from 'react-native-screens';

enableScreens();

Amplify.configure(config);

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  const [qrCodes, setQrCodes] = useState<{ data: string, bookmarked: boolean, scanResult: { secureConnection: boolean, virusTotalCheck: boolean, redirects: number } }[]>([]);
  const [scannedData, setScannedData] = useState<string>('');

  const clearScanData = () => {
    setScannedData('');
  };

  return (
    <QRCodeContext.Provider value={{ qrCodes, setQrCodes }}>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="QRScanner"
          tabBar={props => <CustomTabBar {...props} clearScanData={clearScanData} />}
        >
          <Tab.Screen name="History" component={HistoryScreen} />
          <Tab.Screen name="QRScanner">
            {(props) => <QRScannerScreen clearScanData={function (): void {
              throw new Error('Function not implemented.');
            } } {...props} />}
          </Tab.Screen>
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </QRCodeContext.Provider>
  );
};

export default  withAuthenticator(App);