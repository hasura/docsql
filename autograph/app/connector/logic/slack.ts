import axios from "axios";
import { mustEnv } from "./utils";

/**
 * Slack Block Kit block element - simplified for NDC compatibility
 */
export type SlackBlock = {
  type: string;
  text?: {
    type: string;
    text: string;
  };
  fields?: Array<{
    type: string;
    text: string;
  }>;
  elements?: Array<{
    type: string;
    text: string;
  }>;
};

/**
 * Slack message sending result
 */
export type SlackMessageResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

/**
 * Slack configuration
 */
export type SlackConfig = {
  channel: string; // Channel ID or name (e.g., "#general" or "C1234567890")
  username?: string; // Bot username to display
  iconEmoji?: string; // Bot icon emoji (e.g., ":robot_face:")
  iconUrl?: string; // Bot icon URL
};

/**
 * Create Slack Block Kit blocks from simple content
 * @param content The content to convert to blocks (text only for NDC compatibility)
 * @returns SlackBlock[]
 */
export function createSlackBlocks(content: string): SlackBlock[] {
  // Simple text content - create basic blocks
  const lines = content.split("\n").filter((line) => line.trim());
  const blocks: SlackBlock[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Headers (lines starting with #)
    if (trimmed.startsWith("# ")) {
      blocks.push({
        type: "header",
        text: {
          type: "plain_text",
          text: trimmed.substring(2),
        },
      });
    }
    // Subheaders (lines starting with ##)
    else if (trimmed.startsWith("## ")) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${trimmed.substring(3)}*`,
        },
      });
    }
    // Regular text
    else {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: trimmed,
        },
      });
    }
  }

  return blocks;
}

/**
 * Create a data table block from structured data
 * @param data Array of objects to display as a table (simplified for NDC)
 * @param title Optional title for the table
 * @returns SlackBlock[]
 */
export function createDataTable(data: string, title?: string): SlackBlock[] {
  // Parse the JSON string to get the actual data
  let parsedData: any[];
  try {
    parsedData = JSON.parse(data);
    if (!Array.isArray(parsedData)) {
      throw new Error("Data must be an array");
    }
  } catch (error) {
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "_Error: Invalid JSON data provided_",
        },
      },
    ];
  }
  const blocks: SlackBlock[] = [];

  if (title) {
    blocks.push({
      type: "header",
      text: {
        type: "plain_text",
        text: title,
      },
    });
  }

  if (parsedData.length === 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "_No data available_",
      },
    });
    return blocks;
  }

  // Get headers from first object
  const headers = Object.keys(parsedData[0] || {});

  // Calculate column widths for better alignment
  const columnWidths = headers.map((header) => {
    const headerLength = header.length;
    const maxDataLength = Math.max(...parsedData.slice(0, 10).map((row) => String((row as any)[header] || "").length));
    return Math.max(headerLength, maxDataLength, 3); // minimum width of 3
  });

  // Create markdown table in a code block
  const maxRows = 10;
  const displayData = parsedData.slice(0, maxRows);

  // Build the markdown table
  let tableMarkdown = "```\n";

  // Header row
  const headerRow = headers.map((header, i) => header.padEnd(columnWidths[i])).join(" | ");
  tableMarkdown += headerRow + "\n";

  // Separator row
  const separatorRow = columnWidths.map((width) => "-".repeat(width)).join("-|-");
  tableMarkdown += separatorRow + "\n";

  // Data rows
  for (const row of displayData) {
    const dataRow = headers.map((header, i) => String((row as any)[header] || "").padEnd(columnWidths[i])).join(" | ");
    tableMarkdown += dataRow + "\n";
  }

  tableMarkdown += "```";

  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: tableMarkdown,
    },
  });

  if (parsedData.length > maxRows) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `_Showing ${maxRows} of ${parsedData.length} rows_`,
        },
      ],
    });
  }

  return blocks;
}

/**
 * Create a key-value pairs display from an object
 * @param data JSON string containing key-value pairs
 * @param title Optional title for the section
 * @returns SlackBlock[]
 */
export function createKeyValueDisplay(data: string, title?: string): SlackBlock[] {
  // Parse the JSON string to get the actual data
  let parsedData: any;
  try {
    parsedData = JSON.parse(data);
    if (typeof parsedData !== "object" || Array.isArray(parsedData)) {
      throw new Error("Data must be an object");
    }
  } catch (error) {
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "_Error: Invalid JSON object provided_",
        },
      },
    ];
  }
  const blocks: SlackBlock[] = [];

  if (title) {
    blocks.push({
      type: "header",
      text: {
        type: "plain_text",
        text: title,
      },
    });
  }

  const fields = Object.entries(parsedData).map(([key, value]) => ({
    type: "mrkdwn",
    text: `*${key}:*\n${String(value)}`,
  }));

  // Split into chunks of 10 fields (Slack limit)
  for (let i = 0; i < fields.length; i += 10) {
    const chunk = fields.slice(i, i + 10);
    blocks.push({
      type: "section",
      fields: chunk,
    });
  }

  return blocks;
}

