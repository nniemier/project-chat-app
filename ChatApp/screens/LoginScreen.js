import React from 'react';
import { StyleSheet, Button } from 'react-native';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

GoogleSignin.configure({
  webClientId: '1013134024517-ohcvfgpqqgcuplj7vr13h8s7lr9behat.apps.googleusercontent.com',
});

function LoginScreen({navigation}) {
  return (
    <GoogleSigninButton
  size={GoogleSigninButton.Size.Wide}
  color={GoogleSigninButton.Color.Light}
  onPress={() => {
    onGoogleButtonPress().then(() => navigation.navigate('ChatRooms'))
  }}
/>
  );
}

async function onGoogleButtonPress() {
  // Check if your device supports Google Play
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  // Get the users ID token
  const { idToken } = await GoogleSignin.signIn();

  // Create a Google credential with the token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  // Sign-in the user with the credential
  return auth().signInWithCredential(googleCredential);
}

export default LoginScreen;
