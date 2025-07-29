import React, { useState, useEffect } from "react";
import { ChatWidget } from "@hasura/chat-widget";
import "./App.css";

function App() {
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
  }, [theme]);

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
            // serverUrl="https://pql-docs-bot-710071984479.us-west2.run.app"
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
