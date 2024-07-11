import React, { useState, useEffect } from 'react';
//Imports for authentication
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
//Imports for navigation
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
//Import for the splash-screen
import BootSplash from 'react-native-bootsplash';
import LoginScreen from './screens/LoginScreen';
import ChatRooms from './screens/ChatRooms';
import SpecificRoom from './screens/SpecificRoom';

const Stack = createStackNavigator(); //Creates the Stack navigator

function MyStack({ user }: { user: FirebaseAuthTypes.User | null }) {
  return (
    <Stack.Navigator>
      {user ? ( //If the user is already signed in the screen with the different chat rooms is displayed 
        <>
          <Stack.Screen name="ChatRooms" component={ChatRooms} />
          <Stack.Screen name="SpecificRoom" component={SpecificRoom} />
        </>
      ) : ( //If the user is not signed in the login screen is displayed
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

const App: React.FC = () => {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState<boolean>(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  // Handle user state changes
  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <NavigationContainer onReady={() => BootSplash.hide({ fade: true })}>
      <MyStack user={user} />
    </NavigationContainer>
  );
};

export default App;