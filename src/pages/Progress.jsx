import styled from "styled-components";

export default function ProgressPage() {
  return (
    <Container>
      <Title>你的門診看診進度</Title>
      <Label>身分證號碼查詢 </Label>
      <Input type="text" placeholder="請輸入身分證號碼" />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 80px;
  background-color: transparent;
  width: 100vw;
  height: 100px;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: #000000;
  margin-bottom: 20px;
`;

const Input = styled.input`
  width: 300px;
  height: 50px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #000000;
  border-radius: 5px;
  margin-bottom: 20px;
`;
const Label = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 10.4px;
  width: 100%;
  height: 93px;
`;
