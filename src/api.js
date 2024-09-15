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
