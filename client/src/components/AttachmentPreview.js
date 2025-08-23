import React from 'react';
import { FaFile, FaFileImage, FaFileVideo, FaTimes } from 'react-icons/fa';
import styled from 'styled-components';

const AttachmentPreviewContainer = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background-color: ${({ theme }) => theme.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  max-width: 200px;
`;

const FileIcon = styled.div`
  color: ${({ theme }) => theme.primary};
  font-size: 14px;
  flex-shrink: 0;
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text};
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileSize = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.textSecondary};
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &:hover {
    background-color: ${({ theme }) => theme.hover};
    color: ${({ theme }) => theme.text};
  }
`;

const AttachmentPreview = ({ files, onRemove }) => {
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <FaFileImage />;
    } else if (file.type.startsWith('video/')) {
      return <FaFileVideo />;
    }
    return <FaFile />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getShortFileName = (fileName) => {
    if (fileName.length <= 20) return fileName;
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, 16);
    return `${truncatedName}...${extension ? '.' + extension : ''}`;
  };

  if (!files || files.length === 0) return null;

  return (
    <AttachmentPreviewContainer>
      {files.map((file, index) => (
        <AttachmentItem key={`${file.name}-${index}`}>
          <FileIcon>
            {getFileIcon(file)}
          </FileIcon>
          <FileInfo>
            <FileName title={file.name}>
              {getShortFileName(file.name)}
            </FileName>
            <FileSize>
              {formatFileSize(file.size)}
            </FileSize>
          </FileInfo>
          <RemoveButton onClick={() => onRemove(index)} title="Remove file">
            <FaTimes size={12} />
          </RemoveButton>
        </AttachmentItem>
      ))}
    </AttachmentPreviewContainer>
  );
};

export default AttachmentPreview;
