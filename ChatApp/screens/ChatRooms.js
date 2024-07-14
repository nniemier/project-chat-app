import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, Button, FlatList, ActivityIndicator, Text, StyleSheet, StatusBar, RefreshControl, TouchableOpacity } from 'react-native';
import auth from '@react-native-firebase/auth';
//Import for the NoSql database Firestore
import firestore from '@react-native-firebase/firestore'; 
import Icon from 'react-native-vector-icons/FontAwesome';

function ChatRooms({ navigation }) {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
  const [chatRooms, setChatRooms] = useState([]); // Initial empty array of users
  const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh

  const onSignOut = () => {
    auth()
  .signOut()
  .then(() => console.log('User signed out!'));
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={onSignOut} style={styles.signout_touch}>
          <Text style={styles.signout_text}>Sign out</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const getLatestMessageTimestamp = async (chatRoomId, message_collection) => {
    const snapshot = await firestore()
      .collection('chatRoomsCollection')
      .doc(chatRoomId)
      .collection(message_collection)
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (!snapshot.empty) {
      return snapshot.docs[0].data().timestamp.toDate();
    }

    return null;
  };

  const fetchChatRooms = useCallback(async () => {
    setLoading(true);
    const snapshot = await firestore().collection("chatRoomsCollection").get();

    const chatRooms = await Promise.all(snapshot.docs.map(async (documentSnapshot) => {
      const chatRoomId = documentSnapshot.id;
      const latestMessageTimestampOne = await getLatestMessageTimestamp(chatRoomId, 'messageCollection');
      const latestMessageTimestampTwo = await getLatestMessageTimestamp(chatRoomId, 'messageCollectionTwo');

      const latestMessageTimestamp = latestMessageTimestampOne > latestMessageTimestampTwo ? latestMessageTimestampOne : latestMessageTimestampTwo;

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
    fetchChatRooms();
  }, [fetchChatRooms]); 

  const onRefresh = () => {
    setRefreshing(true);
    fetchChatRooms();
  };

  if (loading) {
    return <ActivityIndicator />;
  }

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
    title: {
      fontSize: 16,
      fontWeight: "bold",
      color: "black"
    },
    description: {
      fontSize: 14,
      color: "black"
    },
    textContainer: {
      flex: 1
    },
    signout_touch: {
      marginRight: 10,
    },
    signout_text: {
      color: "#24BDF4"
    }
  });

export default ChatRooms;
