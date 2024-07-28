// EmailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmailScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Email Screen T^T</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f0fc',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff69b4',
  },
});

export default EmailScreen;
