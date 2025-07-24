import React, { useState } from "react";
import { ChatWidget } from "@pql/chat-widget";
import "./App.css";

function App() {
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");

  return (
    <div className="app">
      <header className="header">
        <h1>Chat Widget Test</h1>
        <div className="theme-controls">
          <label>
            Theme:
            <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
              <option value="auto">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      </header>

      <main className="main">
        <div className="widget-container">
          <ChatWidget
            serverUrl="http://localhost:4000"
            theme={theme}
            title="PromptQL Docs Chat"
            placeholder="Ask about PromptQL..."
          />
        </div>
      </main>
    </div>
  );
}

export default App;
