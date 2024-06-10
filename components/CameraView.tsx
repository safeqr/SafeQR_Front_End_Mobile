import React from 'react';
import { Camera } from 'expo-camera';
import { View, StyleSheet } from 'react-native';

interface CameraViewProps {
  onBarcodeScanned?: (data: any) => void;
  barcodeScannerSettings?: any;
  style?: any;
}

const CameraView: React.FC<CameraViewProps> = ({ onBarcodeScanned, barcodeScannerSettings, style }) => {
  return (
    <View style={style}>
      <Camera
        style={StyleSheet.absoluteFillObject}
        onBarCodeScanned={onBarcodeScanned}
        barCodeScannerSettings={barcodeScannerSettings}
      />
    </View>
  );
};

export default CameraView;
