import { collection, getDocs, query, limit } from "firebase/firestore";
import { fireDb } from "./firebase";

const FETCH_LIMIT = 100;

const fetchCollectionData = async (
  collectionName,
  limitCount = FETCH_LIMIT
) => {
  try {
    let q = query(collection(fireDb, collectionName), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error(`Error fetching ${collectionName} data:`, error);
    throw error;
  }
};

export const fetchDepartmentsData = () =>
  fetchCollectionData("departments", FETCH_LIMIT, );
export const fetchDoctorsData = () =>
  fetchCollectionData("doctors", FETCH_LIMIT, );
export const fetchSchedulesData = () =>
  fetchCollectionData("schedules", FETCH_LIMIT, );
export const fetchRegistrationData = () =>
  fetchCollectionData("registrations", FETCH_LIMIT, );
export const fetchPatientData = () =>
  fetchCollectionData("patients", FETCH_LIMIT, );
export const fetchUserData = () =>
  fetchCollectionData("users", FETCH_LIMIT, );
export const fetchProgressData = () =>
  fetchCollectionData("progress", FETCH_LIMIT, );
export const fetchRequestLeaveData = () =>
  fetchCollectionData("request_leave", FETCH_LIMIT, );
export const fetchNoticeData = () =>
  fetchCollectionData("hospital_announcement", FETCH_LIMIT, );

export const fetchDoctorsDataWithLimit = async (
  limitCount = 50,
) => {
  try {
    let q = query(collection(fireDb, "doctors"), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      uid: doc.uid,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching doctors data:", error);
    throw error;
  }
};
