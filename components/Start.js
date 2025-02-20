import {
  StyleSheet,
  View,
  Text,
  Button,
  TextInput,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";

const Start = ({ navigation }) => {
  const [name, setName] = useState("");
  const bgColors = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];
  const [bgColor, setBgColor] = useState("");

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/bg-image.png")}
        style={styles.image}
      >
        <Text style={styles.title}>Chat</Text>
        <View style={styles.actionBox}>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Type your name here"
          />
          <Text style={styles.chooseColor}>Choose background color</Text>
          <View style={styles.colors}>
            {/* For each bgColors element, make a color selector button and set matching color in press event */}
            {bgColors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.colorSelector, { backgroundColor: color }]}
                onPress={() => {
                  if (!bgColor) {
                    setBgColor(bgColors[0]);
                  }
                  setBgColor(color);
                }}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              if (bgColor === "") {
                setBgColor(bgColors[3]);
              }
              navigation.navigate("Chat", { name, bgColor });
            }}
          >
            <Text style={styles.buttonText}>Start chatting</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  title: {
    alignSelf: "center",
    fontSize: 45,
    fontWeight: "600",
    color: "white",
    flex: 0.75,
  },
  actionBox: {
    justifyContent: "space-evenly",
    alignItems: "center",
    alignSelf: "center",
    width: "88%",
    height: 250,
    paddingTop: 5,
    paddingBottom: 5,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  textInput: {
    width: "88%",
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
  },
  image: {
    flex: 1,
    justifyContent: "flex-end",
    resizeMode: "cover",
  },
  button: {
    width: "88%",
    height: 50,
    backgroundColor: "#757083",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 20,
  },
  chooseColor: {
    fontSize: 18,
  },
  colors: {
    flexDirection: "row",
    gap: 30,
  },
  colorSelector: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default Start;
