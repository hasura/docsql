import React, { useState } from "react";
import { ChatWidget } from "../..";

function App() {
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">("bottom-right");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : prev === "dark" ? "auto" : "light"));
  };

  const togglePosition = () => {
    setPosition((prev) => (prev === "bottom-right" ? "bottom-left" : "bottom-right"));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        backgroundColor: theme === "dark" ? "#1a1a1a" : "#ffffff",
        color: theme === "dark" ? "#ffffff" : "#1a1a1a",
        transition: "all 0.3s ease",
      }}>
      <h1>Chat Widget Test App</h1>

      <div style={{ marginBottom: "2rem" }}>
        <h2>Controls</h2>
        <button
          onClick={toggleTheme}
          style={{
            padding: "8px 16px",
            marginRight: "1rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            backgroundColor: theme === "dark" ? "#333" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
            cursor: "pointer",
          }}>
          Theme: {theme}
        </button>

        <button
          onClick={togglePosition}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            backgroundColor: theme === "dark" ? "#333" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
            cursor: "pointer",
          }}>
          Position: {position}
        </button>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <h2>Test Content</h2>
        <p>This is a test page to demonstrate the chat widget functionality.</p>
        <p>The widget should appear in the {position} corner.</p>
        <p>Try asking questions like:</p>
        <ul>
          <li>"What is PromptQL?"</li>
          <li>"How do I set up a connector?"</li>
          <li>"Show me an example query"</li>
        </ul>
      </div>

      <div style={{ height: "200vh", background: "linear-gradient(45deg, #f0f0f0, #e0e0e0)" }}>
        <p style={{ padding: "2rem", color: "#666" }}>Scroll down to test the widget positioning...</p>
      </div>

      <ChatWidget
        apiEndpoint="http://localhost:4000"
        theme={theme}
        position={position}
        brandColor="#007acc"
        placeholder="Ask me about PromptQL..."
        welcomeMessage="Hi! I'm here to help you with PromptQL. What would you like to know?"
      />
    </div>
  );
}

export default App;
