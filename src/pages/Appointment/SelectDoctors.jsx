import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { fetchDoctorsData } from "../../api";
import AuthMenImg from "../../assets/authMen.png";
import AuthWomenImg from "../../assets/authWomen.png";
import SelectedIcon from "../../assets/selected.svg";

export default function SelectDoctors({
  register,
  department,
  specialty,
  onDoctorClick,
}) {
  const { data } = useQuery({
    queryKey: ["doctors"],
    queryFn: fetchDoctorsData,
    staleTime: 5 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
  });

  const filteredDoctors =
    data?.filter(
      (doctor) =>
        doctor.division.division_id === department.id &&
        doctor.division.specialty_id === specialty.id
    ) || [];
  return (
    <>
      {filteredDoctors.length > 0 ? (
        filteredDoctors.map((doctor, index) => (
          <DoctorItem
            key={doctor.uid || index}
            $borderBottom={
              filteredDoctors.length > 1 && index !== filteredDoctors.length - 1
            }
            onClick={() => onDoctorClick(doctor)}
            {...register("doctor")}
          >
            <CheckInput type="radio" name="doctor" defaultValue={doctor.uid} />
            <CheckIcon src={SelectedIcon} />
            <DoctorImage
              src={
                doctor.physician_imag ||
                (doctor.physician_gender === 1 ? AuthMenImg : AuthWomenImg)
              }
            />
            <DoctorInfo>
              <DoctorName>{doctor.physician_name} 醫師</DoctorName>
              <DoctorTitle
                to={`/doctor-profile/${doctor.uid}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                醫師簡介
              </DoctorTitle>
            </DoctorInfo>
          </DoctorItem>
        ))
      ) : (
        <Text>暫無安排醫師</Text>
      )}
    </>
  );
}

const Text = styled.div`
  font-size: 28px;
  font-weight: 500;
  padding: 30px 65px;
`;

const DoctorItem = styled.div`
  display: flex;
  align-items: center;
  padding: 30px 65px;
  border-bottom: ${(props) =>
    props.$borderBottom ? "5px solid #d2cdcd" : "none"};
  background-color: ${(props) =>
    props.highlighted ? "#ffe6e6" : "transparent"};
  gap: 35px;
  cursor: pointer;
  &:hover {
    background-color: #b7c3da8a;
  }
`;

const DoctorInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
`;

const DoctorName = styled.span`
  letter-spacing: 8px;
  font-weight: 500;
  font-size: 24px;
`;

// Start of Selection
const DoctorTitle = styled(Link)`
  text-decoration: none;
  color: #0267b5;
  font-size: 16px;
  letter-spacing: 1px;
  width: fit-content;
  height: 20px;
  position: relative;
  &:hover {
    &::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 1px;
      background-color: #0267b5;
      transform: scaleX(0);
      transform-origin: left;
      animation: borderAnimation 0.2s forwards;
    }
  }

  @keyframes borderAnimation {
    to {
      transform: scaleX(1);
    }
  }
`;

const CheckInput = styled.input`
  position: absolute;
  top: 35px;
  left: 60px;
  z-index: -1;
`;

const CheckIcon = styled.img`
  width: 50px;
  height: 50px;
  background-color: transparent;
`;

const DoctorImage = styled.img`
  width: 100px;
  height: 100px;
  background-color: gray;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #8282828a;
`;
