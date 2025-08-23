import React, { useState } from 'react';
import { BsCardImage } from 'react-icons/bs';
import { FaCalendarAlt, FaMapMarkerAlt, FaSmile } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { createPost } from '../redux/slices/postSlice';

const ReplyContainer = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
`;

const ReplyLine = styled.div`
  width: 2px;
  background-color: ${({ theme }) => theme.border};
  margin: 0 24px;
  margin-bottom: -16px;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
`;

const ReplyForm = styled.form`
  flex: 1;
`;

const ReplyInput = styled.textarea`
  width: 100%;
  border: none;
  font-size: 20px;
  margin-bottom: 16px;
  background-color: transparent;
  color: ${({ theme }) => theme.text};
  resize: none;
  min-height: 60px;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const ReplyActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const ReplyToolbar = styled.div`
  display: flex;
  gap: 12px;
`;

const ToolbarButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.primary};
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const CharCount = styled.span`
  color: ${({ theme, overLimit }) => overLimit ? theme.error : theme.textSecondary};
  font-size: 14px;
`;

const ReplyButton = styled.button`
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

const ReplyingTo = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  margin-bottom: 8px;

  span {
    color: ${({ theme }) => theme.primary};
  }
`;

const Reply = ({ parentPost, onReplySubmitted }) => {
  const [replyContent, setReplyContent] = useState('');
  const maxCharCount = 280;
  
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.posts);

  const handleReplyChange = (e) => {
    setReplyContent(e.target.value);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (replyContent.trim() && replyContent.length <= maxCharCount) {
      const result = await dispatch(createPost({ 
        content: replyContent,
        replyTo: parentPost._id
      }));

      if (!result.error) {
        setReplyContent('');
        if (onReplySubmitted) {
          onReplySubmitted();
        }
      }
    }
  };

  const isOverCharLimit = replyContent.length > maxCharCount;
  const remainingChars = maxCharCount - replyContent.length;

  return (
    <ReplyContainer>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Avatar src={user?.profilePicture || '/images/default-profile.png'} alt={user?.name} />
        <ReplyLine />
      </div>
      <ReplyForm onSubmit={handleReplySubmit}>
        <ReplyingTo>
          Replying to <span>@{parentPost.user.username}</span>
        </ReplyingTo>
        <ReplyInput
          placeholder="Tweet your reply"
          value={replyContent}
          onChange={handleReplyChange}
          maxLength={maxCharCount + 10}
        />
        <ReplyToolbar>
          <ToolbarButton type="button">
            <BsCardImage size={20} />
          </ToolbarButton>
          <ToolbarButton type="button">
            <FaSmile size={20} />
          </ToolbarButton>
          <ToolbarButton type="button">
            <FaCalendarAlt size={20} />
          </ToolbarButton>
          <ToolbarButton type="button">
            <FaMapMarkerAlt size={20} />
          </ToolbarButton>
        </ReplyToolbar>
        <ReplyActions>
          {replyContent.length > 0 && (
            <CharCount overLimit={isOverCharLimit}>
              {remainingChars}
            </CharCount>
          )}
          <ReplyButton 
            type="submit" 
            disabled={!replyContent.trim() || isOverCharLimit || loading}
          >
            Reply
          </ReplyButton>
        </ReplyActions>
      </ReplyForm>
    </ReplyContainer>
  );
};

export default Reply;
