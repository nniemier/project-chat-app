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
  }, [chatRoomId]);

//This function loads more messages when the user scrolls to the bottom of the chat (the bottom of the message list)
  const loadMoreMessages = useCallback(async () => {
    //The function will not execute if loadingMore is true or if lastDoc is null
    if (loadingMore || !lastDoc) return;

    setLoadingMore(true); //Sets loadingMore to true to indicate that the loading of more messages has started
    try {
      /* Uses the getMessages function to fetch 50 more messages from two collections: 
      messageCollection and messageCollectionTwo, starting after lastDoc */
      const messagesFromFirstCollection = await getMessages(chatRoomId, 'messageCollection', 50, lastDoc);
      const messagesFromSecondCollection = await getMessages(chatRoomId, 'messageCollectionTwo', 50, lastDoc);

      /* Combines the messages from both collections into a single array, combinedMessages, and 
      sorts them by the createdAt timestamp in descending order (most recent first) */
      const combinedMessages = [...messagesFromFirstCollection, ...messagesFromSecondCollection].sort((a, b) => b.createdAt - a.createdAt);
      //Updates the state messages by prepending the new combinedMessages to the existing messages using GiftedChat.prepend
      setMessages(previousMessages => GiftedChat.prepend(previousMessages, combinedMessages));
      //if there's an error during this process, it logs the error to the console
    } catch (error) {
      console.error('Error fetching more messages:', error);
    }
    setLoadingMore(false); //Sets loadingMore to false after the messages are loaded or if an error occurs
  }, [chatRoomId, lastDoc, loadingMore]);

  //The useEffect ensures that loadMessages is called once the component is mounted and whenever loadMessages changes
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);


//Save a message to Firestore based on the chatRoomId, message_collection and messageData
  const saveMessage = async (chatRoomId, message_collection, messageData) => {
    await firestore()
      .collection('chatRoomsCollection') //Specifies the collection where the chat rooms are stored
      .doc(chatRoomId) //Specifies the specific chat room documents within the collection
      .collection(message_collection) //Specifies the subcollection where messages are stored
      .add(messageData); //Adds the message data to the subcollection where messages are stored
  };

  const onSend = useCallback(async (messages = []) => {
    // Append new message to the existing messages
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages));
    // Extract relevant data from the new message
    const { _id, createdAt, text, user, image } = messages[0];
    // Construct message data for Firestore
    const messageData = {
      _id,
      timestamp: firestore.Timestamp.fromDate(new Date(createdAt)),
      text,
      user,
      image: image || ''
    };
   
   // Save message to the appropriate Firestore collection based on chatRoomId
    if (chatRoomId === 'LkJC4Dkq3mFK6o3XTRWx') {
      await saveMessage(chatRoomId, 'messageCollection', messageData);
    } else if (chatRoomId === 'r9YzxiuAMFErs0eitK1Z') {
      await saveMessage(chatRoomId, 'messageCollectionTwo', messageData);
    } else {
      console.warn(`Unhandled chatRoomId: ${chatRoomId}`);
    }
  }, [chatRoomId]);

/*  This function uploads an image to Firebase storage, it gives the image a filename and
 downloads the URL of the image */
  const uploadImage = async (uri) => {
    // Get current user ID
    const userId = auth().currentUser?.uid;
    // Create a unique file name using user ID and timestamp
    const fileName = `${userId}_${new Date().getTime()}`;
    // Create a reference to Firebase Storage location
    const storageRef = storage().ref(`images/${fileName}`);

    // Upload the file to Firebase Storage
    await storageRef.putFile(uri);
     // Return the download URL of the uploaded image
    return await storageRef.getDownloadURL();
  };

/*   This function processes the response from an image picker, 
  uploads the selected image to Firebase Storage, constructs an image message object, and then sends the image message */
  const handleImage = async (response) => {
    if (response.didCancel) {
      // Handle case where user cancelled image picker
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      // Handle any errors from the image picker
      console.log('ImagePicker Error: ', response.errorMessage);
    } else {
      const { uri } = response.assets[0];
      // Upload the image using the uploadImage function and get the download URL
      const imageUrl = await uploadImage(uri);
       // Construct an image message object
      const imageMessage = {
        _id: Math.random().toString(36).substring(7),
        createdAt: new Date(),
        text: '',
        user: {
          _id: auth().currentUser?.uid, //Sets the id to the id of the current user
          name: auth().currentUser?.displayName, //Sets the name to the name of the current user
          avatar: 'https://i.pravatar.cc/300', //Generates random avatar
        },
        image: imageUrl,
      };
      // Send the image message
      onSend([imageMessage]);
    }
  };
//This function uses launchImageLibrary to pick an image from the phone gallery
  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, handleImage);
  };
//This function uses launchCamera to take a photo
  const takePhoto = () => {
    launchCamera({ mediaType: 'photo' }, handleImage);
  };

//This function customizes the appearance of chat bubbles in a chat interface
  function renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#E1E1E1' //The bubbles of the left side will have the color "blue" (sent messages)
          },
          right: {
            backgroundColor: '#42C7F7' //The bubbles of the right side will have the color "grey" (recieved messages)
          }
        }}
      />
    );
  }

/*   The renderSend function customizes the send button area of the chat interface by adding a camera icon for taking photos, 
  an image icon for picking images, and the default send icon to send messages.  */
  const renderSend = (props) => {
    return (
      <Send {...props}>
        <View style={{ flexDirection: 'row' }}>
          <Icon
            name='camera'
            style={{ marginBottom: 10, marginRight: 10, transform: [{ rotateY: '180deg' }] }}
            size={25}
            color='#C3C3C3'
            onPress={takePhoto} /* when the icon is pressed it triggers the takePhoto function */
          />
          <Icon
            name='image'
            style={{ marginBottom: 10, marginRight: 10, transform: [{ rotateY: '180deg' }] }}
            size={25}
            color='#C3C3C3'
            onPress={pickImage} /* when the icon is pressed it triggers the pickImage function */
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
    //The GiftedChat component is used to create a chat interface
    <GiftedChat
      renderUsernameOnMessage={true} //This prop ensures that the username of the sender is displayed
      renderBubble={renderBubble} //This prop customizes the appearance of the message bubbles using the renderBubble function
      alwaysShowSend //This prop ensures that the send button (and the other icons) is always visible, even when the input field is empty
      renderSend={renderSend} // Ensuring that the custom send button area with additional icons (camre and image) is displayed
      messages={messages} //This prop passes the array of chat messages to be displayed in the chat interface
      listViewProps={{ //This prop provides additional properties to customize the behavior of the message list view
        onEndReachedThreshold: 0.1, //A value of 0.1 means onEndReached will be called when the user scrolls within 10% of the bottom of the list
        onEndReached: loadMoreMessages, //Calls the loadMoreMessages function when the end of the message list is reached
      }}
      onSend={messages => onSend(messages)} //Calls the onSend function when a new message is sent
      user={{
        _id: auth().currentUser?.uid, //Sets the id to the id of the current user
        name: auth().currentUser?.displayName, //Sets the name to the name of the current user
        avatar: 'https://i.pravatar.cc/300' //Generates a random avatar
      }}
    />
  );
}

//Exports the SpecificRoom function so that it can be used by other modules
export default SpecificRoom;
