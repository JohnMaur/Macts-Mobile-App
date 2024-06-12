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

const RegistrarReport = ({ route }) => {
  const { user_id } = route.params;
  const [rfidData, setRfidData] = useState([]); // State variable to store the fetched RFID data

  // Function to fetch RFID data from the server
  const fetchRfidData = async () => {
    try {
      const response = await axios.get(`http://192.168.111.90:2525/registrar_tapHistory/${user_id}`);
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
          <Text style={styles.cellText}>{item.registrar_tupID}</Text>
        </View>

        <View style={[styles.cell, { width: responsiveSize(200) }]}>
          <Text style={styles.cellText}>{`${item.registrar_firstname} ${item.registrar_middlename} ${item.registrar_lastname} `}</Text>
        </View>

        <View style={[styles.cell, { width: responsiveSize(150) }]}>
          <Text style={styles.cellText}>{item.registrar_course}</Text>
        </View>

        <View style={[styles.cell, { width: responsiveSize(100), paddingLeft: responsiveSize(16) }]}>
          <Text style={styles.cellText}>{item.registrar_section}</Text>
        </View>

        <View style={[styles.cell, { width: responsiveSize(250) }]}>
          <Text style={styles.cellText}>{item.registrar_email}</Text>
        </View>

        <View style={[styles.cell, { width: responsiveSize(230) }]}>
          <Text style={styles.cellText}>{item.registrar_taphistoryDate}</Text>
        </View>

      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <ScrollView horizontal>
          <View style={styles.listContainer}>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { width: responsiveSize(50) }]}>NO.</Text>
              <Text style={[styles.headerTitle, { width: responsiveSize(150) }]}>TUPT-ID</Text>
              <Text style={[styles.headerTitle, { width: responsiveSize(200) }]}>Name</Text>
              <Text style={[styles.headerTitle, { width: responsiveSize(150) }]}>Course</Text>
              <Text style={[styles.headerTitle, { width: responsiveSize(100) }]}>Section</Text>
              <Text style={[styles.headerTitle, { width: responsiveSize(250) }]}>Email</Text>
              <Text style={[styles.headerTitle, { width: responsiveSize(230) }]}>Date</Text>
            </View>
            {/* <FlatList
              data={rfidData}
              renderItem={renderItem}
            /> */}
            {rfidData.length === 0 ? (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No data</Text>
              </View>
            ) : (
              <FlatList
                data={rfidData}
                renderItem={renderItem}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

export default RegistrarReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    paddingVertical: responsiveSize(20),
    paddingHorizontal: responsiveSize(20),
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
    borderColor: "#DDD",
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
    borderColor: "#DDD",
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