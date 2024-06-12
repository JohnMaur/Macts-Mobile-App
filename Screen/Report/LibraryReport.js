import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, FlatList, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios'; // Import Axios for making HTTP requests

// Get the screen dimensions
const screenWidth = Dimensions.get('window').width;

// Calculate the responsive font size based on the screen width
const responsiveSize = (fontSize) => {
  const standardScreenWidth = 400;
  const scaleFactor = screenWidth / standardScreenWidth;
  const responsiveSize = Math.round(fontSize * scaleFactor);
  return responsiveSize;
};

const LibraryReport = ({ route }) => {
  const { user_id } = route.params;
  const [rfidData, setRfidData] = useState([]); // State variable to store the fetched RFID data

  // Function to fetch RFID data from the server
  const fetchRfidData = async () => {
    try {
      const response = await axios.get(`http://192.168.111.90:2525/library_tapHistory/${user_id}`);
      // setRfidData(response.data); // Update the state with the fetched data
      setRfidData(response.data.reverse()); // Reverse the order of fetched data
    } catch (error) {
      console.error('Error fetching RFID data:', error);
    }
  };

  // Fetch RFID data when the component mounts
  useEffect(() => {
    fetchRfidData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchRfidData();
    }, [])
  );

  const renderItem = ({ item, index }) => {
    const autoIncrementNumber = index + 1;

    return (
      <View style={styles.data}>
        <View style={[styles.cell, { width: responsiveSize(50) }]}>
          <Text style={styles.cellText}>{autoIncrementNumber}</Text>
        </View>

        <View style={[styles.cell, { width: responsiveSize(150) }]}>
          <Text style={styles.cellText}>{item.library_tupId}</Text>
        </View>

        <View style={[styles.cell, { width: responsiveSize(200) }]}>
          <Text style={styles.cellText}>{`${item.library_firstName} ${item.library_middleName} ${item.library_lastName} `}</Text>
        </View>

        <View style={[styles.cell, { width: responsiveSize(150) }]}>
          <Text style={styles.cellText}>{item.library_course}</Text>
        </View>

        <View style={[styles.cell, { width: responsiveSize(100), paddingLeft: responsiveSize(16) }]}>
          <Text style={styles.cellText}>{item.library_section}</Text>
        </View>

        <View style={[styles.cell, { width: responsiveSize(200) }]}>
          <Text style={styles.cellText}>{item.library_InHistoryDate}</Text>
        </View>

        <View style={[styles.cell, { width: responsiveSize(200) }]}>
          <Text style={styles.cellText}>{item.library_OutHistoryDate}</Text>
        </View>

      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.horizontalContainer} horizontal>
          <View style={styles.listContainer}>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { width: responsiveSize(50) }]}>NO.</Text>
              <Text style={[styles.headerTitle, { width: responsiveSize(150) }]}>TUPT-ID</Text>
              <Text style={[styles.headerTitle, { width: responsiveSize(200) }]}>Name</Text>
              <Text style={[styles.headerTitle, { width: responsiveSize(150) }]}>Course</Text>
              <Text style={[styles.headerTitle, { width: responsiveSize(100) }]}>Section</Text>
              <Text style={[styles.headerTitle, { width: responsiveSize(200) }]}>Time In</Text>
              <Text style={[styles.headerTitle, { width: responsiveSize(200) }]}>Time Out</Text>
            </View>
            <FlatList
              data={rfidData}
              renderItem={renderItem}
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default LibraryReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DDDDDD',
  },
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    paddingVertical: responsiveSize(30),
  },
  horizontalContainer: {
    backgroundColor: "white",
    marginLeft: responsiveSize(15),
    marginRight: responsiveSize(15),
    borderRadius: responsiveSize(10),
    flex: 1,
  },
  titleText: {
    color: "white",
    fontSize: responsiveSize(25),
    marginTop: responsiveSize(15),
    marginStart: responsiveSize(25),
    marginBottom: responsiveSize(15),
  },
  listContainer: {
    flex: 1,
    marginTop: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: responsiveSize(1),
    borderColor: "white",
    paddingVertical: responsiveSize(18),
    padding: responsiveSize(10),
  },
  headerTitle: {
    fontSize: responsiveSize(16),
    color: "black",
    fontWeight: "bold",
    textAlign: "left",
    flex: 1,
  },
  data: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: responsiveSize(10),
    borderBottomWidth: responsiveSize(1),
    borderColor: "white",
  },
  cell: {
    height: responsiveSize(40),
    justifyContent: "center",
    flex: 1,
  },
  cellText: {
    fontSize: responsiveSize(16),
    color: "black",
    textAlign: "left",
  }
});