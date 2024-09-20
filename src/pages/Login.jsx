import styled from "styled-components";
import Lock from "../assets/Lock.svg";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signInWithEmail, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail =
      localStorage.getItem("email") || sessionStorage.getItem("email");
    const savedPassword =
      localStorage.getItem("password") || sessionStorage.getItem("password");

    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setPassword(savedPassword);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmail(email, password);
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);

      navigate("/control-progress");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <>
      <Container onSubmit={handleLogin}>
        <NoticeContainer></NoticeContainer>
        <LoginContainer>
          <LockIcon src={Lock} />
          <LoginContent>
            <Content htmlFor="email">
              <LoginIcon></LoginIcon>
              <LoginInput
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Login ID"
                required
              />
            </Content>
            <Content htmlFor="password">
              <LoginIcon />
              <PassWord>
                password 密 碼
                <PasswordInput
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </PassWord>
            </Content>
            <Button type="submit">Sign In</Button>
            {error && <p style={{ color: "red" }}>{error}</p>}
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
  border-bottom: 1px solid #e0e0e0;
`;
const LoginIcon = styled.div`
  width: 20px;
  height: 20px;
  background-color: #000000;
`;
const LoginInput = styled.input`
  width: auto;
  height: 50px;
  border: none;
`;

const PasswordInput = styled.input`
  width: auto;
  height: 50px;
  border: none;
`;

const PassWord = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Button = styled.button`
  width: 420px;
  height: 97px;
`;
