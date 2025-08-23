import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Tweet from '../components/Tweet';

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.background};
  z-index: 10;
  backdrop-filter: blur(10px);
`;

const Hashtag = styled.h1`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
`;

const TweetCount = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 13px;
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

const HashtagPage = () => {
  const { hashtag } = useParams();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        setLoading(true);
        // Ensure we're searching for the hashtag properly
        // If the hashtag already has a # prefix, use it as is, otherwise add it
        const searchQuery = hashtag.startsWith('#') ? hashtag : hashtag;
        const response = await axios.get(`/api/search/posts?q=${searchQuery}`);
        setTweets(response.data);
        setError(null);
        
        // Log for debugging
        console.log(`Fetched ${response.data.length} tweets for hashtag: #${hashtag}`);
      } catch (err) {
        console.error('Error fetching hashtag tweets:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (hashtag) {
      fetchTweets();
    }
  }, [hashtag]);

  if (loading) {
    return <LoadingMessage>Loading tweets...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>Error: {error}</ErrorMessage>;
  }

  return (
    <Container>
      <Header>
        <Hashtag>#{hashtag}</Hashtag>
        <TweetCount>{tweets.length} Tweets</TweetCount>
      </Header>
      {tweets.map(tweet => (
        <Tweet key={tweet._id} tweet={tweet} />
      ))}
    </Container>
  );
};

export default HashtagPage;
