import React, { memo, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import EmojiPicker from '../components/EmojiPicker';
import FormattedInput from '../components/FormattedInput';
import MediaUpload from '../components/MediaUpload';

import Tweet from '../components/Tweet';
import { loadUser } from '../redux/slices/authSlice';
import { createPost, getPosts } from '../redux/slices/postSlice';

const HomeContainer = styled.div`
  width: 100%;
`;

const Header = styled.div`
  padding: 0;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.background};
  z-index: 10;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
`;

const HeaderTitle = styled.div`
  padding: 16px;
  font-size: 20px;
  font-weight: bold;
`;

const HeaderTabs = styled.div`
  display: flex;
  width: 100%;
`;

const HeaderTab = styled.div`
  flex: 1;
  text-align: center;
  padding: 16px;
  cursor: pointer;
  position: relative;
  color: ${props => props.active ? props.theme.text : props.theme.textSecondary};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }

  ${props => props.active && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 56px;
      height: 4px;
      background-color: ${props.theme.primary};
      border-radius: 2px;
    }
  `}
`;

const TweetFormContainer = styled.div`
  padding: 16px 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
`;

const TweetContent = styled.div`
  display: flex;
  gap: 12px;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

const TweetForm = styled.form`
  flex: 1;
  margin-top: 12px;
`;



const TweetActions = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 12px;
`;

const TweetToolbar = styled.div`
  display: flex;
  gap: 12px;
`;



const CharCount = styled.span`
  color: ${({ theme, overLimit }) => overLimit ? theme.error : theme.textSecondary};
  font-size: 14px;
`;

const TweetButton = styled.button`
  background-color: ${({ theme, disabled }) => disabled ? theme.textSecondary : theme.primary};
  color: white;
  border-radius: 30px;
  padding: 10px 20px;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme, disabled }) => disabled ? theme.textSecondary : theme.buttonHover};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const TweetList = styled.div``;

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

const NoTweetsMessage = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 18px;
`;

const Home = () => {
  const [tweetContent, setTweetContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const maxCharCount = 280;
  
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { posts, loading, error } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(getPosts());
  }, [dispatch]);

  // Refresh authentication state when returning to the page
  useEffect(() => {
    const handleFocus = () => {
      // Check if we have a token but no user data
      const token = localStorage.getItem('token');
      if (token && !user && isAuthenticated) {
        console.log('Refreshing user data on page focus');
        dispatch(loadUser());
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch, user, isAuthenticated]);

  const handleTweetChange = useCallback((content) => {
    setTweetContent(content);
  }, []);

  const handleMediaChange = useCallback((files) => {
    setMediaFiles(files);
  }, []);

  const handleEmojiSelect = useCallback((emoji) => {
    // Use a more efficient way to add emoji to the current content
    setTweetContent(prev => prev + emoji);
  }, []);

  const handleTweetSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if ((tweetContent.trim() || mediaFiles.length > 0) && (!tweetContent.trim() || tweetContent.length <= maxCharCount)) {
      const formData = new FormData();
      formData.append('content', tweetContent);
      
      mediaFiles.forEach(file => {
        formData.append('media', file);
      });

      const result = await dispatch(createPost(formData));
      
      if (!result.error) {
        setTweetContent('');
        setMediaFiles([]);
      }
    }
  }, [tweetContent, mediaFiles, maxCharCount, dispatch]);

  const isOverCharLimit = tweetContent.length > maxCharCount;
  const remainingChars = maxCharCount - tweetContent.length;

  return (
    <HomeContainer>
      <Header>
        <HeaderTitle>Home</HeaderTitle>
        <HeaderTabs>
          <HeaderTab active={true}>
            For you
          </HeaderTab>
        </HeaderTabs>
      </Header>
      
      <TweetFormContainer>
        <TweetContent>
          <Avatar src={user?.profilePicture || '/images/default-profile.png'} alt={user?.name} />
          <TweetForm onSubmit={handleTweetSubmit}>
            <FormattedInput
              placeholder="What's happening?"
              value={tweetContent}
              onChange={handleTweetChange}
            />
            <TweetToolbar>
              <MediaUpload onMediaChange={handleMediaChange} />
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </TweetToolbar>
            <TweetActions>
              <CharCount overLimit={isOverCharLimit} style={{ marginRight: '12px', visibility: tweetContent.length > 0 ? 'visible' : 'hidden' }}>
                {remainingChars}
              </CharCount>
              <TweetButton 
                type="submit" 
                disabled={(!tweetContent.trim() && mediaFiles.length === 0) || isOverCharLimit || loading}
              >
                Tweet
              </TweetButton>
            </TweetActions>
          </TweetForm>
        </TweetContent>
      </TweetFormContainer>
      
      <TweetList>
        {loading ? (
          <LoadingMessage>Loading tweets...</LoadingMessage>
        ) : error ? (
          <ErrorMessage>
            {error === 'Failed to fetch' ? (
              <div>
                <div>Error loading tweets</div>
                <div style={{ fontSize: '14px', marginTop: '8px', color: '#8899a6' }}>
                  This might be a temporary issue. Please try refreshing the page.
                </div>
                <button 
                  onClick={() => dispatch(getPosts())}
                  style={{
                    marginTop: '12px',
                    padding: '8px 16px',
                    backgroundColor: '#1DA1F2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Try Again
                </button>
              </div>
            ) : (
              `Error loading tweets: ${error}`
            )}
          </ErrorMessage>
        ) : posts.length === 0 ? (
          <NoTweetsMessage>No tweets yet. Be the first to tweet!</NoTweetsMessage>
        ) : (
          posts.map((post) => <Tweet key={post._id} tweet={post} />)
        )}
      </TweetList>
    </HomeContainer>
  );
};

export default memo(Home); 