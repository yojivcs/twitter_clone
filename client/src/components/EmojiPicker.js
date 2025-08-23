import EmojiPickerReact from 'emoji-picker-react';
import React, { useEffect, useRef, useState } from 'react';
import { FaSmile } from 'react-icons/fa';
import styled from 'styled-components';

const EmojiButton = styled.button`
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
  position: relative;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const PickerContainer = styled.div`
  position: absolute;
  bottom: 50px;
  left: 0;
  z-index: 1000;

  .EmojiPickerReact {
    background-color: ${({ theme }) => theme.background};
    border-color: ${({ theme }) => theme.border};
    
    .epr-search-container input {
      background-color: ${({ theme }) => theme.backgroundSecondary};
      border-color: ${({ theme }) => theme.border};
      color: ${({ theme }) => theme.text};
    }

    .epr-category-nav {
      background-color: ${({ theme }) => theme.background};
      border-color: ${({ theme }) => theme.border};
    }

    .epr-emoji-category-label {
      background-color: ${({ theme }) => theme.background};
      color: ${({ theme }) => theme.textSecondary};
    }

    .epr-body::-webkit-scrollbar-track {
      background-color: ${({ theme }) => theme.background};
    }

    .epr-body::-webkit-scrollbar-thumb {
      background-color: ${({ theme }) => theme.border};
    }
  }
`;

const EmojiPicker = ({ onEmojiSelect }) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef();

  useEffect(() => {
    // Close picker when clicking outside
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmojiClick = (emojiData) => {
    onEmojiSelect(emojiData.emoji);
    setShowPicker(false);
  };

  const togglePicker = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPicker(!showPicker);
  };

  return (
    <div ref={pickerRef} style={{ position: 'relative' }}>
      <EmojiButton onClick={togglePicker} type="button">
        <FaSmile size={20} />
      </EmojiButton>
      {showPicker && (
        <PickerContainer>
          <EmojiPickerReact
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            theme="dark"
          />
        </PickerContainer>
      )}
    </div>
  );
};

export default EmojiPicker;
