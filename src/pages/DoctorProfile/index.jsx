import { useAuth } from "../../contexts/AuthContext";
import ProtectedLayout from "../../components/ProtectedLayout";
import Header from "../../components/Header";
import ProfileDemo from "./ProfileDemo";
import EditProfile from "./EditProfile";

export default function DoctorProfilePage() {
  const { user } = useAuth();

  function calculateAge(timestamp) {
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
        <EditProfile calculateAge={calculateAge} />
      </>
    );
  } else {
    return (
      <>
        <Header />
        <ProfileDemo calculateAge={calculateAge} />
      </>
    );
  }
}
