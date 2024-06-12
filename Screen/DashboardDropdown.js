import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';

// Get the screen dimensions
const screenWidth = Dimensions.get('window').width;

// Calculate the responsive font size based on the screen width
const responsiveSize = (fontSize) => {
  const standardScreenWidth = 400; // Standard screen width (iPhone 8 width)
  const scaleFactor = screenWidth / standardScreenWidth;
  return Math.round(fontSize * scaleFactor);
};

const DashboardDropdown = ({ navigation, user_id, state }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (screen) => {
    setIsOpen(false); // Close the dropdown when navigating
    navigation.navigate(screen, { user_id });
  };

  // Check if any of the items in the dropdown menu matches the active route
  const isActiveRoute = (routeName) => {
    return state.routes[state.index].name === routeName;
  };

  const isDropdownActive =
    isOpen ||
    isActiveRoute('Attendance code') ||
    isActiveRoute('Library') ||
    isActiveRoute('Registrar') ||
    isActiveRoute('Gatepass') ||
    isActiveRoute('Gym');

  const isAnyDropdownItemActive =
    isActiveRoute('Attendance code') ||
    isActiveRoute('Library') ||
    isActiveRoute('Registrar') ||
    isActiveRoute('Gatepass') ||
    isActiveRoute('Gym');

  const shouldCloseDropdown = isOpen && isAnyDropdownItemActive;

  if (shouldCloseDropdown) {
    setIsOpen(false);
  }

  return (
    <View>
      <TouchableOpacity onPress={handleToggle} style={styles.dropdownToggle}>
        <View style={styles.navMainContainer}>
          <View style={styles.navContainer}>
            <Image
              source={require('../img/nav-icon/dashboardIcon.png')}
              style={styles.drawerIcon}
            />
            <Text style={styles.drawerLabel}>Dashboard</Text>
          </View>

          <Image
            source={isOpen ? require('../img/nav-icon/arrow-up.png') : require('../img/nav-icon/arrow-down.png')}
            style={styles.drawerIcon}
          />
        </View>

      </TouchableOpacity>
      {isDropdownActive && (
        <View style={styles.dropdownContent}>
          <TouchableOpacity
            style={{
              ...styles.dropdownItem,
              backgroundColor: isActiveRoute('Attendance code') ? '#2196F3' : '#1E1E1E',
            }}
            onPress={() => handleNavigation('Attendance code')}
          >
            <Text style={styles.dropdownItemText}>Attendance</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              ...styles.dropdownItem,
              backgroundColor: isActiveRoute('Library') ? '#2196F3' : '#1E1E1E',
            }}
            onPress={() => handleNavigation('Library')}
          >
            <Text style={styles.dropdownItemText}>Library</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              ...styles.dropdownItem,
              backgroundColor: isActiveRoute('Gym') ? '#2196F3' : '#1E1E1E',
            }}
            onPress={() => handleNavigation('Gym')}
          >
            <Text style={styles.dropdownItemText}>Gym</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              ...styles.dropdownItem,
              backgroundColor: isActiveRoute('Registrar') ? '#2196F3' : '#1E1E1E',
            }}
            onPress={() => handleNavigation('Registrar')}
          >
            <Text style={styles.dropdownItemText}>Registrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              ...styles.dropdownItem,
              backgroundColor: isActiveRoute('Gatepass') ? '#2196F3' : '#1E1E1E',
            }}
            onPress={() => handleNavigation('Gatepass')}
          >
            <Text style={styles.dropdownItemText}>Gatepass</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  dropdownToggle: {
    backgroundColor: '#1B1A1E',
    paddingVertical: responsiveSize(16),
    paddingHorizontal: responsiveSize(16),
    borderRadius: responsiveSize(5),
  },
  dropdownContent: {
    backgroundColor: '#25242B',
  },
  dropdownItem: {
    paddingVertical: responsiveSize(12),
    paddingHorizontal: responsiveSize(16),
  },
  dropdownItemText: {
    fontSize: responsiveSize(16),
    color: 'white',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginLeft: responsiveSize(25),
    paddingVertical: responsiveSize(2),
  },
  navMainContainer: {
    justifyContent: "space-between",
    flexDirection: "row",
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
});

export default DashboardDropdown;