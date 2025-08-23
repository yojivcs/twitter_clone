import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { FaArrowLeft, FaEllipsisH, FaLock, FaPaperclip, FaPaperPlane, FaPlus, FaSearch, FaSmile, FaTimes, FaUser } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import styled from 'styled-components';
import AttachmentPreview from '../components/AttachmentPreview';
import MediaUpload from '../components/MediaUpload';
import Sidebar from '../components/Sidebar';
import { decryptMessage } from '../utils/encryption';

const MessagesContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  max-width: 1300px;
  margin: 0 auto;
`;

const Header = styled.div`
  padding: 15px;
  font-size: 20px;
  font-weight: bold;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.background};
  z-index: 10;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled.button`
  margin-right: 20px;
  font-size: 20px;
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  
  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const NewMessageButton = styled.button`
  color: ${({ theme }) => theme.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  
  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const MessagesLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ConversationList = styled.div`
  width: 360px;
  border-right: 1px solid ${({ theme }) => theme.border};
  overflow-y: auto;
  
  @media (max-width: 768px) {
    width: 100%;
    display: ${({ showChat }) => (showChat ? 'none' : 'block')};
  }
`;

const ChatContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    display: ${({ show }) => (show ? 'flex' : 'none')};
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
`;

const EmptyStateTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.text};
`;

const EmptyStateText = styled.p`
  font-size: 15px;
  margin-bottom: 20px;
  max-width: 400px;
`;

const EmptyStateButton = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 12px 20px;
  border-radius: 30px;
  font-weight: bold;
  font-size: 15px;
  
  &:hover {
    background-color: ${({ theme }) => theme.buttonHover};
  }
`;

const ConversationItem = styled.div`
  padding: 15px;
  display: flex;
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ active, theme }) => (active ? theme.hover : 'transparent')};
  
  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
`;

const ConversationInfo = styled.div`
  flex: 1;
  overflow: hidden;
`;

const ConversationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const UserName = styled.div`
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TimeStamp = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.textSecondary};
  white-space: nowrap;
`;

const LastMessage = styled.div`
  color: ${({ theme, unread }) => (unread ? theme.text : theme.textSecondary)};
  font-weight: ${({ unread }) => (unread ? 'bold' : 'normal')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 15px;
`;

const UnreadIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.primary};
  margin-left: 5px;
`;

const ChatHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChatUserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ChatUserName = styled.div`
  font-weight: bold;
  font-size: 16px;
`;

const ChatUserHandle = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
`;

const ChatOptions = styled.button`
  color: ${({ theme }) => theme.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  position: relative;
  
  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const OptionsMenu = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border: 1px solid ${({ theme }) => theme.border};
  z-index: 100;
  min-width: 150px;
  overflow: hidden;
`;

const OptionItem = styled.button`
  padding: 12px 16px;
  width: 100%;
  text-align: left;
  display: flex;
  align-items: center;
  color: ${({ theme, danger }) => danger ? theme.error : theme.text};
  
  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
  
  svg {
    margin-right: 12px;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const MessageGroup = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: ${({ sent }) => (sent ? 'flex-end' : 'flex-start')};
  width: 100%;
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  margin-bottom: 5px;
  word-wrap: break-word;
  
  ${({ sent, theme }) => sent
    ? `
      background-color: ${theme.primary};
      color: white;
      border-bottom-right-radius: 4px;
    `
    : `
      background-color: ${theme.backgroundSecondary};
      color: ${theme.text};
      border-bottom-left-radius: 4px;
    `
  }
`;

const MessageAttachment = styled.div`
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
  max-width: 250px;
  
  img, video {
    width: 100%;
    max-height: 200px;
    object-fit: cover;
    border-radius: 12px;
    cursor: pointer;
  }
`;

const MessageTime = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.textSecondary};
  margin-top: 5px;
  text-align: ${({ sent }) => (sent ? 'right' : 'left')};
`;

const ChatInputContainer = styled.div`
  padding: 15px;
  border-top: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
`;

const ChatInputControls = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 12px 15px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.backgroundSecondary};
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }
`;

const InputButton = styled.button`
  color: ${({ theme, active }) => (active ? theme.primary : theme.textSecondary)};
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  
  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingIndicator = styled.div`
  padding: 20px;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
`;

const DateDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }
  
  &::before {
    margin-right: 10px;
  }
  
  &::after {
    margin-left: 10px;
  }
`;

// New Message Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background-color: ${({ theme }) => theme.background};
  border-radius: 16px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
`;

const CloseButton = styled.button`
  color: ${({ theme }) => theme.text};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  
  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const SearchContainer = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.backgroundSecondary};
  color: ${({ theme }) => theme.text};
  font-size: 15px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    background-color: ${({ theme }) => theme.background};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.textSecondary};
`;

const UserList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0;
`;

const UserItem = styled.div`
  padding: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  
  &:hover {
    background-color: ${({ theme }) => theme.hover};
  }
`;

const UserInfo = styled.div`
  margin-left: 12px;
  flex: 1;
`;

const UserHandle = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 14px;
`;

