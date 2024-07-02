import React from 'react';
import { View, Button } from 'react-native';

function LoginScreen({ navigation }) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
          title="Go to ChatRooms"
          onPress={() => navigation.navigate('ChatRooms')}
        />
      </View>
    );
  }

export default LoginScreen;
