import { create } from "zustand";
import { createContext, useContext } from "react";
import {
  useQueries,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  fetchDepartmentsData,
  fetchDoctorsData,
  fetchScheduleData,
  fetchRegistrationData,
  fetchPatientData,
  fetchUserData,
  fetchProgressData,
} from "../api";

const queryClient = new QueryClient();

const useStore = create((set) => ({
  departmentData: [],
  doctorData: [],
  scheduleData: [],
  registrationData: [],
  patientData: [],
  userData: [],
  progressData: [],
  setData: (key, data) => set({ [key]: data }),
}));

const queries = [
  {
    queryKey: ["departments"],
    queryFn: fetchDepartmentsData,
    stateKey: "departmentData",
  },
  { queryKey: ["doctors"], queryFn: fetchDoctorsData, stateKey: "doctorData" },
  {
    queryKey: ["schedules"],
    queryFn: fetchScheduleData,
    stateKey: "scheduleData",
  },
  {
    queryKey: ["registrations"],
    queryFn: fetchRegistrationData,
    stateKey: "registrationData",
  },
  {
    queryKey: ["patients"],
    queryFn: fetchPatientData,
    stateKey: "patientData",
  },
  { queryKey: ["users"], queryFn: fetchUserData, stateKey: "userData" },
  {
    queryKey: ["progress"],
    queryFn: fetchProgressData,
    stateKey: "progressData",
  },
];

const useDataQueries = () => {
  const setData = useStore((state) => state.setData);

  const queryResults = useQueries({
    queries: queries.map(({ queryKey, queryFn, stateKey }) => ({
      queryKey,
      queryFn,
      onSuccess: (data) => setData(stateKey, data),
    })),
  });

  return queryResults;
};
export const refresh = () => {
  queries.forEach(({ queryKey }) => {
    queryClient.invalidateQueries(queryKey);
  });
};

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const queryResults = useDataQueries();

  return (
    <DataContext.Provider value={{ store: useStore, queries: queryResults }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const AppDataProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <DataProvider>{children}</DataProvider>
    </QueryClientProvider>
  );
};

export const useDepartmentData = () => {
  const { store, queries } = useData();
  return {
    data: store((state) => state.departmentData),
    ...queries.departmentData,
  };
};

export const useDoctorData = () => {
  const { store, queries } = useData();
  return {
    data: store((state) => state.doctorData),
    ...queries.doctorData,
  };
};

export const useScheduleData = () => {
  const { store, queries } = useData();
  return {
    data: store((state) => state.scheduleData),
    ...queries.scheduleData,
  };
};

export const useRegistrationData = () => {
  const { store, queries } = useData();
  return {
    data: store((state) => state.registrationData),
    ...queries.registrationData,
  };
};

export const usePatientData = () => {
  const { store, queries } = useData();
  return {
    data: store((state) => state.patientData),
    ...queries.patientData,
  };
};

export const useUserData = () => {
  const { store, queries } = useData();
  return {
    data: store((state) => state.userData),
    ...queries.userData,
  };
};

export const useProgressData = () => {
  const { store, queries } = useData();
  return {
    data: store((state) => state.progressData),
    ...queries.progressData,
  };
};
