import axios from 'axios';
import React, { useState } from 'react';
import { FaCamera } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

const ProfilePictureUpload = ({ onSuccess }) => {
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
      formData.append('profilePicture', file);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      };

      const res = await axios.put('/api/users/profile-picture', formData, config);

      if (onSuccess) {
        onSuccess(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading profile picture');
      console.error('Error uploading profile picture:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container>
      <input
        type="file"
        id="profile-picture-upload"
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <UploadButton htmlFor="profile-picture-upload" disabled={uploading}>
        <FaCamera />
      </UploadButton>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </Container>
  );
};

const Container = styled.div`
  position: relative;
`;

const UploadButton = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: ${props => props.theme.primary || '#1DA1F2'};
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
  opacity: ${props => props.disabled ? 0.7 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: ${props => props.theme.primaryDark || '#1991DB'};
  }
`;

const ErrorMessage = styled.p`
  position: absolute;
  bottom: -30px;
  right: 0;
  color: white;
  background-color: red;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
`;

export default ProfilePictureUpload; 