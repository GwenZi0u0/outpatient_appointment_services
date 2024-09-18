import { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/Logo.svg";
import { Outlet, Link, useLocation } from "react-router-dom";

export default function Header() {
  const [isGradient, setIsGradient] = useState(false);
  const location = useLocation();

  const handleScroll = () => {
    if (window.scrollY > 80) {
      setIsGradient(true);
    } else {
      setIsGradient(false);
    }
  };

  useEffect(() => {
    if (location.pathname === "/") {
      window.addEventListener("scroll", handleScroll);
      setIsGradient(false);
    } else {
      setIsGradient(true);
    }

    return () => {
      if (location.pathname === "/") {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [location.pathname]);

  return (
    <>
      <Container $isGradient={isGradient}>
        <LogoLink href="/">
          <LogoIcon src={Logo} alt="Logo" />
        </LogoLink>
        <Menu>
          <SelectLink to="/">網路掛號</SelectLink>
          <SelectLink to="/cancel-registration">查詢取消掛號</SelectLink>
          {/* <SelectLink to="/">掛號需知</SelectLink> */}
          <SelectLink to="/progress">看診進度</SelectLink>
        </Menu>
      </Container>
      <Outlet />
    </>
  );
}

const Container = styled.div`
  position: fixed;
  top: 0;
  display: flex;
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
    opacity: ${(props) => (props.$isGradient ? 1 : 0)};
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
  padding-right: 40%;
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
