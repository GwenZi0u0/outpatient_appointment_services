import styled from "styled-components";
import SelectedIcon from "../../assets/svg/selectedIcon.svg";

export default function SelectSpecialties({
  register,
  department,
  onClickSpecialty,
}) {
  return (
    <>
      {department.specialties?.map((specialty, index) => (
        <ServiceItem
          key={specialty.id || index}
          $borderBottom={index !== department.specialties.length - 1}
          onClick={() => onClickSpecialty(specialty)}
          {...register("specialty")}
        >
          <CheckInput
            type="radio"
            name="specialty"
            defaultValue={specialty.id || ""}
          />
          <CheckIcon src={SelectedIcon} />
          <ServiceText>{specialty.specialty}</ServiceText>
        </ServiceItem>
      ))}
    </>
  );
}

const ServiceItem = styled.label`
  position: relative;
  display: flex;
  align-items: center;
  padding: 25px 50px;
  border-bottom: ${(props) =>
    props.$borderBottom ? "5px solid #d2cdcd" : "none"};
  background-color: ${(props) =>
    props.highlighted ? "#ffe6e6" : "transparent"};
  cursor: pointer;
  &:hover {
    background-color: #b7c3da8a;
  }
`;

const CheckInput = styled.input`
  position: absolute;
  top: 35px;
  left: 60px;
  border: none;
  z-index: -1;
`;

const CheckIcon = styled.img`
  width: 50px;
  height: 50px;
  background-color: transparent;
  margin-right: 55px;
`;

const ServiceText = styled.div`
  letter-spacing: 14px;
  font-size: 24px;
  font-weight: 500;
  flex-grow: 1;
`;
