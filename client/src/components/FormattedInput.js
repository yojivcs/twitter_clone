import React, { useCallback, useMemo, useRef } from 'react';
import styled from 'styled-components';
import FormatToolbar from './FormatToolbar';

const EditorContainer = styled.div`
  width: 100%;
`;

const Editor = styled.div`
  width: 100%;
  min-height: 60px;
  padding: 12px;
  font-size: 20px;
  border: none;
  background-color: transparent;
  color: ${({ theme }) => theme.text};
  outline: none;
  white-space: pre-wrap;
  word-wrap: break-word;
  resize: none;
  overflow-wrap: break-word;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;

  &[contenteditable=true]:empty:before {
    content: attr(placeholder);
    color: ${({ theme }) => theme.textSecondary};
    pointer-events: none;
  }

  /* Rich text formatting */
  b, strong { font-weight: bold; }
  i, em { font-style: italic; }
  u { text-decoration: underline; }
  strike { text-decoration: line-through; }
  
  /* Lists */
  ul, ol {
    margin-left: 24px;
    margin-bottom: 8px;
  }

  /* Blockquote */
  blockquote {
    border-left: 4px solid ${({ theme }) => theme.primary};
    margin: 8px 0;
    padding-left: 16px;
    color: ${({ theme }) => theme.textSecondary};
  }
`;

const FormattedInput = ({ value, onChange, placeholder }) => {
  const editorRef = useRef(null);
  const [activeFormats, setActiveFormats] = React.useState({});
  const lastValueRef = useRef('');
  const timeoutRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Memoized debounced onChange to prevent excessive updates
  const debouncedOnChange = useMemo(() => {
    return (content) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (content !== lastValueRef.current) {
          lastValueRef.current = content;
          onChange(content);
        }
      }, 0); // No delay for immediate response
    };
  }, [onChange]);

  const handleInput = useCallback((e) => {
    // Immediate response without requestAnimationFrame for better typing experience
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      debouncedOnChange(content);
    }
  }, [debouncedOnChange]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  const insertEmoji = useCallback((emoji) => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    // Create a text node with the emoji
    const emojiNode = document.createTextNode(emoji);
    
    // Insert the emoji at cursor position
    range.insertNode(emojiNode);
    
    // Move cursor after emoji
    range.setStartAfter(emojiNode);
    range.setEndAfter(emojiNode);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Trigger input event to update content
    handleInput();
    
    // Focus back on editor
    editor.focus();
  }, [handleInput]);

  const handleFormat = useCallback((format) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const editor = editorRef.current;
    if (!editor) return;

    // Save the current selection
    const savedSelection = {
      startContainer: range.startContainer,
      startOffset: range.startOffset,
      endContainer: range.endContainer,
      endOffset: range.endOffset
    };

    // Apply formatting based on the format type
    switch (format) {
      case 'bold':
        document.execCommand('bold', false);
        break;
      case 'italic':
        document.execCommand('italic', false);
        break;
      case 'underline':
        document.execCommand('underline', false);
        break;
      case 'strikethrough':
        document.execCommand('strikeThrough', false);
        break;
      case 'bullet':
        document.execCommand('insertUnorderedList', false);
        break;
      case 'number':
        document.execCommand('insertOrderedList', false);
        break;
      case 'quote':
        document.execCommand('formatBlock', false, '<blockquote>');
        break;
      default:
        break;
    }

    // Restore the selection
    try {
      const newRange = document.createRange();
      newRange.setStart(savedSelection.startContainer, savedSelection.startOffset);
      newRange.setEnd(savedSelection.endContainer, savedSelection.endOffset);
      selection.removeAllRanges();
      selection.addRange(newRange);
    } catch (error) {
      // If selection restoration fails, just focus the editor
      editor.focus();
    }

    // Update active formats
    setActiveFormats(prev => ({
      ...prev,
      [format]: !prev[format]
    }));

    // Trigger onChange
    handleInput();

    // Focus back on editor
    editor.focus();
  }, [handleInput]);

  const handleKeyDown = useCallback((e) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          e.stopPropagation();
          handleFormat('bold');
          break;
        case 'i':
          e.preventDefault();
          e.stopPropagation();
          handleFormat('italic');
          break;
        case 'u':
          e.preventDefault();
          e.stopPropagation();
          handleFormat('underline');
          break;
        case 'enter':
          // Allow Ctrl+Enter for form submission
          break;
        default:
          break;
      }
    }
  }, [handleFormat]);

  // Initialize editor content only once and don't sync with external value
  React.useEffect(() => {
    if (editorRef.current && !isInitializedRef.current) {
      if (value) {
        editorRef.current.innerHTML = value;
        lastValueRef.current = value;
      }
      isInitializedRef.current = true;
    }
  }, []); // Empty dependency array - only run once

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <EditorContainer>
      <FormatToolbar onFormat={handleFormat} activeFormats={activeFormats} />
      <Editor
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        role="textbox"
        aria-multiline="true"
        suppressContentEditableWarning={true}
        spellCheck="false"
      />
    </EditorContainer>
  );
};

export default FormattedInput;
