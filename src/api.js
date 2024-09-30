import { collection, getDocs, query, limit } from "firebase/firestore";
import { fireDb } from "./firebase";

const fetchCollectionData = async (collectionName, limitCount = 100) => {
  try {
    const q = query(collection(fireDb, collectionName), limit(limitCount));
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

export const fetchDepartmentsData = () => fetchCollectionData("departments");
export const fetchDoctorsData = () => fetchCollectionData("doctors");
export const fetchSchedulesData = () => fetchCollectionData("schedules");
export const fetchRegistrationData = () => fetchCollectionData("registrations");
export const fetchPatientData = () => fetchCollectionData("patients");
export const fetchUserData = () => fetchCollectionData("users");
export const fetchProgressData = () => fetchCollectionData("progress");
export const fetchRequestLeaveData = () => fetchCollectionData("request_leave");
export const fetchNoticeData = () => fetchCollectionData("hospital_announcement");

export const fetchDoctorsDataWithLimit = async (limitCount = 50) => {
  try {
    const q = query(collection(fireDb, "doctors"), limit(limitCount));
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