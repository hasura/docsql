import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { useChatWidget } from "../context/ChatWidgetContext";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const { theme } = useChatWidget();

  const codeStyle = theme === "dark" ? oneDark : oneLight;

  const rendererComponents = {
    // Code blocks with syntax highlighting
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";

      if (!inline && language) {
        return (
          <div
            style={{
              position: "relative",
              marginBottom: "16px",
              width: "100%",
              minWidth: 0,
              maxWidth: window.innerWidth <= 768 ? "280px" : "100%",
            }}>
            <div
              style={{
                width: "100%",
                overflowX: "auto",
                borderRadius: "8px",
                WebkitOverflowScrolling: "touch",
              }}>
              <SyntaxHighlighter
                style={codeStyle}
                language={language}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  fontSize: "13px",
                  lineHeight: "1.4",
                  whiteSpace: "pre",
                  width: "max-content",
                  minWidth: "100%",
                }}
                {...props}>
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
            <CopyButton content={String(children)} />
          </div>
        );
      }

      // Inline code
      return (
        <code
          style={{
            backgroundColor: theme === "dark" ? "#333" : "#f1f3f4",
            color: theme === "dark" ? "#ff6b6b" : "#d73a49",
            padding: "2px 4px",
            borderRadius: "3px",
            fontSize: "0.9em",
            fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            wordBreak: "break-all",
            overflowWrap: "break-word",
          }}
          {...props}>
          {children}
        </code>
      );
    },

    // Links with proper styling
    a({ href, children, ...props }: any) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: theme === "dark" ? "#58a6ff" : "#0969da",
            textDecoration: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = "underline";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = "none";
          }}
          {...props}>
          {children}
        </a>
      );
    },

    // Blockquotes
    blockquote({ children, ...props }: any) {
      return (
        <blockquote
          style={{
            borderLeft: `4px solid ${theme === "dark" ? "#58a6ff" : "#0969da"}`,
            paddingLeft: "16px",
            margin: "16px 0",
            fontStyle: "italic",
            color: theme === "dark" ? "#8b949e" : "#656d76",
          }}
          {...props}>
          {children}
        </blockquote>
      );
    },

    // Tables
    table({ children, ...props }: any) {
      return (
        <div style={{ overflowX: "auto", margin: "16px 0" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: theme === "dark" ? "1px solid #333" : "1px solid #d1d9e0",
              borderRadius: "6px",
            }}
            {...props}>
            {children}
          </table>
        </div>
      );
    },

    th({ children, ...props }: any) {
      return (
        <th
          style={{
            padding: "8px 12px",
            backgroundColor: theme === "dark" ? "#333" : "#f6f8fa",
            border: theme === "dark" ? "1px solid #333" : "1px solid #d1d9e0",
            fontWeight: "600",
            textAlign: "left",
          }}
          {...props}>
          {children}
        </th>
      );
    },

    td({ children, ...props }: any) {
      return (
        <td
          style={{
            padding: "8px 12px",
            border: theme === "dark" ? "1px solid #333" : "1px solid #d1d9e0",
          }}
          {...props}>
          {children}
        </td>
      );
    },

    // Lists
    ul({ children, ...props }: any) {
      return (
        <ul
          style={{
            paddingLeft: "20px",
            margin: "8px 0",
          }}
          {...props}>
          {children}
        </ul>
      );
    },

    ol({ children, ...props }: any) {
      return (
        <ol
          style={{
            paddingLeft: "20px",
            margin: "8px 0",
          }}
          {...props}>
          {children}
        </ol>
      );
    },

    // Headings
    h1({ children, ...props }: any) {
      return (
        <h1
          style={{
            fontSize: "1.5em",
            fontWeight: "600",
            margin: "16px 0 8px 0",
            color: theme === "dark" ? "#ffffff" : "#1a1a1a",
          }}
          {...props}>
          {children}
        </h1>
      );
    },

    h2({ children, ...props }: any) {
      return (
        <h2
          style={{
            fontSize: "1.3em",
            fontWeight: "600",
            margin: "16px 0 8px 0",
            color: theme === "dark" ? "#ffffff" : "#1a1a1a",
          }}
          {...props}>
          {children}
        </h2>
      );
    },

    h3({ children, ...props }: any) {
      return (
        <h3
          style={{
            fontSize: "1.1em",
            fontWeight: "600",
            margin: "12px 0 6px 0",
            color: theme === "dark" ? "#ffffff" : "#1a1a1a",
          }}
          {...props}>
          {children}
        </h3>
      );
    },

    // Paragraphs
    p({ children, ...props }: any) {
      return (
        <p
          style={{
            margin: "8px 0",
            lineHeight: "1.5",
          }}
          {...props}>
          {children}
        </p>
      );
    },
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={rendererComponents}>
      {content}
    </ReactMarkdown>
  );
};

// Copy button component for code blocks
const CopyButton: React.FC<{ content: string }> = ({ content }) => {
  const { theme } = useChatWidget();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const isMobile = window.innerWidth <= 768;

  const buttonStyle: React.CSSProperties = {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: theme === "dark" ? "#333" : "#f6f8fa",
    border: theme === "dark" ? "1px solid #444" : "1px solid #d1d9e0",
    borderRadius: "4px",
    padding: "4px 8px",
    fontSize: "12px",
    cursor: "pointer",
    color: theme === "dark" ? "#ffffff" : "#1a1a1a",
    transition: "all 0.2s ease",
    opacity: isMobile ? 0 : 1, // Hidden by default on mobile
    pointerEvents: isMobile ? "none" : "auto",
  };

  return (
    <button
      style={buttonStyle}
      onClick={handleCopy}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme === "dark" ? "#444" : "#e1e7ed";
        if (isMobile) {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.pointerEvents = "auto";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = theme === "dark" ? "#333" : "#f6f8fa";
        if (isMobile) {
          e.currentTarget.style.opacity = "0";
          e.currentTarget.style.pointerEvents = "none";
        }
      }}
      aria-label="Copy code">
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
};
