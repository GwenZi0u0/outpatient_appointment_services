import { useQuery } from "@tanstack/react-query";
import { addDoc, collection } from "firebase/firestore";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { create } from "zustand";
import { fetchRegistrationData, fetchSchedulesData } from "../../api";
import Return from "../../assets/svg/returnIcon.svg";
import { PopUp } from "../../components/common/PopUp";
import { fireDb } from "../../firebase";
import {
  calculateNextRegistrationNumber,
  convertDateStringToTimestamp,
  convertToFirebaseTimestamp,
  isValidTaiwanID,
} from "../../utils/dateUtils";
import RegistrationCompleted from "./RegistrationCompleted";
import RegistrationInformation from "./RegistrationInformation";
import SelectDoctors from "./SelectDoctors";
import SelectSpecialties from "./SelectSpecialties";
import SelectTime from "./SelectTime";

const useAppointmentStore = create((set) => ({
  step: 1,
  showPopup: false,
  popupMessage: "",
  setStep: (newStep) => set({ step: newStep }),
  setShowPopup: (newShowPopup) => set({ showPopup: newShowPopup }),
  setPopupMessage: (popupMessage) => set({ popupMessage }),
}));

export default function Appointment() {
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    if (!state || !state.department) {
      navigate("/");
    }
  }, [state, navigate]);

  if (!state || !state.department) {
    return null;
  }

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
    refetchInterval: 60000,
  });
  const { data: registrationData } = useQuery({
    queryKey: ["registrations"],
    queryFn: fetchRegistrationData,
    refetchInterval: 30000,
  });

  const { register, handleSubmit, setValue, watch } = useForm({
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
      navigate("/");
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
    navigate("/");
  };

  const getNextRegistrationNumber = (data, time) => {
    const selectedDate = watch("date");
    return calculateNextRegistrationNumber(data, time, selectedDate);
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
      await addDoc(collection(fireDb, "registrations"), {
        OPD_date: convertDateStringToTimestamp(data.date),
        appointment_timeslot: data.time,
        birth_date: convertToFirebaseTimestamp(data.birthday),
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
        {step !== 5 && (
          <BackButton onClick={() => handleReturnClick()}>
            <ReturnText>{step === 1 ? "掛號首頁" : "上一步"}</ReturnText>
            <BackIcon src={Return} />
          </BackButton>
        )}
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
              navigate("/");
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
  width: auto;
  min-width: 120px;
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
  font-weight: 600;
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
  padding-left: 32px;
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
    padding-left: 25px;
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
