import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaEllipsisH, FaEnvelope, FaPalette, FaSearch, FaUser } from 'react-icons/fa';
import { GiAndroidMask } from 'react-icons/gi';
import { RiHome7Fill, RiHome7Line } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import styled from 'styled-components';
import { logout } from '../redux/slices/authSlice';
import { setTheme } from '../redux/slices/themeSlice';

const SidebarContainer = styled.div`
  width: 275px;
  padding: 0 12px;
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 70px;
    padding: 0 4px;
  }
`;

const Logo = styled(Link)`
  font-size: 28px;
  color: ${({ theme }) => theme.primary};
  margin: 12px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const NavMenu = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 8px;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 30px;
  color: ${({ theme }) => theme.text};
  font-size: 20px;
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  transition: background-color 0.2s;
  position: relative;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }

  @media (max-width: 768px) {
    justify-content: center;
  }
`;



const NavText = styled.span`
  margin-left: 16px;
  font-size: 20px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 5px;
  left: 25px;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  z-index: 1;
`;

const TweetButton = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border-radius: 30px;
  padding: 16px 0;
  font-weight: bold;
  margin-top: 16px;
  transition: background-color 0.2s;
  width: 90%;
  font-size: 17px;

  &:hover {
    background-color: ${({ theme }) => theme.buttonHover};
  }

  @media (max-width: 768px) {
    border-radius: 50%;
    width: 50px;
    height: 50px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const TweetButtonText = styled.span`
  @media (max-width: 768px) {
    display: none;
  }
`;

const TweetButtonIcon = styled.span`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const UserSection = styled.div`
  margin-top: auto;
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 30px;
  cursor: pointer;
  margin-bottom: 12px;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 8px;
  }
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  margin-left: 12px;
  flex: 1;

  @media (max-width: 768px) {
    display: none;
  }
`;

const UserName = styled.div`
  font-weight: bold;
  font-size: 15px;
`;

const UserHandle = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 15px;
`;

const UserMore = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const LogoutMenu = styled.div`
  position: absolute;
  bottom: 80px;
  left: 10px;
  background-color: ${({ theme }) => theme.background};
  border-radius: 16px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  min-width: 200px;
  z-index: 100;
  border: 1px solid ${({ theme }) => theme.border};
`;

const MenuItem = styled.div`
  padding: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ theme }) => theme.text};
  font-weight: ${props => props.bold ? 'bold' : 'normal'};
  
  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
  
  &:first-child {
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }
  
  &:last-child {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 30px;
  color: ${({ theme }) => theme.text};
  font-size: 20px;
  transition: background-color 0.2s;
  margin-bottom: 10px;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const ThemeButton = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  border-radius: 25px;
  padding: 15px 20px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  margin: 20px 0;
  width: 90%;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background-color: ${({ theme }) => theme.buttonHover};
  }

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    padding: 0;
  }
`;

const ThemeDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const ThemeDropdownContent = styled.div`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  position: absolute;
  bottom: 100%;
  left: 0;
  background-color: ${({ theme }) => theme.background};
  min-width: 200px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.border};
  margin-bottom: 10px;
  overflow: hidden;

  @media (max-width: 768px) {
    left: 50%;
    transform: translateX(-50%);
    min-width: 180px;
  }
`;

const ThemeOption = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ theme }) => theme.text};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }

  &:first-child {
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
  }

  &:last-child {
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
  }
`;

const ThemeColor = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  border: 2px solid ${({ theme }) => theme.border};
`;

const ThemeName = styled.span`
  font-size: 14px;
  font-weight: 500;
`;

