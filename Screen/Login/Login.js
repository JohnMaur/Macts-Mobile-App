import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

const responsiveSize = (fontSize) => {
  const standardScreenWidth = 400;
  const scaleFactor = screenWidth / standardScreenWidth;
  return Math.round(fontSize * scaleFactor);
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slowConnection, setSlowConnection] = useState(false);
  const navigation = useNavigation();

  const fetchUserData = async () => {
    setLoading(true); // Start loading indicator
    const slowConnectionTimeout = setTimeout(() => {
      setSlowConnection(true); // Show slow connection popup
    }, 5000); // Timeout for slow connection

    try {
      const response = await axios.get('https://macts-backend-mobile-app-production.up.railway.app/users');
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      clearTimeout(slowConnectionTimeout); // Clear slow connection timeout
      setLoading(false); // Stop loading indicator
      setSlowConnection(false); // Hide slow connection popup
    }
  };

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    fetchUserData();
    checkSession();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const checkSession = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        const user = JSON.parse(await AsyncStorage.getItem('user'));
        navigation.replace('AppDrawer', { username: user.user_name, user_id: user.user_id, tagValue: user.tagValue });
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleLogin = async () => {
    if (!username || !password) {
      setShowModal(true);
      return;
    }
  
    try {
      const response = await axios.get('https://macts-backend-mobile-app-production.up.railway.app/users');
      const user = response.data.find(user => user.user_name === username && user.user_password === password);
  
      if (user) {
        try {
          await AsyncStorage.setItem('userToken', 'someRandomToken');
          await AsyncStorage.setItem('user', JSON.stringify(user));
          navigation.replace('AppDrawer', { username: user.user_name, user_id: user.user_id, tagValue: user.tagValue });
        } catch (error) {
          console.error('Error saving data:', error);
        }
      } else {
        setShowModal(true); // Show modal if login fails
      }
    } catch (error) {
      if (error.message === 'Network Error') {
        setSlowConnection(true); // Show modal if there is a network error
      } else {
        console.error('Error fetching user data:', error);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setShowPassword(false);
    });

    return unsubscribe;
  }, [navigation]);

  const closeModal = () => {
    setShowModal(false);
  };

  const closeSlowConnectionModal = () => {
    setSlowConnection(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        enabled
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
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
              onChangeText={(text) => setUsername(text)}
              value={username}
              isRequired
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
              onChangeText={(text) => setPassword(text)}
              value={password}
              isRequired
            />
            <TouchableWithoutFeedback onPress={togglePasswordVisibility}>
              <Image
                source={showPassword ? require('../../img/icons/show.png') : require('../../img/icons/hide.png')}
                style={styles.passwordIcon}
              />
            </TouchableWithoutFeedback>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignUp}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <View style={styles.icons}>
              <TouchableOpacity>
                <Image
                  style={styles.icon}
                  source={require('../../img/icons/facebook.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.icons}>
              <TouchableOpacity>
                <Image
                  style={styles.icon}
                  source={require('../../img/icons/google.png')}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.icons}>
              <TouchableOpacity>
                <Image
                  style={styles.icon}
                  source={require('../../img/icons/mobile.png')}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>By using MACT’s, you are agreeing to our</Text>
            <TouchableOpacity >
              <Text style={styles.termOfServiceLink}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={responsiveSize(50)} color="#0000ff" />
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
            <Text style={styles.modalText}>Invalid username or password</Text>
            <TouchableOpacity
              style={styles.openButton}
              onPress={closeModal}
            >
              <Text style={styles.textStyle}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={slowConnection}
        onRequestClose={closeSlowConnectionModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Check your internet connection and try again</Text>
            <TouchableOpacity
              style={styles.openButton}
              onPress={closeSlowConnectionModal}
            >
              <Text style={styles.textStyle}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles for the components
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    height: '30%',
    marginTop: responsiveSize(100),
    resizeMode: 'contain',
  },
  textInputContainer: {
    width: '80%',
  },
  input: {
    flex: 1,
    paddingVertical: '5%',
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#17171B',
    borderRadius: 15,
    marginBottom: '3%',
  },
  inputIcon: {
    width: responsiveSize(20),
    height: responsiveSize(20),
    marginLeft: responsiveSize(15),
    marginRight: responsiveSize(10),
    resizeMode: 'contain',
  },
  loginButton: {
    marginTop: '4%',
    backgroundColor: '#35343B',
    paddingVertical: '3%',
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    marginTop: responsiveSize(4),
    marginBottom: responsiveSize(4),
    color: 'white',
    fontSize: responsiveSize(16),
    fontWeight: "bold",
    letterSpacing: responsiveSize(1),
  },
  signUpLink: {
    color: '#2196F3',
    fontSize: responsiveSize(16),
    marginTop: '4%',
    textAlign: 'center',
    fontWeight: "bold",
    letterSpacing: responsiveSize(1),
  },
  iconContainer: {
    flexDirection: 'row',
    height: '10%',
    justifyContent: 'center',
    marginBottom: responsiveSize(30),
  },
  icons: {
    marginTop: '8%',
    backgroundColor: '#2F2E35',
    borderWidth: 0.5,
    borderRadius: 10,
    borderColor: '#2196F3',
    height: responsiveSize(55),
    width: responsiveSize(75),
    marginRight: '4%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    height: responsiveSize(30),
    width: responsiveSize(30),
    resizeMode: 'contain',
  },
  footerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '12%',
  },
  footerText: {
    fontSize: responsiveSize(14),
    color: 'white'
  },
  termOfServiceLink: {
    color: '#2196F3',
    marginTop: '2%',
  },
  passwordIcon: {
    width: '6%',
    height: '75%',
    marginRight: '5%',
    resizeMode: 'contain',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -responsiveSize(25) }, { translateY: -responsiveSize(25) }],
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

export default Login;
