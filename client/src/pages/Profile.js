import axios from 'axios';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { FaCalendarAlt, FaCamera, FaExclamationCircle, FaHome, FaLink, FaMapMarkerAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import EditProfileModal from '../components/EditProfileModal';
import FollowModal from '../components/FollowModal';
import Tweet from '../components/Tweet';

const ProfileContainer = styled.div`
  width: 100%;
`;

const Header = styled.div`
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.background};
  z-index: 10;
  backdrop-filter: blur(10px);
  padding: 15px;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-items: center;
`;

const BackButton = styled.button`
  margin-right: 20px;
  font-size: 20px;
`;

const HeaderInfo = styled.div``;

const HeaderName = styled.div`
  font-weight: bold;
`;



const CoverPhoto = styled.div`
  height: 180px;
  background-color: ${({ theme }) => theme.primary};
  background-image: ${({ url }) => url ? `url(${url})` : 'none'};
  background-size: cover;
  background-position: center;
`;

const ProfileInfo = styled.div`
  padding: 15px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: relative;
  margin-bottom: 10px;
`;

const Avatar = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid ${({ theme }) => theme.background};
  position: absolute;
  top: -60px;
  background-color: ${({ theme }) => theme.background};
  object-fit: cover;
`;

const ProfileActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 5px;
`;

const EditProfileButton = styled.button`
  padding: 8px 16px;
  border-radius: 30px;
  font-weight: bold;
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
  background-color: transparent;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const FollowButton = styled.button`
  padding: 8px 16px;
  border-radius: 30px;
  font-weight: bold;
  background-color: ${({ theme, following }) => following ? 'transparent' : theme.text};
  color: ${({ theme, following }) => following ? theme.text : theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme, following }) => following ? theme.hover : theme.textSecondary};
  }
`;

const ProfileName = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 5px;
`;

const ProfileUsername = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 15px;
`;

const ProfileBio = styled.div`
  margin-bottom: 15px;
`;

const ProfileDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 15px;
  margin-bottom: 15px;
`;

const ProfileDetail = styled.div`
  display: flex;
  align-items: center;
  margin-right: 15px;
  margin-bottom: 5px;

  svg {
    margin-right: 5px;
  }
`;

const ProfileLink = styled.a`
  color: ${({ theme }) => theme.primary};
  &:hover {
    text-decoration: underline;
  }
`;

const FollowInfo = styled.div`
  display: flex;
`;

const FollowCount = styled.button`
  margin-right: 20px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;
  padding: 0;
  text-align: left;
  
  &:hover {
    text-decoration: underline;
  }
  
  span {
    font-weight: bold;
    color: ${({ theme }) => theme.text};
  }
`;

const TabMenu = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const Tab = styled.button`
  flex: 1;
  padding: 15px;
  font-weight: bold;
  color: ${({ active, theme }) => active ? theme.primary : theme.textSecondary};
  border-bottom: 2px solid ${({ active, theme }) => active ? theme.primary : 'transparent'};
  transition: color 0.2s, border-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
    color: ${({ theme }) => theme.primary};
  }
`;

const TweetList = styled.div``;

const LoadingMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
`;

const ErrorMessage = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${({ theme }) => theme.error};
  font-size: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

const ErrorActions = styled.div`
  margin-top: 16px;
`;

const ErrorButton = styled.button`
  padding: 8px 16px;
  border-radius: 30px;
  font-weight: bold;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.primaryDark};
  }
`;

const NoTweetsMessage = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 18px;
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
`;

const ProfilePictureOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(15, 20, 25, 0.75);
  border-radius: 50%;
  padding: 8px;
  cursor: pointer;
  z-index: 5;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(39, 44, 48, 0.75);
  }
