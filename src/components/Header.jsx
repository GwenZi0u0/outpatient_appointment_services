import styled from "styled-components";
import Logo from "../assets/Logo.svg";
import { Outlet, Link } from "react-router-dom";

export default function Header() {
  return (
    <>
      <Container>
        <LogoLink to="/">
          <LogoIcon src={Logo} alt="Logo" />
        </LogoLink>
        <Menu>
          <SelectLink>網路掛號</SelectLink>
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
  background-color: transparent;
  height: 80px;
  width: 100vw;
  padding: 0 20px;
  z-index: 10000;
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding-right: 351px;
`;
const LogoIcon = styled.img`
  width: 226px;
  height: 80px;
`;

const Menu = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  gap: 60px;
`;

const SelectLink = styled(Link)`
  text-decoration: none;
  font-weight: bold;
  font-size: 20px;
  letter-spacing: 30%;
  color: #000000;
  background-color: transparent;
  border: none;
`;
