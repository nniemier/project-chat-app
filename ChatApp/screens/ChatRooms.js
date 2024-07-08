import React from 'react';
import { View, Button, FlatList } from 'react-native';
import auth from '@react-native-firebase/auth';
//Import for the NoSql database Firestore
import firestore from '@react-native-firebase/firestore'; 

//Store a list of chat room documents within a "ChatRooms" collection 
//const chatRoomsCollection = firestore().collection('ChatRooms');

function ChatRooms({ navigation }) {
  /* const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [chatRooms, setChatRooms] = useState([]); // Initial empty array of users

  useEffect(() => {
    const subscriber = firestore()
      .collection('chatRoomsCollection')
      .onSnapshot(querySnapshot => {
        const chatRooms = [];
  
        querySnapshot.forEach(documentSnapshot => {
          chatRooms.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id,
          });
        });
  
        setUsers(chatRooms);
        setLoading(false);
      });
    // Unsubscribe from events when no longer in use
    return () => subscriber();
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <FlatList
      data={chatRooms}
      renderItem={({ item }) => (
        <View style={{ height: 50, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Room Name: {item.roomName}</Text>
          <Text>Room Description: {item.roomDescription}</Text>

          <Button
          title="Go to Specific room"
          onPress={() => navigation.navigate('SpecificRoom')}
        />
        <Button title="Sign out" onPress={() => auth().signOut().then(() => console.log('User signed out!'))}/>
        </View>
      )}
    />
  );
 */

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