const Sidebar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { currentTheme } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [socket, setSocket] = useState(null);

  const themes = [
    { id: 'dark', name: 'Dark', color: '#000000' },
    { id: 'light', name: 'Light', color: '#1DA1F2' },
    { id: 'purple', name: 'Purple', color: '#8B5CF6' },
    { id: 'green', name: 'Green', color: '#10B981' },
    { id: 'orange', name: 'Orange', color: '#F59E0B' },
    { id: 'pink', name: 'Pink', color: '#EC4899' }
  ];

  const handleThemeChange = (themeId) => {
    dispatch(setTheme(themeId));
    setShowThemeDropdown(false);
  };

  const toggleThemeDropdown = () => {
    setShowThemeDropdown(!showThemeDropdown);
  };
  
  // Initialize socket and fetch notification/message counts
  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const serverUrl = process.env.NODE_ENV === 'production' 
        ? window.location.origin 
        : 'http://localhost:5000';
      const newSocket = io(serverUrl);
      setSocket(newSocket);
      
      // Authenticate socket with user ID
      newSocket.emit('authenticate', user._id);
      
              // Listen for new messages
        newSocket.on('new_message', () => {
          setMessageCount(prev => prev + 1);
        });

        // Listen for new message notifications (red dot indicator)
        newSocket.on('new_message_notification', () => {
          setMessageCount(prev => prev + 1);
        });
      
      // Fetch initial message count
      const fetchMessageCount = async () => {
        try {
          const response = await axios.get('/api/messages/unread/count');
          if (response.data.success) {
            setMessageCount(response.data.data.count);
          }
        } catch (error) {
          console.error('Error fetching message count:', error);
        }
      };
      
      fetchMessageCount();
      
      // Reset notification count when navigating to notifications page
      const handleRouteChange = () => {
        if (window.location.pathname === '/messages') {
          setMessageCount(0);
        }
      };
      
      window.addEventListener('popstate', handleRouteChange);
      
      return () => {
        newSocket.disconnect();
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Close theme dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (showThemeDropdown && !event.target.closest('.theme-dropdown')) {
        setShowThemeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showThemeDropdown]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isCurrentPath = (path) => {
    return window.location.pathname === path;
  };

  return (
    <SidebarContainer className="sidebar-container">
      <Logo to="/">
        <GiAndroidMask />
      </Logo>
      <NavMenu className="nav-container">
        <NavItem className="nav-item">
          <NavLink to="/" active={isCurrentPath('/') ? 'true' : undefined}>
            {isCurrentPath('/') ? <RiHome7Fill /> : <RiHome7Line />}
            <NavText>Home</NavText>
          </NavLink>
        </NavItem>
        <NavItem className="nav-item">
          <NavLink to="/explore" active={isCurrentPath('/explore') ? 'true' : undefined}>
            <FaSearch />
            <NavText>Explore</NavText>
          </NavLink>
        </NavItem>
        {isAuthenticated && (
          <>

            <NavItem className="nav-item">
              <NavLink to="/messages" active={isCurrentPath('/messages') ? 'true' : undefined}>
                <FaEnvelope />
                {messageCount > 0 && <NotificationBadge>{messageCount > 99 ? '99+' : messageCount}</NotificationBadge>}
                <NavText>Messages</NavText>
              </NavLink>
            </NavItem>
            
            <NavItem className="nav-item">
              <NavLink to={`/profile/${user?.username}`} active={isCurrentPath(`/profile/${user?.username}`) ? 'true' : undefined}>
                <FaUser />
                <NavText>Profile</NavText>
              </NavLink>
            </NavItem>
          </>
        )}
      </NavMenu>

              {isAuthenticated && (
          <ThemeDropdown className="theme-dropdown">
            <ThemeButton onClick={toggleThemeDropdown}>
              <FaPalette style={{ marginRight: '8px', fontSize: '16px' }} />
              <span style={{ display: window.innerWidth > 768 ? 'inline' : 'none' }}>
                Theme
              </span>
            </ThemeButton>
            {showThemeDropdown && (
              <ThemeDropdownContent isOpen={showThemeDropdown}>
                {themes.map((theme) => (
                  <ThemeOption
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                  >
                    <ThemeColor color={theme.color} />
                    <ThemeName>{theme.name}</ThemeName>
                  </ThemeOption>
                ))}
              </ThemeDropdownContent>
            )}
          </ThemeDropdown>
        )}

      {isAuthenticated && user && (
        <>
          <UserSection 
            className="bottom-profile-section profile-section"
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
          >
            <UserAvatar 
              className="profile-picture"
              src={user.profilePicture || '/images/default-profile.png'} 
              alt={user.name} 
            />
            <UserInfo className="user-info">
              <UserName>{user.name}</UserName>
              <UserHandle>@{user.username}</UserHandle>
            </UserInfo>
            <UserMore>
              <FaEllipsisH />
            </UserMore>
          </UserSection>

          {showLogoutMenu && (
            <LogoutMenu>
              <MenuItem onClick={() => {
                setShowLogoutMenu(false);
                navigate('/profile/settings');
              }}>
                Add an existing account
              </MenuItem>
              <MenuItem onClick={handleLogout} bold>
                Log out @{user.username}
              </MenuItem>
            </LogoutMenu>
          )}
        </>
      )}
    </SidebarContainer>
  );
};

export default Sidebar; 