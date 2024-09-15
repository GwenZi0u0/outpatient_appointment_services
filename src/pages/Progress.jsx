import styled from "styled-components";

export default function ProgressPage() {
  return (
    <Container>
      <Title>Title</Title>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  background-color: gray;
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
