import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, FlatList, ActivityIndicator, Text, StyleSheet, StatusBar, RefreshControl, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
//Import for the NoSql database Firestore
import firestore from '@react-native-firebase/firestore'; 
import Icon from 'react-native-vector-icons/FontAwesome';

function ChatRooms({ navigation }) {
  //State variables to manage loading, chat rooms, and refresh state
  const [loading, setLoading] = useState(true); 
  const [chatRooms, setChatRooms] = useState([]); 
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh

  //Function to sing out the user
  //This code is taken from the React Native Firebase documentation: https://rnfirebase.io/auth/usage#listening-to-authentication-state
  const onSignOut = () => {
    auth()
  .signOut()
  .then(() => console.log('User signed out!'));
  }

  //userLayoutEffect to set the navigation header options, including the sign out button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => ( //Sets the sign out button to the right side of the header
        <TouchableOpacity onPress={onSignOut} style={styles.signout_touch}>
          <Text style={styles.signout_text}>Sign out</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  //Function to get the latest message timestamp from a specific chat room's collection
  const getLatestMessageTimestamp = async (chatRoomId, message_collection) => {
    const snapshot = await firestore()
      .collection('chatRoomsCollection') //Specifies the collection where the chat rooms are stored
      .doc(chatRoomId) //Specifies the specific chat room documents within the collection
      .collection(message_collection) //Specifies the subcollection where messages are stored
      .orderBy('timestamp', 'desc') //Orders the messages by their timestamp field on descending order (latest message first)
      .limit(1) //Limits the query to retrieve only the latest message
      .get(); //executes the query and returns a snapshot of the results

    //Checks if the query returned any documents
    if (!snapshot.empty) {
      /* accesses the first document in the snapshot (the most recent message) 
      and retrieves the timestamp filed from the document's data and converts it to a JavaScript Date object.
      It then returns this Date object. */
      return snapshot.docs[0].data().timestamp.toDate();
    }

    //returns null if the snapshot is empty (if there are no messages in the specified collection)
    return null;
  };

  //Function to fetch all chat rooms and their latest message timestamps
  const fetchChatRooms = useCallback(async () => {
    setLoading(true); //Sets a loading state to true, meaning that the char rooms are being fetched
    //This fetches all documents from the chatRoomsCollection collection in Firestore. The result is stored in snapshot.
    const snapshot = await firestore().collection("chatRoomsCollection").get();

    //This iterates over each document in the snapshot.docs array
    const chatRooms = await Promise.all(snapshot.docs.map(async (documentSnapshot) => {
      //Gets the Id of the chat room
      const chatRoomId = documentSnapshot.id;
      /* This calls the getLatestMessageTimestamp function twice, once for each message collection (messageCollection and messageCollectionTwo), 
      to get the timestamp of the latest message in each collection. */
      const latestMessageTimestampOne = await getLatestMessageTimestamp(chatRoomId, 'messageCollection');
      const latestMessageTimestampTwo = await getLatestMessageTimestamp(chatRoomId, 'messageCollectionTwo');

      //This compares the two timestamps and assigns the later of the two to latestMessageTimestamp
      const latestMessageTimestamp = latestMessageTimestampOne > latestMessageTimestampTwo ? latestMessageTimestampOne : latestMessageTimestampTwo;

      /* This returns an object representing the chat room, including its original data (documentSnapshot.data()), 
      its ID (key: chatRoomId), and the latest message timestamp (latestMessageTimestamp). */
      return {
        ...documentSnapshot.data(),
        key: chatRoomId,
        latestMessageTimestamp,
      };
    }));

    // Sort the chat rooms by the latest message timestamp
    const sortedChatRooms = chatRooms
      .filter(chatRoom => chatRoom.latestMessageTimestamp !== null)
      .sort((a, b) => b.latestMessageTimestamp - a.latestMessageTimestamp);

    setChatRooms(sortedChatRooms);
    setLoading(false);
    setRefreshing(false);
  }, []);

   useEffect(() => {
    fetchChatRooms(); //Calls the fetchChatRooms function to fetch all chat rooms available
  }, [fetchChatRooms]); 

  //Function to handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true); //Sets refreshing to true since the screen is being refreshed
    fetchChatRooms(); //Calls the fetchChatRooms function to fetch all chat rooms available
  };

  //Shows a loading indicator if data is being fetched
  if (loading) {
    return <ActivityIndicator />;
  }

/*  Returns a FlatList that displays the chat rooms. It shows the name of the chat rooms and
  the description of the chat rooms. Each room displayed by the FlatList has a chevron Icon
  which can be pressed to sent the user to a specific chat room. 
  The specific chat room is determined by the chatRoomId.
  The onRefresh function is called so that the user can "pull-to-refresh" the screen. */
  return (
    <FlatList 
      data={chatRooms}
      renderItem={({ item }) => (
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.roomName}</Text>
            <Text style={styles.description}>{item.roomDescription}</Text>
          </View>
          <Icon.Button 
          name="chevron-right" 
          color="black"
          backgroundColor="#E1E1E1"
          onPress={() => navigation.navigate('Chat', { chatRoomId: item.key })}
          ></Icon.Button>
        </View>
        
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}

//This StyleSheet called "styles" is used to style the different components in this screen
  const styles = StyleSheet.create({
    container: {
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      marginTop: StatusBar.currentHeight || 10,
      backgroundColor: '#E1E1E1',
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    title: { //This is used to style the title of the chat rooms (the name of the rooms)
      fontSize: 16,
      fontWeight: "bold",
      color: "black"
    },
    description: { //This used to style the description of the chat rooms
      fontSize: 14,
      color: "black"
    },
    textContainer: {
      flex: 1
    },
    signout_touch: { //This is used to style the TouchableOpacity for the sign out text
      marginRight: 10,
    },
    signout_text: { //This is used to style the sign out text
      color: "#24BDF4"
    }
  });

//Exports the ChatRooms function so that it can be used by other modules
export default ChatRooms;
