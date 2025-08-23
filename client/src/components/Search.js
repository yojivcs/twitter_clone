import React, { useEffect, useRef, useState } from 'react';
import { FaHashtag, FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { searchHashtags, searchPosts, searchUsers } from '../redux/slices/searchSlice';

const SearchContainer = styled.div`
  width: 100%;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.backgroundSecondary};
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    background-color: ${({ theme }) => theme.background};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.textSecondary};
`;

const ResultsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  margin-top: 4px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ResultSection = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border};
  padding: 8px 0;

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.div`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.textSecondary};
`;

const ResultItem = styled.div`
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.text};
`;

const UserHandle = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
`;

const HashtagText = styled.div`
  color: ${({ theme }) => theme.primary};
  font-size: 15px;
`;

const TweetText = styled.div`
  color: ${({ theme }) => theme.text};
  font-size: 15px;
`;

const Search = () => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, posts, hashtags, loading } = useSelector(state => state.search);
  const searchRef = useRef(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        if (query.startsWith('#')) {
          dispatch(searchHashtags(query.slice(1)));
        } else {
          dispatch(searchPosts(query));
          dispatch(searchUsers(query));
          dispatch(searchHashtags(query));
        }
      }
    }, 300); // Delay search by 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [query, dispatch]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowResults(!!value.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (query.startsWith('#')) {
        navigate(`/hashtag/${query.slice(1)}`);
      } else {
        dispatch(searchPosts(query));
        dispatch(searchUsers(query));
        dispatch(searchHashtags(query));
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      searchRef.current?.blur();
    }
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
    setShowResults(false);
  };

  const handleHashtagClick = (hashtag) => {
    navigate(`/hashtag/${hashtag}`);
    setShowResults(false);
  };

  const handleTweetClick = (tweetId) => {
    navigate(`/post/${tweetId}`);
    setShowResults(false);
  };

  return (
    <SearchContainer>
      <form onSubmit={handleSubmit}>
        <SearchIcon>
          <FaSearch />
        </SearchIcon>
                <SearchInput
          ref={searchRef}
          placeholder="Search"
          value={query}
          onChange={handleSearch}
          onFocus={() => setShowResults(!!query.trim())}
          onKeyDown={handleKeyDown}
        />
      </form>
      {showResults && !loading && (
        <ResultsContainer>
          {users.length > 0 && (
            <ResultSection>
              <SectionTitle>People</SectionTitle>
              {users.map(user => (
                <ResultItem key={user._id} onClick={() => handleUserClick(user.username)}>
                  <Avatar src={user.profilePicture || '/images/default-profile.png'} alt={user.name} />
                  <UserInfo>
                    <UserName>{user.name}</UserName>
                    <UserHandle>@{user.username}</UserHandle>
                  </UserInfo>
                </ResultItem>
              ))}
            </ResultSection>
          )}

          {hashtags.length > 0 && (
            <ResultSection>
              <SectionTitle>Hashtags</SectionTitle>
              {hashtags.map(hashtag => (
                <ResultItem key={typeof hashtag === 'string' ? hashtag : hashtag.name} onClick={() => handleHashtagClick(typeof hashtag === 'string' ? hashtag : hashtag.name)}>
                  <FaHashtag />
                  <HashtagText>#{typeof hashtag === 'string' ? hashtag : hashtag.name}</HashtagText>
                             {typeof hashtag === 'object' && hashtag.count && (
             <span style={{ color: 'inherit', fontSize: '12px', marginLeft: 'auto' }}>
               {hashtag.count} tweets
             </span>
           )}
                </ResultItem>
              ))}
            </ResultSection>
          )}

          {posts.length > 0 && (
            <ResultSection>
              <SectionTitle>Tweets</SectionTitle>
              {posts.map(post => (
                <ResultItem key={post._id} onClick={() => handleTweetClick(post._id)}>
                  <Avatar src={post.user.profilePicture || '/images/default-profile.png'} alt={post.user.name} />
                  <TweetText>{post.content}</TweetText>
                </ResultItem>
              ))}
            </ResultSection>
          )}
        </ResultsContainer>
      )}
    </SearchContainer>
  );
};

export default Search;