`;

const Profile = () => {
  const { username } = useParams();
  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tweets');
  const [following, setFollowing] = useState(false);
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState('followers');
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  
  // eslint-disable-next-line
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user profile
        const userRes = await axios.get(`/api/users/${username}`);
        
        if (!userRes.data.success) {
          throw new Error(userRes.data.message || 'User not found');
        }
        
        setProfileUser(userRes.data.data);
        
        // Check if current user is following this user
        if (isAuthenticated && user) {
          setFollowing(user.following?.includes(userRes.data.data._id));
        }
        
        // Fetch user posts
        const postsRes = await axios.get(`/api/users/${username}/posts`);
        setUserPosts(postsRes.data.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err.response?.data?.message || err.message || 'User not found');
        setLoading(false);
      }
    };
    
    if (username) {
      fetchUserProfile();
    } else {
      setError('Invalid username');
      setLoading(false);
    }
  }, [username, isAuthenticated, user]);
  
  const handleFollowToggle = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(`/api/users/${profileUser._id}/follow`, {}, config);
      setFollowing(!following);
      
      // Update follower/following counts
      setProfileUser(prev => ({
        ...prev,
        followers: following 
          ? prev.followers.filter(id => id !== user._id)
          : [...prev.followers, user._id]
      }));
    } catch (err) {
      console.error('Failed to follow/unfollow user', err);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const filterPosts = () => {
    if (activeTab === 'tweets') {
      return userPosts.filter(post => !post.retweetData && !post.replyTo);
    } else if (activeTab === 'replies') {
      return userPosts.filter(post => post.replyTo);
    } else if (activeTab === 'media') {
      return userPosts.filter(post => post.media && post.media.length > 0);
    } else if (activeTab === 'likes') {
      // This would require a separate API call to get liked posts
      return [];
    }
    return userPosts;
  };
  
  const handleProfilePictureUpdate = (updatedUser) => {
    setProfileUser(updatedUser);
  };

  const handleCoverPhotoUpdate = (updatedUser) => {
    setProfileUser(updatedUser);
  };
  
  const filteredPosts = filterPosts();
  const joinDate = profileUser ? format(new Date(profileUser.createdAt), 'MMMM yyyy') : '';
  const isOwnProfile = isAuthenticated && user && profileUser && user._id === profileUser._id;

  // If there's an error, show a user-friendly error page
  if (error) {
    return (
      <ProfileContainer>
        <Header>
          <BackButton onClick={() => window.history.back()}>←</BackButton>
          <HeaderInfo>
            <HeaderName>Profile</HeaderName>
          </HeaderInfo>
        </Header>
        
        <ErrorMessage>
          <ErrorIcon>
            <FaExclamationCircle />
          </ErrorIcon>
          <div>
            <h3>User not found</h3>
            <p>The user @{username} doesn't exist or may have been deleted.</p>
          </div>
          <ErrorActions>
            <ErrorButton onClick={() => window.location.href = '/'}>
              <FaHome style={{ marginRight: '8px' }} /> Go Home
            </ErrorButton>
          </ErrorActions>
        </ErrorMessage>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      {followModalOpen && (
        <FollowModal
          isOpen={followModalOpen}
          onClose={() => setFollowModalOpen(false)}
          username={username}
          initialTab={followModalType}
        />
      )}
      
      {editProfileModalOpen && (
        <EditProfileModal
          isOpen={editProfileModalOpen}
          onClose={() => setEditProfileModalOpen(false)}
          user={profileUser}
          onProfileUpdate={setProfileUser}
        />
      )}
      
      <Header>
        <BackButton onClick={() => window.history.back()}>←</BackButton>
        <HeaderInfo>
          <HeaderName>{profileUser?.name}</HeaderName>
        </HeaderInfo>
      </Header>
      
      <div style={{ position: 'relative' }}>
        <CoverPhoto url={profileUser?.coverPicture} />
        {isOwnProfile && (
          <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
            <button 
              style={{ 
                backgroundColor: 'rgba(15, 20, 25, 0.75)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '50px', 
                padding: '6px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onClick={() => document.getElementById('cover-photo-upload').click()}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(39, 44, 48, 0.75)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 20, 25, 0.75)'}
            >
              <FaCamera size={14} /> Change Cover
            </button>
            <input
              type="file"
              id="cover-photo-upload"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const formData = new FormData();
                  formData.append('coverPicture', file);
                  
                  const token = localStorage.getItem('token');
                  const config = {
                    headers: {
                      'Content-Type': 'multipart/form-data',
                      Authorization: `Bearer ${token}`
                    }
                  };
                  
                  axios.put('/api/users/cover-picture', formData, config)
                    .then(res => {
                      handleCoverPhotoUpdate(res.data.data);
                    })
                    .catch(err => {
                      console.error('Error uploading cover photo:', err);
                    });
                }
              }}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
        )}
      </div>
      
      <ProfileInfo>
        <AvatarContainer>
          <Avatar 
            src={profileUser?.profilePicture || '/images/default-profile.png'} 
            alt={profileUser?.name} 
          />
          {isOwnProfile && (
            <ProfilePictureOverlay>
              <input
                type="file"
                id="profile-picture-upload"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const formData = new FormData();
                    formData.append('profilePicture', file);
                    
                    const token = localStorage.getItem('token');
                    const config = {
                      headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                      }
                    };
                    
                    axios.put('/api/users/profile-picture', formData, config)
                      .then(res => {
                        handleProfilePictureUpdate(res.data.data);
                      })
                      .catch(err => {
                        console.error('Error uploading profile picture:', err);
                      });
                  }
                }}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <FaCamera 
                color="white" 
                size={18} 
                onClick={() => document.getElementById('profile-picture-upload').click()}
              />
            </ProfilePictureOverlay>
          )}
        </AvatarContainer>
        
        <ProfileActions>
          {isOwnProfile ? (
            <EditProfileButton onClick={() => setEditProfileModalOpen(true)}>
              Edit profile
            </EditProfileButton>
          ) : isAuthenticated && (
            <FollowButton 
              following={following}
              onClick={handleFollowToggle}
            >
              {following ? 'Following' : 'Follow'}
            </FollowButton>
          )}
        </ProfileActions>
        
        <ProfileName>{profileUser?.name}</ProfileName>
        <ProfileUsername>@{profileUser?.username}</ProfileUsername>
        
        {profileUser?.bio && <ProfileBio>{profileUser.bio}</ProfileBio>}
        
        <ProfileDetails>
          {profileUser?.location && (
            <ProfileDetail>
              <FaMapMarkerAlt />
              {profileUser.location}
            </ProfileDetail>
          )}
          
          {profileUser?.website && (
            <ProfileDetail>
              <FaLink />
              <ProfileLink href={profileUser.website} target="_blank" rel="noopener noreferrer">
                {profileUser.website.replace(/(^\w+:|^)\/\//, '')}
              </ProfileLink>
            </ProfileDetail>
          )}
          
          <ProfileDetail>
            <FaCalendarAlt />
            Joined {joinDate}
          </ProfileDetail>
        </ProfileDetails>
        
        <FollowInfo>
          <FollowCount onClick={() => {
            setFollowModalType('following');
            setFollowModalOpen(true);
          }}>
            <span>{profileUser?.following?.length || 0}</span> Following
          </FollowCount>
          <FollowCount onClick={() => {
            setFollowModalType('followers');
            setFollowModalOpen(true);
          }}>
            <span>{profileUser?.followers?.length || 0}</span> Followers
          </FollowCount>
        </FollowInfo>
      </ProfileInfo>
      
      <TabMenu>
        <Tab 
          active={activeTab === 'tweets'} 
          onClick={() => handleTabChange('tweets')}
        >
          Tweets
        </Tab>
        <Tab 
          active={activeTab === 'replies'} 
          onClick={() => handleTabChange('replies')}
        >
          Replies
        </Tab>
        <Tab 
          active={activeTab === 'media'} 
          onClick={() => handleTabChange('media')}
        >
          Media
        </Tab>
        <Tab 
          active={activeTab === 'likes'} 
          onClick={() => handleTabChange('likes')}
        >
          Likes
        </Tab>
      </TabMenu>
      
      <TweetList>
        {loading ? (
          <LoadingMessage>Loading tweets...</LoadingMessage>
        ) : error ? (
          <ErrorMessage>Error: {error}</ErrorMessage>
        ) : filteredPosts.length === 0 ? (
          <NoTweetsMessage>
            {activeTab === 'tweets' 
              ? 'No tweets yet.' 
              : activeTab === 'replies' 
                ? 'No replies yet.' 
                : activeTab === 'media' 
                  ? 'No media tweets yet.' 
                  : 'No likes yet.'}
          </NoTweetsMessage>
        ) : (
          filteredPosts.map((post) => <Tweet key={post._id} tweet={post} />)
        )}
      </TweetList>
    </ProfileContainer>
  );
};

export default Profile; 