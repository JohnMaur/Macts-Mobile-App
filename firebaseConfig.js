// firebaseConfig.js

import firebase from 'firebase/compat/app'
import 'firebase/compat/storage'

const firebaseConfig = {
  apiKey: "AIzaSyAa7W_8WIm1PR4SeV513SmrzHLIMVwWcxU",
  authDomain: "insertimage-97b1f.firebaseapp.com",
  projectId: "insertimage-97b1f",
  storageBucket: "insertimage-97b1f.appspot.com",
  messagingSenderId: "755402906087",  
  appId: "1:755402906087:web:742801de9fd5db45a44542"
};

// Check if Firebase is not already initialized before initializing it
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase };

