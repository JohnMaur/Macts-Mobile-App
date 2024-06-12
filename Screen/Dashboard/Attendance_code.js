import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TextInput, Alert, TouchableOpacity, Dimensions } from 'react-native'; // Import Alert and TouchableOpacity
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

const screenWidth = Dimensions.get('window').width;

const responsiveSize = (size) => {
  const standardScreenWidth = 500;
  const scaleFactor = screenWidth / standardScreenWidth;
  return Math.round(size * scaleFactor);
};

const Attendance_code = ({ route }) => {
  const { user_id } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [code, setCode] = useState('');
  const navigation = useNavigation(); // Use useNavigation hook to get navigation object

  const handleJoin = () => {
    // Check if code is empty
    if (!code.trim()) {
      // If code is empty, show an alert
      Alert.alert('Error', 'Please enter a code.');
      return; // Prevent further execution
    }

    // Navigate to "Attendance" route passing the code
    navigation.navigate('Attendance', { code: code, user_id: user_id });
  };

  const clearCode = () => {
    setCode("");
  }

  return (
    <View style={styles.container}>
      <View style={styles.miniContainer}>
        <Text style={styles.miniText}>Click join to enter your code</Text>
        <TouchableOpacity style={styles.MainjoinButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Join</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.miniContainer}>
        <Text style={styles.miniText}>Clear your previous code if join button is not working</Text>
        <TouchableOpacity style={styles.MainjoinButton} onPress={clearCode}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for entering code */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.input}
              placeholder="Enter code"
              onChangeText={(text) => setCode(text)}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
                <Text style={styles.buttonText}>Join</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Attendance_code;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniContainer: {
    flex: 1,
    width: "80%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    maxHeight: responsiveSize(200),
    borderRadius: responsiveSize(10),
    marginBottom: responsiveSize(25),
    paddingHorizontal: responsiveSize(45),
  },
  miniText: {
    fontSize: responsiveSize(18),
    marginBottom: responsiveSize(12),
  },
  MainjoinButton: {
    backgroundColor: '#007bff',
    paddingVertical: responsiveSize(15),
    paddingHorizontal: responsiveSize(75),
    borderRadius: responsiveSize(5),
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: responsiveSize(20),
    backgroundColor: 'white',
    borderRadius: responsiveSize(20),
    padding: responsiveSize(35),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: responsiveSize(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: responsiveSize(4),
    elevation: 5,
  },
  input: {
    height: responsiveSize(55),
    width: responsiveSize(200),
    borderColor: 'gray',
    borderWidth: responsiveSize(1),
    marginBottom: responsiveSize(20),
    paddingHorizontal: responsiveSize(10),
    paddingLeft: responsiveSize(20),
    borderRadius: responsiveSize(10),
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  joinButton: {
    backgroundColor: '#007bff',
    paddingVertical: responsiveSize(10),
    paddingHorizontal: responsiveSize(20),
    borderRadius: responsiveSize(5),
  },
  closeButton: {
    backgroundColor: '#dc3545',
    paddingVertical: responsiveSize(10),
    paddingHorizontal: responsiveSize(20),
    borderRadius: responsiveSize(5),
    marginLeft: responsiveSize(15),
  },
  buttonText: {
    color: 'white',
    fontSize: responsiveSize(18),
    letterSpacing: responsiveSize(1),
    fontWeight: 'bold',
  },
});
