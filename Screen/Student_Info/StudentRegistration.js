import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, SafeAreaView, Dimensions, ScrollView, ActivityIndicator, Modal } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from "../../firebaseConfig"
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

const StudentRegistration = ({ route, navigation }) => {
  const { user_id } = route.params;

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [user_email, setUser_email] = useState('');
  const [tuptId, setTuptId] = useState('');
  const [course, setCourse] = useState('');
  const [section, setSection] = useState('');
  const [image, setImage] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false); // State to track registration status
  const [loading, setLoading] = useState(false); // State to track loading state

  const [selectedValue, setSelectedValue] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Function to check if the user is already registered
  const checkRegistrationStatus = async () => {
    try {
      const response = await axios.get(`http://192.168.111.90:2525/studentinfo/${user_id}`);
      if (response.data.length > 0) {
        setIsRegistered(true);
      } else {
        setIsRegistered(false);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
    }
  };

  useEffect(() => {
    checkRegistrationStatus(); // Check registration status when the component mounts
  }, []);

  const handleRegister = async () => {
    if (!firstName || !middleName || !lastName || !user_email || !tuptId || !course || !section) {
      setModalMessage('Please fill in all fields');
      setShowModal(true);
      return;
    }

    setLoading(true); // Set loading state to true while registering

    try {
      let studentProfile = null; // Initialize student profile as null

      // If image is provided, upload it to Firebase storage
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const filename = image.substring(image.lastIndexOf('/') + 1);
        const storageRef = firebase.storage().ref().child(`student_profile/${filename}`);
        await storageRef.put(blob);
        const downloadURL = await storageRef.getDownloadURL();
        studentProfile = downloadURL; // Set studentProfile to the download URL
      }

      // Insert student data and image URL into the database
      const registrationResponse = await axios.post('http://192.168.111.90:2525/student_registration', {
        firstName,
        middleName,
        lastName,
        tuptId,
        course,
        section,
        user_id,
        user_email,
        studentProfile, // Pass the student profile (image URL or null)
      });

      // Handle successful registration
      setIsRegistered(true);
      console.log('Registered successfully:', registrationResponse.data);
      // Navigate to the next screen or perform any desired action
      navigation.navigate('StudentInfo', { user_id: user_id });
      setModalMessage('Registration Successful', 'You have been registered successfully!');
      setShowModal(true);
    } catch (error) {
      console.error('Error during registration:', error);
      setModalMessage('Failed to register. Please try again.');
      setShowModal(true);
    } finally {
      setLoading(false); // Set loading state to false after registration attempt
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const options = [
    'BET-AUTO',
    'BET-CHEM',
    'BET-CIVIL',
    'BET-DMT',
    'BET-ELECTRICAL',
    'BET-ELEX',
    'BET-EMT',
    'HVACRT',
    'BET-ICT',
    'BET-MECHANICAL',
    'BET-MECHATRONICS',
    'BET-NDT',
    'BSCE-SEP',
    'BSECE-SEP',
    'BSEE-SEP',
    'BSES-SDP',
    'BSIT-SDP',
    'BSME-SEP',
    'BTVTE-CH (Computer Hardware)',
    'BTVTE-CP (Computer Programming)',
    'BTVTE-ELECTRICAL',
    'BTVTE-ELEX'
  ].map(option => ({ label: option, value: option }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContainer}>
        {loading ? ( // Display ActivityIndicator while loading
          <ActivityIndicator size="large" color="#20AB7D" />
        ) : (
          <>
            <TouchableOpacity style={styles.profileMainContainer} onPress={pickImage}>
              <View style={styles.profileCenterborder}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.profilePicture} />
                ) : (
                  <Image
                    source={require('../../img/user.png')}
                    style={styles.profilePicture}
                  />
                )}
              </View>
              <View style={styles.selectProfileContainer}>
                <Image
                  source={require("../../img/icons/camera1.png")}
                  style={styles.selectProfilepic}
                />
              </View>
            </TouchableOpacity>

            <View style={styles.RegisterInputContainer}>
              <ScrollView>
                <Text style={styles.TextDescription}>Register your information:</Text>

                <View style={styles.InputEachContainer}>
                  <Text style={styles.TextDescription}>Name:</Text>
                  <TextInput
                    style={styles.newInput}
                    placeholder="First name"
                    placeholderTextColor="gray"
                    onChangeText={setFirstName}
                    isRequired
                  />
                  <TextInput
                    style={styles.newInput}
                    placeholder="Middle name"
                    placeholderTextColor="gray"
                    onChangeText={setMiddleName}
                    isRequired
                  />
                  <TextInput
                    style={styles.newInput}
                    placeholder="Last name"
                    onChangeText={setLastName}
                    placeholderTextColor="gray"
                    isRequired
                  />
                </View>

                <View style={styles.InputEachContainer}>
                  <Text style={styles.TextDescription}>Email:</Text>
                  <TextInput
                    style={styles.newInput}
                    placeholder="Example: name@tup.edu.ph"
                    onChangeText={setUser_email}
                    placeholderTextColor="gray"
                    isRequired
                  />
                </View>

                <View style={styles.InputEachContainer}>
                  <Text style={styles.TextDescription}>TUPT NO:</Text>
                  <TextInput
                    style={styles.newInput}
                    placeholder="Example: TUPT-00-0000"
                    onChangeText={setTuptId}
                    placeholderTextColor="gray"
                    isRequired
                  />
                </View>

                <View style={styles.InputEachContainer}>
                  <Text style={styles.TextDescription}>Course:</Text>
                  <RNPickerSelect
                    onValueChange={(value) => {
                      setSelectedValue(value);
                      setCourse(value); // Update course TextInput value
                    }}
                    items={options}
                    style={pickerSelectStyles}
                    placeholder={{ label: 'Select your course...', value: null }} // Custom placeholder
                  />
                  <TextInput
                    style={styles.newInput}
                    placeholder="Others:"
                    value={course} // Bind the TextInput value to course state
                    onChangeText={setCourse}
                    placeholderTextColor="gray"
                    isRequired
                  />
                </View>

                <View>
                  <Text style={styles.TextDescription}>Section:</Text>
                  <TextInput
                    style={styles.newInput}
                    placeholder="Example: 1A"
                    onChangeText={setSection}
                    placeholderTextColor="gray"
                    isRequired
                  />
                </View>

              </ScrollView>
              <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
                <Text style={styles.registerText}>Register</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
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
    </SafeAreaView >
  );
};

