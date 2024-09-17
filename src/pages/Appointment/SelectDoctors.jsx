import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { fetchDoctorsData } from "../../api";
import { Link } from "react-router-dom";

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

  return (
    <>
      {data?.map((doctor, index) =>
        doctor.division.division_id === department.id &&
        doctor.division.specialty_id === specialty.id ? (
          <DoctorItem
            key={doctor.id || index}
            onClick={() => onDoctorClick(doctor)}
            {...register("doctor")}
          >
            <CheckInput type="radio" name="doctor" defaultValue={doctor.id} />
            <DoctorInfo>
              <DoctorName>{doctor.physician_name} 醫師</DoctorName>
              <DoctorTitle>醫師簡介</DoctorTitle>
            </DoctorInfo>
          </DoctorItem>
        ) : null
      )}
    </>
  );
}

const DoctorItem = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #e6e6e6;
  background-color: ${(props) =>
    props.highlighted ? "#ffe6e6" : "transparent"};
  cursor: pointer;
`;

const DoctorInfo = styled.div`
  margin-left: 30px;
`;

const DoctorName = styled.h2``;

const DoctorTitle = styled(Link)`
  text-decoration: none;
`;

const CheckInput = styled.input`
  position: absolute;
  margin-right: 15px;
`;
