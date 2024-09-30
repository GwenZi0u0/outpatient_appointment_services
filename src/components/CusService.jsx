import styled from "styled-components";

export default function CusService({ handleClick }) {
  return <Button onClick={handleClick}>AI小幫手</Button>;
}

const Button = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  background-color: #00b1c1de;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1000;
`;
