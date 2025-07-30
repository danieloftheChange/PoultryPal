import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDBh9rpCHpeyr8mdW5UgtTbaYV4SxgjniY",
  authDomain: "health-management-system-5ef79.firebaseapp.com",
  projectId: "health-management-system-5ef79",
  storageBucket: "health-management-system-5ef79.appspot.com",
  messagingSenderId: "67718641625",
  appId: "1:67718641625:web:d091b939bdf716ea228bc8"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
