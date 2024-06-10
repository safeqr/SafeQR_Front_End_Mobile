import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { QRCodeContext } from '../types';

const SettingsScreen: React.FC = () => {
  const { setQrCodes } = useContext(QRCodeContext);

  const clearHistory = () => {
    setQrCodes([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Settings Screen</Text>
      <TouchableOpacity style={styles.button} onPress={clearHistory}>
        <Text style={styles.buttonText}>Clear History</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f0fc',
    padding: 20,
  },
  welcomeText: {
    textAlign: 'center',
    fontSize: 20,
    marginVertical: 10,
    color: 'black',
  },
  button: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default SettingsScreen;
