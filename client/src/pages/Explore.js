import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Search from '../components/Search';
import { followUser } from '../redux/slices/authSlice';

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  padding: 16px;
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.background};
  z-index: 10;
  backdrop-filter: blur(10px);
`;

const SearchContainer = styled.div`
  margin-bottom: 16px;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const Tab = styled.div`
  padding: 16px;
  font-weight: ${({ active }) => (active ? 'bold' : 'normal')};
  color: ${({ theme, active }) => (active ? theme.text : theme.textSecondary)};
  border-bottom: 2px solid ${({ theme, active }) => (active ? 'transparent' : 'transparent')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }

  ${({ active, theme }) => active && `
    border-bottom-color: ${theme.primary};
  `}
`;

const ContentSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.text};
`;

const HashtagGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
`;

const HashtagCard = styled.div`
  background-color: ${({ theme }) => theme.backgroundSecondary};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid ${({ theme }) => theme.border};

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const HashtagText = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 4px;
`;

const HashtagCount = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary};
`;

const ProfileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const ProfileCard = styled.div`
  background-color: ${({ theme }) => theme.backgroundSecondary};
  border-radius: 16px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const ProfileAvatar = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 16px;
  object-fit: cover;
  border: 3px solid ${({ theme }) => theme.primary};
  cursor: pointer;
`;

const ProfileInfo = styled.div`
  flex: 1;
  cursor: pointer;
`;

const ProfileName = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  margin-bottom: 4px;
  font-size: 18px;
`;

const ProfileHandle = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  margin-bottom: 8px;
`;

const ProfileBio = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 16px;
`;

const FollowButton = styled.button`
  background-color: ${({ theme, following }) => following ? 'transparent' : theme.primary};
  color: ${({ following, theme }) => following ? theme.primary : 'white'};
  border: ${({ following, theme }) => following ? `1px solid ${theme.primary}` : 'none'};
  border-radius: 25px;
  padding: 10px 20px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  width: 100%;

  &:hover {
    background-color: ${({ theme, following }) => following ? 'rgba(29, 161, 242, 0.1)' : theme.buttonHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
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

const EmptyState = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
`;

