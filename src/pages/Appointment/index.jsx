import { create } from "zustand";
import styled from "styled-components";
import { useMemo, useCallback } from "react";
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

const useAppointmentStore = create((set) => ({
  step: 1,
  setStep: (newStep) => set({ step: newStep }),
}));

export default function Appointment() {
  const navigator = useNavigate();
  const { state } = useLocation();
  const { department } = state;
  const { step, setStep } = useAppointmentStore();
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
      { step: 1, label: "請選擇科別" },
      { step: 2, label: "請選擇醫生" },
      { step: 3, label: "請選擇掛號時間" },
      { step: 4, label: "掛號資訊確認" },
      { step: 5, label: "完成掛號" },
    ],
    []
  );

  const handleReturnClick = useCallback(() => {
    if (step === 1) {
      navigator("/");
      setTimeout(() => {
        document
          .getElementById("select-department")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    } else {
      setStep(step - 1);
    }
  }, [step, navigator]);

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
      alert("身分證號碼輸入錯誤");
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
        <BackButton onClick={() => handleReturnClick()}>{"<< "}返回</BackButton>
        <Title>網路預約掛號流程</Title>
      </Header>
      <ProcessStep>
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
            onResetClick={() => setStep(1)}
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
    </Container>
  );
}

const Container = styled.div`
  font-family: Arial, sans-serif;
  max-width: 1000px;
  margin: 0 auto;
  padding-top: 100px;
`;

const Header = styled.div`
  background-color: #b7c3da;
  height: 46px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 40%;
  gap: 150px;
  border-radius: 2px;
`;

const BackButton = styled.button`
  width: 148px;
  height: 100%;
  border: none;
  color: #244a8b;
  background-color: #ffc288;
  font-size: 24px;
  font-weight: 700;
  opacity: 0.8;
  border-radius: 2px;
  cursor: pointer;
`;

const Title = styled.h1`
  margin-left: 20px;
  font-size: 18px;
  color: #244a8b;
`;

const ProcessStep = styled.div`
  font-size: 18px;
  letter-spacing: 1px;
  background-color: transparent;
  padding: 11px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  width: 200px;
  height: 45px;
  padding-left: 40px;
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
`;

const ServiceList = styled.form`
  border: 5px solid #d2cdcd;
  height: auto;
  max-height: 840px;
  min-height: 50px;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 2px;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;