const NextButton = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  font-weight: bold;
  margin: 16px;
  align-self: flex-end;
  
  &:hover {
    background-color: ${({ theme }) => theme.buttonHover};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Messages = () => {
  const { conversationId } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  // Setup axios interceptor for authentication
  // Removed duplicate axios interceptor - now handled globally
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  
  // New message modal states
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // For storing decrypted messages
  const [decryptedMessages, setDecryptedMessages] = useState({});
  
  // Chat options menu state
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsMenuRef = useRef(null);
  
  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setShowOptionsMenu(false);
        setDeleteConfirmOpen(false);
      }
    };
    
    // Only add event listener if we have proper authentication
    if (isAuthenticated && user?._id && !authLoading) {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    }
  }, [isAuthenticated, user?._id, authLoading]);
  
  // Initialize encryption
  useEffect(() => {
    if (isAuthenticated && user?._id && !authLoading) {
      // We're using a simplified encryption approach
      // that doesn't require per-user keys
      console.log('Encryption initialized');
    }
  }, [isAuthenticated, user?._id, authLoading]);
  
  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && user?._id && !authLoading) {
      console.log('Initializing socket connection...');
      
      // Specify the server URL explicitly to ensure proper connection
      // Use the correct server URL based on environment
      const serverUrl = process.env.NODE_ENV === 'production' 
        ? window.location.origin 
        : 'http://localhost:5000';
      
      console.log('Connecting to socket server at:', serverUrl);
      
      const newSocket = io(serverUrl, {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 30000,
        transports: ['websocket', 'polling'], // Try WebSocket first, then polling
        forceNew: true, // Force a new connection
        autoConnect: true, // Automatically connect
        withCredentials: true // Enable CORS credentials
      });
      
      // Add connection event listeners for debugging
      newSocket.on('connect', () => {
        console.log('Socket connected successfully with ID:', newSocket.id);
        setSocket(newSocket);
        
        // Authenticate socket with user ID once connected
        if (user._id) {
          console.log('Authenticating socket with user ID:', user._id);
          newSocket.emit('authenticate', user._id.toString());
        }
      });
      
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        // Try to reconnect after a brief delay
        setTimeout(() => {
          console.log('Attempting to reconnect after error...');
          if (!newSocket.connected) {
            newSocket.connect();
          }
        }, 2000);
      });
      
      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        
        // If disconnected for any reason, try to reconnect
        setTimeout(() => {
          console.log('Attempting to reconnect after disconnect...');
          if (!newSocket.connected) {
            newSocket.connect();
          }
        }, 2000);
      });
      
      // Listen for message sending errors
      newSocket.on('message_sent', (response) => {
        console.log('Received message_sent response:', response);
        if (!response.success) {
          console.error('Message sending failed:', response.error);
          alert(`Failed to send message: ${response.error || 'Unknown error'}`);
        }
      });
      
      // Listen for new messages
      newSocket.on('new_message', async (message) => {
        console.log('Received new message:', message._id);
        
        // If message is encrypted (legacy messages), decrypt it
        if (message.isEncrypted && message.content) {
          try {
            const decryptedContent = await decryptMessage(message.content);
            console.log('Successfully decrypted message:', message._id);
            
            // Store decrypted content for display
            setDecryptedMessages(prev => ({
              ...prev,
              [message._id]: decryptedContent
            }));
          } catch (error) {
            console.error('Failed to decrypt message:', error);
          }
        }
        
        // Update messages list if this is for the active conversation
        if (activeConversation && 
            (message.sender._id === activeConversation.otherUser._id || 
             message.recipient._id === activeConversation.otherUser._id)) {
          setMessages(prev => {
            // Check if we already have this message (to avoid duplicates)
            const exists = prev.some(m => m._id === message._id);
            if (exists) return prev;
            // Add new message at the end (newest messages should be at the end)
            return [...prev, message];
          });
        }
        
        // Update conversation list
        setConversations(prev => {
          const updatedConversations = [...prev];
          const conversationIndex = updatedConversations.findIndex(
            conv => conv.otherUser._id === message.sender._id || conv.otherUser._id === message.recipient._id
          );
          
          if (conversationIndex !== -1) {
            const conversation = { ...updatedConversations[conversationIndex] };
            conversation.lastMessage = message;
            conversation.updatedAt = new Date();
            
            // If this is not the active conversation, increment unread count
            if (!activeConversation || conversation.otherUser._id !== activeConversation.otherUser._id) {
              conversation.unreadCount = (conversation.unreadCount || 0) + 1;
            }
            
            // Remove from current position
            updatedConversations.splice(conversationIndex, 1);
            // Add to beginning of array
            updatedConversations.unshift(conversation);
            
            return updatedConversations;
          }
          
          return prev;
        });
      });
      
              // Listen for conversation updates
        newSocket.on('conversation_update', () => {
          console.log('Received conversation_update event');
          fetchConversations();
        });

        // Listen for new message notifications (red dot indicator)
        newSocket.on('new_message_notification', (notification) => {
          console.log('Received new message notification:', notification);
          // This will trigger the red dot in the sidebar
        });
      
      // Set the socket in state
      setSocket(newSocket);
      
      // Clean up on unmount
      return () => {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
      };
    }
  }, [isAuthenticated, user, authLoading]);
  
  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!isAuthenticated || !user?._id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        console.log('Fetching conversations for user:', user._id);
        const response = await axios.get('/api/messages');
        if (response.data.success) {
          console.log('Conversations loaded:', response.data.data.conversations.length);
          setConversations(response.data.data.conversations);
        } else {
          console.log('No conversations found or API error');
          setConversations([]);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch if we have both authentication and user data
    if (isAuthenticated && user?._id) {
    fetchConversations();
    } else {
      // If not authenticated or no user, set loading to false
      setLoading(false);
    }
  }, [isAuthenticated, user?._id]); // Added user._id dependency

  // Reset conversations when user changes
  useEffect(() => {
    if (user?._id && !authLoading) {
      console.log('User changed, resetting conversations for:', user._id);
      setActiveConversation(null);
      setMessages([]);
      setSearchResults([]);
      setSearchQuery('');
      setSelectedUser(null);
      // Don't clear conversations here - let the fetch effect handle it
    }
  }, [user?._id, authLoading]);
  
  // Add a more robust check for when to fetch conversations
  useEffect(() => {
    // Only proceed if we have both authentication and user data
    if (isAuthenticated && user?._id && !loading && !authLoading) {
      console.log('Authentication and user data ready, fetching conversations');
      // The fetchConversations effect will handle the actual fetching
    }
  }, [isAuthenticated, user?._id, loading, authLoading]);
  
  // Fetch conversation by ID from URL param
  useEffect(() => {
    if (conversationId && conversations.length > 0 && isAuthenticated && user?._id && !authLoading) {
      const conversation = conversations.find(conv => conv._id === conversationId);
      if (conversation) {
        setActiveConversation(conversation);
      }
    }
  }, [conversationId, conversations, isAuthenticated, user?._id, authLoading]);
  
  // Fetch messages when active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) return;
      
      if (!isAuthenticated || !user?._id || authLoading) {
        console.error('Cannot fetch messages: user not authenticated or still loading');
        return;
      }
      
      try {
        console.log('Fetching messages for conversation with:', activeConversation.otherUser.name);
        const response = await axios.get(`/api/messages/${activeConversation.otherUser._id}`);
        if (response.data.success) {
          // The API returns messages in reverse chronological order (newest first)
          // We need to reverse them to display in chronological order (oldest first)
          const fetchedMessages = response.data.data.messages;
          setMessages(fetchedMessages);
          
          // Decrypt messages
          const newDecryptedMessages = { ...decryptedMessages };
          
          // Process each message for decryption
          for (const message of fetchedMessages) {
            if (message.isEncrypted && message.content) {
              try {
                const decryptedContent = await decryptMessage(message.content);
                newDecryptedMessages[message._id] = decryptedContent;
                console.log('Decrypted message:', message._id);
              } catch (error) {
                console.error('Failed to decrypt message:', error);
              }
            }
          }
          
          setDecryptedMessages(newDecryptedMessages);
        }
        
        // Reset unread count for this conversation
        setConversations(prev => 
          prev.map(conv => 
            conv._id === activeConversation._id 
              ? { ...conv, unreadCount: 0 } 
              : conv
          )
        );
        
        // Join chat room
        if (socket && socket.connected) {
          console.log('Joining chat room:', activeConversation._id);
          socket.emit('join_chat', activeConversation._id);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    
    // Only fetch messages if we have proper authentication
    if (isAuthenticated && user?._id && !authLoading) {
    fetchMessages();
    }
    
    return () => {
      // Leave chat room when component unmounts or conversation changes
      if (socket && socket.connected && activeConversation) {
        console.log('Leaving chat room:', activeConversation._id);
        socket.emit('leave_chat', activeConversation._id);
      }
    };
  }, [activeConversation, socket, isAuthenticated, user?._id, authLoading]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    // Only scroll if we have proper authentication and messages
    if (isAuthenticated && user?._id && !authLoading && messages.length > 0) {
    // Use setTimeout to ensure DOM has updated before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    }
  }, [messages, isAuthenticated, user?._id, authLoading]);
  
  const fetchConversations = async () => {
    if (!isAuthenticated || !user?._id || authLoading) {
      console.error('Cannot fetch conversations: user not authenticated or still loading');
      return;
    }
    
    try {
      const response = await axios.get('/api/messages');
      if (response.data.success) {
        setConversations(response.data.data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };
  
  const handleConversationClick = (conversation) => {
    if (!isAuthenticated || !user?._id || authLoading) {
      console.error('Cannot select conversation: user not authenticated or still loading');
      return;
    }
    
    setActiveConversation(conversation);
    navigate(`/messages/${conversation._id}`);
  };
  
  // Helper function to send message via REST API
  const sendMessageViaRest = async (recipientId, content, attachments = []) => {
    try {
      console.log('Sending message via REST API fallback');
      
      if (!isAuthenticated || !user?._id || authLoading) {
        console.error('Cannot send message: user not authenticated or still loading');
        return false;
      }
      
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token available');
        alert('Authentication error. Please try logging in again.');
        return false;
      }
      
      // Make direct API call with explicit headers
      const response = await axios.post('/api/messages', {
        recipient: recipientId.toString(),
        content: content,
        attachments: attachments,
        isEncrypted: false
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Message sent via REST API:', response.data);
      return true;
    } catch (error) {
      console.error('Failed to send message via REST API:', error);
      
      // More detailed error message
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(`Failed to send message: ${errorMsg}. Please try again.`);
      return false;
    }
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && mediaFiles.length === 0) || !activeConversation) {
      console.log('Cannot send message: empty message/no attachments or no active conversation');
      return;
    }
    
    if (!isAuthenticated || !user?._id || authLoading) {
      console.error('Cannot send message: user not authenticated or still loading');
      return;
    }
    
    console.log('Sending message:', inputMessage, 'with attachments:', mediaFiles.length);
    
    const recipientId = activeConversation.otherUser._id;
    
    // Allow sending message with only attachments (no text content)
    const messageContent = inputMessage.trim() || '';
    
    // Handle file uploads first if there are any
    let attachments = [];
    if (mediaFiles.length > 0) {
      // Check if server is accessible first
      try {
        await axios.get('/api/messages', { timeout: 5000 });
      } catch (error) {
        console.error('Server not accessible:', error);
        
        // Don't show alert for network issues, just log and continue
        if (error.response?.status === 401) {
          console.log('Authentication error during server check, but continuing with message');
        } else {
          alert('Cannot connect to server. Please check your connection and try again.');
          return;
        }
      }
      
      try {
        setUploading(true);
        const formData = new FormData();
        mediaFiles.forEach(file => {
          formData.append('files', file);
        });
        
        console.log('Uploading files:', mediaFiles.length);
        
        // Check file sizes
        const oversizedFiles = mediaFiles.filter(file => file.size > 15 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
          console.error('Files exceed size limit:', oversizedFiles.map(f => f.name));
          alert('Some files exceed the 15MB size limit. Please select smaller files.');
          return;
        }
        
        // Get auth token
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No auth token available');
          throw new Error('Authentication error');
        }
        
        console.log('Uploading to:', '/api/messages/upload');
        console.log('FormData contents:', Array.from(formData.entries()));
        
        const uploadResponse = await axios.post('/api/messages/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          timeout: 30000, // 30 second timeout for large uploads
          validateStatus: function (status) {
            return status < 500; // Accept all status codes less than 500
          }
        });
        
        console.log('Upload response:', uploadResponse.data);
        
        if (uploadResponse.data.success) {
          attachments = uploadResponse.data.files.map(file => ({
            url: file.path,
            type: file.mimetype.startsWith('video/') ? 'video' : 'image'
          }));
          console.log('Upload successful, attachments:', attachments);
        } else {
          console.error('Upload response indicates failure:', uploadResponse.data);
          throw new Error(uploadResponse.data.message || 'Upload failed');
        }
      } catch (error) {
        console.error('Failed to upload attachments:', error);
        
        // Handle authentication errors gracefully
        if (error.response?.status === 401) {
          console.log('Authentication error during upload, but continuing with message');
          // Don't show alert, just continue without attachments
        } else {
          // More detailed error message for other errors
          if (error.response) {
            // Server responded with error
            console.error('Server error response:', error.response.data);
            alert(`Upload failed: ${error.response.data.message || 'Server error'}`);
          } else if (error.request) {
            // Request made but no response
            console.error('No response from server');
            alert('Upload failed: No response from server. Please check your connection.');
          } else {
            // Error setting up request
            alert('Failed to upload attachments. Please try again.');
          }
          return;
        }
      } finally {
        setUploading(false);
      }
    }
    
    // Create optimistic local message immediately for better UX
    const tempId = Date.now().toString();
    const newMessage = {
      _id: tempId, // Temporary ID
      sender: {
        _id: user._id,
        name: user.name,
        username: user.username,
        profilePicture: user.profilePicture
      },
      recipient: activeConversation.otherUser,
      content: messageContent,
      attachments: attachments,
      isEncrypted: false,
      createdAt: new Date()
    };
    
    // Add new message to the existing messages immediately for better UX
    setMessages(prev => [...prev, newMessage]);
    setInputMessage(''); // Clear input right away
    setMediaFiles([]); // Clear media files
    
    // Attempt to send via socket first
    let socketSendAttempted = false;
    let socketSendSuccessful = false;
    
    // Send message via socket if available
    if (socket && socket.connected) {
      socketSendAttempted = true;
      console.log('Socket is available and connected:', socket.id);
      
      // Make sure we have valid user IDs
      if (!user || !user._id) {
        console.error('User ID is missing for message sender');
        socketSendAttempted = false;
      } else {
        const messageData = {
          sender: user._id.toString(),
          recipient: recipientId.toString(),
          content: messageContent,
          media: attachments,
          isEncrypted: false // No longer encrypting
        };
        
        console.log('Emitting send_message with data:', messageData);
        
        // Add explicit error handling with a timeout
        let messageAcknowledged = false;
        
        // Set up a one-time listener for message acknowledgment
        socket.once('message_sent', (response) => {
          console.log('Received message_sent response:', response);
          messageAcknowledged = true;
          
          if (response.success) {
            socketSendSuccessful = true;
            console.log('Message sent successfully via socket');
          } else {
            console.error('Message sending failed via socket:', response.error);
            // Don't alert here as we'll try the fallback
          }
        });
        
        // Send the message
        socket.emit('send_message', messageData);
        
        // Set a timeout to check if message was acknowledged
        await new Promise(resolve => {
          setTimeout(() => {
            if (!messageAcknowledged) {
              console.error('Message send timeout - no acknowledgment received');
            }
            resolve();
          }, 2000); // 2 second timeout
        });
      }
    }
    
    // If socket send wasn't attempted or wasn't successful, try REST API
    if (!socketSendAttempted || !socketSendSuccessful) {
      console.log('Falling back to REST API for message sending');
      await sendMessageViaRest(recipientId, messageContent, attachments);
    }
    
    // Input has already been cleared and optimistic message added above
  };
  
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatConversationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };
  
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages
    }));
  };
  
  const formatDateDivider = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };
  
  // Search for users to message
  const handleSearch = async (query) => {
    console.log('handleSearch called with query:', query);
    console.log('Current user:', user);
    console.log('isAuthenticated:', isAuthenticated);
    
    if (!query.trim()) {
      setSearchResults([]);
      setSearchQuery(query);
      return;
    }
    
    // Ensure user is authenticated and has an ID
    if (!isAuthenticated || !user?._id || authLoading) {
      console.error('User not authenticated, missing ID, or still loading');
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }
    
    // Add a small delay to prevent too many API calls
    setTimeout(async () => {
      try {
        setSearchLoading(true);
        console.log('Searching for users with query:', query);
        
        const response = await axios.get(`/api/search/users?q=${encodeURIComponent(query)}`);
        console.log('Search response:', response.data);
        
        // Filter out the current user from results
        const filteredResults = response.data.filter(
          userResult => userResult._id !== user._id
        );
        console.log('Filtered results:', filteredResults);
        
        setSearchResults(filteredResults);
        setSearchQuery(query);
        setSearchLoading(false);
      } catch (error) {
        console.error('Error searching users:', error);
        console.error('Error details:', error.response?.data || error.message);
        setSearchResults([]);
        setSearchLoading(false);
      }
    }, 300);
  };
  
  // Handle selecting a user to message
  const handleSelectUser = (selectedUser) => {
    if (!isAuthenticated || !user?._id || authLoading) {
      console.error('Cannot select user: user not authenticated or still loading');
      return;
    }
    
    setSelectedUser(selectedUser);
  };
  
  // Start a new conversation with selected user
  const handleStartConversation = async () => {
    console.log('Starting conversation with user:', selectedUser);
    
    if (!selectedUser) {
      console.error('No user selected');
      return;
    }
    
    if (!isAuthenticated || !user?._id || authLoading) {
      console.error('Cannot start conversation: user not authenticated or still loading');
      return;
    }
    
    try {
      // First, close the modal to prevent multiple clicks
      setShowNewMessageModal(false);
      
      // Check if conversation already exists
      const existingConversation = conversations.find(
        conv => conv.otherUser._id.toString() === selectedUser._id.toString()
      );
      
      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation);
        // If it exists, just navigate to it
        setActiveConversation(existingConversation);
        navigate(`/messages/${existingConversation._id}`);
      } else {
        console.log('Creating new conversation with:', selectedUser.name);
        // Otherwise, create a new conversation by sending a first message
        if (socket) {
          // Make sure we have a valid user ID
          if (!user || !user._id) {
            console.error('User ID is missing for message sender');
            return;
          }
          
          // Use socket approach first since it's already working with the server
          console.log('Sending message via socket');
          
          // Store selected user in a local variable to ensure it's available in the timeout
          const targetUser = {...selectedUser};
          
          socket.emit('send_message', {
            sender: user._id.toString(),
            recipient: targetUser._id.toString(),
            content: 'Started a conversation'
          });
          
          // Listen for message confirmation
          socket.once('message_sent', (response) => {
            console.log('Message sent response:', response);
            if (response.success) {
              console.log('Message sent successfully, fetching conversations');
              
              // If we have a conversation ID directly, use it
              if (response.conversationId) {
                console.log('Got conversation ID directly:', response.conversationId);
                // Wait a moment for the server to process
                setTimeout(async () => {
                  try {
                    // Get updated conversations
                    const convResponse = await axios.get('/api/messages');
                    if (convResponse.data.success) {
                      const updatedConversations = convResponse.data.data.conversations;
                      setConversations(updatedConversations);
                      
                      // Find the conversation by ID
                      const newConversation = updatedConversations.find(
                        conv => conv._id.toString() === response.conversationId.toString()
                      );
                      
                      if (newConversation) {
                        console.log('Found new conversation by ID:', newConversation);
                        // Navigate to the new conversation
                        setActiveConversation(newConversation);
                        navigate(`/messages/${newConversation._id}`);
                        return;
                      }
                    }
                    
                    // Fallback to searching by user ID
                    findConversationByUserId(convResponse.data.data.conversations, targetUser);
                    
                  } catch (fetchError) {
                    console.error('Error fetching conversations:', fetchError);
                    createDirectConversation(targetUser);
                  }
                }, 1000);
              } else {
                // No conversation ID, use the old method
                setTimeout(async () => {
                  try {
                    // Get updated conversations
                    const convResponse = await axios.get('/api/messages');
                    if (convResponse.data.success) {
                      const updatedConversations = convResponse.data.data.conversations;
                      setConversations(updatedConversations);
                      findConversationByUserId(updatedConversations, targetUser);
                    }
                  } catch (fetchError) {
                    console.error('Error fetching conversations:', fetchError);
                    createDirectConversation(targetUser);
                  }
                }, 1000);
              }
            } else {
              console.error('Message sending failed:', response.error);
              alert(`Could not create conversation: ${response.error || 'Unknown error'}`);
              setShowNewMessageModal(true); // Reopen modal
            }
          });
          
          // Backup timeout in case socket response never comes
          setTimeout(() => {
            createDirectConversation(targetUser);
          }, 3000);
        } else {
          console.error('Socket not available');
        }
      }
      
      // Reset state
      setSearchQuery('');
      setSelectedUser(null);
      setSearchResults([]);
    } catch (error) {
      console.error('Error starting conversation:', error);
      // Reopen modal if there was an error
      setShowNewMessageModal(true);
    }
  };
  
  // Helper function to find conversation by user ID
  const findConversationByUserId = (conversations, targetUser) => {
    if (!isAuthenticated || !user?._id || authLoading) {
      console.error('Cannot find conversation: user not authenticated or still loading');
      return;
    }
    
    console.log('Looking for conversation with user:', targetUser._id);
    console.log('Available conversations:', conversations);
    
    // Find the newly created conversation with this user
    const newConversation = conversations.find(
      conv => conv.otherUser._id.toString() === targetUser._id.toString()
    );
    
    if (newConversation) {
      console.log('Found new conversation by user ID:', newConversation);
      // Navigate to the new conversation
      setActiveConversation(newConversation);
      navigate(`/messages/${newConversation._id}`);
    } else {
      console.error('Could not find new conversation with user:', targetUser.name);
      // Try again with a direct approach
      createDirectConversation(targetUser);
    }
  };
  
  // Create conversation directly via API
  const createDirectConversation = async (targetUser) => {
    try {
      console.log('Creating conversation directly with:', targetUser.name);
      
      if (!isAuthenticated || !user?._id || authLoading) {
        console.error('Cannot create conversation: user not authenticated or still loading');
        return;
      }
      
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No auth token available');
        return;
      }
      
      // Make direct API call
      const response = await axios.post('/api/messages', {
        recipient: targetUser._id.toString(),
        content: 'Started a conversation'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Direct API response:', response.data);
      
      if (response.data.success) {
        // Refresh conversations
        const convResponse = await axios.get('/api/messages');
        if (convResponse.data.success) {
          const updatedConversations = convResponse.data.data.conversations;
          setConversations(updatedConversations);
          
          // Find the conversation
          const newConversation = updatedConversations.find(
            conv => conv.otherUser._id.toString() === targetUser._id.toString()
          );
          
          if (newConversation) {
            // Navigate to conversation
            setActiveConversation(newConversation);
            navigate(`/messages/${newConversation._id}`);
          } else {
            console.error('Still could not find conversation after direct creation');
            alert('Could not create conversation. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error in direct conversation creation:', error);
      alert('Could not create conversation. Please try again.');
    }
  };
  
  // Open new message modal
  const openNewMessageModal = () => {
    if (!isAuthenticated || !user?._id || authLoading) {
      console.error('Cannot open new message modal: user not authenticated or still loading');
      return;
    }
    
    setShowNewMessageModal(true);
    setSearchQuery('');
    setSelectedUser(null);
    setSearchResults([]);
    
    // Focus the search input when modal opens
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };
  
  // Handle deleting a conversation
  const handleDeleteConversation = async () => {
    if (!activeConversation) return;
    
    if (!isAuthenticated || !user?._id || authLoading) {
      console.error('Cannot delete conversation: user not authenticated or still loading');
      return;
    }
    
    try {
      console.log('Deleting conversation:', activeConversation._id);
      const response = await axios.delete(`/api/messages/${activeConversation._id}`);
      
      if (response.data.success) {
        // Remove conversation from list
        setConversations(prev => 
          prev.filter(conv => conv._id !== activeConversation._id)
        );
        
        // Clear active conversation
        setActiveConversation(null);
        setMessages([]);
        
        // Navigate back to messages
        navigate('/messages');
        
        // Close menu
        setShowOptionsMenu(false);
        setDeleteConfirmOpen(false);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    }
  };
  
  const messageGroups = groupMessagesByDate(messages);
  
  // Show loading state while authentication is being determined
  if (authLoading) {
  return (
    <MessagesContainer>
      <Sidebar />
        <div 
          style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1,
        borderLeft: '1px solid var(--border-color)',
            borderRight: '1px solid var(--border-color)',
            cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
          }}
          onClick={() => {
            if (isAuthenticated && user?._id && !authLoading) {
              // Could add loading container actions here
            }
          }}
        >
          <LoadingIndicator 
            onClick={() => {
              if (isAuthenticated && user?._id && !authLoading) {
                // Could add loading actions here
              }
            }}
            style={{
              cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
            }}
          >
            Loading...
          </LoadingIndicator>
        </div>
      </MessagesContainer>
    );
  }
  
  return (
    <MessagesContainer 
      onClick={() => {
        if (isAuthenticated && user?._id && !authLoading) {
          // Could add container actions here
        }
      }}
      style={{
        cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
      }}
    >
      <Sidebar />
      <div 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1,
          borderLeft: '1px solid var(--border-color)',
          borderRight: '1px solid var(--border-color)',
          cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
        }}
        onClick={() => {
          if (isAuthenticated && user?._id && !authLoading) {
            // Could add main container actions here
          }
        }}
      >
        <Header 
          onClick={() => {
            if (isAuthenticated && user?._id && !authLoading) {
              // Could add header actions here
            }
          }}
          style={{
            cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
          }}
        >
          {activeConversation && (
            <BackButton 
              onClick={() => {
                if (isAuthenticated && user?._id && !authLoading) {
              setActiveConversation(null);
              navigate('/messages');
                }
              }}
              disabled={!isAuthenticated || !user?._id || authLoading}
              style={{
                opacity: !isAuthenticated || !user?._id || authLoading ? 0.5 : 1,
                cursor: !isAuthenticated || !user?._id || authLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <FaArrowLeft />
            </BackButton>
          )}
          <span 
            onClick={() => {
              if (isAuthenticated && user?._id && !authLoading) {
                // Could add title actions here
              }
            }}
            style={{
              cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
            }}
          >
          Messages
          </span>
          <NewMessageButton 
            onClick={() => {
              if (isAuthenticated && user?._id && !authLoading) {
                openNewMessageModal();
              }
            }}
            disabled={!isAuthenticated || !user?._id || authLoading}
            style={{
              opacity: isAuthenticated && user?._id && !authLoading ? 1 : 0.5,
              cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
            }}
          >
            <FaPlus />
          </NewMessageButton>
        </Header>
        
        <MessagesLayout 
          onClick={() => {
            if (isAuthenticated && user?._id && !authLoading) {
              // Could add layout actions here
            }
          }}
          style={{
            cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
          }}
        >
        <ConversationList 
          showChat={!!activeConversation}
          onClick={() => {
            if (isAuthenticated && user?._id && !authLoading) {
              // Could add conversation list actions here
            }
          }}
          style={{
            cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
          }}
        >
          {loading || authLoading ? (
            <LoadingIndicator 
              onClick={() => {
                if (isAuthenticated && user?._id && !authLoading) {
                  // Could add loading actions here
                }
              }}
              style={{
                cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
              }}
            >
              Loading conversations...
            </LoadingIndicator>
          ) : conversations.length === 0 ? (
            <EmptyState 
              onClick={() => {
                if (isAuthenticated && user?._id && !authLoading) {
                  // Could add empty state actions here
                }
              }}
              style={{
                cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
              }}
            >
              <EmptyStateTitle 
                onClick={() => {
                  if (isAuthenticated && user?._id && !authLoading) {
                    // Could add title actions here
                  }
                }}
                style={{
                  cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                }}
              >
                Welcome to your inbox!
              </EmptyStateTitle>
              <EmptyStateText 
                onClick={() => {
                  if (isAuthenticated && user?._id && !authLoading) {
                    // Could add text actions here
                  }
                }}
                style={{
                  cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                }}
              >
                Drop a line, share posts and more with private conversations between you and others on Twitter.
              </EmptyStateText>
              <EmptyStateButton 
                onClick={() => {
                  if (isAuthenticated && user?._id && !authLoading) {
                    openNewMessageModal();
                  }
                }}
                disabled={!isAuthenticated || !user?._id || authLoading}
                style={{
                  opacity: isAuthenticated && user?._id && !authLoading ? 1 : 0.5,
                  cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                }}
              >
                <FaPlus style={{ marginRight: '8px' }} /> New Message
              </EmptyStateButton>
            </EmptyState>
          ) : (
            conversations.map(conversation => {
              // Only render conversations when user state is properly loaded
              if (!user || !user._id || authLoading) return null;
              
              return (
              <ConversationItem
                key={conversation._id}
                active={activeConversation?._id === conversation._id}
                  onClick={() => {
                    if (isAuthenticated && user?._id && !authLoading) {
                      handleConversationClick(conversation);
                    }
                  }}
                  style={{
                    cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                  }}
              >
                <Avatar
                  src={conversation.otherUser.profilePicture || '/images/default-profile.png'}
                  alt={conversation.otherUser.name}
                  onClick={() => {
                    if (isAuthenticated && user?._id && !authLoading) {
                      navigate(`/profile/${conversation.otherUser.username}`);
                    }
                  }}
                  style={{
                    cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                  }}
                />
                                <ConversationInfo 
                  onClick={() => {
                    if (isAuthenticated && user?._id && !authLoading) {
                      navigate(`/profile/${conversation.otherUser.username}`);
                    }
                  }}
                  style={{
                    cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                  }}
                >
                  <ConversationHeader 
                    onClick={() => {
                      if (isAuthenticated && user?._id && !authLoading) {
                        navigate(`/profile/${conversation.otherUser.username}`);
                      }
                    }}
                    style={{
                      cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <UserName 
                      onClick={() => {
                        if (isAuthenticated && user?._id && !authLoading) {
                          navigate(`/profile/${conversation.otherUser.username}`);
                        }
                      }}
                      style={{
                        cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {conversation.otherUser.name}
                    </UserName>
                    <TimeStamp 
                      onClick={() => {
                        if (isAuthenticated && user?._id && !authLoading) {
                          navigate(`/profile/${conversation.otherUser.username}`);
                        }
                      }}
                      style={{
                        cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {formatConversationTime(conversation.updatedAt)}
                    </TimeStamp>
                  </ConversationHeader>
                  <LastMessage 
                    unread={conversation.unreadCount > 0}
                    onClick={() => {
                      if (isAuthenticated && user?._id && !authLoading) {
                        navigate(`/profile/${conversation.otherUser.username}`);
                      }
                    }}
                    style={{
                      cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                    }}
                  >
                    {conversation.lastMessage?.isEncrypted ? (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FaLock size={10} style={{ marginRight: '4px', opacity: 0.7 }} />
                        {conversation.lastMessage && decryptedMessages[conversation.lastMessage._id] 
                          ? decryptedMessages[conversation.lastMessage._id] 
                          : (() => {
                              try {
                                if (conversation.lastMessage && 
                                    typeof conversation.lastMessage.content === 'string' && 
                                    conversation.lastMessage.content.includes('plaintext')) {
                                  return JSON.parse(conversation.lastMessage.content).plaintext;
                                }
                                return conversation.lastMessage?.content || 'Encrypted message';
                              } catch (e) {
                                console.error('Error parsing conversation message:', e);
                                return conversation.lastMessage?.content || 'Encrypted message';
                              }
                            })()}
                      </div>
                    ) : (
                      conversation.lastMessage?.content || 'No messages yet'
                    )}
                    {conversation.unreadCount > 0 && <UnreadIndicator />}
                  </LastMessage>
                </ConversationInfo>
              </ConversationItem>
                );
            })
          )}
        </ConversationList>
        
        <ChatContainer 
          show={!!activeConversation}
          onClick={() => {
            if (isAuthenticated && user?._id && !authLoading) {
              // Could add chat container actions here
            }
          }}
          style={{
            cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
          }}
        >
          {activeConversation ? (
            <>
              <ChatHeader 
                onClick={() => {
                  if (isAuthenticated && user?._id && !authLoading) {
                    // Could add header actions here
                  }
                }}
                style={{
                  cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                }}
              >
                <ChatUserInfo 
                  onClick={() => {
                    if (isAuthenticated && user?._id && !authLoading) {
                      navigate(`/profile/${activeConversation.otherUser.username}`);
                    }
                  }}
                  style={{
                    cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                  }}
                >
                  <Avatar
                    src={activeConversation.otherUser.profilePicture || '/images/default-profile.png'}
                    alt={activeConversation.otherUser.name}
                    style={{ width: '40px', height: '40px' }}
                    onClick={() => {
                      if (isAuthenticated && user?._id && !authLoading) {
                        navigate(`/profile/${activeConversation.otherUser.username}`);
                      }
                    }}
                    className="clickable-avatar"
                  />
                  <div style={{ marginLeft: '10px' }}>
                    <ChatUserName 
                      onClick={() => {
                        if (isAuthenticated && user?._id && !authLoading) {
                          navigate(`/profile/${activeConversation.otherUser.username}`);
                        }
                      }}
                      style={{
                        cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {activeConversation.otherUser.name}
                    </ChatUserName>
                                          <ChatUserHandle 
                        onClick={() => {
                          if (isAuthenticated && user?._id && !authLoading) {
                            navigate(`/profile/${activeConversation.otherUser.username}`);
                          }
                        }}
                        style={{
                          cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                        }}
                      >
                        @{activeConversation.otherUser.username}
                      </ChatUserHandle>
                  </div>
                </ChatUserInfo>
                <ChatOptions 
                  onClick={() => {
                    if (isAuthenticated && user?._id && !authLoading) {
                      setShowOptionsMenu(!showOptionsMenu);
                    }
                  }} 
                  ref={optionsMenuRef}
                  disabled={!isAuthenticated || !user?._id || authLoading}
                  style={{
                    opacity: !isAuthenticated || !user?._id || authLoading ? 0.5 : 1,
                    cursor: !isAuthenticated || !user?._id || authLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <FaEllipsisH />
                  {showOptionsMenu && (
                    <OptionsMenu 
                      onClick={() => {
                        if (isAuthenticated && user?._id && !authLoading) {
                          // Could add options menu actions here
                        }
                      }}
                      style={{
                        cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {!deleteConfirmOpen ? (
                        <OptionItem 
                          danger 
                          onClick={(e) => {
                            if (isAuthenticated && user?._id && !authLoading) {
                            e.stopPropagation();
                            setDeleteConfirmOpen(true);
                            }
                          }}
                          disabled={!isAuthenticated || !user?._id || authLoading}
                          style={{
                            opacity: !isAuthenticated || !user?._id || authLoading ? 0.5 : 1,
                            cursor: !isAuthenticated || !user?._id || authLoading ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <FaTimes /> Delete conversation
                        </OptionItem>
                      ) : (
                        <>
                          <OptionItem 
                            danger
                            onClick={(e) => {
                              if (isAuthenticated && user?._id && !authLoading) {
                              e.stopPropagation();
                              handleDeleteConversation();
                              }
                            }}
                            disabled={!isAuthenticated || !user?._id || authLoading}
                            style={{
                              opacity: !isAuthenticated || !user?._id || authLoading ? 0.5 : 1,
                              cursor: !isAuthenticated || !user?._id || authLoading ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Confirm delete
                          </OptionItem>
                          <OptionItem
                            onClick={(e) => {
                              if (isAuthenticated && user?._id && !authLoading) {
                              e.stopPropagation();
                              setDeleteConfirmOpen(false);
                              }
                            }}
                            disabled={!isAuthenticated || !user?._id || authLoading}
                            style={{
                              opacity: !isAuthenticated || !user?._id || authLoading ? 0.5 : 1,
                              cursor: !isAuthenticated || !user?._id || authLoading ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Cancel
                          </OptionItem>
                        </>
                      )}
                    </OptionsMenu>
                  )}
                </ChatOptions>
              </ChatHeader>
              
              <ChatMessages 
                ref={chatMessagesRef}
                onClick={() => {
                  if (isAuthenticated && user?._id && !authLoading) {
                    // Could add messages actions here
                  }
                }}
                style={{
                  cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                }}
              >
                {messageGroups.map((group, groupIndex) => (
                  <React.Fragment key={group.date}>
                    <DateDivider 
                      onClick={() => {
                        if (isAuthenticated && user?._id && !authLoading) {
                          // Could add date actions here
                        }
                      }}
                      style={{
                        cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {formatDateDivider(group.date)}
                    </DateDivider>
                    {group.messages.map((message, index) => {
                      // Only render messages when user state is properly loaded
                      if (!user || !user._id || authLoading) return null;
                      const isSentByUser = message.sender._id === user._id;
                      return (
                        <MessageGroup 
                          key={message._id} 
                          sent={isSentByUser}
                          onClick={() => {
                            if (isAuthenticated && user?._id && !authLoading) {
                              // Could add message group actions here
                            }
                          }}
                          style={{
                            cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                          }}
                        >
                          <MessageBubble 
                            sent={isSentByUser}
                            onClick={() => {
                              if (isAuthenticated && user?._id && !authLoading) {
                                // Could add message actions here
                              }
                            }}
                            style={{
                              cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                            }}
                          >
                          {message.isEncrypted ? (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <FaLock size={12} style={{ marginRight: '6px', opacity: 0.7 }} />
                              {decryptedMessages[message._id] || 
                                (() => {
                                  try {
                                    if (typeof message.content === 'string' && message.content.includes('plaintext')) {
                                      return JSON.parse(message.content).plaintext;
                                    }
                                    return message.content;
                                  } catch (e) {
                                    console.error('Error parsing message content:', e);
                                    return message.content || '[Encrypted message]';
                                  }
                                })()}
                            </div>
                          ) : (
                            message.content
                          )}
                          {message.attachments && message.attachments.length > 0 && message.attachments.map((attachment, attachIndex) => (
                            <MessageAttachment 
                              key={`${message._id}-${attachIndex}`}
                              onClick={() => {
                                if (isAuthenticated && user?._id && !authLoading) {
                                  // Could add attachment actions here
                                }
                              }}
                              style={{
                                cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                              }}
                            >
                              {attachment.type === 'video' ? (
                                <video 
                                  src={attachment.url} 
                                  controls
                                  style={{
                                    cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                                  }}
                                />
                              ) : (
                                <img 
                                  src={attachment.url} 
                                  alt={`Attachment ${attachIndex + 1}`}
                                  onClick={() => {
                                    if (isAuthenticated && user?._id && !authLoading) {
                                      window.open(attachment.url, '_blank');
                                    }
                                  }}
                                  style={{
                                    cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                                  }}
                                />
                              )}
                            </MessageAttachment>
                          ))}
                          </MessageBubble>
                          <MessageTime 
                            sent={isSentByUser}
                            onClick={() => {
                              if (isAuthenticated && user?._id && !authLoading) {
                                // Could add message actions here
                              }
                            }}
                            style={{
                              cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                            }}
                          >
                            {formatMessageTime(message.createdAt)}
                          </MessageTime>
                        </MessageGroup>
                      );
                    })}
                  </React.Fragment>
                ))}
                <div ref={messagesEndRef} />
              </ChatMessages>
              
              <ChatInputContainer 
                onClick={() => {
                  if (isAuthenticated && user?._id && !authLoading) {
                    // Could add input container actions here
                  }
                }}
                style={{
                  cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                }}
              >
                                  <ChatInputControls 
                    onClick={() => {
                      if (isAuthenticated && user?._id && !authLoading) {
                        // Could add input controls actions here
                      }
                    }}
                    style={{
                      cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                    }}
                  >
                  <ChatInput
                    placeholder="Start a new message"
                    value={inputMessage}
                    onChange={(e) => {
                      if (isAuthenticated && user?._id && !authLoading) {
                        setInputMessage(e.target.value);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && isAuthenticated && user?._id && !authLoading) {
                        handleSendMessage();
                      }
                    }}
                    disabled={!isAuthenticated || !user?._id || authLoading}
                  />
                  <InputButton 
                    onClick={() => {
                      if (isAuthenticated && user?._id && !authLoading) {
                        setShowAttachmentOptions(!showAttachmentOptions);
                      }
                    }}
                    disabled={uploading || !isAuthenticated || !user?._id || authLoading}
                    style={{
                      opacity: uploading || !isAuthenticated || !user?._id || authLoading ? 0.5 : 1,
                      cursor: uploading || !isAuthenticated || !user?._id || authLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {uploading ? '⏳' : <FaPaperclip />}
                  </InputButton>
                  <InputButton
                    disabled={!isAuthenticated || !user?._id || authLoading}
                    style={{
                      opacity: !isAuthenticated || !user?._id || authLoading ? 0.5 : 1,
                      cursor: !isAuthenticated || !user?._id || authLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <FaSmile />
                  </InputButton>
                  <InputButton
                    active={inputMessage.trim().length > 0 || mediaFiles.length > 0}
                    onClick={() => {
                      if (isAuthenticated && user?._id && !authLoading) {
                        handleSendMessage();
                      }
                    }}
                    disabled={inputMessage.trim().length === 0 && mediaFiles.length === 0 || uploading || !isAuthenticated || !user?._id || authLoading}
                    style={{
                      opacity: (inputMessage.trim().length === 0 && mediaFiles.length === 0) || uploading || !isAuthenticated || !user?._id || authLoading ? 0.5 : 1,
                      cursor: (inputMessage.trim().length === 0 && mediaFiles.length === 0) || uploading || !isAuthenticated || !user?._id || authLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {uploading ? '⏳' : <FaPaperPlane />}
                  </InputButton>
                </ChatInputControls>
                
                {showAttachmentOptions && (
                  <div style={{ marginTop: '10px' }}>
                    <MediaUpload 
                      onMediaChange={files => {
                        if (isAuthenticated && user?._id && !authLoading) {
                          setMediaFiles(files);
                        }
                      }} 
                      showPreview={false}
                      disabled={!isAuthenticated || !user?._id || authLoading}
                    />
                  </div>
                )}
                
                {/* Show attachment preview below the input */}
                {mediaFiles.length > 0 && (
                  <AttachmentPreview 
                    files={mediaFiles} 
                    onRemove={(index) => {
                      if (isAuthenticated && user?._id && !authLoading) {
                      const newFiles = mediaFiles.filter((_, i) => i !== index);
                      setMediaFiles(newFiles);
                      }
                    }} 
                    disabled={!isAuthenticated || !user?._id || authLoading}
                  />
                )}
              </ChatInputContainer>
            </>
          ) : (
            <EmptyState 
              onClick={() => {
                if (isAuthenticated && user?._id && !authLoading) {
                  // Could add empty state actions here
                }
              }}
              style={{
                cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
              }}
            >
              <FaUser size={40} style={{ marginBottom: '20px', opacity: 0.5 }} />
              <EmptyStateTitle 
                onClick={() => {
                  if (isAuthenticated && user?._id && !authLoading) {
                    // Could add title actions here
                  }
                }}
                style={{
                  cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                }}
              >
                Select a message
              </EmptyStateTitle>
              <EmptyStateText 
                onClick={() => {
                  if (isAuthenticated && user?._id && !authLoading) {
                    // Could add text actions here
                  }
                }}
                style={{
                  cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                }}
              >
                Choose from your existing conversations, or start a new one.
              </EmptyStateText>
              <EmptyStateButton 
                onClick={() => {
                  if (isAuthenticated && user?._id && !authLoading) {
                    openNewMessageModal();
                  }
                }}
                disabled={!isAuthenticated || !user?._id || authLoading}
                style={{
                  opacity: isAuthenticated && user?._id && !authLoading ? 1 : 0.5,
                  cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                }}
              >
                <FaPlus style={{ marginRight: '8px' }} /> New Message
              </EmptyStateButton>
            </EmptyState>
          )}
        </ChatContainer>
      </MessagesLayout>
      </div>
      
      {/* New Message Modal */}
      {showNewMessageModal && (
        <ModalOverlay 
          onClick={() => {
            if (isAuthenticated && user?._id && !authLoading) {
              setShowNewMessageModal(false);
            }
          }}
          style={{
            cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
          }}
        >
                      <Modal 
              onClick={(e) => {
                if (isAuthenticated && user?._id && !authLoading) {
                  e.stopPropagation();
                }
              }}
              style={{
                cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
              }}
            >
            <ModalHeader 
              onClick={() => {
                if (isAuthenticated && user?._id && !authLoading) {
                  // Could add header actions here
                }
              }}
              style={{
                cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
              }}
            >
              <ModalTitle 
                onClick={() => {
                  if (isAuthenticated && user?._id && !authLoading) {
                    // Could add title actions here
                  }
                }}
                style={{
                  cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                }}
              >
                New Message
              </ModalTitle>
              <CloseButton 
                onClick={() => {
                  if (isAuthenticated && user?._id && !authLoading) {
                    setShowNewMessageModal(false);
                  }
                }}
                disabled={!isAuthenticated || !user?._id || authLoading}
                style={{
                  opacity: !isAuthenticated || !user?._id || authLoading ? 0.5 : 1,
                  cursor: !isAuthenticated || !user?._id || authLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <SearchContainer 
              onClick={() => {
                if (isAuthenticated && user?._id && !authLoading) {
                  // Could add search container actions here
                }
              }}
              style={{
                cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
              }}
            >
              <SearchIcon 
                onClick={() => {
                  if (isAuthenticated && user?._id && !authLoading) {
                    // Could add icon actions here
                  }
                }}
                style={{
                  cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                }}
              >
                <FaSearch />
              </SearchIcon>
              <SearchInput
                ref={searchInputRef}
                placeholder={isAuthenticated && user?._id && !authLoading ? "Search people" : "Please log in to search"}
                value={searchQuery}
                disabled={!isAuthenticated || !user?._id || authLoading}
                onChange={(e) => {
                  if (isAuthenticated && user?._id && !authLoading) {
                  const value = e.target.value;
                  console.log('Search input changed to:', value);
                  setSearchQuery(value); // Always update the input value
                  if (value.trim()) {
                    handleSearch(value);
                  } else {
                    setSearchResults([]);
                    }
                  }
                }}
              />
            </SearchContainer>
            
            <UserList 
              onClick={() => {
                if (isAuthenticated && user?._id && !authLoading) {
                  // Could add user list actions here
                }
              }}
              style={{
                cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
              }}
            >
              {searchLoading ? (
                <LoadingIndicator 
                  onClick={() => {
                    if (isAuthenticated && user?._id && !authLoading) {
                      // Could add loading actions here
                    }
                  }}
                  style={{
                    cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                  }}
                >
                  Searching users...
                </LoadingIndicator>
              ) : searchResults.length > 0 ? (
                searchResults.map((searchUser) => {
                  // Only render search results when user state is properly loaded
                  if (!user || !user._id || authLoading) return null;
                  
                  return (
                  <UserItem 
                    key={searchUser._id}
                    onClick={() => {
                      if (isAuthenticated && user?._id && !authLoading) {
                        handleSelectUser(searchUser);
                      }
                    }}
                    style={{
                      backgroundColor: selectedUser?._id === searchUser._id ? 
                        'rgba(29, 161, 242, 0.1)' : 'transparent',
                      cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <Avatar
                      src={searchUser.profilePicture || '/images/default-profile.png'}
                      alt={searchUser.name}
                      onClick={() => {
                        if (isAuthenticated && user?._id && !authLoading) {
                          navigate(`/profile/${searchUser.username}`);
                        }
                      }}
                      style={{
                        cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                      }}
                    />
                                          <UserInfo 
                      onClick={() => {
                        if (isAuthenticated && user?._id && !authLoading) {
                          navigate(`/profile/${searchUser.username}`);
                        }
                      }}
                      style={{
                        cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <UserName 
                        onClick={() => {
                          if (isAuthenticated && user?._id && !authLoading) {
                            navigate(`/profile/${searchUser.username}`);
                          }
                        }}
                        style={{
                          cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {searchUser.name}
                      </UserName>
                      <UserHandle 
                        onClick={() => {
                          if (isAuthenticated && user?._id && !authLoading) {
                            navigate(`/profile/${searchUser.username}`);
                          }
                        }}
                        style={{
                          cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                        }}
                      >
                        @{searchUser.username}
                      </UserHandle>
                    </UserInfo>
                  </UserItem>
                  );
                })
              ) : searchQuery ? (
                <LoadingIndicator 
                  onClick={() => {
                    if (isAuthenticated && user?._id && !authLoading) {
                      // Could add loading actions here
                    }
                  }}
                  style={{
                    cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                  }}
                >
                  No users found
                </LoadingIndicator>
                              ) : (
                  <LoadingIndicator 
                    onClick={() => {
                      if (isAuthenticated && user?._id && !authLoading) {
                        // Could add loading actions here
                      }
                    }}
                    style={{
                      cursor: isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Search for people to message
                  </LoadingIndicator>
              )}
            </UserList>
            
            <NextButton
              disabled={!selectedUser || !isAuthenticated || !user?._id || authLoading}
              onClick={() => {
                if (isAuthenticated && user?._id && !authLoading) {
                console.log('Next button clicked with selected user:', selectedUser);
                handleStartConversation();
                }
              }}
              style={{ 
                cursor: selectedUser && isAuthenticated && user?._id && !authLoading ? 'pointer' : 'not-allowed',
                opacity: selectedUser && isAuthenticated && user?._id && !authLoading ? 1 : 0.5
              }}
            >
              Next
            </NextButton>
          </Modal>
        </ModalOverlay>
      )}
    </MessagesContainer>
  );
};

export default Messages;
