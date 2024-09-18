import styled from "styled-components";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchScheduleData } from "../../api";
import SelectSpecialties from "./SelectSpecialties";
import SelectDoctors from "./SelectDoctors";
import SelectTime from "./SelectTime";
import RegistrationInformation from "./RegistrationInformation";
import RegistrationCompleted from "./RegistrationCompleted";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { fireDb } from "../../firebase";

export default function Appointment() {
  const navigator = useNavigate();
  const { state } = useLocation();
  const { department } = state;
  const { data } = useQuery({
    queryKey: ["schedules"],
    queryFn: fetchScheduleData,
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
    },
  });

  console.log(getValues());

  const [step, setStep] = useState(1);

  const handleReturnClick = () => {
    if (step === 1) {
      navigator("/");
    } else {
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

  const birthdayStamp = () => {
    const date = new Date(watch("birthday"));
    const firebaseTimestamp = Timestamp.fromDate(date);
    return firebaseTimestamp;
  };

  const dateStamp = () => {
    const [monthDay] = watch("date").split(" ");
    const [month, day] = monthDay.split("/").map(Number);
    const date = new Date(2024, month - 1, day);
    const firebaseTimestamp = Timestamp.fromDate(date);
    return firebaseTimestamp;
  };

  const onSubmit = async (data) => {
    setValue("idNumber", data.idNumber);
    try {
      console.log("Starting onSubmit");
      const docRef = await addDoc(collection(fireDb, "registrations"), {
        OPD_date: dateStamp(),
        appointment_timeslot: data.time,
        birth_date: birthdayStamp(),
        division: {
          department_id: data.department.id,
          specialty_id: data.specialty.id,
        },
        doctor: data.doctor.id,
        name: data.name,
        patient_contact: data.phone,
        personal_id_number: data.idNumber,
        registration_number: "0000000000",
        status: "confirmed",
      });

      console.log("Document written with ID: ", docRef.id);
      setStep(5);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const handleCompleted = () => {
    navigator("/");
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => handleReturnClick()}>{"<< "}返回</BackButton>
        <Title>網路預約掛號流程</Title>
      </Header>
      <ProcessStep>
        <span>請選擇科別</span>
        <span>請選擇醫生</span>
        <span>請選擇掛號時間</span>
        <span>請輸入掛號資訊</span>
        <span>掛號資訊確認</span>
        <span>完成掛號</span>
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
            schedule={data}
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
            schedule={data}
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
            schedule={data}
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
  max-width: 800px;
  margin: 0 auto;
  padding-top: 80px;
`;

const Header = styled.div`
  background-color: #f0f0f0;
  height: 46px;
  display: flex;
  align-items: center;
  gap: 150px;
`;

const BackButton = styled.button`
  width: 148px;
  height: 100%;
  margin-left: 20px;
  border: none;
  color: #244a8b;
  background-color: #d9d9d9;
  cursor: pointer;
`;

const Title = styled.h1`
  margin-left: 20px;
  font-size: 18px;
`;

const ProcessStep = styled.div`
  background-color: #e6e6e6;
  padding: 10px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// const StepIcon = styled.div`
//   width: 20px;
//   height: 20px;
//   background-color: #ffffff;
//   border: 2px solid #cccccc;
//   border-radius: 50%;
//   margin-right: 10px;
// `;

const ServiceList = styled.form`
  margin-top: 20px;
  border: 5px solid #d2cdcd;
`;
