import { create } from "zustand";
import styled from "styled-components";
import Lock from "../assets/Lock.svg";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const useLoginStore = create((set) => ({
  email: "",
  password: "",
  setEmail: (email) => set({ email }),
  setPassword: (password) => set({ password }),
}));

export default function LoginPage() {
  const { email, password, setEmail, setPassword } = useLoginStore();
  const { signInWithEmail, error, loading } = useAuth();
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

      navigate("/control-progress");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  if (loading) {
    return <div>加載中...</div>;
  }

  return (
    <>
      <Container onSubmit={handleLogin}>
        <NoticeContainer />
        <LoginContainer>
          <LockIcon src={Lock} />
          <LoginContent>
            <Content htmlFor="email">
              <LoginIcon />
              <LoginInput
                type="email"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
              </PassWord>
            </Content>
            <Button type="submit">Sign In</Button>
            {error && <ErrorMessage>帳號/密碼輸入錯誤</ErrorMessage>}
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
  width: 100%;
  height: 50px;
  border: none;
  &:focus {
    outline: none;
  }
`;

const PasswordInput = styled.input`
  width: auto;
  height: 50px;
  border: none;
  &:focus {
    outline: none;
  }
`;

const PassWord = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`;

const Button = styled.button`
  width: 100%;
  height: 97px;
  font-size: 28px;
  letter-spacing: 5px;
  background-color: #00b0c1;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #b7c3da;
  }
`;

const ErrorMessage = styled.p`
  color: red;
`;
