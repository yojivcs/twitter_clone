import React from 'react';
import {
    FaBold,
    FaItalic,
    FaListOl,
    FaListUl,
    FaQuoteRight,
    FaStrikethrough,
    FaUnderline
} from 'react-icons/fa';
import styled from 'styled-components';

const ToolbarContainer = styled.div`
  display: flex;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const FormatButton = styled.button`
  background: transparent;
  color: ${({ theme, active }) => active ? theme.primary : theme.textSecondary};
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.hover};
    color: ${({ theme }) => theme.primary};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Separator = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.border};
  margin: 0 4px;
`;

const FormatToolbar = ({ onFormat, activeFormats = {} }) => {
  const handleFormat = (e, format) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling
    onFormat(format);
  };

  return (
    <ToolbarContainer>
      <FormatButton 
        onClick={(e) => handleFormat(e, 'bold')}
        active={activeFormats.bold}
        title="Bold (Ctrl+B)"
      >
        <FaBold size={14} />
      </FormatButton>
      <FormatButton 
        onClick={(e) => handleFormat(e, 'italic')}
        active={activeFormats.italic}
        title="Italic (Ctrl+I)"
      >
        <FaItalic size={14} />
      </FormatButton>
      <FormatButton 
        onClick={(e) => handleFormat(e, 'underline')}
        active={activeFormats.underline}
        title="Underline (Ctrl+U)"
      >
        <FaUnderline size={14} />
      </FormatButton>
      <FormatButton 
        onClick={(e) => handleFormat(e, 'strikethrough')}
        active={activeFormats.strikethrough}
        title="Strikethrough"
      >
        <FaStrikethrough size={14} />
      </FormatButton>
      <Separator />
      <FormatButton 
        onClick={(e) => handleFormat(e, 'bullet')}
        active={activeFormats.bullet}
        title="Bullet List"
      >
        <FaListUl size={14} />
      </FormatButton>
      <FormatButton 
        onClick={(e) => handleFormat(e, 'number')}
        active={activeFormats.number}
        title="Numbered List"
      >
        <FaListOl size={14} />
      </FormatButton>
      <FormatButton 
        onClick={(e) => handleFormat(e, 'quote')}
        active={activeFormats.quote}
        title="Quote"
      >
        <FaQuoteRight size={14} />
      </FormatButton>
    </ToolbarContainer>
  );
};

export default FormatToolbar;
