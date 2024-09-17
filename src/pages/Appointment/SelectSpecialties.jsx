import styled from "styled-components";

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
          onClick={() => onClickSpecialty(specialty)}
          {...register("specialty")}
        >
          <CheckInput type="radio" name="specialty" defaultValue={specialty.id} />
          <CheckIcon />
          <ServiceText>{specialty.specialty}</ServiceText>
        </ServiceItem>
      ))}
    </>
  );
}

const ServiceItem = styled.label`
  display: flex;
  align-items: center;
  padding: 15px;
  border-bottom: 5px solid #d2cdcd;
  background-color: ${(props) =>
    props.highlighted ? "#ffe6e6" : "transparent"};
  cursor: pointer;
`;

const CheckInput = styled.input`
  position: absolute;
  margin-right: 15px;
`;

const CheckIcon = styled.div`
  width: 20px;
  height: 20px;
  background-color: #000000;
  margin-right: 15px;
`;

const ServiceText = styled.div`
  flex-grow: 1;
`;
