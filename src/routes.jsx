import { createBrowserRouter } from "react-router-dom";
import Header from "./components/layout/Header";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import AppointmentPage from "./pages/Appointment";
import CancelRegistrationPage from "./pages/CancelRegistration";
import ClassSchedulePage from "./pages/ClassSchedule";
import ControlProgressPage from "./pages/ControlProgress";
import DoctorProfilePage from "./pages/DoctorProfile";
import LoginPage from "./pages/Login";
import NotFoundPage from "./pages/NotFound";
import ProgressPage from "./pages/Progress";
import RegistrationPage from "./pages/Registration";

export const router = createBrowserRouter([
  {
    element: <Header />,
    children: [
      {
        path: "/",
        element: <RegistrationPage />,
      },
      {
        path: "appointment",
        element: <AppointmentPage />,
      },
      {
        path: "progress",
        element: <ProgressPage />,
      },
      {
        path: "cancel-registration",
        element: <CancelRegistrationPage />,
      },
    ],
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "doctor-profile/:doctorId",
    element: <DoctorProfilePage />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "control-progress",
        element: <ControlProgressPage />,
      },
      {
        path: "class-schedule",
        element: <ClassSchedulePage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
