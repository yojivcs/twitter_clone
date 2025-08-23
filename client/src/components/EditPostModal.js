import React, { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { updatePost } from '../redux/slices/postSlice';
import EmojiPicker from './EmojiPicker';
import MediaUpload from './MediaUpload';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: ${({ theme }) => theme.background};
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.background};
  z-index: 10;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.text};
  font-size: 20px;
  cursor: pointer;
  margin-right: 12px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const HeaderTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  flex: 1;
`;

const SaveButton = styled.button`
  padding: 8px 16px;
  border-radius: 30px;
  font-weight: bold;
  background-color: ${({ theme }) => theme.primary};
  color: white;
  border: none;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.primaryHover || theme.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FormContainer = styled.form`
  padding: 16px;
`;

const PostTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.text};
  font-size: 20px;
  resize: none;
  outline: none;
  font-family: inherit;
  line-height: 1.4;
  
  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${({ theme }) => theme.border};
`;

const LeftTools = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CharCount = styled.div`
  color: ${({ theme, overLimit }) => overLimit ? theme.error : theme.textSecondary};
  font-size: 14px;
  margin-left: auto;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.error};
  background-color: rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  font-size: 14px;
`;

const MediaPreviewContainer = styled.div`
  margin-top: 12px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border};
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.count > 1 ? '1fr 1fr' : '1fr'};
  grid-template-rows: ${props => props.count > 2 ? '1fr 1fr' : '1fr'};
  gap: 2px;
  max-height: 300px;
`;

const MediaItem = styled.div`
  position: relative;
  width: 100%;
  height: ${props => props.count === 1 ? '300px' : '150px'};
  
  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.9);
  }
`;

const EditPostModal = ({ isOpen, onClose, post, onPostUpdate }) => {
  const dispatch = useDispatch();
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const maxCharCount = 280;
  
  useEffect(() => {
    if (post) {
      setContent(post.content || '');
      // Convert existing media to the format expected by MediaUpload
      if (post.media && post.media.length > 0) {
        const existingMedia = post.media.map((media, index) => {
          let mediaUrl, mediaType;
          
          // Handle corrupted media objects (character-by-character storage)
          if (media && typeof media === 'object' && media['0'] === '/' && media['1'] === 'u' && media['2'] === 'p') {
            // Reconstruct the path from character properties
            const pathLength = Object.keys(media).filter(key => !isNaN(key)).length;
            let reconstructedPath = '';
            for (let i = 0; i < pathLength; i++) {
              reconstructedPath += media[i];
            }
            mediaUrl = reconstructedPath;
            mediaType = reconstructedPath.endsWith('.mp4') ? 'video' : 'image';
          } else if (typeof media === 'string') {
            mediaUrl = media;
            mediaType = media.endsWith('.mp4') ? 'video' : 'image';
          } else if (media && typeof media === 'object') {
            mediaUrl = media.url || media.path || media.src || media.filename || media;
            mediaType = media.type || (typeof mediaUrl === 'string' && mediaUrl.endsWith('.mp4') ? 'video' : 'image');
          }
          
          // Create a File-like object for existing media
          return {
            name: `existing-media-${index}`,
            type: mediaType === 'video' ? 'video/mp4' : 'image/jpeg',
            url: mediaUrl,
            isExisting: true
          };
        });
        setMediaFiles(existingMedia);
      }
    }
  }, [post]);
  
  if (!isOpen || !post) return null;
  
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };
  
  const handleMediaChange = (files) => {
    setMediaFiles(files);
  };
  
  const removeExistingMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleEmojiSelect = (emoji) => {
    setContent(prev => prev + emoji);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((content.trim() || mediaFiles.length > 0) && (!content.trim() || content.length <= maxCharCount)) {
      setLoading(true);
      setError(null);
      
      try {
        const formData = new FormData();
        formData.append('content', content);
        
        // Add new media files
        mediaFiles.forEach(file => {
          if (!file.isExisting) {
            formData.append('media', file);
          }
        });
        
        // Add existing media URLs
        const existingMedia = mediaFiles.filter(file => file.isExisting);
        if (existingMedia.length > 0) {
          formData.append('existingMedia', JSON.stringify(existingMedia.map(file => file.url)));
        }
        
        // Call the updatePost action
        const result = await dispatch(updatePost({ postId: post._id, formData })).unwrap();
        
        // Show success message and close modal
        alert('Post updated successfully!');
        
        // Call onPostUpdate to refresh the posts list
        if (onPostUpdate) {
          onPostUpdate();
        }
        
        onClose();
        
      } catch (err) {
        console.error('Error updating post:', err);
        setError(err.message || 'Failed to update post. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const isOverCharLimit = content.length > maxCharCount;
  const remainingChars = maxCharCount - content.length;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
          <HeaderTitle>Edit post</HeaderTitle>
          <SaveButton 
            onClick={handleSubmit}
            disabled={loading || isOverCharLimit || (!content.trim() && mediaFiles.length === 0)}
          >
            {loading ? 'Updating...' : 'Update'}
          </SaveButton>
        </ModalHeader>
        
        <FormContainer onSubmit={handleSubmit}>
          <PostTextarea
            placeholder="What's happening?"
            value={content}
            onChange={handleContentChange}
            maxLength={maxCharCount}
          />
          
          {mediaFiles.length > 0 && (
            <MediaPreviewContainer>
              <MediaGrid count={mediaFiles.length}>
                {mediaFiles.map((file, index) => (
                  <MediaItem key={index} count={mediaFiles.length}>
                    {file.type?.startsWith('video/') ? (
                      <video src={file.url} controls />
                    ) : (
                      <img src={file.url} alt={`Media ${index + 1}`} />
                    )}
                    <RemoveButton onClick={() => removeExistingMedia(index)}>
                      ×
                    </RemoveButton>
                  </MediaItem>
                ))}
              </MediaGrid>
            </MediaPreviewContainer>
          )}
          
          <Toolbar>
            <LeftTools>
              <MediaUpload onMediaChange={handleMediaChange} showPreview={false} />
              <EmojiPicker onEmojiSelect={handleEmojiSelect} />
            </LeftTools>
            <CharCount overLimit={isOverCharLimit}>
              {remainingChars}
            </CharCount>
          </Toolbar>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </FormContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default EditPostModal;
