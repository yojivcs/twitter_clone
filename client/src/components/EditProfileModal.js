import axios from 'axios';
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import styled from 'styled-components';

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
  background-color: ${({ theme }) => theme.text};
  color: ${({ theme }) => theme.background};
  border: none;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.textSecondary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FormContainer = styled.form`
  padding: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const CharCount = styled.div`
  position: absolute;
  right: 10px;
  bottom: -20px;
  font-size: 12px;
  color: ${({ theme, isLimit }) => isLimit ? theme.error : theme.textSecondary};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.error};
  font-size: 14px;
  margin-top: 8px;
`;

const DangerZone = styled.div`
  margin-top: 32px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.error};
  border-radius: 12px;
  background-color: rgba(220, 38, 38, 0.05);
`;

const DangerZoneTitle = styled.h3`
  color: ${({ theme }) => theme.error};
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const DangerZoneDescription = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.4;
`;

const DeleteAccountButton = styled.button`
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: bold;
  background-color: ${({ theme }) => theme.error};
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover:not(:disabled) {
    background-color: #dc2626;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EditProfileModal = ({ isOpen, onClose, user, onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  if (!isOpen) return null;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const response = await axios.put('/api/users', formData, config);
      
      if (response.data.success) {
        onProfileUpdate(response.data.data);
        onClose();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data, posts, and profile information.'
    );
    
    if (!confirmed) return;
    
    const doubleConfirmed = window.confirm(
      'This is your final warning. Deleting your account will:\n\n' +
      '• Permanently remove all your posts and replies\n' +
      '• Delete your profile and all associated data\n' +
      '• Remove you from all conversations and followers\n' +
      '• This action CANNOT be undone\n\n' +
      'Are you absolutely certain you want to proceed?'
    );
    
    if (!doubleConfirmed) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      // TODO: Implement delete account API endpoint
      // const response = await axios.delete('/api/users/account', config);
      
      // For now, just show a message
      alert('Account deletion functionality will be implemented soon. Please contact support for immediate account deletion.');
      
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate character limits
  const bioLimit = 160;
  const nameLimit = 50;
  const locationLimit = 30;
  const websiteLimit = 100;
  
  const isBioLimit = formData.bio.length >= bioLimit;
  const isNameLimit = formData.name.length >= nameLimit;
  
  // Validate form
  const isFormValid = 
    formData.name.trim().length > 0 && 
    formData.name.length <= nameLimit &&
    formData.bio.length <= bioLimit &&
    formData.location.length <= locationLimit &&
    formData.website.length <= websiteLimit;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
          <HeaderTitle>Edit profile</HeaderTitle>
          <SaveButton 
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
          >
            {loading ? 'Saving...' : 'Save'}
          </SaveButton>
        </ModalHeader>
        
        <FormContainer onSubmit={handleSubmit}>
          <FormGroup>
            <FormLabel>Name</FormLabel>
            <FormInput
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={nameLimit}
              required
            />
            {isNameLimit && (
              <CharCount isLimit={isNameLimit}>
                {nameLimit - formData.name.length} characters remaining
              </CharCount>
            )}
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Bio</FormLabel>
            <FormTextarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              maxLength={bioLimit}
            />
            <CharCount isLimit={isBioLimit}>
              {bioLimit - formData.bio.length} characters remaining
            </CharCount>
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Location</FormLabel>
            <FormInput
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              maxLength={locationLimit}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Website</FormLabel>
            <FormInput
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              maxLength={websiteLimit}
              placeholder="https://example.com"
            />
          </FormGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <DangerZone>
            <DangerZoneTitle>Danger Zone</DangerZoneTitle>
            <DangerZoneDescription>
              Once you delete your account, there is no going back. Please be certain.
            </DangerZoneDescription>
            <DeleteAccountButton 
              type="button" 
              onClick={handleDeleteAccount}
              disabled={loading}
            >
              Delete Account
            </DeleteAccountButton>
          </DangerZone>
        </FormContainer>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default EditProfileModal;
