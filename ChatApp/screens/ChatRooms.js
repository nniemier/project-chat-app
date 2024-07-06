import React from 'react';
import { View, Button } from 'react-native';
import auth from '@react-native-firebase/auth';

function ChatRooms({ navigation }) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
          title="Go to Specific room"
          onPress={() => navigation.navigate('SpecificRoom')}
        />
        <Button title="Sign out" onPress={() => auth().signOut().then(() => console.log('User signed out!'))}/>
      </View>
    );
  }

export default ChatRooms;
