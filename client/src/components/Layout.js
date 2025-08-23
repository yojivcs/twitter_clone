import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import RightBar from './RightBar';
import Sidebar from './Sidebar';

const LayoutContainer = styled.div`
  display: flex;
  max-width: 1300px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
`;

const MainContent = styled.main`
  flex: 1;
  border-left: 1px solid ${({ theme }) => theme.border};
  border-right: 1px solid ${({ theme }) => theme.border};
  min-height: 100vh;
  background-color: ${({ theme }) => theme.background};
`;

const Layout = () => {
  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent>
        <Outlet />
      </MainContent>
      <RightBar />
    </LayoutContainer>
  );
};

export default Layout; 