import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, Dimensions, Modal, ActivityIndicator, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from "../../firebaseConfig";
import axios from 'axios';

// Get the screen dimensions
const screenWidth = Dimensions.get('window').width;

// Calculate the responsive font size based on the screen width
const responsiveSize = (fontSize) => {
  const standardScreenWidth = 400; // Standard screen width (iPhone 8 width)
  const scaleFactor = screenWidth / standardScreenWidth;
  const responsiveSize = Math.round(fontSize * scaleFactor);
  return responsiveSize;
};

const UpdateDeviceInfo = ({ route, navigation }) => {
  const { user_id, studentDevice } = route.params;

  const [deviceName, setDeviceName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [imageUploadUrl, setImageUploadUrl] = useState(null);

  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.cancelled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    if (studentDevice) {
      setDeviceName(studentDevice.device_name);
      setSerialNumber(studentDevice.device_serialNumber);
      setColor(studentDevice.device_color);
      setBrand(studentDevice.device_brand);
      setImageUploadUrl(studentDevice.device_image_url);
    }
  }, [studentDevice]);

  const uploadImageToFirebase = async () => {
    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      const filename = selectedImage.substring(selectedImage.lastIndexOf('/') + 1);
      const storageRef = firebase.storage().ref().child(`device_images/${filename}`);
      await storageRef.put(blob);
      const downloadURL = await storageRef.getDownloadURL();
      setImageUploadUrl(downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image to Firebase:', error);
      throw new Error('Image upload failed');
    }
  };

  const updateDevice = async () => {
    setLoading(true);

    try {
      let imageUrl = imageUploadUrl;
      if (selectedImage !== null) {
        imageUrl = await uploadImageToFirebase();
      }

      await axios.post(`http://192.168.111.90:2525/update_device/${user_id}`, {
        device_name: deviceName,
        device_serialNumber: serialNumber,
        device_color: color,
        device_brand: brand,
        device_image_url: imageUrl
      });

      navigation.navigate('Device Registration', { user_id: user_id });
      setModalMessage('Device updated successfully');
      setShowModal(true);
    } catch (error) {
      console.error('Error updating device:', error);
      setModalMessage('Failed to update device information. Please try again.');
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <KeyboardAwareScrollView style={styles.safeAreaContainer}>
      {loading ? (
        <View style={styles.setLoadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : studentDevice ? (
        <>
          <View style={styles.devicephotoTitle}>
            <Text style={styles.TextDescription}>Click to select new photo:</Text>
          </View>
      
          <TouchableOpacity style={styles.ImageMaincontainer} onPress={pickImage}>
            <View style={styles.imageContainer}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage }} style={styles.selectedImageStyle} />
              ) : (
                imageUploadUrl ? (
                  <Image
                    source={{ uri: imageUploadUrl }}
                    style={styles.selectedImageStyle}
                  />
                ) : (
                  <Image source={require("../../img/icons/plus.png")} style={styles.addImageIcon} />
                )
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.deviceDescriptionContainer}>
            <Text style={styles.TextDescription}>Device Information:</Text>

            <TextInput
              style={styles.input}
              onChangeText={setDeviceName}
              defaultValue={deviceName}
              isRequired
            />

            <TextInput
              style={styles.input}
              onChangeText={setSerialNumber}
              defaultValue={serialNumber}
              isRequired
            />

            <TextInput
              style={styles.input}
              onChangeText={setColor}
              defaultValue={color}
              isRequired
            />

            <TextInput
              style={styles.input}
              onChangeText={setBrand}
              defaultValue={brand}
              isRequired
            />

            <TouchableOpacity style={styles.button} onPress={updateDevice}>
              <Text style={styles.buttonText}>UPDATE</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.noDeviceContainer}>
          <Text style={styles.noDeviceText}>No device found.</Text>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={closeModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              {modalMessage}
            </Text>
            <TouchableOpacity
              style={styles.openButton}
              onPress={closeModal}
            >
              <Text style={styles.textStyle}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
  );
};

export default UpdateDeviceInfo;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
  },
  devicephotoTitle: {
    paddingHorizontal: responsiveSize(40),
  },
  ImageMaincontainer: {
    alignItems: "center",
  },
  imageContainer: {
    backgroundColor: "#EEEEEE",
    width: "80%",
    height: responsiveSize(175),
    borderRadius: responsiveSize(12),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: responsiveSize(2),
    borderColor: "#2196F3",
  },
  selectedImageStyle: {
    height: responsiveSize(170),
    width: "99%",
    borderRadius: responsiveSize(12),
  },
  addImageIcon: {
    width: responsiveSize(45),
    height: responsiveSize(45),
  },
  deviceDescriptionContainer: {
    paddingHorizontal: responsiveSize(40),
    marginTop: responsiveSize(25),
  },
  TextDescription: {
    fontSize: responsiveSize(18),
    marginVertical: responsiveSize(15),
    fontWeight: "bold",
    letterSpacing: responsiveSize(1),
  },
  input: {
    fontSize: responsiveSize(18),
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    marginBottom: responsiveSize(15),
    paddingBottom: responsiveSize(5),
    paddingLeft: responsiveSize(10),
  },
  button: {
    marginTop: responsiveSize(12),
    backgroundColor: "#001529",
    padding: responsiveSize(15),
    borderRadius: responsiveSize(10),
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: responsiveSize(14),
    letterSpacing: responsiveSize(1),
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: responsiveSize(22),
  },
  modalView: {
    margin: responsiveSize(20),
    backgroundColor: "#FFF",
    borderRadius: responsiveSize(20),
    padding: responsiveSize(35),
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: responsiveSize(15),
    fontSize: responsiveSize(16),
    fontWeight: "bold",
    letterSpacing: responsiveSize(1),
    textAlign: "center",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  openButton: {
    backgroundColor: "#2196F3",
    borderRadius: responsiveSize(20),
    padding: responsiveSize(10),
    elevation: 2
  },
  setLoadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noDeviceContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noDeviceText: {
    fontSize: responsiveSize(18),
    fontWeight: "bold",
  },
});
