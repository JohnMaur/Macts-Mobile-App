import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, Dimensions, Modal, TouchableOpacity } from 'react-native';
import io from 'socket.io-client';
import axios from 'axios';
import { ScrollView } from 'react-native-gesture-handler';

const screenWidth = Dimensions.get('window').width;

const responsiveSize = (fontSize) => {
  const standardScreenWidth = 420;
  const scaleFactor = screenWidth / standardScreenWidth;
  return Math.round(fontSize * scaleFactor);
};

const Gatepass = ({ route }) => {
  const { user_id } = route.params;

  const [tagData, setTagData] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [studentDevice, setStudentDevice] = useState(null);
  const [currentTap, setCurrentTap] = useState(null);
  const [previousTap, setPreviousTap] = useState(null);
  const [isCooldown, setIsCooldown] = useState(false);
  const [showExcessiveTappingModal, setShowExcessiveTappingModal] = useState(false);
  const [setting, setSetting] = useState(null);

  useEffect(() => {
    const GatepassSocket = io('wss://macts-backend-gatepass-production.up.railway.app');

    const handleTagData = (data, source) => {
      console.log(`Received tag data from ${source}:`, data);
    
      if (isCooldown && data === studentDevice.deviceRegistration) {
        console.log("Excessive tapping detected. Please wait for a minute before tapping again.");
        setShowExcessiveTappingModal(true);
        return;
      }
    
      if (studentDevice && data === studentDevice.deviceRegistration) {
        setIsCooldown(true);
        setTimeout(() => setIsCooldown(false), 60000);
    
        if (currentTap) {
          setPreviousTap(currentTap); // Update previousTap before updating currentTap
        }
        
        const newTap = { ...studentInfo, device_brand: studentDevice.device_brand, device_serialNumber: studentDevice.device_serialNumber, taggedAt: new Date().toLocaleString('en-US') };
        setCurrentTap(newTap);
        setSetting(source);
    
        GatepassTapHistory(newTap);
      } else {
        console.log("Tag value doesn't match the student device information.");
      }
    };
    

    GatepassSocket.on('tagData', data => handleTagData(data, 'Gatepass'));

    return () => {
      GatepassSocket.disconnect();
    };
  }, [studentDevice, isCooldown, currentTap, setting]);

  useEffect(() => {
    const excessiveTappingTimer = setTimeout(() => setShowExcessiveTappingModal(false), 60000);
    return () => clearTimeout(excessiveTappingTimer);
  }, [showExcessiveTappingModal]);

  const fetchStudentInfo = async () => {
    try {
      const response = await axios.get(`https://macts-backend-mobile-app-production.up.railway.app/studentinfo/${user_id}`);
      setStudentInfo(response.data[0]);
    } catch (error) {
      console.error('Error fetching student information:', error);
    }
  };

  const fetchStudentDevice = async () => {
    try {
      const response = await axios.get(`https://macts-backend-mobile-app-production.up.railway.app/get_device/${user_id}`);
      setStudentDevice(response.data[0]);
    } catch (error) {
      console.error('Error fetching device information:', error);
    }
  };

  const GatepassTapHistory = async (data) => {
    try {
      await axios.post('https://macts-backend-mobile-app-production.up.railway.app/Gatepass_history', {
        firstName: data.studentInfo_first_name,
        middleName: data.studentInfo_middle_name,
        lastName: data.studentInfo_last_name,
        tuptId: data.studentInfo_tuptId,
        course: data.studentInfo_course,
        section: data.studentInfo_section,
        deviceName: data.device_brand,
        serialNumber: data.device_serialNumber,
        date: data.taggedAt,
        user_id: user_id,
      });
    } catch (error) {
      console.error('Error inserting data into database:', error);
    }
  };

  useEffect(() => {
    fetchStudentInfo();
    fetchStudentDevice();
  }, [user_id]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollViewContainer}>
        <Text style={styles.displayText}>Current Tap</Text>
        <View style={styles.tapContainer}>
          {currentTap ? (
            <View style={styles.studentInfoContainer}>
              {currentTap.student_profile ? (
                <Image source={{ uri: currentTap.student_profile }} style={styles.studentProfile} />
              ) : (
                <Image source={require('../../img/user.png')} style={styles.studentProfile} />
              )}
              <View style={styles.studentDataContainer}>
                <Text style={styles.studentName}>{`${currentTap.studentInfo_first_name} ${currentTap.studentInfo_middle_name} ${currentTap.studentInfo_last_name}`}</Text>
                <View style={styles.nestedStudentData}>
                  <Text style={styles.studentTitle}>TUPT ID: </Text>
                  <Text style={styles.studentData}>{currentTap.studentInfo_tuptId}</Text>
                </View>
                <View style={styles.nestedStudentData}>
                  <Text style={styles.studentTitle}>Course: </Text>
                  <Text style={styles.studentData}>{currentTap.studentInfo_course}</Text>
                </View>
                <View style={styles.nestedStudentData}>
                  <Text style={styles.studentTitle}>Section: </Text>
                  <Text style={styles.studentData}>{currentTap.studentInfo_section}</Text>
                </View>
                <View style={styles.nestedStudentData}>
                  <Text style={styles.studentTitle}>Device: </Text>
                  <Text style={styles.studentData}>{currentTap.device_brand}</Text>
                </View>
                <View style={styles.nestedStudentData}>
                  <Text style={styles.studentTitle}>Serial No: </Text>
                  <Text style={styles.studentData}>{currentTap.device_serialNumber}</Text>
                </View>
                <View style={styles.nestedStudentData}>
                  <Text style={styles.studentTitle}>Time: </Text>
                  <Text style={styles.studentData}>{currentTap.taggedAt}</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.noStudentInfoText}>Tap your RFID tag</Text>
          )}
        </View>

        <Text style={styles.displayText}>Previous Tap</Text>
        <View style={styles.tapContainer}>
          {previousTap ? (
            <View style={styles.studentInfoContainer}>
              {previousTap.student_profile ? (
                <Image source={{ uri: previousTap.student_profile }} style={styles.studentProfile} />
              ) : (
                <Image source={require('../../img/user.png')} style={styles.studentProfile} />
              )}
              <View style={styles.studentDataContainer}>
                <Text style={styles.studentName}>{`${previousTap.studentInfo_first_name} ${previousTap.studentInfo_middle_name} ${previousTap.studentInfo_last_name}`}</Text>
                <View style={styles.nestedStudentData}>
                  <Text style={styles.studentTitle}>TUPT ID: </Text>
                  <Text style={styles.studentData}>{previousTap.studentInfo_tuptId}</Text>
                </View>
                <View style={styles.nestedStudentData}>
                  <Text style={styles.studentTitle}>Course: </Text>
                  <Text style={styles.studentData}>{previousTap.studentInfo_course}</Text>
                </View>
                <View style={styles.nestedStudentData}>
                  <Text style={styles.studentTitle}>Section: </Text>
                  <Text style={styles.studentData}>{previousTap.studentInfo_section}</Text>
                </View>
                <View style={styles.nestedStudentData}>
                  <Text style={styles.studentTitle}>Device: </Text>
                  <Text style={styles.studentData}>{previousTap.device_brand}</Text>
                </View>
                <View style={styles.nestedStudentData}>
                  <Text style={styles.studentTitle}>Serial No: </Text>
                  <Text style={styles.studentData}>{previousTap.device_serialNumber}</Text>
                </View>
                <View style={styles.nestedStudentData}>
                  <Text style={styles.studentTitle}>Time: </Text>
                  <Text style={styles.studentData}>{previousTap.taggedAt}</Text>
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.noStudentInfoText}>Tap your RFID tag</Text>
          )}
        </View>

      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showExcessiveTappingModal}
        onRequestClose={() => setShowExcessiveTappingModal(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              You've already tapped your RFID card. Please wait for a minute before tapping again.
            </Text>
            <TouchableOpacity
              style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
              onPress={() => setShowExcessiveTappingModal(false)}
            >
              <Text style={styles.textStyle}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Gatepass;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
  },
  scrollViewContainer: {
    flex: 1,
  },
  displayText: {
    color: 'black',
    fontSize: responsiveSize(22),
    fontWeight: 'bold',
    marginLeft: responsiveSize(20),
    marginTop: responsiveSize(30),
    marginBottom: responsiveSize(20),
    letterSpacing: responsiveSize(1),
  },
  tapContainer: {
    backgroundColor: '#fff',
    marginHorizontal: responsiveSize(30),
    marginBottom: responsiveSize(20),
    elevation: 2,
    borderRadius: responsiveSize(12),
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "black",
    shadowOpacity: 0.3,
  },
  studentInfoContainer: {
    flexDirection: 'row',
  },
  studentProfile: {
    width: responsiveSize(50),
    height: responsiveSize(50),
    resizeMode: 'cover',
    margin: responsiveSize(15),
    borderRadius: responsiveSize(100),
  },
  studentDataContainer: {
    marginTop: responsiveSize(20),
  },
  studentName: {
    color: 'black',
    fontSize: responsiveSize(18),
    fontWeight: 'bold',
    marginBottom: responsiveSize(15),
  },
  nestedStudentData: {
    flexDirection: 'row',
    marginBottom: responsiveSize(10),
  },
  studentTitle: {
    fontSize: responsiveSize(16),
    color: 'black',
    fontWeight: 'bold',
  },
  studentData: {
    color: 'black',
    fontSize: responsiveSize(16),
    width: responsiveSize(220),
    marginLeft: responsiveSize(2),
  },
  noStudentInfoText: {
    color: 'black',
    height: responsiveSize(100),
    fontSize: responsiveSize(18),
    fontWeight: 'bold',
    marginLeft: responsiveSize(20),
    marginTop: responsiveSize(20),
    paddingBottom: responsiveSize(20),
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
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: responsiveSize(20),
    padding: responsiveSize(10),
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: responsiveSize(15),
    textAlign: "center"
  }
});
