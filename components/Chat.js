import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import PropTypes from "prop-types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomActions from "./CustomActions";
import MapView from "react-native-maps";
import { Audio } from "expo-av";

const Chat = ({ route, navigation, db, isConnected, storage }) => {
  const { name, bgColor, userID } = route.params;
  const [messages, setMessages] = useState([]);
  let soundObject = null;

  //This must be declared outside of useEffect so that the old unsub listener gets removed
  let unsubChat;

  useEffect(() => {
    navigation.setOptions({ title: name });

    //If connected to internet, use db. If not, use AsyncStorage
    if (isConnected === true) {
      if (unsubChat) unsubChat();
      unsubChat = null;

      //Gets all documents from db
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));

      //Get message documents from database to update chat messages in realtime
      unsubChat = onSnapshot(q, (documents) => {
        let newMessages = [];
        documents.forEach((doc) => {
          const data = doc.data();
          newMessages.push({
            _id: doc.id,
            ...doc.data(),
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });
        //Store messages locally and update chat messages to new value
        cacheMessages(newMessages);
        setMessages(newMessages);
      });
    } else loadCachedMessages();

    //Cleanup
    return () => {
      if (unsubChat) unsubChat(); //Calling onSnapshot cancels it
      if (soundObject) soundObject.unloadAsync(); //Unload audio
    };
  }, [isConnected]);

  //use AsyncStorage to store messages locally. It can only store strings, so it must be stringified.
  const cacheMessages = async (messagesToCache) => {
    try {
      await AsyncStorage.setItem("messages", JSON.stringify(messagesToCache));
    } catch (error) {
      console.log(error.message);
    }
  };

  //use AsyncStorage to load cached messages
  const loadCachedMessages = async () => {
    const cachedMessages = (await AsyncStorage.getItem("messages")) || [];
    setMessages(JSON.parse(cachedMessages));
  };

  //Send message handler. All messages need _id, user, and createdAt to display correctly
  const onSend = (newMessages) => {
    addDoc(collection(db, "messages"), {
      ...newMessages[0],
      createdAt: serverTimestamp(),
    });

    //useState callback function first param is the previous state (prevMessages)
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
  };

  //Set chat bubble appearance
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#FFF",
          },
          right: {
            backgroundColor: "#000000",
          },
        }}
      />
    );
  };

  //Display input field only if online
  const renderInputToolbar = (props) => {
    if (isConnected) {
      return <InputToolbar {...props} />;
    } else return null;
  };

  //Creates "+" button
  const renderCustomActions = (props) => (
    <CustomActions
      userID={userID}
      name={name}
      storage={storage}
      onSend={(message) => onSend([message])}
      {...props}
    />
  );

  //Renders google maps view
  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 250, height: 250, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  };

  //Renders audio message
  const renderAudioBubble = (props) => {
    return (
      <View {...props}>
        <TouchableOpacity
          style={{ backgroundColor: "#FFD24B", borderRadius: 10, margin: 5 }}
          onPress={async () => {
            if (soundObject) soundObject.unloadAsync();
            const { sound } = await Audio.Sound.createAsync({
              uri: props.currentMessage.audio,
            });
            soundObject = sound;
            await sound.playAsync();
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: "black",
              padding: 10,
            }}
          >
            Play Audio
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor || "#474056" }]}>
      {/* Renders chat */}
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderActions={renderCustomActions}
        renderCustomView={renderCustomView}
        renderMessageAudio={renderAudioBubble}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: userID,
          name: name || "Chatter",
        }}
      />

      {/* Prevents onscreen keyboard from covering up content */}
      {Platform.OS === "android" ? (
        <KeyboardAvoidingView behavior="height" />
      ) : null}
      {Platform.OS === "ios" ? (
        <KeyboardAvoidingView behavior="padding" />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    color: "white",
    fontSize: 30,
  },
});

Chat.propTypes = {
  route: PropTypes.shape({
    name: PropTypes.string,
    bgColor: PropTypes.string,
    userID: PropTypes.string,
  }).isRequired,
};

export default Chat;