export default StudentRegistration;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  profileMainContainer: {
    marginTop: responsiveSize(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCenterborder: {
    justifyContent: "center",
    alignItems: "center",
    height: responsiveSize(130),
    width: responsiveSize(130),
    borderRadius: responsiveSize(125),
    backgroundColor: "#CCCCCC",
  },
  profilePicture: {
    height: responsiveSize(120),
    width: responsiveSize(120),
    borderRadius: responsiveSize(120),
    resizeMode: "cover",
    backgroundColor: "white",
  },
  selectProfileContainer: {
    height: responsiveSize(45),
    width: responsiveSize(45),
    borderRadius: responsiveSize(45),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#AAAAAA',
    position: "relative",
    bottom: responsiveSize(45),
    left: responsiveSize(45),
  },
  selectProfilepic: {
    height: responsiveSize(20),
    width: responsiveSize(20),
  },
  RegisterInputContainer: {
    flex: 1,
    paddingHorizontal: responsiveSize(50),
    justifyContent: "space-between",
  },
  TextDescription: {
    fontSize: responsiveSize(18),
    marginVertical: responsiveSize(15),
    fontWeight: "bold",
    letterSpacing: responsiveSize(1),
  },
  InputEachContainer: {
    marginBottom: responsiveSize(20),
  },
  newInput: {
    fontSize: responsiveSize(18),
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    marginVertical: responsiveSize(10),
    paddingBottom: responsiveSize(5),
    paddingLeft: responsiveSize(12),
  },
  registerBtn: {
    marginVertical: responsiveSize(35),
    backgroundColor: '#2196F3',
    paddingVertical: responsiveSize(14),
    borderRadius: responsiveSize(15),
    alignItems: 'center',
  },
  registerText: {
    color: 'white',
    fontWeight: "bold",
    fontSize: responsiveSize(16),
    letterSpacing: responsiveSize(1),
  },
  disabledBtn: {
    backgroundColor: '#888',
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
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});