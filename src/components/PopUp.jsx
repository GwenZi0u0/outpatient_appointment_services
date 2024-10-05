import styled from "styled-components";

export function PopUp({ children }) {
  return (
    <PopUpContainer>
      <PopUpWrapper>{children}</PopUpWrapper>
    </PopUpContainer>
  );
}

const PopUpContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PopUpWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 400px;
  height: 250px;
  background-color: white;
  border: 5px solid #00B0C1;
  border-radius: 30px;
  padding: 50px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;
