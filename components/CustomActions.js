import { TouchableOpacity, View, Text, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Audio } from "expo-av";
import { useEffect } from "react";

const CustomActions = ({
  wrapperStyle,
  iconTextStyle,
  onSend,
  storage,
  userID,
  name,
}) => {
  //Actionsheet comes with giftedchat
  const actionSheet = useActionSheet();

  //Audio recording
  let recordingObject = null;

  //Unload audio recording when app closes
  useEffect(() => {
    return () => {
      if (recordingObject) recordingObject.stopAndUnloadAsync();
    };
  }, []);

  //Define actions for "+"-menu buttons
  const onActionPress = () => {
    const options = [
      "Choose From Library",
      "Take Picture",
      "Send Location",
      "Record audio",
      "Cancel",
    ];

    const cancelButton = options.length - 1;

    //this is a predefined function that expects options and actions
    actionSheet.showActionSheetWithOptions(
      {
        options,
        cancelButton,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            pickImage();
            return;
          case 1:
            takePhoto();
            return;
          case 2:
            getLocation();
            return;
          case 3:
            startRecording();
            return;
          default:
        }
      }
    );
  };

  //Uploads images and messages to db
  const uploadAndSendImage = async (imageURI) => {
    const uniqueRefString = generateReference(imageURI);
    const newUploadRef = ref(storage, uniqueRefString);
    const response = await fetch(imageURI);
    const blob = await response.blob();
    uploadBytes(newUploadRef, blob).then(async (snapshot) => {
      const imageURL = await getDownloadURL(snapshot.ref);
      onSend({
        //_id and user needs to be explicitly added to message, otherwise it wont display
        _id: `${new Date().getTime()}-${userID}`,
        user: { _id: userID, name },
        image: imageURL,
      });
    });
  };

  const generateReference = (uri) => {
    const timeStamp = new Date().getTime();
    const imageName = uri.split("/")[uri.split("/").length - 1];
    return `${userID}-${timeStamp}-${imageName}`;
  };

  //Allows user to select an image from local storage
  const pickImage = async () => {
    let permissions = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissions?.granted) {
      let result = await ImagePicker.launchImageLibraryAsync();
      if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
    } else Alert.alert("Permissions haven't been granted.");
  };

  //Allows user to take a photo with phone cam
  const takePhoto = async () => {
    let permissions = await ImagePicker.requestCameraPermissionsAsync();
    if (permissions?.granted) {
      let result = await ImagePicker.launchCameraAsync();
      if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
    } else Alert.alert("Permissions haven't been granted.");
  };

  //Allows user to display their google maps location
  const getLocation = async () => {
    let permissions = await Location.requestForegroundPermissionsAsync();
    if (permissions?.granted) {
      const location = await Location.getCurrentPositionAsync({});
      if (location) {
        onSend({
          //_id and user needs to be explicitly added to message, otherwise it wont display
          _id: `${new Date().getTime()}-${userID}`,
          user: { _id: userID, name },
          location: {
            longitude: location.coords.longitude,
            latitude: location.coords.latitude,
          },
        });
      } else Alert.alert("Error occurred while fetching location");
    } else Alert.alert("Permissions haven't been granted.");
  };

  //Start audio recording
  const startRecording = async () => {
    try {
      let permissions = await Audio.requestPermissionsAsync();
      if (permissions?.granted) {
        // iOS specific config to allow recording on iPhone devices
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
          .then((results) => {
            return results.recording;
          })
          .then((recording) => {
            recordingObject = recording;
            Alert.alert(
              "You are recording...",
              undefined,
              [
                {
                  text: "Cancel",
                  onPress: () => {
                    stopRecording();
                  },
                },
                {
                  text: "Stop and Send",
                  onPress: () => {
                    sendRecordedSound();
                  },
                },
              ],
              { cancelable: false }
            );
          });
      }
    } catch (err) {
      Alert.alert("Failed to record!");
    }
  };

  //Stops audio recording
  const stopRecording = async () => {
    // iOS specific config
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
    });
    await recordingObject.stopAndUnloadAsync();
  };

  //Send audio recording as message
  const sendRecordedSound = async () => {
    await stopRecording();
    const uniqueRefString = generateReference(recordingObject.getURI());
    const newUploadRef = ref(storage, uniqueRefString);
    const response = await fetch(recordingObject.getURI());
    const blob = await response.blob();
    uploadBytes(newUploadRef, blob).then(async (snapshot) => {
      const soundURL = await getDownloadURL(snapshot.ref);
      onSend({
        //_id and user needs to be explicitly added to message, otherwise it wont display
        _id: `${new Date().getTime()}-${userID}`,
        user: { _id: userID, name },
        audio: soundURL,
      });
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onActionPress}
      accessible={true}
      accessibilityLabel="Additional options"
      accessibilityHint="Let’s you choose to send an image or your geolocation."
      accessibilityRole="button"
    >
      <View style={[styles.wrapper, wrapperStyle]}>
        <Text style={[styles.iconText, iconTextStyle]}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: "#b2b2b2",
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: "#b2b2b2",
    fontWeight: "bold",
    fontSize: 16,
    backgroundColor: "transparent",
    textAlign: "center",
  },
});

export default CustomActions;
