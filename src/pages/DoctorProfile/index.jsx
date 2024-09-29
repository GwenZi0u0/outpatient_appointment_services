import { useAuth } from "../../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchDoctorsData, fetchDepartmentsData } from "../../api";
import ProtectedLayout from "../../components/ProtectedLayout";
import Header from "../../components/Header";
import ProfileDemo from "./ProfileDemo";
import EditProfile from "./EditProfile";

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const { data: doctorData, refetch: refetchDoctorData } = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctorsData,
  });
  const { data: departmentData } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartmentsData,
  });

  function calculateAge(timestamp) {
    if (!timestamp) return null;
    const { seconds, nanoseconds } = timestamp;
    const birthDate = new Date(
      seconds * 1000 + Math.floor(nanoseconds / 1000000)
    );
    const currentDate = new Date();
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    const dayDiff = currentDate.getDate() - birthDate.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age;
  }

  if (user) {
    return (
      <>
        <ProtectedLayout />
        <EditProfile
          calculateAge={calculateAge}
          user={user}
          doctorData={doctorData}
          departmentData={departmentData}
          refetchDoctorData={refetchDoctorData}
        />
      </>
    );
  } else {
    return (
      <>
        <Header />
        <ProfileDemo
          calculateAge={calculateAge}
          doctorData={doctorData}
          departmentData={departmentData}
        />
      </>
    );
  }
}
