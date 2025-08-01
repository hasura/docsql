import React from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useChatWidget } from '../context/ChatWidgetContext';
import type { Message } from '../types';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { theme } = useChatWidget();

  const isUser = message.role === 'user';

  const messageStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: isUser ? 'flex-end' : 'flex-start',
    maxWidth: '85%',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
  };

  const bubbleStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
    backgroundColor: isUser 
      ? (theme === 'dark' ? '#0066cc' : '#007acc')
      : (theme === 'dark' ? '#2a2a2a' : '#f1f3f4'),
    color: isUser 
      ? '#ffffff'
      : (theme === 'dark' ? '#ffffff' : '#1a1a1a'),
    wordBreak: 'break-word',
    fontSize: '14px',
    lineHeight: '1.4',
  };

  const timestampStyle: React.CSSProperties = {
    fontSize: '11px',
    color: theme === 'dark' ? '#888' : '#666',
    marginTop: '4px',
    marginLeft: isUser ? '0' : '16px',
    marginRight: isUser ? '16px' : '0',
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={messageStyle}>
      <div style={bubbleStyle}>
        {isUser ? (
          message.content
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
      <div style={timestampStyle}>
        {formatTimestamp(message.timestamp)}
      </div>
    </div>
  );
};