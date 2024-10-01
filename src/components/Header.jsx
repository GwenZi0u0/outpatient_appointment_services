import { useState, useEffect } from "react";
import styled from "styled-components";
import Logo from "../assets/Logo.svg";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import MenuImg from "../assets/menu.svg";
import CloseImg from "../assets/x-circle.svg";

export default function Header() {
  const navigate = useNavigate();
  const [isGradient, setIsGradient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isRootPath = location.pathname === "/";

  const handleScroll = () => {
    window.requestAnimationFrame(() => {
      if (window.scrollY > 80) {
        setIsGradient(true);
      } else {
        setIsGradient(false);
      }
    });
  };

  useEffect(() => {
    if (isRootPath) {
      window.addEventListener("scroll", handleScroll);
      setIsGradient(false);
    } else {
      setIsGradient(true);
    }

    return () => {
      if (isRootPath) {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [location.pathname]);

  const handleButtonClick = () => {
    navigate("/");
    setTimeout(() => {
      document
        .getElementById("select-region")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    setIsMenuOpen(false);
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <Container $isGradient={isGradient}>
        <LogoLink href="/" $isGradient={isGradient}>
          <LogoIcon src={Logo} alt="Logo" $isGradient={isGradient} />
        </LogoLink>
        <Menu $isGradient={isGradient}>
          <SelectLink
            to="/"
            onClick={handleButtonClick}
            $isGradient={isGradient}
          >
            網路掛號
          </SelectLink>
            <SelectLink
            to="/cancel-registration"
            $isGradient={isGradient}
          >
            查詢取消掛號
          </SelectLink>
          <SelectLink to="/progress" $isGradient={isGradient}>
            看診進度
          </SelectLink>
        </Menu>
        <MenuIcon src={MenuImg} alt="Menu" onClick={handleMenuClick} />
        <MenuMobile $isMenuOpen={isMenuOpen}>
          <CloseIcon
            src={CloseImg}
            alt="Close"
            onClick={() => setIsMenuOpen(false)}
          />
          <SelectLink
            to="/"
            onClick={() => {
              handleButtonClick();
              setIsMenuOpen(false);
            }}
          >
            網路掛號
          </SelectLink>
          <SelectLink
            to="/cancel-registration"
            onClick={() => setIsMenuOpen(false)}
          >
            查詢取消掛號
          </SelectLink>
          <SelectLink
            to="/progress"
            onClick={() => setIsMenuOpen(false)}
          >
            看診進度
          </SelectLink>
        </MenuMobile>
        <div></div>
      </Container>
      <Outlet />
    </>
  );
}

const Container = styled.div`
  position: fixed;
  top: 0;
  display: flex;
  justify-content: center;
  height: 80px;
  width: 100%;
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
    transition: opacity 0.4s ease;
    opacity: ${(props) => (props.$isGradient ? 1 : 0)};
    z-index: -1;
  }
  @media (max-width: 1024.1px) {
    align-items: center;
    justify-content: flex-end;
  }
`;

const LogoLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 226px;
  height: 80px;
  cursor: pointer;
  position: absolute;
  transition: top 0.4s ease;
  top: ${(props) => (props.$isGradient ? "0" : "22px")};
  left: 30px;
  @media (max-width: 1440.1px) {
    left: 20px;
  }
  @media (max-width: 1024.1px) {
    top: ${(props) => (props.$isGradient ? "0" : "10px")};
    left: 10px;
  }
`;

const LogoIcon = styled.img`
  position: relative;
  width: auto;
  height: ${(props) => (props.$isGradient ? "100%" : "180%")};
  position: absolute;
  left: 0;
  transition: height 0.4s ease;
  @media (max-width: 1440.1px) {
    height: ${(props) => (props.$isGradient ? "100%" : "160%")};
  }
  @media (max-width: 1280.1px) {
    height: ${(props) => (props.$isGradient ? "100%" : "140%")};
  }
  @media (max-width: 1024.1px) {
    height: ${(props) => (props.$isGradient ? "100%" : "120%")};
  }
  @media (max-width: 768.1px) {
    height: ${(props) => (props.$isGradient ? "85%" : "100%")};
  }
`;

const Menu = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  gap: 60px;
  transition: margin-left 0.4s ease;
  @media (max-width: 1280.1px) {
    margin-left: 1%;
    gap: 40px;
  }
  @media (max-width: 1024.1px) {
    display: none;
  }
`;

const MenuIcon = styled.img`
  display: none;
  @media (max-width: 1024.1px) {
    display: block;
    margin-right: 15px;
    width: 40px;
    height: 40px;
    cursor: pointer;
  }
`;

const MenuMobile = styled.div`
  display: none;
  @media (max-width: 1024.1px) {
    display: ${(props) => (props.$isMenuOpen ? "flex" : "none")};
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 50px;
    position: absolute;
    top: 0;
    right: 0;
    padding: 30px;
    width: 100%;
    transition: opacity 0.4s ease;
    opacity: ${(props) => (props.$isMenuOpen ? 1 : 0)};
    background: linear-gradient(
      180deg,
      #01edd7 0%,
      #01c7c1 28.72%,
      #01a6af 57.43%,
      #01839b 78.72%,
      #1f7f9a 100%
    );
    height: 100vh;
    z-index: 10000;
  }
`;

const CloseIcon = styled.img`
  position: absolute;
  top: 20px;
  right: 40px;
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: transform 0.4s ease;
  &:hover {
    transform: rotate(180deg);
  }
  @media (max-width: 1024.1px) {
    width: 40px;
    height: 40px;
  }
`;

const SelectLink = styled(Link)`
  text-decoration: none;
  font-weight: 500;
  letter-spacing: 6px;
  font-size: 24px;
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
      background-color: ${(props) =>
        props.$isGradient ? "#ffffff" : "#01c7c1"};
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
  @media (max-width: 1024.1px) {
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 12px;
    height: auto;
    width: 100%;
    border-radius: 10px;
    padding: 20px;
    &:hover {
      background-color: #01c7c1;
      &:after {
        display: none;
      }
    }
  }
`;
