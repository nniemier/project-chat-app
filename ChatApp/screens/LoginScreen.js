import React from 'react';
import { StyleSheet, Button, Alert, View, Text} from 'react-native';
import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Header } from 'react-native-elements';

GoogleSignin.configure({
  webClientId: '1013134024517-ohcvfgpqqgcuplj7vr13h8s7lr9behat.apps.googleusercontent.com',
});

function LoginScreen({ navigation }) {

  const handleGoogleSignIn = async () => {
    try {
      await onGoogleButtonPress();
      navigation.navigate('Rooms');
    } catch (error) {
      showAlert('Google Sign-In Error', error.message);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      await onFacebookButtonPress();
      navigation.navigate('Rooms');
    } catch (error) {
      showAlert('Facebook Sign-In Error', error.message);
    }
  };

  const showAlert = (title, message) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Light}
        onPress={handleGoogleSignIn}
      />
      <Icon.Button 
      name="facebook" 
      backgroundColor="#3b5998"
      style={styles.facebook_button} 
      onPress={handleFacebookSignIn}> 
       <Text style={styles.facebook_button_text}>Sign in with Facebook</Text>
      </Icon.Button>
    </View>
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

async function onFacebookButtonPress() {
  // Attempt login with permissions
  const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

  if (result.isCancelled) {
    throw 'User cancelled the login process';
  }

  // Once signed in, get the users AccessToken
  const data = await AccessToken.getCurrentAccessToken();

  if (!data) {
    throw 'Something went wrong obtaining access token';
  }

  // Create a Firebase credential with the AccessToken
  const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

  // Sign-in the user with the credential
  return auth().signInWithCredential(facebookCredential);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facebook_button: {
    height: 46,
    width: 308,
  },
  facebook_button_text: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
