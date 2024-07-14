import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

function SpecificRoom({ route }) {
  const { chatRoomId } = route.params;
  const [messages, setMessages] = useState([]); //Holds the chat messages
  const [loading, setLoading] = useState(true); //Indicates if messages are currently being fetched
  const [lastDoc, setLastDoc] = useState(null); //Keeps track of the last document fetched for pagination
  const [loadingMore, setLoadingMore] = useState(false); //Indicates if more messages are currently being fetched for pagination

//This function get the messages from Firestore based on chatRoomId and message_collection
  const getMessages = async (chatRoomId, message_collection, limit = 50, startAfter = null) => {
    let query = firestore() //Initialize the Firestore database instance
      .collection('chatRoomsCollection') //Specifies the collection where the chat rooms are stored
      .doc(chatRoomId) //Specifies the specific chat room documents within the collection
      .collection(message_collection) //Specifies the subcollection where messages are stored
      .orderBy("timestamp", "desc") //Orders the messages by their timestamp field on descending order (latest message first)
      .limit(limit); //Limits the number of messages returned to "limit" (50)

    //Checks if there is a "startAfter" parameter provided
    if (startAfter) {
      //Modifies the query object to start the query after the startAfter document
      /*This is useful to use pagination in Firestore queries. 
      For examlpe, after fetching the initial set of documents, 
      startAfter allows fetching the next set of documents starting from a specific document */
      query = query.startAfter(startAfter);
    }

    //Executes the Firstore query and returns a QuerySnapshot
    /* This QuerySnapshot contains metadata and an array of QueryDocumentSnapshot objects
    representing the documents returned by the query */
    const snapshot = await query.get();

    //Checks if the snapshot is not empty
    if (!snapshot.empty) {
      //Sets the lastDoc state to the last document in the array of documents snapshot.docs
      //This helps maintaining the reference to the last document fetched
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    }

    return snapshot.docs.map(doc => {
      const firebaseData = doc.data(); //Extracts the firebaseData from each document
      //Constructs and returns a new object representing each message with fields e.g. "_id"
      return {
        _id: doc.id,
        text: firebaseData.text || '',
        createdAt: firebaseData.timestamp.toDate(), //Changes firebaseData.timestamp to a JavaScript Date object
        user: {
          _id: firebaseData.user._id,
          name: firebaseData.user.name,
          avatar: firebaseData.user.avatar,
        },
        image: firebaseData.image || '',
      };
    }).filter(msg => msg !== null); //Filters out any messages that might be "null"
  };

/* This function fetches messages from two different Firestore collections "messageCollection" and "messageCollectionTwo"
for a specific chat room "chatRoomId" */
  const loadMessages = useCallback(async () => {
    setLoading(true); //Sets a loading state to true, meaning that messages are being fetched
    try { //Wraps the message fetching in a try-catch block to handle any potential errors that may occur
      const messagesFromFirstCollection = await getMessages(chatRoomId, 'messageCollection'); //Uses the getMessages function
      const messagesFromSecondCollection = await getMessages(chatRoomId, 'messageCollectionTwo');
      //Combines and sorts these messages by their "createdAt" timestamp in descending order
      const combinedMessages = [...messagesFromFirstCollection, ...messagesFromSecondCollection].sort((a, b) => b.createdAt - a.createdAt);
      //Updates the component state "setMessages" with the combined and sorted messages
      setMessages(combinedMessages); 
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    setLoading(false); //Sets the loading state to false once the message fetching and state updating are completed
  }, [chatRoomId]);

//This function loads more messages when the user scrolls to the top of the chat
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


//Save a message to Firestore based on the chatRoomId and message_collection
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
