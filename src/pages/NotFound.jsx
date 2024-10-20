import styled from 'styled-components';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Container>
      <Title>404</Title>
      <Subtitle>頁面未找到</Subtitle>
      <HomeButton to="/">返回首頁</HomeButton>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f8f9fa;
  text-align: center;
`;

const Title = styled.p`
  font-size: 10rem;
  font-weight: bold;
  color: #343a40;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 2.5rem;
  color: #6c757d;
  margin-bottom: 2rem;
`;

const HomeButton = styled(Link)`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

