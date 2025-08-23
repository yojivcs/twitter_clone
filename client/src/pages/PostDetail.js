import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import Reply from '../components/Reply';
import Tweet from '../components/Tweet';
import { getPostById } from '../redux/slices/postSlice';

const PostDetailContainer = styled.div`
  width: 100%;
`;

const Header = styled.div`
  padding: 16px;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.background};
  z-index: 10;
  backdrop-filter: blur(10px);
`;

const RepliesContainer = styled.div``;

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

const NoRepliesMessage = styled.div`
  padding: 40px 20px;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 18px;
`;

const PostDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { post, loading, error } = useSelector((state) => state.posts);
  const [showReplyForm, setShowReplyForm] = useState(false);

  useEffect(() => {
    dispatch(getPostById(id));
  }, [dispatch, id]);

  const handleReplySubmitted = () => {
    setShowReplyForm(false);
    dispatch(getPostById(id)); // Refresh the post to get updated replies
  };

  if (loading) {
    return <LoadingMessage>Loading post...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>Error loading post: {error}</ErrorMessage>;
  }

  if (!post) {
    return <ErrorMessage>Post not found</ErrorMessage>;
  }

  return (
    <PostDetailContainer>
      <Header>Post</Header>
      
      <Tweet 
        tweet={post} 
        onReplyClick={() => setShowReplyForm(true)}
        isDetailView
      />
      
      {showReplyForm && (
        <Reply 
          parentPost={post} 
          onReplySubmitted={handleReplySubmitted}
        />
      )}
      
      <RepliesContainer>
        {post.replies && post.replies.length > 0 ? (
          post.replies.map((reply) => (
            <Tweet 
              key={reply._id} 
              tweet={reply}
              onReplyClick={() => setShowReplyForm(true)}
            />
          ))
        ) : (
          <NoRepliesMessage>
            No replies yet. Be the first to reply!
          </NoRepliesMessage>
        )}
      </RepliesContainer>
    </PostDetailContainer>
  );
};

export default PostDetail;