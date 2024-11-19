import { create } from "zustand";

const useAppointmentStore = create((set) => ({
  step: 1,
  showPopup: false,
  popupMessage: "",
  setStep: (newStep) => set({ step: newStep }),
  setShowPopup: (newShowPopup) => set({ showPopup: newShowPopup }),
  setPopupMessage: (popupMessage) => set({ popupMessage }),
}));

const useRegistrationInformationStore = create((set) => ({
  idNumber: "",
  birthday: "",
  name: "",
  phone: "",
  setIdNumber: (value) => set({ idNumber: value }),
  setBirthday: (value) => set({ birthday: value }),
  setName: (value) => set({ name: value }),
  setPhone: (value) => set({ phone: value }),
}));

const useCancelRegistrationStore = create((set) => ({
  idNumber: "",
  error: "",
  isOpened: false,
  result: [],
  popupMessage: "",
  confirmAction: null,
  showPopup: false,
  setIdNumber: (idNumber) => set({ idNumber }),
  setError: (error) => set({ error }),
  setIsOpened: (isOpened) => set({ isOpened }),
  setResult: (result) => set({ result }),
  setPopupMessage: (popupMessage) => set({ popupMessage }),
  setConfirmAction: (confirmAction) => set({ confirmAction }),
  setShowPopup: (showPopup) => set({ showPopup }),
  resetState: () =>
    set({
      idNumber: "",
      error: "",
      isOpened: false,
      result: [],
      popupMessage: "",
      showPopup: false,
      confirmAction: null,
    }),
}));

const useProgressStore = create((set) => ({
  idNumber: "",
  error: "",
  isOpened: false,
  visibleRows: 5,
  setIdNumber: (idNumber) => set({ idNumber }),
  setError: (error) => set({ error }),
  setIsOpened: (isOpened) => set({ isOpened }),
  setVisibleRows: (visibleRows) => set({ visibleRows }),
  resetState: () =>
    set({
      idNumber: "",
      error: "",
      isOpened: false,
      visibleRows: 5,
    }),
}));

const useControlProgressStore = create((set) => ({
  isOpen: false,
  currentTime: new Date(),
  currentNumber: null,
  currentPeriod: null,
  period: "",
  selectedPeriod: null,
  setIsOpen: (isOpen) => set({ isOpen }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setCurrentNumber: (currentNumber) => set({ currentNumber }),
  setCurrentPeriod: (currentPeriod) => set({ currentPeriod }),
  setPeriod: (period) => set({ period }),
  toggleIsOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),
}));

const useEditProfile = create((set) => ({
  showPopup: false,
  popupMessage: "",
  confirmMessage: "",
  currentAction: null,
  setShowPopup: (show) => set({ showPopup: show }),
  setPopupMessage: (message) => set({ popupMessage: message }),
  setConfirmMessage: (message) => set({ confirmMessage: message }),
  setCurrentAction: (action) => set({ currentAction: action }),
}));

const useClassSchedule = create((set) => ({
  selectedDateTimes: [],
  leaveDayToCancel: [],
  showPopup: false,
  popupMessage: "",
  confirmMessage: "",
  setShowPopup: (show) => set({ showPopup: show }),
  setPopupMessage: (message) => set({ popupMessage: message }),
  setConfirmMessage: (message) => set({ confirmMessage: message }),
  setLeaveDayToCancel: (days) => set({ leaveDayToCancel: days }),
  setSelectedDateTimes: (updater) =>
    set((state) => {
      const newSelectedDateTimes = updater(state.selectedDateTimes);
      return { selectedDateTimes: newSelectedDateTimes };
    }),
  toggleDateTime: (firebaseTimestamp, time) =>
    set((state) => {
      const prevState = state.selectedDateTimes;
      const dateIndex = prevState.findIndex(
        (item) => item.date.seconds === firebaseTimestamp.seconds
      );
      let newState;

      if (dateIndex === -1) {
        newState = [...prevState, { date: firebaseTimestamp, times: [time] }];
      } else {
        const updatedTimes = [...prevState[dateIndex].times];
        const timeIndex = updatedTimes.indexOf(time);

        if (timeIndex === -1) {
          updatedTimes.push(time);
        } else {
          updatedTimes.splice(timeIndex, 1);
        }

        if (updatedTimes.length === 0) {
          newState = prevState.filter(
            (item) => item.date.seconds !== firebaseTimestamp.seconds
          );
        } else {
          newState = [...prevState];
          newState[dateIndex] = {
            ...newState[dateIndex],
            times: updatedTimes,
          };
        }
      }

      return { selectedDateTimes: newState };
    }),
}));

const useLoginStore = create((set) => ({
  email: "ann123@yoihospital.com",
  password: "yoiann123",
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
}));

export {
  useAppointmentStore,
  useCancelRegistrationStore,
  useClassSchedule,
  useControlProgressStore,
  useEditProfile,
  useLoginStore,
  useProgressStore,
  useRegistrationInformationStore,
};
