import { View, Text, StyleSheet, TouchableOpacity, Linking, Button } from 'react-native';
import { useAuthenticator } from '@aws-amplify/ui-react-native';
import useFetchUserAttributes from '../hooks/useFetchUserAttributes';


function SignOutButton() {
  const { signOut } = useAuthenticator();
  return <Button title="Sign Out" onPress={signOut} />;
}

const SettingsScreen: React.FC = () => {
  const { userAttributes } = useFetchUserAttributes();
  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Profile</Text>
        {userAttributes ? (
          <View>
            <Text style={styles.userName}>Hello, {userAttributes?.name}</Text>
            <SignOutButton />
          </View>
        ) : (
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.divider} />
      <View style={styles.aboutUsSection}>
        <Text style={styles.sectionTitle}>About Us</Text>
        <TouchableOpacity onPress={() => handleLinkPress('https://safeqr.github.io/marketing/')}>
          <Text style={styles.linkText}>safeqr.github.io/marketing</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleLinkPress('https://safeqr.github.io/privacy-policy')}>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleLinkPress('https://safeqr.github.io/terms-of-service')}>
          <Text style={styles.linkText}>Terms Of Service</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.versionText}>Version 1.2</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  userName: {
    fontSize: 16,
    marginBottom: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f0fc',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff69b4',
    marginBottom: 20,
  },
  profileSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },
  aboutUsSection: {
    marginBottom: 20,
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
