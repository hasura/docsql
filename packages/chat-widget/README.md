# Chat Widget

Embeddable React component for adding PromptQL-powered chat to any documentation site.

## Installation

```sh
npm install @hasura/chat-widget
```

## Usage

```tsx
import { ChatWidget } from "@hasura/chat-widget";
import "@hasura/chat-widget/styles";

<ChatWidget
  serverUrl="http://localhost:4000"
  theme="auto"
  title="Documentation Chat"
  placeholder="Ask about PromptQL..."
/>;
```

## Props

| Prop          | Type                          | Default                | Description          |
| ------------- | ----------------------------- | ---------------------- | -------------------- |
| `serverUrl`   | `string`                      | -                      | Chat API server URL  |
| `theme`       | `"light" \| "dark" \| "auto"` | `"auto"`               | Theme mode           |
| `title`       | `string`                      | `"Documentation Chat"` | Chat window title    |
| `placeholder` | `string`                      | `"Ask a question..."`  | Input placeholder    |
| `className`   | `string`                      | -                      | Additional CSS class |

## Features

- 🎨 Light/dark/auto theme support
- 📱 Responsive design
- 💬 Streaming message support
- ⚡ Minimal dependencies
- 🔧 TypeScript support

## Development

```sh
# Build the widget
bun run build

# Test with demo app
bun run test
# Opens http://localhost:3001
```

## Styling

The widget includes default styles, but you can customize with CSS variables:

```css
.chat-widget {
  --chat-primary-color: #your-color;
  --chat-background: #your-bg;
}
```

## Browser Support

- Modern browsers with ES2018+ support
- React 16.8+ (hooks: support)
