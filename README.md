# project-chat-app

This chat-app has been named “Convos” and is implemented using the React native CLI. The app was implemented on a Windows computer which means that the implementation of the app has been solely focused on Android.

 The app consists of the following screens and components:
- LoginScreen.js (screen)
- ChatRooms.js (screen)
- SpecificRoom.js (screen)
- Splash screen
- App.tsx
  
The key functionalities of the screens will be described below.

## LoginScreen:
This screen displays two buttons; one button is used to sign in the user using Google social sign-in and another button is used to sign in the user using Facebook social sign-in. Once the user has signed in using one of the two sign-in options the user is sent to the ChatRooms screen. 
Beside from the two buttons the user is greeted with a welcome text.

This screen fulfills the following requirements:
- Two sign-in methods (Facebook and Google)
- When a user signs in they go to Chat rooms
- If an error happens, the user is shown a dialogue

## ChatRooms:
This screen displays a list of chat rooms fetched from a Firestore collection. Each chat room shows its name and description. The chat rooms are sorted by the latest message timestamp from two message collections. The screen also includes a "Sign Out" button in the header. Users can refresh the chat room list by pulling down the list.

This screen fulfills the following requirements:
- A list is shown with the name and a short description of each room
- Each row has a chevron icon to the right indicating it can be pressed
- The list is sorted by newest message
- It is possible to "pull to refresh" to reload the list
- Pressing a room takes the user to a new screen (send and receive screen)

## SpecificRoom:
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

