import React from 'react';
import { WebView } from 'react-native-webview';

// Define the SecureWebView component
const SecureWebView = ({ url }) => {
  return (
    <WebView
      source={{ uri: url }} // Load the URL passed as a prop
      javaScriptEnabled={false} // Disable JavaScript for security
      domStorageEnabled={false} // Disable DOM storage for security
      allowFileAccess={false} // Disable file access within the WebView for security
      originWhitelist={['*']} // Allow all origins to be loaded in the WebView
      onShouldStartLoadWithRequest={(request) => {
        // Implement additional URL filtering logic here if needed
        return true; // Return true to allow the URL to be loaded
      }}
    />
  );
};

export default SecureWebView;
