import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, Navigate, Outlet } from "react-router-dom";
import styled from "styled-components";
import { fetchDoctorsDataWithLimit } from "../api";
import AuthMenImg from "../assets/authMen.png";
import AuthWomenImg from "../assets/authWomen.png";
import Loading from "../assets/loading.gif";
import Logo from "../assets/Logo.svg";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedLayout() {
  const { user, loading, signOut } = useAuth((state) => ({
    user: state.user,
    loading: state.loading,
  }));

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["fetchDoctors"],
    queryFn: () => fetchDoctorsDataWithLimit(),
    staleTime: 5 * 60 * 1000,
  });
  if (loading) {
    return (
      <LoadingContainer>
        <LoadingGif src={Loading} alt="載入中..." />
      </LoadingContainer>
    );
  }

  const getDefaultImage = (doctor) => {
    if (doctor?.physician_gender === 1) {
      return AuthMenImg;
    } else if (doctor?.physician_gender === 2) {
      return AuthWomenImg;
    }
    return AuthMenImg;
  };

  if (user) {
    return (
      <>
        <Container onMouseLeave={() => setIsDropdownOpen(false)}>
          <LogoLink href="/control-progress">
            <LogoIcon src={Logo} alt="Logo" />
          </LogoLink>
          <Menu>
            <SelectLink to="/control-progress">看診進度</SelectLink>
            <SelectLink to="/class-schedule">門診班表</SelectLink>
            <SelectLink to={`/doctor-profile/${user.uid}`}>醫師簡介</SelectLink>
          </Menu>
          <Profile
            onMouseEnter={() => setIsDropdownOpen(true)}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          >
            <AuthImg
              src={(() => {
                const doctor = data?.find((d) => d.uid === user.uid);
                return doctor?.physician_imag || getDefaultImage(doctor);
              })()}
              alt="Profile"
            />
            <Dropdown $isOpen={isDropdownOpen}>
              <MenuMobile>
                <SelectLink to="/control-progress">看診進度</SelectLink>
                <SelectLink to="/class-schedule">門診班表</SelectLink>
                <SelectLink to={`/doctor-profile/${user.uid}`}>
                  醫師簡介
                </SelectLink>
              </MenuMobile>
              <DropSpan onClick={signOut}>登 出</DropSpan>
            </Dropdown>
          </Profile>
        </Container>
        <Outlet />
      </>
    );
  }

  return <Navigate to="/login" replace />;
}

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
  position: fixed;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  width: 100vw;
  padding: 0 20px;
  z-index: 10000;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      #01edd7 0%,
      #01c7c1 28.72%,
      #01a6af 57.43%,
      #01839b 78.72%,
      #1f7f9a 100%
    );
    transition: opacity 0.3s ease;
    z-index: -1;
  }
`;

const LogoLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;
const LogoIcon = styled.img`
  width: 226px;
  height: 80px;
`;

const Menu = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 5%;
  height: 100%;
  gap: 60px;
  @media (max-width: 1280.1px) {
    gap: 40px;
  }
  @media (max-width: 1024.1px) {
    gap: 20px;
  }
  @media (max-width: 768.1px) {
    display: none;
  }
`;

const SelectLink = styled(Link)`
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 6px;
  font-size: 22px;
  letter-spacing: 30%;
  color: #ffffff;
  background-color: transparent;
  border: none;
  position: relative;
  &:hover {
    &:after {
      content: "";
      position: absolute;
      width: 100%;
      height: 2px;
      bottom: -10px;
      left: 0;
      background-color: #ffffff;
      border-radius: 10px;
      animation: slide 0.3s ease;
      @keyframes slide {
        from {
          width: 0;
        }
        to {
          width: 100%;
        }
      }
    }
  }
  @media (max-width: 1280.1px) {
    font-size: 20px;
  }
  @media (max-width: 768.1px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    letter-spacing: 12px;
    height: 50px;
    width: 100%;
    padding: 20px;
    &:hover {
      background-color: #01c7c1;
      &:after {
        display: none;
      }
    }
  }
`;

const AuthImg = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
`;

const Profile = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: fit-content;
  position: relative;
  margin: 4px 10px 4px 5px;
`;

const Dropdown = styled.div`
  display: ${(props) => (props.$isOpen ? "flex" : "none")};
  position: absolute;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  top: -15px;
  right: -45px;
  font-size: 22px;
  letter-spacing: 6px;
  font-weight: 600;
  width: 200px;
  height: 100vh;
  padding: 10px 0;
  border-radius: 10px 0 0 10px;
  gap: 30px;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  background: linear-gradient(
    180deg,
    #01edd7 0%,
    #01c7c1 28.72%,
    #01a6af 57.43%,
    #01839b 78.72%,
    #1f7f9a 100%
  );
  z-index: 10000;
`;

const DropSpan = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  width: 100%;
  height: 50px;
  cursor: pointer;
  &:hover {
    background-color: #01c7c1;
    &:after {
      display: none;
    }
  }
  @media (max-width: 768.1px) {
    text-align: center;
    font-size: 18px;
    letter-spacing: 12px;
    height: 50px;
    width: 100%;
    padding: 20px;
    &:hover {
      background-color: #01c7c1;
      &:after {
        display: none;
      }
    }
  }
`;

const MenuMobile = styled.div`
  display: none;
  @media (max-width: 768.1px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 30px;
  }
`;
