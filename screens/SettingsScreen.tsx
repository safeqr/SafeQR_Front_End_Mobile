import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert, Button } from 'react-native';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import useFetchUserAttributes from '../hooks/useFetchUserAttributes';
import { fetchAuthSession, getCurrentUser, signInWithRedirect } from 'aws-amplify/auth';
import { deleteAllScannedHistories } from '../api/qrCodeAPI'; // Import the API function
import { Buffer } from 'buffer';

function SignOutButton() {
  const { signOut } = useAuthenticator();
  return <Button title="Sign Out" onPress={signOut} />;
}

const handleSignInWithRedirect = async () => {
  try {
    await signInWithRedirect();
  } catch (error) {
    console.error('Error during sign in:', error);
  }
};

const SettingsScreen: React.FC = () => {
  const { userAttributes } = useFetchUserAttributes();
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const getGoogleAccessToken = async () => {
      try {
        const currentUser = await getCurrentUser();
        console.log('Current user:', currentUser);
        
        const { tokens } = await fetchAuthSession();
        const test = await fetchAuthSession();
        console.log('Tokens:', tokens);
        console.log("aws access token: ", tokens.accessToken.toString());
        console.log("test ", test);
        
        if (tokens?.idToken) {
          const idToken = tokens.idToken.toString();
          console.log('ID Token:', idToken);
          
          const parts = idToken.split('.');
          if (parts.length !== 3) {
            throw new Error('ID token is not a valid JWT');
          }
          
          const payload = parts[1];
          const decodedPayload = Buffer.from(payload, 'base64').toString('utf8');
          console.log('Decoded payload:', decodedPayload);
          
          let parsedPayload;
          try {
            parsedPayload = JSON.parse(decodedPayload);
          } catch (parseError) {
            console.error('Error parsing payload:', parseError);
            console.error(`Parse error: ${parseError.message}\nPayload: ${decodedPayload}`);
            return;
          }
          
          console.log('Parsed payload:', parsedPayload);
          // Options for toLocaleString
          const options: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Singapore', // UTC+8 timezone
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          };

          if (parsedPayload["custom:access_token"]) {
            console.log('Google Access Token:', parsedPayload["custom:access_token"]);
            console.log('Google Refresh Token: ', parsedPayload["custom:refresh_token"]);
            
            setGoogleAccessToken(parsedPayload["custom:access_token"]);
            console.log("auth_time: ", new Date(parsedPayload.auth_time * 1000).toLocaleString('en-US', options));
            console.log("iat: ", new Date(parsedPayload.iat * 1000).toLocaleString('en-US', options));
            console.log("expiry: ", new Date(parsedPayload.exp * 1000).toLocaleString('en-US', options));
            console.log("date created: ", new Date(1721715837500).toLocaleString('en-US', options));

          } else {
            console.error('No Google access token found in the payload');
          }
        } else {
          console.error('No ID token found in the session');
        }
      } catch (error) {
        console.error('Error getting Google access token:', error);
      }
    };

    if (userAttributes) {
      getGoogleAccessToken();
    }
  }, [userAttributes]);

  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const handleDeleteAllHistories = async () => {
    try {
      const response = await deleteAllScannedHistories();
      Alert.alert('Success', response.message);
    } catch (error) {
      Alert.alert('Error', 'Failed to delete histories. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      {/* Profile Section */}
          <View style={styles.section}>
      <Text style={styles.sectionTitle}>Profile</Text>
      {userAttributes ? (
        <View>
          <Text style={styles.userName}>Hello, {userAttributes.name || 'Unknown User'}</Text>
          {googleAccessToken && (
            <Text>Google Access Token: {googleAccessToken.substring(0, 10)}...</Text>
          )}
          <SignOutButton />
        </View>
      ) : (
        <TouchableOpacity style={styles.loginButton} onPress={handleSignInWithRedirect}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      )}
      </View>


      <View style={styles.divider} />

      {/* History & Bookmarks Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>History & Bookmarks</Text>
        <TouchableOpacity style={styles.deleteAllButton} onPress={handleDeleteAllHistories}>
          <Text style={styles.deleteAllButtonText}>Delete All History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* About Us Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Us</Text>
        <TouchableOpacity onPress={() => handleLinkPress('https://safeqr.github.io/marketing/')}>
          <Text style={styles.linkText}>safeqr.github.io/marketing</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleLinkPress('https://safeqr.github.io/marketing/#/privacy-policy')}>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleLinkPress('https://safeqr.github.io/marketing/#/terms-of-service')}>
          <Text style={styles.linkText}>Terms Of Service</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.versionText}>Version 1.2</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f0fc',
    padding: 10,
    width: '100%',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#ff69b4',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  loginButtonText: {
    color: '#000',
    fontSize: 16,
  },
  deleteAllButton: {
    backgroundColor: '#ff0000', // Red color
    borderRadius: 25, // Round button
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginVertical: 10,
  },
  deleteAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
  linkText: {
    fontSize: 16,
    color: '#0000ff',
    marginBottom: 10,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#aaa',
    marginTop: 20,
  },
  
});

export default SettingsScreen;