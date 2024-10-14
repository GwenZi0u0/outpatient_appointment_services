import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchDoctorsData, fetchDepartmentsData } from "../../api";
import ProtectedLayout from "../../components/ProtectedLayout";
import Header from "../../components/Header";
import ProfileDemo from "./ProfileDemo";
import EditProfile from "./EditProfile";
import Loading from "../../assets/loading.gif";
import { useParams } from "react-router-dom";

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const { doctorId } = useParams();
  const {
    data: doctorData,
    refetch: refetchDoctorData,
    isLoading,
  } = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctorsData,
  });
  const { data: departmentData } = useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartmentsData,
    staleTime: Infinity,
  });

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingGif src={Loading} alt="載入中..." />
      </LoadingContainer>
    );
  }

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
  const canAccessProfile = user && user.uid === doctorId;

  if (user && canAccessProfile) {
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const LoadingGif = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;
`;
