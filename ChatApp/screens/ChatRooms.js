import React, { useState, useEffect } from 'react';
import { View, Button, FlatList, ActivityIndicator, Text, StyleSheet, StatusBar } from 'react-native';
import auth from '@react-native-firebase/auth';
//Import for the NoSql database Firestore
import firestore from '@react-native-firebase/firestore'; 
import Icon from 'react-native-vector-icons/FontAwesome';

//Store a list of chat room documents within a "ChatRooms" collection 
//const chatRoomsCollection = firestore().collection('ChatRooms');

function ChatRooms({ navigation }) {
  const [loading, setLoading] = useState(true); // Set loading to true on component mount
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
  
        setChatRooms(chatRooms);
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
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.roomName}</Text>
            <Text style={styles.description}>{item.roomDescription}</Text>
          </View>
          <Icon.Button 
          name="chevron-right" 
          color="black"
          backgroundColor="transparent"
          ></Icon.Button>

{/*           <Button
          title="Go to Specific room"
          onPress={() => navigation.navigate('SpecificRoom')}
        />
        <Button title="Sign out" onPress={() => auth().signOut().then(() => console.log('User signed out!'))}/> */}
        </View>
      )}
    />
  );
}

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: StatusBar.currentHeight || 10,
      backgroundColor: 'lightgrey',
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
  });

/* 
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
          title="Go to Specific room"
          onPress={() => navigation.navigate('SpecificRoom')}
        />
        <Button title="Sign out" onPress={() => auth().signOut().then(() => console.log('User signed out!'))}/>
      </View>
    ); */


export default ChatRooms;
