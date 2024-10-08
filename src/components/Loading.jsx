import styled, { keyframes } from "styled-components";
import LineImg from "../assets/LoadingLine.png";

const heartAnimation = keyframes`
  0% {
    transform: scale(1);
  }
  70% {
    filter: none;
    transform: scale(1);
  }
  80% {
    filter: drop-shadow(0px 0px 20px #FFC288);
    transform: scale(1.2) translateX(1%) translateY(1%);
  }
`;

const maskAnimation = keyframes`
  0% {
    left: 0;
  }
  100% {
    left: 100%;
  }
`;

const Body = styled.div`
  margin: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  flex-flow: column;
  justify-content: center;
  background-color: #ffffff;
`;

const Container = styled.div`
  width: 800px;
  height: 430px;
  position: relative;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  background-color: transparent;
  overflow: hidden;
`;

const Img = styled.img`
  width: 70%;
  height: 100%;
  position: absolute;
  background-repeat: repeat;
`;

const HeartContainer = styled.div`
  display: flex;
  align-items: center;
  top: 105px;
  right: 60px;
  position: absolute;
  width: 220px;
  height: 200px;
`;

const Heart = styled.div`
  width: 100px;
  height: 150px;
  animation: ${heartAnimation} 2s infinite;

  &::before,
  &::after {
    content: "";
    position: absolute;

    width: 100px;
    height: 150px;
    background-color: #d80032;
    border-radius: 50px 50px 0 0;
  }

  &::before {
    left: 70px;
    transform: rotate(45deg);
  }

  &::after {
    left: 34px;
    transform: rotate(-45deg);
  }
`;

const Mask = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  background-color: #ffffff;
  animation: ${maskAnimation} 3s infinite;
`;

const LoadingText = styled.div`
  &::after {
    content: attr(data-progress);
    width: auto;
    font-size: 30px;
    color: white;
    text-align: center;
    margin-left: -30px;
    filter: drop-shadow(0px 0px 10px #dafffb);
  }

  &:hover {
    filter: drop-shadow(0 0 10px #dafffb);
  }
`;

const Loading = ({ isLoading, progress }) => {
  if (!isLoading) return null;

  return (
    <Body>
      <Container>
        <Img src={LineImg} alt="Loading..." />
        <HeartContainer>
          <Heart />
          <LoadingText data-progress={`${progress}%`} />
        </HeartContainer>
        <Mask />
      </Container>
    </Body>
  );
};

export default Loading;
