import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Define custom props for CustomTabBar
interface CustomTabBarProps extends BottomTabBarProps {
  clearScanData: () => void;
}

// Custom tab bar component with typings
const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation, clearScanData }) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        // Event handler for tab press
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }

          if (route.name === 'QRScanner') {
            clearScanData();
            navigation.reset({
              index: 0,
              routes: [{ name: 'QRScanner' }],
            });
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Define the icon for each tab
        const iconName =
          route.name === 'QRScanner' ? 'camera' : route.name === 'History' ? 'time' : 'settings';

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            {route.name === 'Settings' ? (
              <MaterialIcons name="email" size={24} color={isFocused ? '#ff69b4' : '#222'} />
            ) : (
              <Ionicons name={iconName} size={24} color={isFocused ? '#ff69b4' : '#222'} />
            )}
            {/* Check if label is a string before rendering */}
            {typeof label === 'string' && route.name !== 'Settings' ? (
              <Text style={{ color: isFocused ? '#ff69b4' : '#222' }}>
                {label}
              </Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
      <View style={styles.floatingButton}>
        <TouchableOpacity
          onPress={() => {
            clearScanData();
            navigation.reset({
              index: 0,
              routes: [{ name: 'QRScanner' }],
            });
          }}
        >
          <Ionicons name="camera" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 10,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff69b4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
});

export default CustomTabBar;
