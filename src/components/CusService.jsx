import styled from "styled-components";
import Robot from "../assets/images/robot.png";

export default function CusService({ handleClick }) {
  return (
    <Container>
      <Button onClick={handleClick}>
        <RobotImg src={Robot} />
        <Text>小幫手</Text>
      </Button>
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
`;

const Button = styled.button`
  background-color: #00b1c1de;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 110px;
  height: 110px;
  border: 5px solid #ffffff;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
  &:hover {
    transform: scale(1.1);
  }
  @media (max-width: 480.1px) {
    width: 90px;
    height: 90px;
  }
`;

const RobotImg = styled.img`
  width: 70px;
  height: 70px;
  @media (max-width: 480.1px) {
    width: 50px;
    height: 50px;
  }
`;

const Text = styled.span`
  font-size: 15px;
  font-weight: 500;
  @media (max-width: 480.1px) {
    font-size: 12px;
  }
`;
