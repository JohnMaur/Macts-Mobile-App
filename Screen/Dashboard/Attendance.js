import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, Dimensions, Modal, TouchableOpacity, ScrollView } from 'react-native';
import io from 'socket.io-client';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook

const screenWidth = Dimensions.get('window').width;

const responsiveSize = (fontSize) => {
  const standardScreenWidth = 440;
  const scaleFactor = screenWidth / standardScreenWidth;
  return Math.round(fontSize * scaleFactor);
};

const Attendance = ({ route }) => {
  const { user_id } = route.params;
  const navigation = useNavigation();

  const [tagData, setTagData] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [currentTap, setCurrentTap] = useState(null);
  const [previousTap, setPreviousTap] = useState(null);
  const [showExcessiveTappingModal, setShowExcessiveTappingModal] = useState(false);
  const [excessiveTappingMessage, setExcessiveTappingMessage] = useState(''); 
  const [setting, setSetting] = useState(null);
  const [attendanceDescription, setAttendanceDescription] = useState(null); 
  const [showLeaveModal, setShowLeaveModal] = useState(false); 

  useEffect(() => {
    const attendanceSocket = io('wss://macts-attendance-production.up.railway.app');

    const handleTagData = (data) => {
      console.log('Received tag data:', data);
      setTagData(prevTagData => [...prevTagData, data]);

      if (data.excessiveTap && data.tagData === studentInfo?.tagValue) {
        setExcessiveTappingMessage("You've already tapped your RFID card. Please wait for a minute before tapping again.");
        setShowExcessiveTappingModal(true);
      } else if (data.tagData === studentInfo?.tagValue) {
        setPreviousTap(currentTap ? { ...currentTap, setting: setting } : null);
        setCurrentTap({ ...studentInfo, taggedAt: new Date().toLocaleString('en-US') });
        setSetting('Attendance');
      } else {
        console.log("Tag value doesn't match the student information.");
      }
    };

    attendanceSocket.on('tagData', handleTagData);

    return () => {
      attendanceSocket.disconnect();
    };
  }, [studentInfo, currentTap]);

  useEffect(() => {
    const excessiveTappingTimer = setTimeout(() => {
      setShowExcessiveTappingModal(false);
    }, 5000); // Hide modal after 5 seconds

    return () => clearTimeout(excessiveTappingTimer);
  }, [showExcessiveTappingModal]);

  const fetchStudentInfo = async () => {
    try {
      const response = await axios.get(`https://macts-backend-mobile-app-production.up.railway.app/studentinfo/${user_id}`);
      const fetchedStudentInfo = response.data[0];
      setStudentInfo(fetchedStudentInfo);
    } catch (error) {
      console.error('Error fetching student information:', error);
    }
  };

  useEffect(() => {
    fetchStudentInfo();
  }, []);

  const fetchAttendanceDescription = async () => {
    try {
      const response = await axios.get(`https://macts-backend-mobile-app-production.up.railway.app/attendanceDetails/${user_id}`);
      const fetchedStudentInfo = response.data;
      setAttendanceDescription(fetchedStudentInfo.attendance_description); // Set the attendance description
    } catch (error) {
      console.error('Error fetching student information:', error);
    }
  };

  useEffect(() => {
    fetchAttendanceDescription();
  }, []);

  const handleLeaveConfirm = async () => {
    setShowLeaveModal(false);
  
    try {
      await axios.post(`https://macts-backend-mobile-app-production.up.railway.app/update_attendance_code/${user_id}`, { code: '' });
      navigation.navigate('Attendance code', { user_id: user_id });
    } catch (error) {
      console.error('Error clearing attendance code:', error);
      // Handle error as needed
    }
  };

  const handleLeavePress = () => {
    setShowLeaveModal(true);
  };

  const handleLeaveCancel = () => {
    setShowLeaveModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.attendanceDescriptionContainer}>
          <Text style={styles.attendanceStyleText}>You are in: </Text>
          <Text style={[styles.attendanceStyleText, { fontWeight: "bold", width: "75%",}]}>{attendanceDescription}</Text>

        </View>

        <Text style={styles.displayText}>Current Tap</Text>
        <View style={styles.tapContainer}>
          {currentTap ? (
            <View style={styles.studentInfoContainer}>
              {currentTap.student_profile ? (
                <Image
                  source={{ uri: currentTap.student_profile }}
                  style={styles.studentProfile}
                />
              ) : (
                <Image
                  source={require('../../img/user.png')}
                  style={styles.studentProfile}
                />
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
                  <Text style={styles.studentTitle}>Email: </Text>
                  <Text style={{
                    color: 'black',
                    width: responsiveSize(230),
                    fontSize: responsiveSize(16),
                    marginLeft: responsiveSize(2),
                  }}>{currentTap.user_email}</Text>
                </View>
                <View style={styles.nestedStudentData}>
                  <Text style={styles.studentTitle}>Setting: </Text>
                  <Text style={styles.studentData}>{setting}</Text>
                </View>
                <View style={styles.nestedStudentData}>
                  <Text style={styles.studentTitle}>Time: </Text>
                  <Text style={styles.studentData}>{currentTap.taggedAt}</Text>
                </View>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.noStudentInfoText}>Tap your RFID tag</Text>
            </>
          )}
        </View>

        <Text style={styles.displayText}>Previous Tap</Text>
        <View style={styles.tapContainer}>
          {previousTap ? (
            <View style={styles.studentInfoContainer}>
              {previousTap.student_profile ? (
                <Image
                  source={{ uri: currentTap.student_profile }}
                  style={styles.studentProfile}
                />
              ) : (
                <Image
                  source={require('../../img/user.png')}
                  style={styles.studentProfile}
                />
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
                  <Text style={styles.studentTitle}>Email: </Text>
                  <Text style={{
                    color: 'black',
                    width: responsiveSize(230),
                    fontSize: responsiveSize(16),
                    marginLeft: responsiveSize(2),
                  }}>{previousTap.user_email}</Text>
                </View>
                <View style={styles.nestedStudentData}>
                  <Text style={styles.studentTitle}>Setting: </Text>
                  <Text style={styles.studentData}>{previousTap.setting}</Text>
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleLeavePress}>
        <Text style={styles.backButtonText}>Leave</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showLeaveModal}
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Click "Yes" to leave this attendance session</Text>
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleLeaveConfirm}>
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, {backgroundColor: "#808080"}]} onPress={handleLeaveCancel}>
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showExcessiveTappingModal}
        onRequestClose={() => {
          setShowExcessiveTappingModal(false);
        }}
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

export default Attendance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
  },
  attendanceDescriptionContainer: {
    flexDirection: "row",
    margin: responsiveSize(10),
    marginHorizontal: responsiveSize(20),
    marginBottom: responsiveSize(20),
    
  },
  attendanceStyleText: {
    fontSize: responsiveSize(22),
  },
  displayText: {
    color: 'black',
    fontSize: responsiveSize(22),
    fontWeight: 'bold',
    marginLeft: responsiveSize(20),
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
  },
  backButton: {
    marginVertical: responsiveSize(25),
    paddingVertical: responsiveSize(12),
    borderRadius: responsiveSize(15),
    backgroundColor: 'black',
    alignItems: 'center',
    width: '85%',
    alignSelf: 'center',
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: responsiveSize(16),
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: responsiveSize(20),
    backgroundColor: 'white',
    borderRadius: responsiveSize(10),
    alignItems: 'center',
  },
  modalText: {
    fontSize: responsiveSize(18),
    marginBottom: responsiveSize(20),
    textAlign: 'center',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: responsiveSize(5),
    padding: responsiveSize(10),
    backgroundColor: '#3498db',
    borderRadius: responsiveSize(5),
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: responsiveSize(16),
  },
  
});

