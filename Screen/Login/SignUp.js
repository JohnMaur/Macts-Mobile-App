import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Dimensions,
  Modal,
} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

// Get the screen dimensions
const screenWidth = Dimensions.get('window').width;

// Calculate the responsive font size based on the screen width
const responsiveSize = (fontSize) => {
  const standardScreenWidth = 400; // Standard screen width (iPhone 8 width)
  const scaleFactor = screenWidth / standardScreenWidth;
  const responsiveSize = Math.round(fontSize * scaleFactor);
  return responsiveSize;
};

const SignUp = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchUserData = async () => {
    try {
      const response = await axios.post('http://192.168.144.90:2525/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  const handleSignUp = async () => {
    if (!username || !password || !confirmPassword) {
      setModalMessage('Please fill in all fields');
      setShowModal(true);
      return;
    }

    if (password !== confirmPassword) {
      setModalMessage('Passwords do not match');
      setShowModal(true);
      return;
    }

    try {
      // Check if the username already exists
      const userData = await fetchUserData();
      const isUsernameTaken = userData.some(user => user.user_name === username);
      if (isUsernameTaken) {
        setModalMessage('Username is already in use');
        setShowModal(true);
        return;
      }

      // Proceed with signup if username is available
      const response = await axios.post('http://192.168.144.90:2525/signup', {
        username,
        password,
      });
      // Handle successful signup
      console.log('Signup successful:', response.data);
      setModalMessage('Signup successful');
      setShowModal(true);
      await fetchUserData(); // Fetch user data
      navigation.navigate('Login'); // Navigate to the login screen
    } catch (error) {
      console.error('Error signing up:', error);
      setModalMessage('Failed to sign up');
      setShowModal(true);
    }
  };

  const handleLoginLink = () => {
    navigation.navigate('Login');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      // Reset password visibility when navigating away from SignUp screen
      setShowPassword(false);
      setShowConfirmPassword(false);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        enabled
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >

        <View style={styles.content}>
          <Image
            source={require('../../img/Logo_blue.png')}
            style={styles.logo}
          />
          <View style={styles.textInputContainer}>
            <View style={styles.inputContainer}>
              <Image
                source={require('../../img/icons/name.png')}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="lightgray"
                onChangeText={setUsername}
              />
            </View>
            <View style={styles.inputContainer}>
              <Image
                source={require('../../img/icons/password.png')}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="lightgray"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
              />
              <TouchableWithoutFeedback onPress={togglePasswordVisibility}>
                <Image
                  source={showPassword ? require('../../img/icons/show.png') : require('../../img/icons/hide.png')}
                  style={styles.passwordIcon}
                />
              </TouchableWithoutFeedback>
            </View>
            <View style={styles.inputContainer}>
              <Image
                source={require('../../img/icons/password.png')}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="lightgray"
                secureTextEntry={!showConfirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableWithoutFeedback onPress={toggleConfirmPasswordVisibility}>
                <Image
                  source={showConfirmPassword ? require('../../img/icons/show.png') : require('../../img/icons/hide.png')}
                  style={styles.passwordIcon}
                />
              </TouchableWithoutFeedback>
            </View>


            <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLoginLink}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>By using MACT’s, you are agreeing to our</Text>
              <TouchableOpacity >
                <Text style={styles.termOfServiceLink}>Terms of Service</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E1E1E'
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    height: '30%',
    marginTop: responsiveSize(90),
    resizeMode: 'contain',
  },
  textInputContainer: {
    width: '100%',
    marginBottom: responsiveSize(50),
  },
  input: {
    flex: 1,
    paddingVertical: '4.4%',
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#17171B',
    borderRadius: 15,
    marginBottom: '4%',
  },
  inputIcon: {
    width: '7%',
    height: '40%',
    marginLeft: '6%',
    marginRight: responsiveSize(10),
    resizeMode: 'contain',
  },
  loginLink: {
    color: '#2196F3',
    fontSize: responsiveSize(16),
    marginTop: '3.5%',
    textAlign: 'center',
    fontWeight: "bold",
    letterSpacing: responsiveSize(1),
  },
  signUpButton: {
    marginTop: '8%',
    backgroundColor: '#2196F3',
    paddingVertical: '4.4%',
    borderRadius: 15,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: responsiveSize(16),
    fontWeight: "bold",
    letterSpacing: responsiveSize(1),
  },
  footerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '12%',
  },
  footerText: {
    fontSize: responsiveSize(14),
    color: 'white',
  },
  termOfServiceLink: {
    color: '#2196F3',
    marginTop: '2.5%',
  },
  passwordIcon: {
    width: '6%',
    height: '75%',
    marginRight: '5%',
    resizeMode: 'contain',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: responsiveSize(22),
  },
  modalView: {
    margin: responsiveSize(20),
    backgroundColor: "white",
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
    textAlign: "center"
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

export default SignUp;