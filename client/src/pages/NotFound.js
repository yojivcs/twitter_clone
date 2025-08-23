import React from 'react';
import { GiAndroidMask } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 20px;
  text-align: center;
`;

const Logo = styled.div`
  font-size: 40px;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 28px;
  margin-bottom: 10px;
`;

const Message = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 30px;
`;

const HomeButton = styled(Link)`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border-radius: 30px;
  padding: 12px 24px;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.buttonHover};
  }
`;

const NotFound = () => {
  return (
    <NotFoundContainer>
      <Logo>
        <GiAndroidMask />
      </Logo>
      <Title>Page not found</Title>
      <Message>
        Hmm...this page doesn't exist. Try searching for something else.
      </Message>
      <HomeButton to="/">
        Go to Home
      </HomeButton>
    </NotFoundContainer>
  );
};

export default NotFound; 