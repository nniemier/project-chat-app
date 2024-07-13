import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

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
        text: firebaseData.text || '',
        createdAt: firebaseData.timestamp.toDate(),
        user: {
          _id: firebaseData.user._id,
          name: firebaseData.user.name,
          avatar: firebaseData.user.avatar,
        },
        image: firebaseData.image || '',
      };
    }).filter(msg => msg !== null);
  };

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

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const saveMessage = async (chatRoomId, message_collection, messageData) => {
    await firestore()
      .collection("chatRoomsCollection")
      .doc(chatRoomId)
      .collection(message_collection)
      .add(messageData);
  };

  const onSend = useCallback(async (messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages));

    const { _id, createdAt, text, user, image } = messages[0];

    const messageData = {
      _id,
      timestamp: firestore.Timestamp.fromDate(new Date(createdAt)),
      text,
      user,
      image: image || ''
    };

    if (chatRoomId === 'LkJC4Dkq3mFK6o3XTRWx') {
      await saveMessage(chatRoomId, "messageCollection", messageData);
    } else if (chatRoomId === 'r9YzxiuAMFErs0eitK1Z') {
      await saveMessage(chatRoomId, "messageCollectionTwo", messageData);
    } else {
      console.warn(`Unhandled chatRoomId: ${chatRoomId}`);
    }
  }, [chatRoomId]);

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const { uri } = response.assets[0];
        const imageMessage = {
          _id: Math.random().toString(36).substring(7),
          createdAt: new Date(),
          user: {
            _id: auth().currentUser?.uid,
            name: auth().currentUser?.displayName,
            avatar: "https://i.pravatar.cc/300",
          },
          image: uri,
        };
        onSend([imageMessage]);
      }
    });
  };

  const takePhoto = () => {
    launchCamera({ mediaType: 'photo' }, response => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.log('Camera Error: ', response.errorMessage);
      } else {
        const { uri } = response.assets[0];
        const imageMessage = {
          _id: Math.random().toString(36).substring(7),
          createdAt: new Date(),
          user: {
            _id: auth().currentUser?.uid,
            name: auth().currentUser?.displayName,
            avatar: "https://i.pravatar.cc/300",
          },
          image: uri,
        };
        onSend([imageMessage]);
      }
    });
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  function renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#E1E1E1"
          },
          right: {
            backgroundColor: "#42C7F7"
          }
        }}
      />
    );
  }

  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
        <Icon
            name="camera"
            style={{ marginBottom: 10, marginRight: 10, transform: [{ rotateY: '180deg' }] }}
            size={25}
            color='#C3C3C3'
            onPress={takePhoto}
          />
          <Icon
            name="image"
            style={{ marginBottom: 10, marginRight: 10, transform: [{ rotateY: '180deg' }] }}
            size={25}
            color='#C3C3C3'
            onPress={pickImage}
          />
          <Icon
          name="send"
          style={{marginBottom: 10, marginRight: 10}}
          size={25}
          color='#42C7F7'
          tvParallaxProperties={undefined}
        />
        </View>
      </Send>
    );
  };

  return (
    <GiftedChat
      renderUsernameOnMessage={true}
      renderBubble={renderBubble}
      renderSend={renderSend}
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: auth().currentUser?.uid,
        name: auth().currentUser?.displayName,
        avatar: "https://i.pravatar.cc/300"
      }}
    />
  );
}

export default SpecificRoom;
