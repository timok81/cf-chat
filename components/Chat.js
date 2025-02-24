import { StyleSheet, View, KeyboardAvoidingView, Platform } from "react-native";
import { useEffect, useState } from "react";
import { GiftedChat, Bubble } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import PropTypes from "prop-types";

const Chat = ({ route, navigation, db }) => {
  const { name, bgColor, userID } = route.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    navigation.setOptions({ title: name });
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    
    //Listen for database events
    const unsubChat = onSnapshot(q, (documents) => {
      let newMessages = [];
      documents.forEach((document) => {
        newMessages.push({
          id: document.id,
          ...document.data(),
          createdAt: new Date(document.data().createdAt.toMillis()),
        });
      });
      setMessages(newMessages);
    });
    return () => {
      if (unsubChat) unsubChat();
    };
  }, []);

  //Send message handler
  const onSend = (newMessages) => {
    addDoc(collection(db, "messages"), newMessages[0]);
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

  return (
    <View style={[styles.container, { backgroundColor: bgColor || "#474056" }]}>
      {/* Renders chat */}
      <GiftedChat
        messages={messages}
        renderBubble={renderBubble}
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
