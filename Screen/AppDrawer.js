import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Image, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import axios from 'axios';

import StudentInfo from './Student_Info/StudentInfo';
import StudentRegistration from './Student_Info/StudentRegistration';
import UpdateInfo from './Student_Info/UpdateInfo';
import StudentAddDevice from './Student_Info/StudentAddDevice';
import UpdateDeviceInfo from './Student_Info/UpdateDeviceInfo';

import AttendanceReport from './Report/AttendanceReport';
import LibraryReport from './Report/LibraryReport';
import GymReport from './Report/GymReport';
import RegistrarReport from './Report/RegistrarReport';
import GatepassReport from './Report/GatepassReport';

import Attendance_code from './Dashboard/Attendance_code';
import Attendance from './Dashboard/Attendance';
import Library from './Dashboard/Library';
import Gym from './Dashboard/Gym';
import Gatepass from './Dashboard/Gatepass';
import Registrar from './Dashboard/Registrar';

import ReportDropdown from './ReportDropdown';
import DashboardDropdown from './DashboardDropdown';

const Drawer = createDrawerNavigator();

// Get the screen dimensions
const screenWidth = Dimensions.get('window').width;

// Calculate the responsive font size based on the screen width
const responsiveSize = (fontSize) => {
  const standardScreenWidth = 400; // Standard screen width (iPhone 8 width)
  const scaleFactor = screenWidth / standardScreenWidth;
  return Math.round(fontSize * scaleFactor);
};

const CustomDrawerContent = ({ navigation, state, username, user_id, tagValue }) => {
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    let intervalId;

    const fetchStudentData = async () => {
      try {
        const response = await axios.get(`http://192.168.144.90:2525/studentinfo/${user_id}`);
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setStudentProfile(response.data[0].student_profile);
        } else {
          console.log('No student data found.');
        }
      } catch (error) {
        console.error('Error fetching student information:', error);
      }
    };

    fetchStudentData();

    // Polling every 10 seconds for changes
    intervalId = setInterval(fetchStudentData, 10000);

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [user_id]);

  const logOutNav = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          <View style={styles.profileContainer}>

            <TouchableOpacity style={styles.profileCircleRadius}>
              <Image
                source={studentProfile ? { uri: studentProfile } : require('../img/user.png')}
                style={styles.profileIcon}
              />
            </TouchableOpacity>

            <Text style={styles.profileName}>{username}</Text>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: state.routes[state.index].name === 'StudentInfo' ? '#2196F3' : '#1B1A1E',
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 5,
            }}
            onPress={() => navigation.navigate('StudentInfo', { user_id: user_id })}
          >
            <View style={styles.navContainer}>
              <Image
                source={require('../img/nav-icon/student_info.png')}
                style={styles.drawerIcon}
              />
              <Text style={styles.drawerLabel}>Profile</Text>
            </View>
          </TouchableOpacity>

          <DashboardDropdown navigation={navigation} user_id={user_id} state={state} />
          <ReportDropdown navigation={navigation} user_id={user_id} state={state} />

          <TouchableOpacity
            style={{
              backgroundColor: state.routes[state.index].name === 'Device Registration' ? '#2196F3' : '#1B1A1E',
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 5,
            }}
            onPress={() => navigation.navigate('Device Registration', { user_id: user_id })}
          >
            <View style={styles.navContainer}>
              <Image
                source={require('../img/nav-icon/deviceIcon.png')}
                style={styles.drawerIcon}
              />
              <Text style={styles.drawerLabel}>Device Registration</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <TouchableOpacity onPress={logOutNav}>
        <Text style={styles.logOutButton}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export const AppDrawer = ({ route }) => {
  const { username, user_id, tagValue } = route.params;

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} username={username} user_id={user_id} tagValue={tagValue} />}
      screenOptions={{
        headerStyle: {
          // backgroundColor: "#25242B",#1E1E1E, #001529
          backgroundColor: "#1B1A1E",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: 'bold',
          letterSpacing: 1,
        },
      }}
    >
      <Drawer.Screen
        name="StudentInfo"
        component={StudentInfo}
        initialParams={{ user_id: user_id }}
        options={{ title: 'My Profile' }}
      />
      <Drawer.Screen name="Attendance code" component={Attendance_code} />
      <Drawer.Screen name="Attendance" component={Attendance} />
      <Drawer.Screen name="Library" component={Library} />
      <Drawer.Screen name="Gym" component={Gym} />
      <Drawer.Screen name="Gatepass" component={Gatepass} />
      <Drawer.Screen name="Registrar" component={Registrar} />

      <Drawer.Screen name="Student Registration" component={StudentRegistration} />
      <Drawer.Screen name="Update Information" component={UpdateInfo} />
      <Drawer.Screen name="Device Registration" component={StudentAddDevice} />
      <Drawer.Screen name="Update" component={UpdateDeviceInfo} />

      <Drawer.Screen name="Attendance Report" component={AttendanceReport} />
      <Drawer.Screen name="Library Report" component={LibraryReport} />
      <Drawer.Screen name="Gym Report" component={GymReport} />
      <Drawer.Screen name="Registrar Report" component={RegistrarReport} />
      <Drawer.Screen name="Gatepass Report" component={GatepassReport} />
    </Drawer.Navigator>
  );
};

export default AppDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B1A1E',
    paddingTop: StatusBar.currentHeight,
    justifyContent: 'space-between',
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: responsiveSize(1),
    borderTopWidth: responsiveSize(1),
    borderColor: "#83818B",
    height: responsiveSize(100),
    marginBottom: responsiveSize(10),
    paddingHorizontal: responsiveSize(16),
  },
  profileCircleRadius: {
    width: responsiveSize(52),
    height: responsiveSize(52),
    borderRadius: responsiveSize(100),
    marginRight: responsiveSize(12),
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileIcon: {
    width: responsiveSize(50),
    height: responsiveSize(50),
    resizeMode: 'cover',
    borderRadius: responsiveSize(100),
  },
  profileName: {
    color: 'white',
    fontSize: responsiveSize(18),
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerIcon: {
    width: responsiveSize(20),
    height: responsiveSize(20),
    resizeMode: 'contain',
    marginRight: responsiveSize(10),
  },
  drawerLabel: {
    fontSize: responsiveSize(16),
    color: 'white',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  logOutButton: {
    color: 'white',
    backgroundColor: '#35343B',
    width: '80%',
    marginHorizontal: responsiveSize(30),
    padding: responsiveSize(10),
    textAlign: 'center',
    borderRadius: responsiveSize(10),
    fontSize: responsiveSize(16),
    fontWeight: 'bold',
    marginVertical: responsiveSize(30),
    letterSpacing: responsiveSize(1),
  },
});
