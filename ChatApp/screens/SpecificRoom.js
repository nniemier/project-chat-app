import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

function SpecificRoom({ route }) {
  const { chatRoomId } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const getMessages = async (chatRoomId, message_collection, limit = 50, startAfter = null) => {
    let query = firestore()
      .collection('chatRoomsCollection')
      .doc(chatRoomId)
      .collection(message_collection)
      .orderBy("timestamp", "desc")
      .limit(limit);

    if (startAfter) {
      query = query.startAfter(startAfter);
    }

    const snapshot = await query.get();

    if (!snapshot.empty) {
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    }

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

  const loadMoreMessages = useCallback(async () => {
    if (loadingMore || !lastDoc) return;

    setLoadingMore(true);
    try {
      const messagesFromFirstCollection = await getMessages(chatRoomId, 'messageCollection', 50, lastDoc);
      const messagesFromSecondCollection = await getMessages(chatRoomId, 'messageCollectionTwo', 50, lastDoc);

      const combinedMessages = [...messagesFromFirstCollection, ...messagesFromSecondCollection].sort((a, b) => b.createdAt - a.createdAt);
      setMessages(previousMessages => GiftedChat.prepend(previousMessages, combinedMessages));
    } catch (error) {
      console.error('Error fetching more messages:', error);
    }
    setLoadingMore(false);
  }, [chatRoomId, lastDoc, loadingMore]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const saveMessage = async (chatRoomId, message_collection, messageData) => {
    await firestore()
      .collection('chatRoomsCollection')
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
      await saveMessage(chatRoomId, 'messageCollection', messageData);
    } else if (chatRoomId === 'r9YzxiuAMFErs0eitK1Z') {
      await saveMessage(chatRoomId, 'messageCollectionTwo', messageData);
    } else {
      console.warn(`Unhandled chatRoomId: ${chatRoomId}`);
    }
  }, [chatRoomId]);

  const uploadImage = async (uri) => {
    const userId = auth().currentUser?.uid;
    const fileName = `${userId}_${new Date().getTime()}`;
    const storageRef = storage().ref(`images/${fileName}`);

    await storageRef.putFile(uri);
    return await storageRef.getDownloadURL();
  };

  const handleImage = async (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
    } else {
      const { uri } = response.assets[0];
      const imageUrl = await uploadImage(uri);
      const imageMessage = {
        _id: Math.random().toString(36).substring(7),
        createdAt: new Date(),
        text: '',
        user: {
          _id: auth().currentUser?.uid,
          name: auth().currentUser?.displayName,
          avatar: 'https://i.pravatar.cc/300',
        },
        image: imageUrl,
      };
      onSend([imageMessage]);
    }
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, handleImage);
  };

  const takePhoto = () => {
    launchCamera({ mediaType: 'photo' }, handleImage);
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
            backgroundColor: '#E1E1E1'
          },
          right: {
            backgroundColor: '#42C7F7'
          }
        }}
      />
    );
  }

  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={{ flexDirection: 'row' }}>
          <Icon
            name='camera'
            style={{ marginBottom: 10, marginRight: 10, transform: [{ rotateY: '180deg' }] }}
            size={25}
            color='#C3C3C3'
            onPress={takePhoto}
          />
          <Icon
            name='image'
            style={{ marginBottom: 10, marginRight: 10, transform: [{ rotateY: '180deg' }] }}
            size={25}
            color='#C3C3C3'
            onPress={pickImage}
          />
          <Icon
            name='send'
            style={{ marginBottom: 10, marginRight: 10 }}
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
      alwaysShowSend
      renderSend={renderSend}
      messages={messages}
      listViewProps={{
        onEndReachedThreshold: 0.1,
        onEndReached: loadMoreMessages,
      }}
      onSend={messages => onSend(messages)}
      user={{
        _id: auth().currentUser?.uid,
        name: auth().currentUser?.displayName,
        avatar: 'https://i.pravatar.cc/300'
      }}
    />
  );
}

export default SpecificRoom;
