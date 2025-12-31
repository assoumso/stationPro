
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { StationData } from "../types";
import { INITIAL_DATA } from "../constants";

const firebaseConfig = {
  apiKey: "AIzaSyClLvHS1eB8cFNoOJpGFFcgqXF2p2AdHfs",
  authDomain: "stationpro-485ee.firebaseapp.com",
  projectId: "stationpro-485ee",
  storageBucket: "stationpro-485ee.firebasestorage.app",
  messagingSenderId: "697275524668",
  appId: "1:697275524668:web:ff531782f3f48fe8dc8539",
  measurementId: "G-K7PQG1Z3GL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Nous utilisons un document unique pour stocker l'état global de la station pour cette version
const STATION_DOC_ID = "main_station_data";
const stationRef = doc(db, "appData", STATION_DOC_ID);

export const subscribeToStationData = (callback: (data: StationData) => void) => {
  return onSnapshot(stationRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as StationData);
    } else {
      // Si le document n'existe pas encore, on l'initialise
      setDoc(stationRef, INITIAL_DATA);
      callback(INITIAL_DATA);
    }
  });
};

export const updateStationData = async (newData: StationData) => {
  try {
    await setDoc(stationRef, newData);
  } catch (error) {
    console.error("Error updating Firestore:", error);
  }
};
