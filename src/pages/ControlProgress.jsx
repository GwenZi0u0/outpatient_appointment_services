import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { fetchRegistrationData } from "../api";
import { useAuth } from "../contexts/AuthContext";

export default function CancelRegistrationPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["registrations"],
    queryFn: fetchRegistrationData,
  });
  console.log(user.uid);
  console.log(data);

  if (isLoading) return <div>載入中...</div>;
  if (error) return <div>發生錯誤: {error.message}</div>;

  return (
    <>
      <MainContainer>
        <Container>
          <NumberRegisteredPeopleText>
            當日掛號人數
            <PeopleNumber>{"10"}</PeopleNumber>
          </NumberRegisteredPeopleText>
          <ProgressNumberDisplayArea>
            <CurrentNumber>
              <Text>目前看診號碼</Text>
              <Number>{"5"}</Number>
            </CurrentNumber>
            <NextNumber>
              <Text>下一位看診號碼</Text>
              <Number>{"6"}</Number>
            </NextNumber>
          </ProgressNumberDisplayArea>
        </Container>
      </MainContainer>
    </>
  );
}

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: auto;
  min-height: 100vh;
  padding-top: 80px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: transparent;
  height: 584px;
  min-height: 100vh;
  padding: 70px 320px 0;
  gap: 80px;
`;

const NumberRegisteredPeopleText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 9.6px;
`;

const PeopleNumber = styled.span`
  font-size: 110px;
  font-weight: 700;
  letter-spacing: 38.4px;
`;

const ProgressNumberDisplayArea = styled.div`
  display: flex;
  align-items: center;
  background-color: #ffffff;
  height: 350px;
  gap: 85px;
`;

const CurrentNumber = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
`;

const Text = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 8.4px;
  width: 100%;
  height: 93px;
`;

const Number = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 70px;
  font-weight: 700;
  letter-spacing: 21px;
  height: 156px;
`;

const NextNumber = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
`;
