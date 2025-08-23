import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { BsThreeDots } from 'react-icons/bs';
import { FaHeart, FaRegComment, FaRegHeart, FaRetweet, FaRetweet as FaRetweetFill, FaTrash, FaUpload } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { deletePost, likePost, retweetPost } from '../redux/slices/postSlice';

const TweetContainer = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  transition: background-color 0.2s;
  position: relative;

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

const TweetContent = styled.div`
  flex: 1;
  position: relative;
`;

const TweetHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2px;
  flex-wrap: wrap;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
`;

const UserName = styled(Link)`
  font-weight: bold;
  color: ${({ theme }) => theme.text};
  margin-right: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    text-decoration: underline;
  }
`;

// Keeping this for future verified user feature
// const VerifiedBadge = styled.span`
//   color: ${({ theme }) => theme.primary};
//   margin-left: 2px;
//   font-size: 14px;
// `;

const UserHandle = styled(Link)`
  color: ${({ theme }) => theme.textSecondary};
  margin-right: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover {
    text-decoration: underline;
  }
`;

const TweetTime = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  white-space: nowrap;
  &::before {
    content: '·';
    margin: 0 4px;
  }
`;

const TweetOptions = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  margin-left: auto;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  position: relative;
  
  &:hover {
    background-color: ${({ theme }) => theme.backgroundTertiary};
    color: ${({ theme }) => theme.primary};
  }
`;

const OptionsDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
  margin-top: 8px;
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 12px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid ${({ theme }) => theme.background};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -7px;
    right: 12px;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid ${({ theme }) => theme.border};
  }
`;

const OptionItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  color: ${({ theme, danger }) => danger ? theme.error : theme.text};
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme, danger }) => danger ? 'rgba(220, 38, 38, 0.1)' : theme.hover};
  }
  
  &:first-child {
    border-radius: 12px 12px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 12px 12px;
  }
  
  &:only-child {
    border-radius: 12px;
  }
`;

const TweetText = styled.div`
  margin-bottom: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 15px;
  line-height: 1.3;

  a {
    color: ${({ theme }) => theme.primary};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
  
  .hashtag-link {
    color: ${({ theme }) => theme.primary};
    font-weight: 500;
  }
  
  .mention-link {
    color: ${({ theme }) => theme.primary};
  }
`;

const TweetMedia = styled.div`
  margin-bottom: 12px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border};
`;

const MediaItem = styled.div`
  width: 100%;
  max-height: 300px;
  position: relative;
  
  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 16px;
    display: block;
  }
  
  video {
    background-color: #000;
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.3s ease;
    
    &:hover {
      opacity: 0.95;
    }
  }
  
  img {
    cursor: pointer;
    
    &:hover {
      opacity: 0.95;
    }
  }
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.count > 1 ? '1fr 1fr' : '1fr'};
  grid-template-rows: ${props => props.count > 2 ? '1fr 1fr' : '1fr'};
  gap: 2px;
  max-height: 300px;
`;

const SingleMediaItem = styled(MediaItem)`
  height: ${props => props.count === 1 ? '300px' : '150px'};
`;

const MultiMediaItem = styled(MediaItem)`
  height: 150px;
`;

const TweetActions = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 425px;
  margin-top: 4px;
  position: relative;
  z-index: 10;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  color: ${({ theme, active, color }) => active ? color : theme.textSecondary};
  transition: all 0.2s;
  border-radius: 50%;
  font-size: 18px;

  &:hover {
    color: ${({ color }) => color};
    
    & > div {
      background-color: ${({ color, theme }) => color === theme.primary ? 'rgba(29, 155, 240, 0.1)' : 
        color === theme.retweet ? 'rgba(0, 186, 124, 0.1)' : 
        color === theme.like ? 'rgba(249, 24, 128, 0.1)' : 'transparent'};
    }
  }
`;

const ActionIconWrapper = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s, transform 0.2s;

  ${props => props.isLikeButton && props.active && `
    animation: heartPulse 0.3s ease-out;
    
    @keyframes heartPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.3); }
      100% { transform: scale(1); }
    }
  `}

  ${props => props.isRetweetButton && props.active && `
    animation: retweetSpin 0.3s ease-out;
    
    @keyframes retweetSpin {
      0% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.2) rotate(180deg); }
      100% { transform: scale(1) rotate(360deg); }
    }
  `}
`;

