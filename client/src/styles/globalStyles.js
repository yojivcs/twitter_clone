import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    transition: all 0.2s linear;
  }

  a {
    text-decoration: none;
    color: ${({ theme }) => theme.primary};
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    font-family: inherit;
  }

  input, textarea {
    font-family: inherit;
    outline: none;
  }

  img {
    max-width: 100%;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.border};
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.textSecondary};
  }
`;

export default GlobalStyle; 