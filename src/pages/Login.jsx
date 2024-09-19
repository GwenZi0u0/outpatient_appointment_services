import styled from "styled-components";
import Lock from "../assets/Lock.svg";

export default function LoginPage() {
  return (
    <>
      <Container>
        <NoticeContainer></NoticeContainer>
        <LoginContainer>
          <LockIcon src={Lock} />
          <LoginContent>
            <Content>
              <LoginIcon></LoginIcon>
              <LoginInput type="email" placeholder="Login ID" required />
            </Content>
            <Content>
              <LoginIcon></LoginIcon>
              <PassWord>
                password 密 碼
                <PasswordInput type="password" required />
              </PassWord>
            </Content>

            <Button type="submit">登入</Button>
          </LoginContent>
        </LoginContainer>
      </Container>
    </>
  );
}

const Container = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 100vh;
  padding: 98px 211px;
  background-color: #fefefe;
  gap: 55px;
`;

const NoticeContainer = styled.div`
  display: flex;
  width: 50%;
  height: 100%;
  background-color: #cccccc;
`;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 50%;
  height: 100%;
  background-color: #ffffff;
`;

const LockIcon = styled.img`
  width: 250px;
  height: 250px;
`;

const LoginContent = styled.form`
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 70%;
  padding: 93px 71px;
  border: 1px solid #e0e0e0;
  gap: 20px;
`;
const Content = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 20px;
`;
const LoginIcon = styled.div`
  width: 20px;
  height: 20px;
  background-color: #000000;
`;
const LoginInput = styled.input``;

const PassWord = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const PasswordInput = styled.input``;

const Button = styled.button`
  width: 420px;
  height: 97px;
`;
