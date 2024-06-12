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
} from 'react-native';
import axios from 'axios';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const responsiveSize = (fontSize) => {
  const standardScreenWidth = 400;
  const scaleFactor = screenWidth / standardScreenWidth;
  const responsiveSize = Math.round(fontSize * scaleFactor);
  return responsiveSize;
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userData, setUserData] = useState([]);
  const [showModal, setShowModal] = useState(false); // State for modal visibility

  const navigation = useNavigation();

  const fetchUserData = async () => {
    try {
      const response = await axios.post('http://192.168.111.90:2525/users');
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    fetchUserData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleLogin = () => {
    const user = userData.find(user => user.user_name === username && user.user_password === password);
    if (user) {
      fetchUserData().then(() => {
        navigation.replace('AppDrawer', { username: user.user_name, user_id: user.user_id, tagValue: user.tagValue });
      });
    } else {
      // Show modal if login fails
      setShowModal(true);
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal} // Control modal visibility with state
        onRequestClose={() => {
          closeModal(); // Close modal on pressing hardware back button on Android
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Invalid username or password
            </Text>
            <TouchableOpacity
              style={styles.openButton}
              onPress={closeModal} // Close modal on button press
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