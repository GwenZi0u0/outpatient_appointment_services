import { createBrowserRouter, RouterProvider } from "react-router-dom";
import GlobalStyles from "./styles/GlobalStyles";
import Header from "./components/Header";
import RegistrationPage from "./pages/Registration";
import AppointmentPage from "./pages/Appointment";
import ProgressPage from "./pages/Progress";
import CancelRegistrationPage from "./pages/CancelRegistration";
import LoginPage from "./pages/Login";
import ProtectedLayout from "./components/ProtectedLayout";
import ControlProgressPage from "./pages/ControlProgress";
import ClassSchedulePage from "./pages/ClassSchedule";
import DoctorProfilePage from "./pages/DoctorProfile";
import NotFoundPage from "./pages/NotFound";

const router = createBrowserRouter([
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
      {
        path: "doctor-profile",
        element: <DoctorProfilePage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default function App() {
  return (
    <>
      <GlobalStyles />
      <RouterProvider router={router} />
    </>
  );
}