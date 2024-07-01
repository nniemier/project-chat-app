import React from 'react';
import { View, Button } from 'react-native';

function ChatRooms({ navigation }) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
          title="Go to Specific room"
          onPress={() => navigation.navigate('SpecificRoom')}
        />
        <Button title="Go back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

export default ChatRooms;
