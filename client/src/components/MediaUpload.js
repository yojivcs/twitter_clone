import React, { useRef, useState } from 'react';
import { BsCardImage, BsX } from 'react-icons/bs';
import styled from 'styled-components';

const MediaPreviewContainer = styled.div`
  margin-top: 12px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border};
  position: relative;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const UploadButton = styled.button`
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

  &:disabled {
    color: ${({ theme }) => theme.textSecondary};
    cursor: not-allowed;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const MediaUpload = ({ onMediaChange, showPreview = true, disabled = false }) => {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef();

  const handleFileSelect = (e) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Filter for images and videos
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    ).slice(0, 4 - mediaFiles.length); // Limit to 4 files total

    if (validFiles.length === 0) {
      alert('Please select only image or video files.');
      return;
    }

    // Create preview URLs
    const newPreviews = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image'
    }));

    const updatedFiles = [...mediaFiles, ...validFiles];
    const updatedPreviews = [...previews, ...newPreviews];

    setMediaFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onMediaChange(updatedFiles);
  };

  const removeMedia = (index) => {
    if (disabled) return;
    
    // Revoke the preview URL to free up memory
    URL.revokeObjectURL(previews[index].url);

    const newMediaFiles = mediaFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setMediaFiles(newMediaFiles);
    setPreviews(newPreviews);
    onMediaChange(newMediaFiles);
  };

  return (
    <>
      <UploadButton
        onClick={() => !disabled && fileInputRef.current.click()}
        disabled={disabled || mediaFiles.length >= 4}
        title={mediaFiles.length >= 4 ? 'Maximum 4 media files allowed' : 'Add media'}
      >
        <BsCardImage size={20} />
      </UploadButton>

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileSelect}
        disabled={disabled}
      />

      {showPreview && previews.length > 0 && (
        <MediaPreviewContainer>
          <MediaGrid count={previews.length}>
            {previews.map((preview, index) => (
              <MediaItem key={preview.url} count={previews.length}>
                {preview.type === 'video' ? (
                  <video src={preview.url} controls />
                ) : (
                  <img src={preview.url} alt={`Media ${index + 1}`} />
                )}
                <RemoveButton onClick={() => removeMedia(index)} disabled={disabled}>
                  <BsX size={20} />
                </RemoveButton>
              </MediaItem>
            ))}
          </MediaGrid>
        </MediaPreviewContainer>
      )}
    </>
  );
};

export default MediaUpload;