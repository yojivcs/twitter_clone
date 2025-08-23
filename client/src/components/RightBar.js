import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { followUser } from '../redux/slices/authSlice';

const RightBarContainer = styled.div`
  width: 350px;
  padding: 0 20px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;

  @media (max-width: 1024px) {
    width: 290px;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin: 10px 0 20px;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: ${({ theme }) => theme.background};
  padding: 5px 0;
`;

const SearchInput = styled.input`
  background-color: ${({ theme }) => theme.backgroundTertiary};
  border: none;
  border-radius: 30px;
  padding: 12px 45px;
  width: 100%;
  color: ${({ theme }) => theme.text};
  font-size: 15px;

  &:focus {
    outline: 2px solid ${({ theme }) => theme.primary};
    background-color: ${({ theme }) => theme.background};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.textSecondary};
`;

const TrendsContainer = styled.div`
  background-color: ${({ theme }) => theme.backgroundSecondary};
  border-radius: 16px;
  margin-bottom: 16px;
  overflow: hidden;
`;

const TrendsHeader = styled.div`
  padding: 16px;
  font-size: 20px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SettingsIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const TrendItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  text-decoration: none;
  color: inherit;

  &:hover {
    background-color: ${({ theme }) => theme.backgroundTertiary};
  }
`;

const TrendCategory = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.textSecondary};
  display: flex;
  justify-content: space-between;
`;

const TrendOptions = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const TrendName = styled.div`
  font-weight: bold;
  margin: 2px 0;
`;

const TrendCount = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.textSecondary};
`;

const ShowMoreLink = styled.div`
  padding: 16px;
  color: ${({ theme }) => theme.primary};
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.backgroundTertiary};
  }
`;

const WhoToFollowContainer = styled.div`
  background-color: ${({ theme }) => theme.backgroundSecondary};
  border-radius: 16px;
  overflow: hidden;
`;

const WhoToFollowHeader = styled.div`
  padding: 16px;
  font-size: 20px;
  font-weight: bold;
`;

const UserToFollowItem = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  transition: background-color 0.2s;
  gap: 12px;

  &:hover {
    background-color: ${({ theme }) => theme.backgroundTertiary};
  }
`;

const UserAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const UserName = styled.div`
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserHandle = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserBio = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

const FollowButton = styled.button`
  background-color: ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.background};
  border-radius: 30px;
  padding: 8px 16px;
  font-weight: bold;
  transition: background-color 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: flex-start;
  margin-top: 2px;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.backgroundTertiary};
    color: ${({ theme }) => theme.textSecondary};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const Footer = styled.div`
  padding: 16px 0;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
  text-align: center;
