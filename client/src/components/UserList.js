import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const UserListContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled(Link)`
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  margin-right: 4px;
  display: block;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const UserHandle = styled(Link)`
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FollowButton = styled.button`
  padding: 6px 16px;
  border-radius: 30px;
  font-weight: bold;
  background-color: ${({ theme, following }) => following ? 'transparent' : theme.text};
  color: ${({ theme, following }) => following ? theme.text : theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  transition: background-color 0.2s;
  margin-left: 16px;

  &:hover {
    background-color: ${({ theme, following }) => following ? theme.hover : theme.textSecondary};
  }
`;

const EmptyMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
`;

const UserList = ({ users, onFollowToggle }) => {
  const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);
  
  if (!users || users.length === 0) {
    return <EmptyMessage>No users to display</EmptyMessage>;
  }

  return (
    <UserListContainer>
      {users.map((user) => {
        const isFollowing = currentUser && currentUser.following && 
          currentUser.following.some(id => id === user._id);
        const isCurrentUser = currentUser && currentUser._id === user._id;
        
        return (
          <UserItem key={user._id}>
            <Avatar 
              src={user.profilePicture || '/images/default-profile.png'} 
              alt={user.name} 
            />
            <UserInfo>
              <UserName to={`/profile/${user.username}`}>{user.name}</UserName>
              <UserHandle to={`/profile/${user.username}`}>@{user.username}</UserHandle>
            </UserInfo>
            
            {isAuthenticated && !isCurrentUser && (
              <FollowButton 
                following={isFollowing}
                onClick={() => onFollowToggle && onFollowToggle(user._id, isFollowing)}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </FollowButton>
            )}
          </UserItem>
        );
      })}
    </UserListContainer>
  );
};

export default UserList;
