import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import QRScannerScreen from './screens/QRScannerScreen';
import HistoryScreen from './screens/HistoryScreen';
import EmailScreen from './screens/EmailScreen'; // Import the Email screen
import { QRCodeContext } from './types';
import CustomTabBar from './components/CustomTabBar';
import store from './store';
import { withAuthenticator } from '@aws-amplify/ui-react-native';
import { Amplify } from 'aws-amplify';
import config from './src/aws-exports';
import { enableScreens } from 'react-native-screens';

enableScreens();

Amplify.configure(config);

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  const [scannedData, setScannedData] = useState<string>('');

  const clearScanData = () => {
    setScannedData('');
  };

  return (
    <Provider store={store}>
      <QRCodeContext.Provider value={{ scannedData, setScannedData }}>
        <NavigationContainer>
        <Tab.Navigator
          initialRouteName="QRScanner"
          tabBar={(props) => <CustomTabBar {...props} clearScanData={clearScanData} />}
          screenOptions={{ headerShown: false }} // turn of header for all screens
        >
            <Tab.Screen name="History" component={HistoryScreen} />
            <Tab.Screen name="QRScanner">
              {(props) => <QRScannerScreen {...props} clearScanData={clearScanData} />}
            </Tab.Screen>
            <Tab.Screen name="Email" component={EmailScreen} />
          </Tab.Navigator>




          
        </NavigationContainer>
      </QRCodeContext.Provider>
    </Provider>
  );
};

export default withAuthenticator(App);
