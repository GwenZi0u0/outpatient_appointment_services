import { create } from "zustand";
import styled from "styled-components";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSchedulesData, fetchRegistrationData } from "../../api";
import SelectSpecialties from "./SelectSpecialties";
import SelectDoctors from "./SelectDoctors";
import SelectTime from "./SelectTime";
import RegistrationInformation from "./RegistrationInformation";
import RegistrationCompleted from "./RegistrationCompleted";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { fireDb } from "../../firebase";
import {
  isValidTaiwanID,
  formatFirestoreTimestamp,
  convertToTimestamp,
} from "../../utils/dateUtils";
import Return from "../../assets/return_Square.svg";
import { PopUp } from "../../components/PopUp";

const useAppointmentStore = create((set) => ({
  step: 1,
  showPopup: false,
  popupMessage: "",
  setStep: (newStep) => set({ step: newStep }),
  setShowPopup: (newShowPopup) => set({ showPopup: newShowPopup }),
  setPopupMessage: (popupMessage) => set({ popupMessage }),
}));

export default function Appointment() {
  const navigator = useNavigate();
  const { state } = useLocation();
  const { department } = state;
  const {
    step,
    setStep,
    showPopup,
    setShowPopup,
    popupMessage,
    setPopupMessage,
  } = useAppointmentStore();
  const { data: scheduleData } = useQuery({
    queryKey: ["schedules"],
    queryFn: fetchSchedulesData,
  });
  const { data: registrationData } = useQuery({
    queryKey: ["registrations"],
    queryFn: fetchRegistrationData,
  });

  const { register, handleSubmit, setValue, watch, getValues } = useForm({
    defaultValues: {
      department: department,
      specialty: "",
      doctor: "",
      date: "",
      time: "",
      idNumber: "",
      birthday: "",
      name: "",
      phone: "",
      nextRegistrationNumber: "",
    },
  });

  console.log(getValues());

  const steps = useMemo(
    () => [
      { step: 1, label: "選擇科別" },
      { step: 2, label: "選擇醫生" },
      { step: 3, label: "選擇掛號時間" },
      { step: 4, label: "填寫掛號資訊" },
      { step: 5, label: "完成掛號" },
    ],
    []
  );

  const handleReturnClick = () => {
    if (step === 1) {
      navigator("/");
      setTimeout(() => {
        document
          .getElementById("select-department")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    } else {
      switch (step) {
        case 2:
          setValue("specialty", "");
          break;
        case 3:
          setValue("doctor", "");
          break;
        case 4:
          setValue("date", "");
          setValue("time", "");
          break;
        case 5:
          setValue("idNumber", "");
          setValue("birthday", "");
          setValue("name", "");
          setValue("phone", "");
          break;
      }
      setStep(step - 1);
    }
  };

  const handleSpecialtyClick = (specialty) => {
    setValue("specialty", specialty);
    setStep(2);
  };

  const handleDoctorClick = (doctor) => {
    setValue("doctor", doctor);
    setStep(3);
  };

  const handleTimeClick = (date, time) => {
    setValue("date", date);
    setValue("time", time);
    setStep(4);
  };

  const handleCompleted = () => {
    setValue("department", "");
    setValue("specialty", "");
    setValue("doctor", "");
    setValue("date", "");
    setValue("time", "");
    setValue("idNumber", "");
    setValue("birthday", "");
    setValue("name", "");
    setValue("phone", "");
    setValue("nextRegistrationNumber", "");
    setStep(1);
    navigator("/");
  };

  const birthdayStamp = (data) => {
    const date = new Date(data);
    const firebaseTimestamp = Timestamp.fromDate(date);
    return firebaseTimestamp;
  };

  const getNextRegistrationNumber = (data, time) => {
    const extractedDate = watch("date").split(" ")[0];
    const foundDate = data.filter(
      (item) => formatFirestoreTimestamp(item.OPD_date) === extractedDate
    );
    const foundTime = foundDate.filter(
      (item) => item.appointment_timeslot === time
    );
    const maxRegistrationNumber = Math.max(
      ...foundTime.map((item) => item.registration_number),
      0
    );
    return maxRegistrationNumber + 1;
  };

  const onSubmit = async (data) => {
    if (!isValidTaiwanID(data.idNumber)) {
      setShowPopup(true);
      setPopupMessage("身分證號碼輸入錯誤");
      return;
    }
    const nextNumber = getNextRegistrationNumber(registrationData, data.time);
    setValue("nextRegistrationNumber", nextNumber);

    setValue("idNumber", data.idNumber);
    try {
      const docRef = await addDoc(collection(fireDb, "registrations"), {
        OPD_date: convertToTimestamp(data.date),
        appointment_timeslot: data.time,
        birth_date: birthdayStamp(data.birthday),
        division: {
          department_id: data.department.id,
          specialty_id: data.specialty.id,
        },
        doctor_id: data.doctor.uid,
        name: data.name,
        patient_contact: data.phone,
        personal_id_number: data.idNumber,
        registration_number: nextNumber,
        status: "confirmed",
      });

      console.log("Document written with ID: ", docRef.id);
      setStep(5);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <Container>
      <Header>
        <Title>網路預約掛號流程</Title>
      </Header>
      <ProcessStep>
        <BackButton onClick={() => handleReturnClick()}>
          <ReturnText>上一步</ReturnText>
          <BackIcon src={Return} />
        </BackButton>
        {steps.map((item, index) => (
          <Step
            key={item.step}
            $active={step === item.step}
            $completed={step > item.step}
            $isFirst={index === 0}
            $isMiddle={index > 0 && index < steps.length - 1}
            $isLast={index === steps.length - 1}
          >
            {item.label}
          </Step>
        ))}
      </ProcessStep>
      <ServiceList onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <SelectSpecialties
            register={register}
            department={watch("department")}
            onClickSpecialty={(specialty) => handleSpecialtyClick(specialty)}
          />
        )}
        {step === 2 && (
          <SelectDoctors
            register={register}
            department={watch("department")}
            specialty={watch("specialty")}
            onDoctorClick={(doctor) => handleDoctorClick(doctor)}
          />
        )}
        {step === 3 && (
          <SelectTime
            register={register}
            department={watch("department")}
            specialty={watch("specialty")}
            doctor={watch("doctor")}
            schedule={scheduleData}
            onTimeClick={(date, time) => handleTimeClick(date, time)}
          />
        )}
        {step === 4 && (
          <RegistrationInformation
            register={register}
            specialty={watch("specialty")}
            doctor={watch("doctor")}
            date={watch("date")}
            time={watch("time")}
            schedule={scheduleData}
            getNextRegistrationNumber={getNextRegistrationNumber}
            registrationData={registrationData}
            onResetClick={() => {
              navigator("/");
              setTimeout(() => {
                document
                  .getElementById("select-department")
                  ?.scrollIntoView({ behavior: "smooth" });
              }, 0);
              setStep(1);
              setValue("department", "");
              setValue("specialty", "");
              setValue("idNumber", "");
              setValue("birthday", "");
              setValue("name", "");
              setValue("phone", "");
            }}
            onSubmit={(idNumber, birthday, name, phone) =>
              onSubmit({ idNumber, birthday, name, phone })
            }
          />
        )}
        {step === 5 && (
          <RegistrationCompleted
            department={watch("department")}
            specialty={watch("specialty")}
            doctor={watch("doctor")}
            date={watch("date")}
            time={watch("time")}
            schedule={scheduleData}
            idNumber={watch("idNumber")}
            birthday={watch("birthday")}
            name={watch("name")}
            onCompletedClick={() => handleCompleted()}
          />
        )}
      </ServiceList>
      {showPopup && (
        <PopUp>
          <PopupContent>
            <PopupMessage>{popupMessage}</PopupMessage>
            <CloseButton onClick={() => setShowPopup(false)}>確定</CloseButton>
          </PopupContent>
        </PopUp>
      )}
    </Container>
  );
}

const PopupContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const BaseButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
`;

const PopupMessage = styled.p`
  font-size: 18px;
  margin-bottom: 20px;
  text-align: center;
`;

const CloseButton = styled(BaseButton)`
  background-color: #244a8b;
  color: white;
  &:hover {
    background-color: #1c3a6e;
  }
`;

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 100px 0 0px;
  height: auto;
  min-height: 100vh;
  @media (max-width: 1024.1px) {
    padding: 100px 40px 30px;
  }
  @media (max-width: 768.1px) {
    padding: 100px 20px 20px;
  }
`;

const Header = styled.div`
  background-color: #b7c3da8a;
  width: 100%;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 150px;
  border-radius: 10px;
  position: relative;
`;

const BackButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  height: auto;
  color: #244a8b;
  background-color: #d3cdcd;
  opacity: 1;
  width: 120px;
  height: 40px;
  padding: 10px 5px;
  border-radius: 10px;
  cursor: pointer;
  &:hover {
    opacity: 0.7;
  }
`;

const ReturnText = styled.span`
  display: inline-block;
  font-size: 16px;
  text-align: center;
  letter-spacing: 2.5px;
  font-weight: 500;
`;

const BackIcon = styled.img`
  width: 25px;
  height: 25px;
`;

const Title = styled.span`
  font-size: 28px;
  font-weight: 600;
  color: #244a8b;
`;

const ProcessStep = styled.div`
  font-size: 19px;
  letter-spacing: 1px;
  background-color: transparent;
  padding: 11px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  width: 180px;
  height: 45px;
  padding-left: 36px;
  color: #ffffff;
  border-radius: 2px;
  background-color: ${(props) =>
    props.$active ? "#244a8b" : props.$completed ? "#B7C3DA" : "#d3cdcd"};
  clip-path: ${(props) =>
    props.$isFirst
      ? "polygon(0% 0%, 88% 0%, 100% 50%, 88% 100%, 0% 100%)"
      : props.$isLast
      ? "polygon(100% 0%, 0% 0%, 12% 50%, 0% 100%, 100% 100%)"
      : "polygon(0% 0%, 88% 0%, 100% 50%, 88% 100%, 0% 100%, 12% 50%)"};

  @media (max-width: 1024.1px) {
    font-size: 18px;
    padding-left: 28px;
  }
  @media (max-width: 768.1px) {
    font-size: 15px;
    padding-left: 18px;
  }
`;

const ServiceList = styled.form`
  border: 5px solid #d2cdcd;
  height: auto;
  max-height: calc(100vh - 278px);
  min-height: 50px;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 25px;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
  @media (max-width: 768.1px) {
    overflow-x: auto;
  }
`;
