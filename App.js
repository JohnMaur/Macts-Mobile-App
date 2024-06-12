import React, { useEffect, useRef } from 'react'; // Import useRef
import { BackHandler } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './Screen/Login/Login';
import SignUp from './Screen/Login/SignUp';
import { AppDrawer } from './Screen/AppDrawer';

const Stack = createStackNavigator();

const App = () => {
  const navigationRef = useRef(null); // Define navigationRef using useRef

  useEffect(() => {
    const backAction = () => {
      // Check if the current screen is AppDrawer, if true, prevent default behavior
      if (navigationRef.current && navigationRef.current.getCurrentRoute().name === 'AppDrawer') {
        return true; // Return true to prevent default behavior (i.e., going back)
      }
      return false; // Return false to allow default behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove(); // Cleanup function to remove event listener

  }, []); // Run this effect only once when the component mounts

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
        <Stack.Screen 
          name="AppDrawer" 
          component={AppDrawer} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

// import React, { useEffect, useRef } from 'react';
// import { BackHandler, StatusBar } from 'react-native'; // Import StatusBar
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import Login from './Screen/Login/Login';
// import SignUp from './Screen/Login/SignUp';
// import { AppDrawer } from './Screen/AppDrawer';

// const Stack = createStackNavigator();

// const App = () => {
//   const navigationRef = useRef(null);

//   useEffect(() => {
//     const backAction = () => {
//       if (navigationRef.current && navigationRef.current.getCurrentRoute().name === 'AppDrawer') {
//         return true;
//       }
//       return false;
//     };

//     const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

//     return () => backHandler.remove();

//   }, []);

//   // Customize status bar appearance
//   useEffect(() => {
//     StatusBar.setBackgroundColor('#FFFFFF');
//     StatusBar.setBarStyle('dark-content');
//   }, []); // Run this effect only once when the component mounts

//   return (
//     <NavigationContainer ref={navigationRef}>
//       <Stack.Navigator initialRouteName="Login">
//         <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
//         <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
//         <Stack.Screen 
//           name="AppDrawer" 
//           component={AppDrawer} 
//           options={{ headerShown: false }}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// export default App;
