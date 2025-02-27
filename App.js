import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  disableNetwork,
  enableNetwork,
} from "firebase/firestore";
import { useNetInfo } from "@react-native-community/netinfo";
import { useEffect } from "react";
import { Alert } from "react-native";
import { getStorage } from "firebase/storage";
import Start from "./components/Start.js";
import Chat from "./components/Chat.js";

const Stack = createNativeStackNavigator();

const App = () => {
  const connectionStatus = useNetInfo();

  //useNetInfo checks for internet connection, this is used for determining whether to display database data or local data
  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert("Connection Lost!");
      disableNetwork(db);
    } else if (connectionStatus.isConnected === true) {
      enableNetwork(db);
    }
  }, [connectionStatus.isConnected]);

  const firebaseConfig = {
    apiKey: "AIzaSyBNLdwEy3WSEE_Le4qk_oIebDPQqgvwg5o",
    authDomain: "cf-chat-app-b.firebaseapp.com",
    projectId: "cf-chat-app-b",
    storageBucket: "cf-chat-app-b.firebasestorage.app",
    messagingSenderId: "1038154013160",
    appId: "1:1038154013160:web:2a964a62ad8236440b6c5d",
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const storage = getStorage(app);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Chat">
          {(props) => (
            <Chat
              isConnected={connectionStatus.isConnected}
              db={db}
              storage={storage}
              {...props}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
