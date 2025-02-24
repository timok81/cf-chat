import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import Start from "./components/Start.js";
import Chat from "./components/Chat.js";

const Stack = createNativeStackNavigator();

const App = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyBFR7FMIJeSarJUkQLT7MM34AmQdyQQmpk",
    authDomain: "cf-chat-app-ec088.firebaseapp.com",
    projectId: "cf-chat-app-ec088",
    storageBucket: "cf-chat-app-ec088.firebasestorage.app",
    messagingSenderId: "908816694427",
    appId: "1:908816694427:web:866efa3c48277be82cda3e",
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Start">
        <Stack.Screen name="Start" component={Start} />
        <Stack.Screen name="Chat">
          {(props) => <Chat db={db} {...props} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
