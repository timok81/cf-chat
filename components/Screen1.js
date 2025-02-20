import { StyleSheet, View, Text, Button, TextInput } from "react-native";
import { useEffect, useState } from "react";

const Screen1 = ({ navigation }) => {
  const [name, setName] = useState("");

  return (
    <View style={styles.container}>
      <Text>Hello Screen 1!</Text>
      <TextInput
        style={styles.textInput}
        value={name}
        onChangeText={setName}
        placeholder="Type your username here"
      />
      <Button
        title="Go to Screen 2"
        onPress={() => navigation.navigate("Screen2", { name })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    width: "80%",
    padding: 15,
    borderWidth: 1,
    marginTop: 15,
    marginBottom: 15,
  },
});

export default Screen1;
