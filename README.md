# project-chat-app

This chat-app has been named “Convos” and is implemented using the React native CLI. The app was implemented on a Windows computer which means that the implementation of the app has been solely focused on Android.

 The app consists of the following screens and components:
- LoginScreen.js (screen)
- ChatRooms.js (screen)
- SpecificRoom.js (screen)
- Splash screen
- App.tsx
  
The key functionalities of the screens will be described below.

## LoginScreen
This screen displays two buttons; one button is used to sign in the user using Google social sign-in and another button is used to sign in the user using Facebook social sign-in. Once the user has signed in using one of the two sign-in options the user is sent to the ChatRooms screen. 
Beside from the two buttons the user is greeted with a welcome text.

This screen fulfills the following requirements:
- Two sign-in methods (Facebook and Google)
- When a user signs in they go to Chat rooms
- If an error happens, the user is shown a dialogue

## ChatRooms
This screen displays a list of chat rooms fetched from a Firestore collection. Each chat room shows its name and description. The chat rooms are sorted by the latest message timestamp from two message collections. The screen also includes a "Sign Out" button in the header. Users can refresh the chat room list by pulling down the list.

This screen fulfills the following requirements:
- A list is shown with the name and a short description of each room
- Each row has a chevron icon to the right indicating it can be pressed
- The list is sorted by newest message
- It is possible to "pull to refresh" to reload the list
- Pressing a room takes the user to a new screen (send and receive screen)

## SpecificRoom
The screen displays a chat interface for a specific chat room. It displays messages fetched from two Firestore sub-collections, allows users to send text and image messages, and supports loading more messages when scrolling up.

This screen fulfills the following requirement:
- The last 50 messages are loaded when a chat room is opened
- The user can scroll to load more messages
- When a message is received it is automatically added to the list

- An input field at the bottom of the view is shown
  - When pressed the keyboard opens
  - When a message is entered and the user presses "Send"/"Enter" the message is sent and added to the list

- A message consists of 
  - Avatar of sender
  - Name of sender
  - Message date
  - Message text


## Firebase
Firebase was used throughout the development of this app. Firebase is a set of backend services and application development platforms provided by Google. It hosts databases, services, authentication, and integration for different applications, including Android.

Firebase was specifically used to create social sign in authentication in the app, and store chat rooms and messages using Firebase Firestore and Firebase storage.

## Implementation process
This part of the READ.ME talks about the implementation process of the app.

### Firebase setup
To be able to use Firebase a Firebase project had to be setup and the app module had to be installed. I followed the “Getting started” guide provided by the React Native Firebase documentation:
https://rnfirebase.io/ 
 
### Firebase authentication
By using the React Native Firebase documentation social sign in guide, authentication could be integrated in the app: 
https://rnfirebase.io/auth/social-auth 

### Firebase Firestore
Firestore is a NoSql database that was used to store the chat rooms in a collection called “chatRoomsCollection”. The “chatRoomsCollection” can hold multiple documents where each document contains a collection with the fields “roomName” and “roomDescription” used to store information about the chat rooms. Other than these fields, the chat room collections also contain a sub-collection where the messages for the individual rooms are stored. As can be seen in the screenshot below the message sub-collection for the chat room with the name “Film fanatics” contains a sub-collection called “messageCollection”. 

![firestore chat rooms](https://github.com/user-attachments/assets/b3891511-1324-4178-81b7-c4202d085751)

The message sub-collections within each chat room collection contains the following fields:
- _id (string): unique id of the message
- image (string): url to the image stored in Firebase storage
- text (string): the text of the message
- timestamp (timestamp): time and data of when the message was created/sent
- user (map)
     - _id (string): unique id of the user
     - avatar (string): url that generates random avatar image
     - name (string): name of the user

### Firebase storage
Since Firestore is not made for storing large binary files, Firebase storage was used to save the images that the user can sent from the camera or the photo gallery. A reference to the images would then be stored in the message sub-collections in the field "image". This is also seen above in "Firebase Firestore" where the structure of a message is displayed. 
