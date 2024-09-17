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

export default function Appointment() {
  const navigator = useNavigate();
  const { state } = useLocation();
  const { department } = state;
  const { data } = useQuery({
    queryKey: ["schedules"],
    queryFn: fetchScheduleData,
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
    },
  });
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

  const handleRegistrationClick = (idNumber, birthday) => {
    setValue("idNumber", idNumber);
    setValue("birthday", birthday);
    setStep(5);
  };

  const onSubmit = (data) => {
    console.log("提交到 Firebase 的資料:", data);
    setStep(5);
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
            onRegistrationClick={(idNumber, birthday) =>
              handleRegistrationClick(idNumber, birthday)
            }
            onResetClick={() => setStep(1)}
            handleSubmit={() => onSubmit()}
          />
        )}
        {step === 5 && <div>掛號資訊確認</div>}
        {step === 6 && <div>掛號完成</div>}
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
