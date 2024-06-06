import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, ActivityIndicator } from "react-native";
import { CameraView, Camera } from "expo-camera";

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      setShowSplash(false);
    };

    initializeApp();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color="#ff69b4" />
      </View>
    );
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Top Banner */}
      <View style={styles.banner}>
        <Text style={styles.headerText}>SafeQR</Text>
      </View>

      {/* Welcome Text */}
      <Text style={styles.welcomeText}>Welcome to SafeQR code Scanner</Text>

      {/* Camera Container */}
      <View style={styles.cameraContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417"],
          }}
          style={styles.camera}
        />
      </View>

      {/* Scan Again Button */}
      {scanned && (
        <Button
          title={"Tap to Scan Again"}
          onPress={() => setScanned(false)}
        />
      )}

      {/* Bottom Menu */}
      <View style={styles.menu}>
        {/* Your existing menu items */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f0fc", // light purple background
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f0fc", // light purple background
  },
  banner: {
    backgroundColor: "#ff69b4", // pink background
    paddingVertical: 10,
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 24,
  },
  welcomeText: {
    textAlign: "center",
    fontSize: 20,
    marginVertical: 10, // Adjusted margin
    color: "#ff69b4", // pink color
  },
  cameraContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: 300,
    height: 400,
  },
  menu: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ff69b4", // pink background
    paddingVertical: 10,
  },
  // Your existing menu item styles
});
