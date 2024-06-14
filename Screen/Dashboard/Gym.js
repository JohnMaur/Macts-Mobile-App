import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, SafeAreaView, Dimensions, Modal, TouchableOpacity } from 'react-native';
import io from 'socket.io-client';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;

const responsiveSize = (fontSize) => {
  const standardScreenWidth = 400;
  const scaleFactor = screenWidth / standardScreenWidth;
  return Math.round(fontSize * scaleFactor);
};

const Gym = ({ route }) => {
  const { user_id } = route.params;

  const [tagData, setTagData] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [currentTap, setCurrentTap] = useState(null);
  const [previousTap, setPreviousTap] = useState(null);
  const [isCooldown, setIsCooldown] = useState(false);
  const [showExcessiveTappingModal, setShowExcessiveTappingModal] = useState(false);
  const [setting, setSetting] = useState(null); // Added state for setting
  const [tapStatus, setTapStatus] = useState(null); // New state for tap status

  useEffect(() => {
    const gymSocket = io('http://192.168.111.90:3030');

    const handleTagData = (data, source) => {
      console.log(`Received tag data from ${source}:`, data);
      setTagData(prevTagData => [...prevTagData, data]);

      // Check if cooldown is active
      if (isCooldown && data === studentInfo.tagValue) {
        console.log("Excessive tapping detected. Please wait for a minute before tapping again.");
        setShowExcessiveTappingModal(true);
        return;
      }

      // Compare fetched student info with tagValue
      if (data === studentInfo.tagValue) {
        setIsCooldown(true); // Activate cooldown
        setTimeout(() => {
          setIsCooldown(false); // Deactivate cooldown after 1 minute
        }, 1000); // 1 minute cooldown

        // // Set previousTap before updating currentTap
        setPreviousTap(currentTap ? { ...currentTap, setting: setting + (tapStatus ? ` - ${tapStatus}` : '') } : null);
        setCurrentTap({ ...studentInfo, taggedAt: new Date().toLocaleString('en-US') });


        setSetting(source); // Set the setting based on the source
      } else {
        console.log("Tag value doesn't match the student information.");
      }
    };

    gymSocket.on('tagData', data => handleTagData(data, 'Gym'));

    return () => {
      gymSocket.disconnect();
    };
  }, [studentInfo, isCooldown, currentTap]);

  useEffect(() => {
    const excessiveTappingTimer = setTimeout(() => {
      setShowExcessiveTappingModal(false);
    }, 1000); // 60 seconds

    return () => clearTimeout(excessiveTappingTimer);
  }, [showExcessiveTappingModal]);


  useEffect(() => {
    if (currentTap) {
      if (setting === 'Gym') {
        gymTapHistory(currentTap);
      }
    }
  }, [currentTap, setting]);


  const fetchStudentInfo = async () => {
    try {
      const response = await axios.get(`http://192.168.111.90:2525/studentinfo/${user_id}`);
      const fetchedStudentInfo = response.data[0];
      setStudentInfo(fetchedStudentInfo);
    } catch (error) {
      console.error('Error fetching student information:', error);
    }
  };

  const gymTapHistory = async (data) => {
    try {
      const response = await axios.post('http://192.168.111.90:2525/gym_history', {
        firstName: data.studentInfo_first_name,
        middleName: data.studentInfo_middle_name,
        lastName: data.studentInfo_last_name,
        tuptId: data.studentInfo_tuptId,
        course: data.studentInfo_course,
        section: data.studentInfo_section,
        email: data.user_email,
        user_id: data.user_id,
      });
      const { tapStatus } = response.data;
      setTapStatus(tapStatus); // Set tap status when available
    } catch (error) {
      console.error('Error inserting data into database:', error);
    }
  };

  useEffect(() => {
    fetchStudentInfo();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
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
                <Text style={styles.studentData}>{currentTap.user_email}</Text>
              </View>
              <View style={styles.nestedStudentData}>
                <Text style={styles.studentTitle}>Setting: </Text>
                <Text style={styles.studentData}>{!tapStatus ? setting : setting + " - " + tapStatus}</Text>
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
                <Text style={styles.studentData}>{previousTap.user_email}</Text>
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

export default Gym;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
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
