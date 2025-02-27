# Chat App

A basic React Native chat app developed using Expo and Gifted Chat. Uses Google Firebase for database, storage and authentication.

## Features

- A single chat room
- Users can enter their name and choose a background color before entering chat screen
- Chat displays chat messages, text input field and additional features button
- Sending images, location data and audio messages
- Data gets stored online in a database and offline in local storage

## Installation and use

 - Make sure you have npm installed
 - Clone the repository: <code>git clone https://github.com/timok81/cf-chat.git</code>
 
 - The project was created with Node 18.20.6, as Expo wouldn't work with later versions
 - If your Node version is higher than 18, run <code>nvm install 18.20.6</code> followed by <code>nvm use 18.20.6</code>

 - Install Expo with <code>npm install -g expo-cli</code>
 - If you wish to run on a physical device, you need to install Expo Go (app store) on it
 - Android Studio provides emulators which also work with this project

 - A Google Firebase account is required: https://firebase.google.com/
 - Create a new Firebase project
 - Create a new database in the project
 - In the project's rules tab, change the line <code>allow read, write: if false;</code> to <code>allow read, write: if true;</code>
 - In Project general settings (gearwheel) choose Firestore for Web
 - After clicking Register app, copy the "firebaseConfig" code snippet on screen and replace the one in App.js with it. This enables the app to communicate with your Firebase project.
 - For sending any files in the App, you need Firebase storage. Select "Storage" in the project's Build-menu and click Get started
 - In the storage's rules tab, change the line <code>allow read, write: if false;</code> to <code>allow read, write: if true;</code>

 - Navigate to project directory
 - Run <code>npm install</code> to install dependencies
 - Run <code>npm run start</code> to run project
 - Open Expo Go on either your physical device or emulator. The App should appear on the screen.