/**
 * Create a status/alert block with color coding
 * @param message The main message
 * @param status Status level: success, warning, error, or info
 * @param details Optional additional details
 * @returns SlackBlock[]
 */
export function createStatusAlert(message: string, status: string, details?: string): SlackBlock[] {
  const blocks: SlackBlock[] = [];

  // Status emoji mapping
  let emoji = "ℹ️"; // default
  if (status === "success") emoji = "✅";
  else if (status === "warning") emoji = "⚠️";
  else if (status === "error") emoji = "❌";
  else if (status === "info") emoji = "ℹ️";

  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `${emoji} *${message}*`,
    },
  });

  if (details) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: details,
      },
    });
  }

  return blocks;
}

/**
 * Create a metrics/stats display from numeric data
 * @param metrics JSON string containing metric names and numeric values
 * @param title Optional title for the metrics section
 * @returns SlackBlock[]
 */
export function createMetricsDisplay(metrics: string, title?: string): SlackBlock[] {
  // Parse the JSON string to get the actual data
  let parsedMetrics: any;
  try {
    parsedMetrics = JSON.parse(metrics);
    if (typeof parsedMetrics !== "object" || Array.isArray(parsedMetrics)) {
      throw new Error("Metrics must be an object");
    }
  } catch (error) {
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "_Error: Invalid JSON metrics provided_",
        },
      },
    ];
  }
  const blocks: SlackBlock[] = [];

  if (title) {
    blocks.push({
      type: "header",
      text: {
        type: "plain_text",
        text: title,
      },
    });
  }

  const fields = Object.entries(parsedMetrics).map(([key, value]) => ({
    type: "mrkdwn",
    text: `*${key}*\n${Number(value).toLocaleString()}`,
  }));

  // Split into chunks of 10 fields (Slack limit)
  for (let i = 0; i < fields.length; i += 10) {
    const chunk = fields.slice(i, i + 10);
    blocks.push({
      type: "section",
      fields: chunk,
    });
  }

  return blocks;
}

/**
 * Create a list display from an array
 * @param items JSON string containing array of items to display
 * @param title Optional title for the list
 * @param ordered Whether to use numbered list (default: false)
 * @returns SlackBlock[]
 */
export function createListDisplay(items: string, title?: string, ordered: boolean = false): SlackBlock[] {
  // Parse the JSON string to get the actual data
  let parsedItems: any[];
  try {
    parsedItems = JSON.parse(items);
    if (!Array.isArray(parsedItems)) {
      throw new Error("Items must be an array");
    }
  } catch (error) {
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "_Error: Invalid JSON array provided_",
        },
      },
    ];
  }
  const blocks: SlackBlock[] = [];

  if (title) {
    blocks.push({
      type: "header",
      text: {
        type: "plain_text",
        text: title,
      },
    });
  }

  if (parsedItems.length === 0) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "_No items to display_",
      },
    });
    return blocks;
  }

  const listText = parsedItems
    .map((item: any, index: number) => {
      const prefix = ordered ? `${index + 1}.` : "•";
      return `${prefix} ${String(item)}`;
    })
    .join("\n");

  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: listText,
    },
  });

  return blocks;
}

/**
 * Send message to Slack
 * @readonly
 * @param blocks Slack Block Kit blocks or simple text content
 * @param config Slack configuration
 * @param text Optional fallback text for notifications
 * @returns Promise<SlackMessageResult>
 */
export async function sendSlackMessage(
  blocks: string,
  config: SlackConfig,
  text?: string
): Promise<SlackMessageResult> {
  try {
    const slackToken = mustEnv("SLACK_BOT_TOKEN");

    // Try to parse as JSON first, if that fails treat as simple text
    let blocksArray: SlackBlock[];
    try {
      blocksArray = JSON.parse(blocks);
      if (!Array.isArray(blocksArray)) {
        // If it's not an array, treat as simple text
        blocksArray = createSlackBlocks(blocks);
      }
    } catch {
      // If JSON parsing fails, treat as simple text
      blocksArray = createSlackBlocks(blocks);
    }

    const payload: any = {
      channel: config.channel,
      blocks: blocksArray,
      text: text || "New message", // Fallback text for notifications
    };

    // Optional bot customization
    if (config.username) payload.username = config.username;
    if (config.iconEmoji) payload.icon_emoji = config.iconEmoji;
    if (config.iconUrl) payload.icon_url = config.iconUrl;

    const response = await axios.post("https://slack.com/api/chat.postMessage", payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${slackToken}`,
      },
    });

    if (!response.data.ok) {
      throw new Error(`Slack API error: ${response.data.error}`);
    }

    return {
      success: true,
      messageId: response.data.ts, // Slack timestamp serves as message ID
    };
  } catch (error) {
    console.error("Error sending Slack message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown Slack API error",
    };
  }
}