// Add global CSS for loading spinner
const GlobalStyle = styled.div`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ActionText = styled.span`
  margin-left: 4px;
  font-size: 13px;
`;

const RetweetInfo = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 4px;
  font-size: 13px;
  display: flex;
  align-items: center;
`;

const RetweetIcon = styled(FaRetweet)`
  margin-right: 6px;
  color: ${({ theme }) => theme.retweet};
  font-size: 12px;
`;

const FilledRetweetIcon = styled(FaRetweetFill)`
  color: ${({ theme }) => theme.retweet};
  transition: transform 0.2s;
`;

const FilledHeartIcon = styled(FaHeart)`
  color: ${({ theme }) => theme.like};
  transition: transform 0.2s;
`;

const OutlineHeartIcon = styled(FaRegHeart)`
  transition: transform 0.2s;
`;

const ReplyInfo = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 4px;
  font-size: 13px;
`;

const Tweet = ({ tweet, onReplyClick, isDetailView = false }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showOptions, setShowOptions] = React.useState(false);
  const [isRetweeting, setIsRetweeting] = React.useState(false);
  
  // Handle retweet display
  const isRetweet = tweet.retweetData !== undefined;
  const mainTweet = isRetweet ? tweet.retweetData : tweet;
  
  // Check if user has liked or retweeted
  const isLiked = mainTweet?.likes?.includes(user?._id);
  const isRetweeted = mainTweet?.retweets?.includes(user?._id);
  
  // Debug logging for retweet state
  console.log('Tweet retweet state:', {
    tweetId: mainTweet?._id,
    userId: user?._id,
    retweets: mainTweet?.retweets,
    isRetweeted
  });
  
  // Format date
  const timeAgo = formatDistanceToNow(new Date(mainTweet?.createdAt || Date.now()), { addSuffix: true });
  
  // Helper function to detect media type
  const getMediaType = (mediaPath) => {
    if (!mediaPath || typeof mediaPath !== 'string') return 'unknown';
    
    console.log('getMediaType input:', mediaPath);
    
    const videoExtensions = /\.(mp4|webm|ogg|mov|avi|mkv|m4v|3gp|flv|wmv|mpg|mpeg|3g2|f4v|f4p|f4a|f4b)$/i;
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff|tif)$/i;
    
    if (videoExtensions.test(mediaPath)) {
      console.log('Detected video type for:', mediaPath);
      return 'video';
    }
    if (imageExtensions.test(mediaPath)) {
      console.log('Detected image type for:', mediaPath);
      return 'image';
    }
    
    console.log('Unknown media type for:', mediaPath);
    return 'unknown';
  };
  
  // Helper function to get proper media URL
  const getMediaUrl = (mediaPath) => {
    if (!mediaPath) return '';
    
    // Convert to string if it's not already
    const path = String(mediaPath);
    
    console.log('getMediaUrl input:', mediaPath, 'converted to:', path);
    
    if (path.startsWith('http')) return path;
    if (path.startsWith('//')) return `https:${path}`;
    
    // Handle relative paths - if it already starts with /uploads/, return as is
    if (path.startsWith('/uploads/')) return path;
    
    // If it's just a filename without path, add the uploads path
    if (path.includes('.') && !path.startsWith('/')) {
      const result = `/uploads/${path}`;
      console.log('Adding uploads path:', result);
      return result;
    }
    
    // If it starts with / but not /uploads/, return as is
    if (path.startsWith('/')) return path;
    
    // Default case - add slash prefix
    const result = `/${path}`;
    console.log('Adding slash prefix:', result);
    return result;
  };
  
  // Handle actions
  const handleLike = () => {
    // Optimistic update for better UX
    const optimisticUpdate = !isLiked;
    
    // Dispatch the action to update the backend
    dispatch(likePost(mainTweet._id));
  };
  
  const handleRetweet = () => {
    if (!user?._id) {
      console.log('User not authenticated, cannot retweet');
      return;
    }
    
    if (isRetweeting) {
      console.log('Retweet already in progress');
      return;
    }
    
    console.log('Attempting to retweet post:', mainTweet._id);
    setIsRetweeting(true);
    dispatch(retweetPost(mainTweet._id))
      .finally(() => {
        setIsRetweeting(false);
      });
  };
  
  const handleDelete = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this tweet?\n\n' +
      'This action cannot be undone and will permanently remove the tweet and all associated data.'
    );
    
    if (confirmed) {
      dispatch(deletePost(tweet._id));
      setShowOptions(false);
    }
  };
  

  
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };
  
  // Close options when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptions && !event.target.closest('.tweet-options')) {
        setShowOptions(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showOptions]);

  if (!mainTweet) return null;

  const formatTweetContent = (content) => {
    if (!content) return '';
    
    // Replace hashtags with links - improved regex to catch more hashtag formats
    content = content.replace(/#(\w+)/g, (match, tag) => {
      return `<a href="/hashtag/${tag}" class="hashtag-link">#${tag}</a>`;
    });
    
    // Replace @mentions with links
    content = content.replace(/@(\w+)/g, (match, username) => {
      return `<a href="/profile/${username}" class="mention-link">@${username}</a>`;
    });
    
    return content;
  };

  return (
    <>
      <TweetContainer>
        <Avatar 
          src={mainTweet.user?.profilePicture || '/images/default-profile.png'} 
          alt={mainTweet.user?.name} 
        />
        <TweetContent>
          {isRetweet && (
            <RetweetInfo>
              <RetweetIcon />
              {tweet.user?.name === user?.name ? 'You' : tweet.user?.name} retweeted
            </RetweetInfo>
          )}
          
          {mainTweet.replyTo && (
            <ReplyInfo>
              Replying to <Link to={`/profile/${mainTweet.replyTo.user?.username}`}>@{mainTweet.replyTo.user?.username}</Link>
            </ReplyInfo>
          )}
          
          <TweetHeader>
            <UserInfo>
              <UserName to={`/profile/${mainTweet.user?.username}`}>
                {mainTweet.user?.name}
              </UserName>
              <UserHandle to={`/profile/${mainTweet.user?.username}`}>
                @{mainTweet.user?.username}
              </UserHandle>
              <TweetTime>{timeAgo}</TweetTime>
            </UserInfo>
            
            <TweetOptions className="tweet-options" onClick={toggleOptions}>
              <BsThreeDots />
              {showOptions && (
                <OptionsDropdown>
                  {mainTweet.user?._id === user?._id && (
                    <OptionItem onClick={handleDelete} danger>
                      <FaTrash size={16} />
                      Delete post
                    </OptionItem>
                  )}
                </OptionsDropdown>
              )}
            </TweetOptions>
          </TweetHeader>
          
          <TweetText dangerouslySetInnerHTML={{ __html: formatTweetContent(mainTweet.content) }} />
          
          {(() => {
            if (!mainTweet.media || mainTweet.media.length === 0) return null;
            
            // Debug logging
            console.log('Tweet media data:', mainTweet.media);
            
            // Filter out null/undefined media items
            const validMedia = mainTweet.media.filter(media => media != null);
            if (validMedia.length === 0) return null;
            
            console.log('Valid media items:', validMedia);
            
            return (
              <TweetMedia>
                <MediaGrid count={validMedia.length}>
                  {validMedia.map((media, index) => {
                    let mediaUrl = '';
                    let mediaType = 'unknown';
                    
                    console.log(`Processing media item ${index}:`, media);
                    
                    // Enhanced media handling with better debugging
                    if (typeof media === 'string') {
                      console.log(`Media ${index} is string:`, media);
                      mediaUrl = getMediaUrl(media);
                      mediaType = getMediaType(media);
                    } else if (media && typeof media === 'object') {
                      console.log(`Media ${index} is object:`, media);
                      
                      // Handle corrupted media objects (character-by-character storage)
                      if (media['0'] === '/' && media['1'] === 'u' && media['2'] === 'p') {
                        console.log(`Media ${index} is corrupted, reconstructing path`);
                        // Reconstruct the path from character properties
                        const pathLength = Object.keys(media).filter(key => !isNaN(key)).length;
                        let reconstructedPath = '';
                        for (let i = 0; i < pathLength; i++) {
                          reconstructedPath += media[i];
                        }
                        console.log(`Reconstructed path:`, reconstructedPath);
                        mediaUrl = getMediaUrl(reconstructedPath);
                        mediaType = getMediaType(reconstructedPath);
                      } else if (media.url) {
                        console.log(`Using media.url:`, media.url);
                        mediaUrl = getMediaUrl(media.url);
                        mediaType = media.type || getMediaType(media.url);
                      } else if (media.filename) {
                        console.log(`Using media.filename:`, media.filename);
                        mediaUrl = getMediaUrl(media.filename);
                        mediaType = media.type || getMediaType(media.filename);
                      } else {
                        console.log(`Media object has no url or filename:`, media);
                      }
                    } else {
                      console.log(`Media ${index} is neither string nor object:`, media, 'type:', typeof media);
                    }
                    
                    console.log(`Media ${index} - URL: ${mediaUrl}, Type: ${mediaType}`);
                    
                    // Skip if no valid URL
                    if (!mediaUrl) {
                      console.log('Skipping media item with no valid URL:', media);
                      return null;
                    }
                    
                    return (
                      <MediaItem key={index}>
                        {mediaType === 'video' ? (
                          <video 
                            src={mediaUrl} 
                            controls 
                            preload="metadata"
                            style={{ backgroundColor: '#000' }}
                            onError={(e) => {
                              console.error('Video loading error:', e);
                              console.error('Video URL that failed:', mediaUrl);
                              e.target.style.display = 'none';
                            }}
                            onLoadStart={(e) => {
                              console.log('Video loading started:', mediaUrl);
                              e.target.pause();
                            }}
                            onPlay={(e) => {
                              // Pause all other videos when one starts playing
                              const allVideos = document.querySelectorAll('video');
                              allVideos.forEach(video => {
                                if (video !== e.target) {
                                  video.pause();
                                }
                              });
                            }}
                          />
                        ) : (
                          <img 
                            src={mediaUrl} 
                            alt={`Tweet media ${index + 1}`}
                            loading="lazy"
                            onError={(e) => {
                              console.error('Image loading error:', e);
                              console.error('Image URL that failed:', mediaUrl);
                              e.target.style.display = 'none';
                            }}
                            onLoad={(e) => {
                              console.log('Image loaded successfully:', mediaUrl);
                            }}
                          />
                        )}
                      </MediaItem>
                    );
                  }).filter(Boolean)}
                </MediaGrid>
              </TweetMedia>
            );
          })()}
          
          <TweetActions>
            <ActionButton 
              onClick={handleLike} 
              active={isLiked} 
              color={({ theme }) => theme.like}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <ActionIconWrapper isLikeButton active={isLiked}>
                {isLiked ? <FilledHeartIcon /> : <OutlineHeartIcon />}
              </ActionIconWrapper>
              <ActionText>{mainTweet.likes?.length || 0}</ActionText>
            </ActionButton>
            
            <ActionButton 
              onClick={onReplyClick} 
              color={({ theme }) => theme.primary}
              as={isDetailView ? 'div' : Link}
              to={isDetailView ? undefined : `/post/${mainTweet._id}`}
            >
              <ActionIconWrapper>
                <FaRegComment />
              </ActionIconWrapper>
              <ActionText>{mainTweet.replies?.length || 0}</ActionText>
            </ActionButton>
            
            <ActionButton 
              onClick={handleRetweet} 
              active={isRetweeted} 
              color={({ theme }) => theme.retweet}
              disabled={isRetweeting}
            >
              <ActionIconWrapper isRetweetButton active={isRetweeted}>
                {isRetweeting ? (
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid currentColor', 
                    borderTop: '2px solid transparent', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite' 
                  }} />
                ) : (
                  isRetweeted ? <FaRetweetFill /> : <FaRetweet />
                )}
              </ActionIconWrapper>
              <ActionText>{mainTweet.retweets?.length || 0}</ActionText>
            </ActionButton>
            
            <ActionButton color={({ theme }) => theme.primary}>
              <ActionIconWrapper>
                <FaUpload />
              </ActionIconWrapper>
            </ActionButton>
          </TweetActions>
        </TweetContent>
      </TweetContainer>
      
    </>
  );
};

export default Tweet; 