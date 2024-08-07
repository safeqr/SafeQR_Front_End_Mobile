import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import QRScannerScreen from '../screens/QRScannerScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomTabBar from '../components/CustomTabBar';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator 
        initialRouteName="QRScanner" 
        tabBar={props => <CustomTabBar clearScanData={function (): void {
          throw new Error('Function not implemented.');
        } } {...props} />}
      >
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="QRScanner" component={QRScannerScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
