import { collection, getDocs } from "firebase/firestore";
import { fireDb } from "./firebase";

export const fetchDepartmentsData = async () => {
  const querySnapshot = await getDocs(collection(fireDb, "departments"));
  const departments = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return departments;
};

export const fetchDoctorsData = async () => {
  const querySnapshot = await getDocs(collection(fireDb, "doctors"));
  const doctors = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return doctors;
};

export const fetchScheduleData = async () => {
  const querySnapshot = await getDocs(collection(fireDb, "schedules"));
  const schedules = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return schedules;
};

export const fetchRegistrationData = async () => {
  const querySnapshot = await getDocs(collection(fireDb, "registrations"));
  const registrations = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return registrations;
};

export const fetchPatientData = async () => {
  const querySnapshot = await getDocs(collection(fireDb, "patients"));
  const patients = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return patients;
};
