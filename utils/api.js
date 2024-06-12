// utils/api.js
import axios from 'axios';

export const fetchUserData = async () => {
  try {
    const response = await axios.get('http://192.168.100.138:2525/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};
