import axios from 'axios';
import React, { useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const CoverPhotoUpload = ({ onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useSelector(state => state.auth);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('coverPicture', file);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.put('/api/users/cover-picture', formData, config);

      if (onSuccess) {
        onSuccess(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading cover photo');
      console.error('Error uploading cover photo:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container>
      <input
        type="file"
        id="cover-photo-upload"
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <UploadButton htmlFor="cover-photo-upload" disabled={uploading}>
        <FaCamera />
        {uploading ? 'Uploading...' : 'Change Cover'}
      </UploadButton>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
`;

const UploadButton = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s;
  opacity: ${props => props.disabled ? 0.7 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const ErrorMessage = styled.p`
  color: white;
  background-color: rgba(255, 0, 0, 0.7);
  font-size: 14px;
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 4px;
`;

export default CoverPhotoUpload; 