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
        registration_number: "1",
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

  const steps = [
    { step: 1, label: "請選擇科別" },
    { step: 2, label: "請選擇醫生" },
    { step: 3, label: "請選擇掛號時間" },
    { step: 4, label: "掛號資訊確認" },
    { step: 5, label: "完成掛號" },
  ];

  return (
    <Container>
      <Header>
        <BackButton onClick={() => handleReturnClick()}>{"<< "}返回</BackButton>
        <Title>網路預約掛號流程</Title>
      </Header>
      <ProcessStep>
        {steps.map((item) => (
          <Step
            key={item.step}
            $active={step === item.step}
            $completed={step > item.step}
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
  /* justify-content: center; */
  width: 190px;
  height: 45px;
  padding-left: 30px;
  color: #ffffff;
  background-color: ${(props) =>
    props.$active ? "#244a8b" : props.$completed ? "#B7C3DA" : "#d3cdcd"};
  /* clip-path: polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%); //step第一個
  clip-path: polygon(5% 0%, 90% 0%, 100% 50%, 90% 100%, 5% 100%, 12% 50%); //中間的step
  clip-path: polygon(100% 0%, 15% 0%, 0% 50%, 15% 100%, 100% 100%); //step最後一個 */
`;

const ServiceList = styled.form`
  border: 5px solid #d2cdcd;
  height: auto;
  max-height: 650px;
  min-height: 50px;
  overflow-y: auto;
  border-radius: 2px;
`;
