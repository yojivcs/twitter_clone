import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HashtagLink = styled(Link)`
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  font-weight: bold;

  &:hover {
    text-decoration: underline;
  }
`;

const HighlightedText = ({ text }) => {
  // Split text into parts that are hashtags and not hashtags
  const parts = text.split(/(#\w+)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('#')) {
          // Remove the # for the URL but keep it for display
          const hashtag = part.substring(1);
          return (
            <HashtagLink key={index} to={`/hashtag/${hashtag}`}>
              {part}
            </HashtagLink>
          );
        }
        return part;
      })}
    </>
  );
};

export default HighlightedText;
