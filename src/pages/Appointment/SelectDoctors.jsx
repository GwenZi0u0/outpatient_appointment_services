import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { fetchDoctorsData } from "../../api";
import { Link } from "react-router-dom";
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
  });

  const hasDoctors = data?.some(
    (doctor) =>
      doctor.division.division_id === department.id &&
      doctor.division.specialty_id === specialty.id
  );

  return (
    <>
      {hasDoctors ? (
        data?.map((doctor, index) =>
          doctor.division.division_id === department.id &&
          doctor.division.specialty_id === specialty.id ? (
            <DoctorItem
              key={doctor.id || index}
              $borderBottom={index !== data.length - 1}
              onClick={() => onDoctorClick(doctor)}
              {...register("doctor")}
            >
              <CheckInput type="radio" name="doctor" defaultValue={doctor.id} />
              <CheckIcon src={SelectedIcon} />
              <DoctorImage src={doctor.image} />
              <DoctorInfo>
                <DoctorName>{doctor.physician_name} 醫師</DoctorName>
                <DoctorTitle to={`/doctor-profile/${doctor.uid}`}>
                  醫師簡介
                </DoctorTitle>
              </DoctorInfo>
            </DoctorItem>
          ) : null
        )
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

const DoctorTitle = styled(Link)`
  text-decoration: none;
`;

const CheckInput = styled.input`
  position: absolute;
  margin-right: 65px;
  z-index: -1;
`;

const CheckIcon = styled.img`
  width: 50px;
  height: 50px;
  background-color: #ffffff;
`;

const DoctorImage = styled.img`
  width: 100px;
  height: 100px;
  background-color: gray;
  border-radius: 10px;
`;
