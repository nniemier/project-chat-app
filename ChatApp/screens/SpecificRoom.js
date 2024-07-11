import React, { useState, useEffect, useCallback} from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Bubble } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

function SpecificRoom({ route }) {
  const { chatRoomId } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

 const getMessages = async (chatRoomId, message_collection) => {
  const snapshot = await firestore()
  .collection('chatRoomsCollection')
  .doc(chatRoomId)
  .collection(message_collection)
  .orderBy("timestamp", "desc")
  .get();

  return snapshot.docs.map(doc => {
    const firebaseData = doc.data();

    return {
      _id: doc.id,
      text: firebaseData.text,
      createdAt: firebaseData.timestamp.toDate(),
      user: {
        _id: firebaseData.user._id,
        name: firebaseData.user.name,
        avatar: firebaseData.user.avatar,
      },
    };
  }).filter(msg => msg !== null);

 };


/*   // Fetch messages from the first subcollection
  const fetchMessagesFromFirstCollection = useCallback(async () => {
    const snapshot = await firestore()
      .collection('chatRoomsCollection')
      .doc(chatRoomId)
      .collection('messageCollection')
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const firebaseData = doc.data();

      return {
        _id: doc.id,
        text: firebaseData.text,
        createdAt: firebaseData.timestamp.toDate(),
        user: {
          _id: 1,
          name: "Adam",
        },
      };
    }).filter(msg => msg !== null);
  }, [chatRoomId]);

  // Fetch messages from the second subcollection
  const fetchMessagesFromSecondCollection = useCallback(async () => {
    const snapshot = await firestore()
      .collection('chatRoomsCollection')
      .doc(chatRoomId)
      .collection('messageCollectionTwo')
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const firebaseData = doc.data();

      return {
        _id: doc.id,
        text: firebaseData.text,
        createdAt: firebaseData.timestamp.toDate(),
        user: {
          _id: 2,
          name: "Sophie",
        },
      };
    }).filter(msg => msg !== null);
  }, [chatRoomId]); */

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const messagesFromFirstCollection = await getMessages(chatRoomId, 'messageCollection');
      const messagesFromSecondCollection = await getMessages(chatRoomId, 'messageCollectionTwo');

      const combinedMessages = [...messagesFromFirstCollection, ...messagesFromSecondCollection].sort((a, b) => b.createdAt - a.createdAt);
      setMessages(combinedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    setLoading(false);
  }, [chatRoomId]);

/*   // Fetch and combine messages from both subcollections
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const [messagesFromFirst, messagesFromSecond] = await Promise.all([
      fetchMessagesFromFirstCollection(),
      fetchMessagesFromSecondCollection(),
    ]);

    const combinedMessages = [...messagesFromFirst, ...messagesFromSecond].sort((a, b) => b.createdAt - a.createdAt);
    setMessages(combinedMessages);
    setLoading(false);
  }, [fetchMessagesFromFirstCollection, fetchMessagesFromSecondCollection]); */

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const saveMessage = async (chatRoomId, message_collection, messageData) => {
    await firestore()
    .collection("chatRoomsCollection")
    .doc(chatRoomId)
    .collection(message_collection)
    .add(messageData)
  }

  const onSend = useCallback(async (messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages));

    const { _id, createdAt, text, user } = messages[0];

    // Create the message data structure
    const messageData = {
      _id,
      createdAt: firestore.Timestamp.fromDate(new Date(createdAt)),
      text,
      user,
    };

    if (chatRoomId === 'LkJC4Dkq3mFK6o3XTRWx') {
      // Save to messageCollection
        await saveMessage(chatRoomId, "messageCollection", messageData)
    } else if (chatRoomId === 'r9YzxiuAMFErs0eitK1Z') {
      // Save to messageCollectionTwo
        await saveMessage(chatRoomId, "messageCollectionTwo", messageData)
    } else {
      // Handle other cases or throw an error
      console.warn(`Unhandled chatRoomId: ${chatRoomId}`);
    }
  }, [chatRoomId]);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <GiftedChat
     renderUsernameOnMessage={true}
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: auth().currentUser?.uid,
        name: auth().currentUser?.displayName,
        avatar: 'https://i.pravatar.cc/300', //Creates a random generated avatar
      }}
    />
  );

}

export default SpecificRoom;
