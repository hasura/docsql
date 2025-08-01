import React, { useEffect } from "react";
import { MessageList } from "./MessageList";
import { InputField } from "./InputField";
import { useChatWidget } from "../context/ChatWidgetContext";

interface ChatPanelProps {
  onClose: () => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ onClose }) => {
  const { theme, brandColor, position } = useChatWidget();

  // Handle mobile responsiveness
  const isMobile = window.innerWidth <= 768;

  const getPositionStyles = () => {
    if (isMobile) {
      return {
        bottom: "0",
        left: "0",
        right: "0",
        top: "0",
        width: "100%",
        height: "100%",
        borderRadius: "0",
      };
    }

    const baseStyles = {
      width: "400px",
      height: "600px",
      borderRadius: "12px",
    };

    if (position === "bottom-left") {
      return { ...baseStyles, bottom: "20px", left: "20px" };
    }

    return { ...baseStyles, bottom: "20px", right: "20px" };
  };

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    ...getPositionStyles(),
    backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
    boxShadow: theme === "dark" ? "0 20px 60px rgba(0, 0, 0, 0.6)" : "0 20px 60px rgba(0, 0, 0, 0.15)",
    border: theme === "dark" ? "1px solid #333" : "1px solid #e1e5e9",
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto",
    zIndex: 1000,
    animation: isMobile
      ? "slideUpMobile 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      : "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  const headerStyle: React.CSSProperties = {
    padding: "16px 20px",
    borderBottom: theme === "dark" ? "1px solid #333" : "1px solid #e1e5e9",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
    borderRadius: isMobile ? "0" : "12px 12px 0 0",
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: theme === "dark" ? "#ffffff" : "#1a1a1a",
  };

  const closeButtonStyle: React.CSSProperties = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "6px",
    color: theme === "dark" ? "#ffffff" : "#1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease",
  };

  const messageAreaStyle: React.CSSProperties = {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  const inputAreaStyle: React.CSSProperties = {
    padding: "16px 20px",
    borderTop: theme === "dark" ? "1px solid #333" : "1px solid #e1e5e9",
    backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
    borderRadius: isMobile ? "0" : "0 0 12px 12px",
  };

  return (
    <>
      {/* CSS keyframes injection */}
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          @keyframes slideUpMobile {
            from {
              opacity: 0;
              transform: translateY(100%);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      <div style={panelStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={titleStyle}>Chat Assistant</h3>
          <button
            style={closeButtonStyle}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === "dark" ? "#333" : "#f0f0f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label="Close chat">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* Message Area */}
        <div style={messageAreaStyle}>
          <MessageList />
        </div>

        {/* Input Area */}
        <div style={inputAreaStyle}>
          <InputField />
        </div>
      </div>
    </>
  );
};
