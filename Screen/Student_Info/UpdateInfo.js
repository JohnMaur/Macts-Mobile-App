import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity, SafeAreaView, Dimensions, Alert, ScrollView, ActivityIndicator, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../../firebaseConfig';
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

const UpdateInfo = ({ route, navigation }) => {
  const { user_id, studentInfo } = route.params;

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [user_email, setUser_email] = useState('');
  const [tuptId, setTuptId] = useState('');
  const [course, setCourse] = useState('');
  const [section, setSection] = useState('');
  const [profile, setProfile] = useState('');
  const [image, setImage] = useState(null);
  const [allInputsFilled, setAllInputsFilled] = useState(false); // State to track if all inputs are filled
  const [loading, setLoading] = useState(false); // State to track loading state

  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (studentInfo) {
      setFirstName(studentInfo.studentInfo_first_name);
      setMiddleName(studentInfo.studentInfo_middle_name);
      setLastName(studentInfo.studentInfo_last_name);
      setUser_email(studentInfo.user_email);
      setTuptId(studentInfo.studentInfo_tuptId);
      setCourse(studentInfo.studentInfo_course);
      setSection(studentInfo.studentInfo_section);
      setProfile(studentInfo.student_profile);
    }
  }, [studentInfo]);

  useEffect(() => {
    // Check if all inputs are filled
    const inputsFilled = firstName && middleName && lastName && user_email && tuptId && course && section;
    setAllInputsFilled(inputsFilled);
  }, [firstName, middleName, lastName, user_email, tuptId, course, section]);

  const handleUpdate = async () => {
    if (!firstName || !middleName || !lastName || !user_email || !tuptId || !course || !section) {
      Alert.alert('Error', 'Please fill out all input fields');
      return;
    }

    setLoading(true);

    try {
      let downloadURL = profile; // Use existing profile URL by default
      if (image) {
        // Upload new image to Firebase storage
        const response = await fetch(image);
        const blob = await response.blob();
        const filename = image.substring(image.lastIndexOf('/') + 1);
        const storageRef = firebase.storage().ref().child(`student_profile/${filename}`);
        await storageRef.put(blob);
        downloadURL = await storageRef.getDownloadURL();
      }

      // Make an HTTP request to update the student information
      await axios.post(`https://macts-backend-mobile-app-production.up.railway.app/update_studentinfo/${user_id}`, {
        firstName,
        middleName,
        lastName,
        user_email,
        tuptId,
        course,
        section,
        profile: downloadURL
      });

      // Handle success
      navigation.navigate('StudentInfo', { user_id: user_id });
      console.log('Update successful');
      setModalMessage('Update successful');
      setShowModal(true);
    } catch (error) {
      console.error('Error updating student information:', error);
      setModalMessage('Failed to update information');
      setShowModal(true);
    } finally {
      setLoading(false);
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

  const handleRegisterLink = () => {
    navigation.navigate('Student Registration', { user_id: user_id });
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" animating={loading} />
        </View>
      ) : (
        studentInfo && (
          <ScrollView contentContainerStyle={styles.scrollContentContainer}>
            <TouchableOpacity style={styles.profilepicture} onPress={pickImage}>
              <View style={styles.profileCenterborder}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.profileIcon} />
                ) : profile ? (
                  <Image source={{ uri: profile }} style={styles.profileIcon} />
                ) : (
                  <Image source={require('../../img/user.png')} style={styles.profileIcon} />
                )}
              </View>
              <View style={styles.selectProfileContainer}>
                <Image
                  source={require('../../img/icons/camera1.png')}
                  style={styles.selectProfilepic}
                />
              </View>
            </TouchableOpacity>

            <View style={styles.updateInputContainer}>
              <View>
                <Text style={styles.TextDescription}>Update your Information:</Text>
                <TextInput
                  style={styles.newInput}
                  placeholder="First name"
                  placeholderTextColor="gray"
                  onChangeText={setFirstName}
                  defaultValue={firstName}
                  isRequired
                />
                <TextInput
                  style={styles.newInput}
                  placeholder="Middle name"
                  placeholderTextColor="gray"
                  onChangeText={setMiddleName}
                  defaultValue={middleName}
                  isRequired
                />
                <TextInput
                  style={styles.newInput}
                  placeholder="Last name"
                  onChangeText={setLastName}
                  defaultValue={lastName}
                  placeholderTextColor="gray"
                  isRequired
                />
                <TextInput
                  style={styles.newInput}
                  placeholder="Email"
                  onChangeText={setUser_email}
                  defaultValue={user_email}
                  placeholderTextColor="gray"
                  isRequired
                />
                <TextInput
                  style={styles.newInput}
                  placeholder="TUPT-ID No."
                  onChangeText={setTuptId}
                  defaultValue={tuptId}
                  placeholderTextColor="gray"
                  isRequired
                />
                <TextInput
                  style={styles.newInput}
                  placeholder="Course"
                  onChangeText={setCourse}
                  defaultValue={course}
                  placeholderTextColor="gray"
                  isRequired
                />
                <TextInput
                  style={styles.newInput}
                  placeholder="Section"
                  onChangeText={setSection}
                  defaultValue={section}
                  placeholderTextColor="gray"
                  isRequired
                />
              </View>
              <TouchableOpacity
                style={[styles.registerBtn, !allInputsFilled && styles.disabledBtn]}
                onPress={() => {
                  if (!allInputsFilled) {
                    setModalMessage('Please fill out all input fields before updating.');
                    setShowModal(true);                    
                  } else {
                    handleUpdate();
                  }
                }}
              >
                <Text style={styles.registerText}>Update</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )
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

export default UpdateInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  profilepicture: {
    marginTop: responsiveSize(50),
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCenterborder: {
    borderColor: '#2196F3',
    borderWidth: responsiveSize(2),
    borderRadius: responsiveSize(100),
    padding: responsiveSize(5),
  },
  profileIcon: {
    height: responsiveSize(120),
    width: responsiveSize(120),
    borderRadius: responsiveSize(60),
    resizeMode: 'cover',
  },
  selectProfileContainer: {
    height: responsiveSize(45),
    width: responsiveSize(45),
    borderRadius: responsiveSize(45),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#FFF',
    position: "relative",
    bottom: responsiveSize(45),
    left: responsiveSize(45),
  },
  selectProfilepic: {
    height: responsiveSize(20),
    width: responsiveSize(20),
  },
  updateInputContainer: {
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
  newInput: {
    fontSize: responsiveSize(18),
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    marginBottom: responsiveSize(15),
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
