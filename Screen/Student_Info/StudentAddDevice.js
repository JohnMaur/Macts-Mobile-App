import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, SafeAreaView, Dimensions, Alert, Modal, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from "../../firebaseConfig";
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const responsiveSize = (fontSize) => {
  const standardScreenWidth = 400;
  const scaleFactor = screenWidth / standardScreenWidth;
  return Math.round(fontSize * scaleFactor);
};

const StudentAddDevice = ({ route }) => {
  const navigation = useNavigation();
  const { user_id } = route.params;

  const [deviceName, setDeviceName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUploadUrl, setImageUploadUrl] = useState(null);
  const [studentDevice, setStudentDevice] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const addDevice = async () => {
    if (!deviceName || !serialNumber || !color || !brand || !selectedImage) {
      setModalMessage('Please fill in all fields');
      setShowModal(true);
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await uploadImageToFirebase();

      await axios.post('http://192.168.111.90:2525/add_device', {
        device_name: deviceName,
        device_serialNumber: serialNumber,
        device_color: color,
        device_brand: brand,
        user_id: user_id,
        device_image_url: imageUrl
      });

      setModalMessage('Device added successfully');
      setShowModal(true);
      fetchStudentDevice();  // Fetch updated device info
    } catch (error) {
      console.error('Error adding device:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDevice = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://192.168.111.90:2525/get_device/${user_id}`);
      setStudentDevice(response.data[0]);
    } catch (error) {
      console.error('Error fetching student information:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStudentDevice();
    }, [])
  );

  const closeModal = () => {
    setShowModal(false);
  };

  const handleUpdateLink = () => {
    navigation.navigate('Update', { user_id: user_id, studentDevice: studentDevice });
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      {loading ? (
        <>
          <View style={styles.setLoadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>

        </>

      ) : studentDevice ? (
        <>
          <View style={styles.devicephotoTitle}>
            <Text style={styles.TextDescription}>Device Photo:</Text>
          </View>
          <View style={styles.ImageMaincontainer}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: studentDevice.device_image_url }}
                style={styles.selectedImageStyle}
              />
            </View>
          </View>

          <View style={styles.deviceDescriptionContainer}>
            <Text style={styles.TextDescription}>Device Description:</Text>

            <View style={styles.deviceNameContainer}>
              <Text style={styles.deviceNameTitle}>Device name: </Text>
              <Text style={styles.deviceNameText}>{studentDevice.device_name}</Text>
            </View>

            <View style={styles.deviceNameContainer}>
              <Text style={styles.deviceNameTitle}>Serial number: </Text>
              <Text style={styles.deviceNameText}>{studentDevice.device_serialNumber}</Text>
            </View>

            <View style={styles.deviceNameContainer}>
              <Text style={styles.deviceNameTitle}>Device color: </Text>
              <Text style={styles.deviceNameText}>{studentDevice.device_color}</Text>
            </View>

            <View style={styles.deviceNameContainer}>
              <Text style={styles.deviceNameTitle}>Device brand: </Text>
              <Text style={styles.deviceNameText}>{studentDevice.device_brand}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleUpdateLink}>
              <Text style={styles.buttonText}>UPDATE</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <KeyboardAwareScrollView style={styles.container}>
            <View style={styles.devicephotoTitle}>
              <Text style={styles.TextDescription}>Add Device Picture:</Text>
            </View>
            <TouchableOpacity style={styles.ImageMaincontainer} onPress={pickImage}>
              <View style={styles.imageContainer}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.selectedImageStyle} />
                ) : (
                  <Image source={require("../../img/icons/plus.png")} style={styles.addImageIcon} />
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.deviceDescriptionContainer}>
              <Text style={styles.TextDescription}>Add Device Information:</Text>

              <TextInput
                style={styles.input}
                placeholder="Device Name"
                onChangeText={setDeviceName}
                isRequired
              />
              <TextInput
                style={styles.input}
                placeholder="Serial Number"
                onChangeText={setSerialNumber}
                isRequired
              />
              <TextInput
                style={styles.input}
                placeholder="Device Color"
                onChangeText={setColor}
                isRequired
              />
              <TextInput
                style={styles.input}
                placeholder="Device Brand"
                onChangeText={setBrand}
                isRequired
              />

              <TouchableOpacity style={styles.button} onPress={addDevice}>
                <Text style={styles.buttonText}>ADD</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </>
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
    </SafeAreaView>
  );
};

export default StudentAddDevice;

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
    backgroundColor: "#2196F3",
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
  deviceNameContainer: {
    flexDirection: "row",
    marginBottom: responsiveSize(5),
  },
  deviceNameTitle: {
    fontSize: responsiveSize(18),
    fontWeight: "bold",
  },
  deviceNameText: {
    fontSize: responsiveSize(18),
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
  }
});