`;

const RightBar = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [randomProfiles, setRandomProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Array of different section titles for variety
  const sectionTitles = [
    'People to Follow',
    'Discover People',
    'Suggested for You',
    'Trending Accounts',
    'People You Might Like',
    'New Faces',
    'Popular Users',
    'Featured Profiles'
  ];

  const fetchRandomProfiles = async () => {
    try {
      setProfilesLoading(true);
      
      // Only fetch if user is authenticated
      if (!user?._id) {
        console.log('User not loaded yet, skipping random profiles fetch');
        setRandomProfiles([]);
        return;
      }
      
      // Build query parameters
      const params = new URLSearchParams({ limit: '3' });
      params.append('excludeCurrentUser', user._id);
      
      console.log('Fetching random profiles, excluding user:', user._id);
      const response = await axios.get(`/api/users/random/suggestions?${params}`);
      
      if (response.data && response.data.length > 0) {
        // Double-check that current user is not included
        const filteredProfiles = response.data.filter(profile => profile._id !== user._id);
        console.log('Random profiles fetched:', filteredProfiles.length, 'profiles');
        setRandomProfiles(filteredProfiles);
      } else {
        // If no users found, show a message
        setRandomProfiles([]);
      }
    } catch (error) {
      console.error('Error fetching random profiles:', error);
      // Set sample profiles as fallback
      setRandomProfiles([
        { name: 'Elon Musk', username: 'elonmusk', profilePicture: '/images/tech-personalities/profiles/elonmusk.png' },
        { name: 'Jeff Bezos', username: 'jeffbezos', profilePicture: '/images/tech-personalities/profiles/jeffbezos.png' },
        { name: 'Sundar Pichai', username: 'sundarpichai', profilePicture: '/images/tech-personalities/profiles/sundarpichai.png' }
      ]);
    } finally {
      setProfilesLoading(false);
    }
  };

  const refreshRandomProfiles = () => {
    fetchRandomProfiles();
    // Rotate to next title for variety
    setCurrentTitleIndex((prevIndex) => (prevIndex + 1) % sectionTitles.length);
    // Update refresh timestamp
    setLastRefreshed(new Date());
  };

  useEffect(() => {
    // Only fetch random profiles if user is loaded
    if (user?._id) {
      fetchRandomProfiles();
    }
    
    // Refresh random profiles every 10 minutes for variety
    const profilesIntervalId = setInterval(() => {
      if (user?._id) {
        fetchRandomProfiles();
      }
    }, 10 * 60 * 1000);
    
    return () => {
      clearInterval(profilesIntervalId);
    };
  }, [user?._id]);



  return (
    <RightBarContainer>
      <SearchContainer>
        <SearchIcon>
          <FaSearch />
        </SearchIcon>
        <SearchInput placeholder="Search" />
      </SearchContainer>

      <TrendsContainer>
        <TrendsHeader>
          {sectionTitles[currentTitleIndex]}
          <span style={{ 
            fontSize: '14px', 
            fontWeight: 'normal', 
            color: '#8899a6',
            marginLeft: '8px'
          }}>
            ({randomProfiles.length} profiles)
          </span>
        </TrendsHeader>
        
        {!user?._id ? (
          <UserToFollowItem>
            <UserAvatar src="/images/default-profile.png" alt="Loading" />
            <UserInfo>
              <UserName>Loading profiles...</UserName>
              <UserHandle>Please wait</UserHandle>
            </UserInfo>
          </UserToFollowItem>
        ) : profilesLoading ? (
          <UserToFollowItem>
            <UserAvatar src="/images/default-profile.png" alt="Loading" />
            <UserInfo>
              <UserName>Loading profiles...</UserName>
              <UserHandle>Please wait</UserHandle>
            </UserInfo>
          </UserToFollowItem>
        ) : randomProfiles.length === 0 ? (
          <UserToFollowItem>
            <UserAvatar src="/images/default-profile.png" alt="No profiles" />
            <UserInfo>
              <UserName>No profiles available</UserName>
              <UserHandle>Check back later</UserHandle>
            </UserInfo>
          </UserToFollowItem>
        ) : (
          randomProfiles.map((profile, index) => {
            const isFollowing = user && user.following && user.following.includes(profile._id);
            const isCurrentUser = user && user._id === profile._id;
            
            return (
              <UserToFollowItem key={profile._id || index}>
                <UserAvatar 
                  src={profile.profilePicture || '/images/default-profile.png'} 
                  alt={profile.name} 
                />
                <UserInfo>
                  <UserName 
                    onClick={() => navigate(`/profile/${profile.username}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {profile.name}
                  </UserName>
                  <UserHandle 
                    onClick={() => navigate(`/profile/${profile.username}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    @{profile.username}
                  </UserHandle>
                </UserInfo>
                
                {!isCurrentUser && (
                  <FollowButton 
                    onClick={() => {
                      if (!user) {
                        navigate('/login');
                        return;
                      }
                      dispatch(followUser(profile._id));
                    }}
                    disabled={false}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </FollowButton>
                )}
              </UserToFollowItem>
            );
          })
        )}
        
        <ShowMoreLink onClick={refreshRandomProfiles}>
          Refresh profiles
        </ShowMoreLink>
        
        <div style={{ 
          padding: '8px 16px', 
          fontSize: '12px', 
          color: 'inherit',
          textAlign: 'center',
          borderTop: '1px solid inherit'
        }}>
          Last refreshed: {lastRefreshed.toLocaleTimeString()}
        </div>
      </TrendsContainer>

      <Footer>
        <div>© 2025 Twitter Clone - Tausif Akbar</div>
      </Footer>
    </RightBarContainer>
  );
};

export default RightBar; 