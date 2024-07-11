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
        <TouchableOpacity onPress={onSignOut} style={{marginRight: 10}} >
          <Text>Sign out</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);


  const fetchChatRooms = useCallback(() => {
    setLoading(true);
    firestore()
      .collection("chatRoomsCollection")
      .onSnapshot(querySnapshot => {
        const chatRooms = [];

        querySnapshot.forEach(documentSnapshot => {
          chatRooms.push({
            ...documentSnapshot.data(),
            key: documentSnapshot.id
          });
        });

        setChatRooms(chatRooms);
        setLoading(false);
        setRefreshing(false);
    });
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
          backgroundColor="transparent"
          onPress={() => navigation.navigate('SpecificRoom', { chatRoomId: item.key })}
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

export default ChatRooms;