const Explore = () => {
  const [activeTab, setActiveTab] = useState('hashtags');
  const [hashtags, setHashtags] = useState([]);
  const [randomProfiles, setRandomProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followLoading, setFollowLoading] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch random hashtags from posts
        const hashtagsResponse = await axios.get('/api/search/hashtags');
        setHashtags(hashtagsResponse.data || []);
        
        // Fetch random profiles
        const profilesResponse = await axios.get('/api/users/random/suggestions?limit=12');
        setRandomProfiles(profilesResponse.data || []);
        
      } catch (error) {
        console.error('Error fetching explore data:', error);
        setError('Failed to load explore content');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFollowToggle = async (userId, isFollowing) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    // Prevent following yourself
    if (user && user._id === userId) {
      return;
    }

    try {
      setFollowLoading(prev => ({ ...prev, [userId]: true }));
      await dispatch(followUser(userId)).unwrap();
    } catch (error) {
      console.error('Failed to follow/unfollow user:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleProfileClick = (username) => {
    navigate(`/profile/${username}`);
  };

  const renderHashtagsContent = () => {
    if (hashtags.length === 0) {
      // Show sample hashtags as fallback
      const sampleHashtags = [
        { name: 'technology', count: 42 },
        { name: 'programming', count: 38 },
        { name: 'webdev', count: 35 },
        { name: 'react', count: 31 },
        { name: 'javascript', count: 28 },
        { name: 'mongodb', count: 25 },
        { name: 'nodejs', count: 22 },
        { name: 'express', count: 19 },
        { name: 'ai', count: 17 },
        { name: 'machinelearning', count: 15 }
      ];
      
      return (
        <>
          <div style={{ padding: '16px', color: '#8899a6', fontSize: '14px' }}>
            Showing sample hashtags (API data unavailable)
          </div>
          <HashtagGrid>
            {sampleHashtags.map((hashtag, index) => (
              <Link 
                key={index}
                to={`/hashtag/${hashtag.name}`} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <HashtagCard>
                  <HashtagText>#{hashtag.name}</HashtagText>
                  <HashtagCount>{hashtag.count} Tweets</HashtagCount>
                </HashtagCard>
              </Link>
            ))}
          </HashtagGrid>
        </>
      );
    }

    return (
      <HashtagGrid>
        {hashtags.map((hashtag, index) => (
          <Link 
            key={index}
            to={`/hashtag/${hashtag.name}`} 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <HashtagCard>
              <HashtagText>#{hashtag.name}</HashtagText>
              <HashtagCount>{hashtag.count} Tweets</HashtagCount>
            </HashtagCard>
          </Link>
        ))}
      </HashtagGrid>
    );
  };

  const renderProfilesContent = () => {
    if (randomProfiles.length === 0) {
      // Show sample profiles as fallback
      const sampleProfiles = [
        { 
          name: 'Elon Musk', 
          username: 'elonmusk', 
          profilePicture: '/images/tech-personalities/profiles/elonmusk.png',
          bio: 'CEO of Tesla & SpaceX | Mars colonization | AI & sustainable energy'
        },
        { 
          name: 'Jeff Bezos', 
          username: 'jeffbezos', 
          profilePicture: '/images/tech-personalities/profiles/jeffbezos.png',
          bio: 'Founder of Amazon | Blue Origin space exploration | Innovation & disruption'
        },
        { 
          name: 'Sundar Pichai', 
          username: 'sundarpichai', 
          profilePicture: '/images/tech-personalities/profiles/sundarpichai.png',
          bio: 'CEO of Google & Alphabet | AI & machine learning | Product innovation'
        },
        { 
          name: 'Tim Cook', 
          username: 'tim_cook', 
          profilePicture: '/images/tech-personalities/profiles/tim_cook.png',
          bio: 'CEO of Apple | Privacy & security | Sustainable technology'
        },
        { 
          name: 'Mark Zuckerberg', 
          username: 'zuck', 
          profilePicture: '/images/tech-personalities/profiles/zuck.png',
          bio: 'Founder of Meta | Metaverse & VR | Social technology'
        },
        { 
          name: 'Jensen Huang', 
          username: 'jensenhuang', 
          profilePicture: '/images/tech-personalities/profiles/jensenhuang.png',
          bio: 'CEO of NVIDIA | GPU computing | AI & gaming technology'
        }
      ];
      
      return (
        <>
          <div style={{ padding: '16px', color: '#8899a6', fontSize: '14px' }}>
            Showing sample profiles (API data unavailable)
          </div>
          <ProfileGrid>
            {sampleProfiles.map((profile, index) => (
              <ProfileCard key={index}>
                <ProfileHeader>
                  <ProfileAvatar 
                    src={profile.profilePicture} 
                    alt={profile.name}
                    onClick={() => handleProfileClick(profile.username)}
                  />
                  <ProfileInfo onClick={() => handleProfileClick(profile.username)}>
                    <ProfileName>{profile.name}</ProfileName>
                    <ProfileHandle>@{profile.username}</ProfileHandle>
                    <ProfileBio>{profile.bio}</ProfileBio>
                  </ProfileInfo>
                </ProfileHeader>
                <FollowButton 
                  onClick={() => handleFollowToggle(profile._id || profile.username, false)}
                  disabled={!isAuthenticated}
                >
                  {!isAuthenticated ? 'Sign in to follow' : 'Follow'}
                </FollowButton>
              </ProfileCard>
            ))}
          </ProfileGrid>
        </>
      );
    }

    return (
      <ProfileGrid>
        {randomProfiles.map((profile, index) => {
          const isFollowing = user && user.following && user.following.includes(profile._id);
          const isCurrentUser = user && user._id === profile._id;
          
          return (
            <ProfileCard key={profile._id || index}>
              <ProfileHeader>
                <ProfileAvatar 
                  src={profile.profilePicture || '/images/default-profile.png'} 
                  alt={profile.name}
                  onClick={() => handleProfileClick(profile.username)}
                />
                <ProfileInfo onClick={() => handleProfileClick(profile.username)}>
                  <ProfileName>{profile.name}</ProfileName>
                  <ProfileHandle>@{profile.username}</ProfileHandle>
                  <ProfileBio>
                    {profile.bio || 'Tech enthusiast and innovator'}
                  </ProfileBio>
                </ProfileInfo>
              </ProfileHeader>
              {!isCurrentUser && (
                <FollowButton 
                  following={isFollowing}
                  onClick={() => handleFollowToggle(profile._id, isFollowing)}
                  disabled={followLoading[profile._id]}
                >
                  {followLoading[profile._id] 
                    ? '...' 
                    : isFollowing 
                      ? 'Following' 
                      : 'Follow'
                  }
                </FollowButton>
              )}
            </ProfileCard>
          );
        })}
      </ProfileGrid>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'hashtags':
        return renderHashtagsContent();
      case 'profiles':
        return renderProfilesContent();
      default:
        return renderHashtagsContent();
    }
  };

  if (loading) {
    return <LoadingMessage>Loading explore content...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <Container>
      <Header>
        <SearchContainer>
          <Search />
        </SearchContainer>
        <TabContainer>
          <Tab
            active={activeTab === 'hashtags'}
            onClick={() => setActiveTab('hashtags')}
          >
            Hashtags
          </Tab>
          <Tab
            active={activeTab === 'profiles'}
            onClick={() => setActiveTab('profiles')}
          >
            Profiles
          </Tab>
        </TabContainer>
      </Header>

      {renderContent()}
    </Container>
  );
};

export default Explore;