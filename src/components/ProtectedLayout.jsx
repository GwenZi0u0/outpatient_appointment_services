import styled from "styled-components";
import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../assets/Logo.svg";
import { useState } from "react";

export default function ProtectedLayout() {
  const { user, loading, signOut } = useAuth((state) => ({
    user: state.user,
    loading: state.loading,
  }));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  function handleMouseEnter() {
    setIsDropdownOpen(true);
  }
  function handleMouseLeave() {
    setIsDropdownOpen(false);
  }

  if (user) {
    return (
      <>
        <Container onMouseLeave={handleMouseLeave}>
          <LogoLink href="/control-progress">
            <LogoIcon src={Logo} alt="Logo" />
          </LogoLink>
          <Menu>
            <SelectLink to="/control-progress">看診進度</SelectLink>
            <SelectLink to="/class-schedule">門診班表</SelectLink>
            <SelectLink to="/doctor-profile">醫師簡介</SelectLink>
          </Menu>
          <Profile onMouseEnter={handleMouseEnter}>
            <AuthImg />
            <Dropdown $isOpen={isDropdownOpen} onClick={signOut}>
              <DropSpan>Logout</DropSpan>
            </Dropdown>
          </Profile>
        </Container>
        <Outlet />
      </>
    );
  }

  return <Navigate to="/login" replace />;
}

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
`;

const SelectLink = styled(Link)`
  text-decoration: none;
  font-weight: 500;
  letter-spacing: 6px;
  font-size: 20px;
  letter-spacing: 30%;
  color: #ffffff;
  background-color: transparent;
  border: none;
`;

const AuthImg = styled.div`
  width: 50px;
  height: 50px;
  background-color: #ffffff;
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
  top: 75px;
  right: -40px;
  align-items: center;
  justify-content: center;
  width: 200px;
  height: 50px;
  background-color: #b7c3da;
  z-index: 1000;
`;

const DropSpan = styled.span`
  font-size: 18px;
  font-weight: 400;
  text-align: center;
  color: #0a1b2e;
  margin: 14px auto;
  width: 220px;
  position: relative;
  display: inline-block;
  cursor: pointer;
`;
