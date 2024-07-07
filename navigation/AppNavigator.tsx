import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import QRScannerScreen from '../screens/QRScannerScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CustomTabBar from '../components/CustomTabBar';

// Create a bottom tab navigator
const Tab = createBottomTabNavigator();

// Main navigation component
const AppNavigator = () => {
  return (
    // Wrap the navigator in a NavigationContainer to manage the navigation tree
    <NavigationContainer>
      
      {/* Define the tab navigator with custom tab bar and initial route */}
      <Tab.Navigator initialRouteName="QR Scanner" tabBar={props => <CustomTabBar {...props} />}>

        {/* Define each tab with a name and corresponding component */}
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="QR Scanner" component={QRScannerScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;