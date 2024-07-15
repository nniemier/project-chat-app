import React, { useState, useEffect, useRef } from 'react';
//Imports for authentication
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
//Imports for navigation
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
//Import for the splash-screen
import BootSplash from 'react-native-bootsplash';
//Imports the screen components
import LoginScreen from './screens/LoginScreen';
import ChatRooms from './screens/ChatRooms';
import SpecificRoom from './screens/SpecificRoom';

const Stack = createStackNavigator(); //Creates the Stack navigator

//This function defines the navigation stack
  function MyStack({ user }: { user: FirebaseAuthTypes.User | null }) {
    return (
      <Stack.Navigator>
        {user ? ( //If the user is already signed in the screen with the different chat rooms is displayed 
          <>
            <Stack.Screen name="Rooms" component={ChatRooms} options={() => ({
              headerTitleAlign: 'center',
            })}/>
            <Stack.Screen name="Chat" component={SpecificRoom} options={() => ({
              headerTitleAlign: 'center',
            })}/>
          </>
        ) : ( //If the user is not signed in the login screen is displayed
          //The headerShown: false hides the header on the Login screen and the backgroundColor gives the screen another color
          <Stack.Screen name="Login" options={{headerShown: false, cardStyle: {backgroundColor:"#CCF1FF"}}} component={LoginScreen}/>
        )}
      </Stack.Navigator>
    );
  }

const App: React.FC = () => {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState<boolean>(true);
  // State to store the authenticated user
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const navigationRef = useNavigationContainerRef();

  // Handle user state changes
  // onAuthStateChanged sets the user and updates the initializing state
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    // Subscribe to Firebase authentication state changes
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []); 

  // If the app is initializing, it returns null (shows nothing) until Firebase is ready
  if (initializing) return null;

  return (
    //Uses the NavigationContainer to wrap the app's navigation and hides the splash screen when the app is ready
    <NavigationContainer ref={navigationRef} onReady={() => BootSplash.hide({ fade: true })}>
      <MyStack user={user} />
    </NavigationContainer>
  );
};

export default App;