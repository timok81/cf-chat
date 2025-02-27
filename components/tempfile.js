import { StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
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

const Chat = ({ route, navigation, db, isConnected, storage }) => {
  const { name, bgColor, userID } = route.params;
  const [messages, setMessages] = useState([]);

  //This must be declared outside of useEffect so that the old listener gets removed
  let unsubChat;

  useEffect(() => {
    navigation.setOptions({ title: name });

    //If connected to internet, use db. If not, use AsyncStorage
    if (isConnected === true) {
      if (unsubChat) unsubChat();
      unsubChat = null;
      const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));

      //Listen for database events to update messages in realtime
      unsubChat = onSnapshot(q, (documents) => {
        let newMessages = [];
        documents.forEach((document) => {
          newMessages.push({
            id: document.id,
            ...document.data(),
            createdAt: new Date(document.data().createdAt.toMillis()),
          });
        });
        cacheMessages(newMessages);
        setMessages(newMessages);
      });
    } else loadCachedMessages();

    //Cleanup
    return () => {
      if (unsubChat) unsubChat();
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

  //Send message handler
  const onSend = (newMessages) => {
    const [message] = newMessages;

    addDoc(collection(db, "messages"), {
      _id: message._id,
      text: message.text || "",
      createdAt: serverTimestamp(),
      user: message.user,
      image: message.image || null,
      location: message.location || null,
    });

    setMessages((prev) => GiftedChat.append(prev, newMessages));
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

  const renderCustomActions = (props) => (
    <CustomActions
      userID={userID}
      name={name}
      storage={storage}
      onSend={(message) => onSend([message])}
      {...props}
    />
  );

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

  return (
    <View style={[styles.container, { backgroundColor: bgColor || "#474056" }]}>
      {/* Renders chat */}
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderActions={renderCustomActions}
        renderCustomView={renderCustomView}
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
