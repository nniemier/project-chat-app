import React from 'react';
import { StyleSheet, Alert, View, Text} from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import Icon from 'react-native-vector-icons/FontAwesome';

//Initialize the the Google SDK using the webClientId found in the android/app/google-services.json under client/oauth_client/client_id
//Make sure to pick the the client_id with client_type: 3
//Further instructions: https://rnfirebase.io/auth/social-auth (Google sign-in)
GoogleSignin.configure({
  webClientId: '1013134024517-ohcvfgpqqgcuplj7vr13h8s7lr9behat.apps.googleusercontent.com',
});

//The LoginScreen function takes navigation as a parameter to use it to navigate to other screens
/* The LoginScreen handles the functionality of signing in with Google and Facebook using onGoogleButtonPress and 
onFacebookButtonPress. It uses the showAlert function to display an alert if something went wrong during the
sign in process. It returns a view containing a Welcome message to the user and the sign in buttons for Google
and Facebook. */
function LoginScreen({ navigation }) {
//Handle the sign in for Google
//This is an asynchronous function which means it allows other code to run while waiting for the operation to complete
  const handleGoogleSignIn = async () => { 
    try {
      await onGoogleButtonPress(); //Calls the onGoogleButtonPress() function to sign in with Google
      navigation.navigate('Rooms'); //Navigates the user to the ChatRooms.js screen (which is named Rooms in App.tsx)
    } catch (error) {
      //If an error happens the showAlert() function is called with a title and an error message
      showAlert('Google Sign-In Error', error.message);
    }
  };

//Handle the sign in for Facebook
//This is an asynchronous function which means it allows other code to run while waiting for the operation to complete
  const handleFacebookSignIn = async () => { 
    try {
      await onFacebookButtonPress(); //Calls the onFacebookButtonPress() function to sign in with Facebook
      navigation.navigate('Rooms'); //Navigates the user to the ChatRooms.js screen (which is named Rooms in App.tsx)
    } catch (error) {
      //If an error happens the showAlert() function is called with a title and an error message
      showAlert('Facebook Sign-In Error', error.message); 
    }
  };

//This function takes title and message as parameters and can be called to display an alert to the user
  const showAlert = (title, message) => {
    Alert.alert( //Creates the actual alert
      title, //Specifies the title of the alert dialog
      message, //Specifies the message of the alert dialog
      [ //The alert contains an "OK" butten and when this button is pressed, "OK pressed" will be written in the console (terminal)
        { text: 'OK', onPress: () => console.log('OK Pressed') }, 
      ],
      { cancelable: false } //Ensures that the alert dialog cannot be dismissed by tapping outside of it
    );
  };

  return (
    <View style={styles.container}>
       {/* Displays the Welcome text on the screen and uses the welcome_text style from styles*/}
      <Text style={styles.welcome_text}>Welcome to Convos</Text>
      {/* Displays the google button on the screen and uses the button style from styles */}
      <Icon.Button 
       name='google'
       backgroundColor="#F87C60"
       style={styles.button}
       onPress={handleGoogleSignIn}>
       {/* Displays the text inside of the google button and uses the button_text style from styles */}
       <Text style={styles.button_text} >Sign in with Google</Text>
      </Icon.Button>
      {/* Displays the facebook button on the screen and uses the button style from styles */}
      <Icon.Button 
      name="facebook" 
      backgroundColor="#3b5998"
      style={styles.button} 
      onPress={handleFacebookSignIn}> 
      {/* Displays the text inside of the facebook button and uses the button_text style from styles */}
       <Text style={styles.button_text}>Sign in with Facebook</Text>
      </Icon.Button>
    </View>
  );
}

//This code is taken directly from the React Native Firebase documentation: https://rnfirebase.io/auth/social-auth (Google sign-in)
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

//This code is taken directly from the React Native Firebase documentation: https://rnfirebase.io/auth/social-auth (Facebook sign-in)
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

//This StyleSheet called "styles" is used to style the different components in this screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: { //This is used to style the Google and Facebook button
    width: '80%',
  },
  button_text: { //This is used to style the text on the buttons e.g. "Sign in with Google"
    flex: 1,
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcome_text: { //This is used to style the text above the buttons e.g. "Welcome" text
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 50,
    color: '#0F303C'
  }
});

//Exports the LoginScreen function so that it can be used by other modules
export default LoginScreen;
