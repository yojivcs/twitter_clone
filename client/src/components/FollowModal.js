import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import styled from 'styled-components';
import UserList from './UserList';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: ${({ theme }) => theme.background};
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  font-size: 20px;
  cursor: pointer;
  margin-right: 12px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const HeaderTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  flex: 1;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const Tab = styled.button`
  flex: 1;
  padding: 16px;
  background: none;
  border: none;
  font-weight: bold;
  color: ${({ theme, active }) => active ? theme.primary : theme.textSecondary};
  border-bottom: ${({ theme, active }) => active ? `2px solid ${theme.primary}` : 'none'};
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const ModalContent = styled.div`
  overflow-y: auto;
  max-height: 70vh;
`;

const LoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
`;

const ErrorMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: ${({ theme }) => theme.error};
`;

const FollowModal = ({ isOpen, onClose, username, initialTab = 'followers' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers(activeTab);
    }
  }, [isOpen, activeTab, username]);

  const fetchUsers = async (tab) => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = `/api/users/${username}/${tab}`;
      const response = await axios.get(endpoint);
      setUsers(response.data.data);
    } catch (err) {
      console.error(`Error fetching ${tab}:`, err);
      setError(`Failed to load ${tab}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (userId, isFollowing) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(`/api/users/${userId}/follow`, {}, config);
      
      // Update the UI optimistically
      fetchUsers(activeTab);
    } catch (err) {
      console.error('Failed to follow/unfollow user', err);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
          <HeaderTitle>@{username}</HeaderTitle>
        </ModalHeader>
        
        <TabContainer>
          <Tab 
            active={activeTab === 'followers'}
            onClick={() => setActiveTab('followers')}
          >
            Followers
          </Tab>
          <Tab 
            active={activeTab === 'following'}
            onClick={() => setActiveTab('following')}
          >
            Following
          </Tab>
        </TabContainer>
        
        <ModalContent>
          {loading ? (
            <LoadingMessage>Loading...</LoadingMessage>
          ) : error ? (
            <ErrorMessage>{error}</ErrorMessage>
          ) : (
            <UserList 
              users={users} 
              onFollowToggle={handleFollowToggle}
            />
          )}
        </ModalContent>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default FollowModal;
