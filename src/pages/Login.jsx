import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { create } from "zustand";
import { fetchNoticeData } from "../api";
import Loading from "../assets/loading.gif";
import Lock from "../assets/Lock.svg";
import KeyIcon from "../assets/login_key.svg";
import UserIcon from "../assets/login_user.svg";
import { useAuth } from "../contexts/AuthContext";

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
  const { data: noticeData } = useQuery({
    queryKey: ["noticeData"],
    queryFn: fetchNoticeData,
    staleTime: 30 * 1000,
    cacheTime: 1 * 60 * 1000,
  });
  const [animationDelay, setAnimationDelay] = useState(0.2);

  useEffect(() => {
    if (noticeData) {
      setAnimationDelay(0.2);
    }
  }, [noticeData]);

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
    return (
      <LoadingContainer>
        <LoadingGif src={Loading} alt="載入中..." />
      </LoadingContainer>
    );
  }

  return (
    <>
      <Container onSubmit={handleLogin}>
        <NoticeContainer>
          <NoticeTitle style={{ animationDelay: "0s" }}>院內公告</NoticeTitle>
          <NoticeContent>
            {noticeData &&
              noticeData
                .sort((a, b) => b.created_at.toDate() - a.created_at.toDate())
                .map((notice, index) => (
                  <NoticeItem
                    key={notice.id}
                    style={{
                      animationDelay: `${(index + 1) * animationDelay}s`,
                    }}
                  >
                    <ItemTitle>{notice.title}</ItemTitle>
                    <ItemContent>{notice.content}</ItemContent>
                  </NoticeItem>
                ))}
          </NoticeContent>
        </NoticeContainer>
        <LoginContainer>
          <LockIcon src={Lock} />
          <ContentTitle>院內登入系統</ContentTitle>
          <LoginContent>
            <Content htmlFor="email">
              <LoginIcon src={UserIcon} />
              <LoginInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Login ID"
                required
              />
            </Content>
            <Content htmlFor="password">
              <LoginIcon src={KeyIcon} />
              <PassWord>
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

const NoticeContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;
  height: 100%;
  background-color: transparent;
  gap: 20px;
  @media (max-width: 1280.1px) {
    width: 100%;
    min-height: 250px;
    gap: 10px;
  }
`;

const NoticeTitle = styled.div`
  color: #244a8b;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 1px;
  padding: 10px;
  width: auto;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 1s ease forwards;

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @media (max-width: 480.1px) {
    font-size: 24px;
    text-align: center;
  }
`;

const NoticeContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding-right: 10px;
  border-radius: 10px;
  background-color: #b7c3da5f;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 30px;
  }
  &::-webkit-scrollbar-thumb {
    background: #d2cdcd;
    border-radius: 30px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #b7c3da;
  }
  @media (max-width: 1280.1px) {
    width: 100%;
  }
`;

const NoticeItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 1px;
  background-color: transparent;
  padding: 25px;
  gap: 20px;
  position: relative;
  cursor: pointer;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 1.2s ease forwards;

  &:hover {
    color: #244a8b;
    border-color: #b7c3da63;
  }

  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @media (max-width: 1280.1px) {
    font-size: 18px;
  }
  @media (max-width: 768.1px) {
    font-size: 16px;
  }
  @media (max-width: 480.1px) {
    font-size: 14px;
  }
`;
const ItemTitle = styled.div`
  height: 32px;
  width: auto;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 1.5px;
  position: relative;

  ${NoticeItem}:hover &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0px;
    width: auto;
    height: 2.5px;
    background-color: #b7c3da;
    border-radius: 30px;
    color: #244a8b;
    animation: borderExpand 0.5s forwards;
  }

  @keyframes borderExpand {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }
  @media (max-width: 1280.1px) {
    font-size: 20px;
  }
  @media (max-width: 768.1px) {
    font-size: 18px;
  }
  @media (max-width: 480.1px) {
    font-size: 16px;
  }
`;

const ItemContent = styled.div`
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 1.5px;
  line-height: 1.5;
  text-align: justify;
  text-justify: inter-word;
  @media (max-width: 1280.1px) {
    font-size: 18px;
  }
  @media (max-width: 768.1px) {
    font-size: 16px;
  }
  @media (max-width: 480.1px) {
    font-size: 14px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const LoadingGif = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;
`;

const Container = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 100vh;
  padding: 98px 180px;
  background-color: #fefefe;
  gap: 55px;
  @media (max-width: 1280.1px) {
    flex-direction: column;
    width: 100%;
    padding: 40px 80px;
    gap: 15px;
  }
  @media (max-width: 768.1px) {
    padding: 30px;
  }
  @media (max-width: 480.1px) {
    padding: 20px;
  }
`;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50%;
  height: 100%;
  background-color: #ffffff;
  @media (max-width: 1280.1px) {
    width: 100%;
  }
`;

const LockIcon = styled.img`
  width: 200px;
  height: 200px;
  @media (max-width: 1280.1px) {
    display: none;
  }
`;

const LoginContent = styled.form`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-around;
  width: 100%;
  height: 100%;
  padding: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  gap: 25px;
`;

const ContentTitle = styled.span`
  font-size: 24px;
  font-weight: 600;
  text-align: left;
  padding: 20px;
`;

const Content = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 30px;
  @media (max-width: 1280.1px) {
    gap: 20px;
  }
  @media (max-width: 768.1px) {
    gap: 10px;
  }
`;

const LoginIcon = styled.img`
  width: 70px;
  height: 70px;
  background-color: transparent;
  @media (max-width: 1280.1px) {
    width: 50px;
    height: 50px;
  }
  @media (max-width: 480.1px) {
    width: 40px;
    height: 40px;
  }
`;

const LoginInput = styled.input`
  width: 100%;
  height: 50px;
  font-size: 22px;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  &:focus {
    outline: none;
    border-bottom: 1px solid #244a8b;
  }
  @media (max-width: 1280.1px) {
    height: 40px;
    font-size: 18px;
  }
`;

const PasswordInput = styled.input`
  width: 100%;
  height: 50px;
  font-size: 22px;
  border: none;
  border-bottom: 1px solid #e0e0e0;
  &:focus {
    outline: none;
    border-bottom: 1px solid #244a8b;
  }
`;

const PassWord = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 18px;
  width: 100%;
  gap: 10px;
`;

const Button = styled.button`
  width: 100%;
  height: 97px;
  font-size: 28px;
  letter-spacing: 5px;
  background-color: #b7c3da;
  color: white;
  border: none;
  border-radius: 10px;
  margin-top: 20px;
  padding: 10px;
  cursor: pointer;
  &:hover {
    background-color: #00b0c1;
  }
  @media (max-width: 1280.1px) {
    height: 50px;
    font-size: 22px;
  }
  @media (max-width: 768.1px) {
    height: 40px;
    font-size: 18px;
  }
`;

const ErrorMessage = styled.p`
  color: red;
`;
