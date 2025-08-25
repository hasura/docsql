import { CreateBuildOutput, createPatchBuild, getModelsCommandsAndTypes, MetadataPatch, Resources } from "./cp";
import { getThreads, Thread } from "./threads";
import {
  createSlackBlocks,
  sendSlackMessage,
  createDataTable,
  createKeyValueDisplay,
  createStatusAlert,
  createMetricsDisplay,
  createListDisplay,
  SlackBlock,
  SlackMessageResult,
  SlackConfig,
} from "./slack";
import * as sdk from "@hasura/ndc-lambda-sdk";
import { validatedDetails } from "./auth";
import { envCheck } from "./utils";

envCheck([
  "CONTROL_PLANE_URL",
  "PROMPTQL_PLAYGROUND_URL",
  "CONSOLE_HOST",
  "AUTH_JWKS_URI",
  "DDN_ACCESS_TOKEN",
  "SLACK_BOT_TOKEN",
]);

/**
 * Get all threads of a project.
 * @readonly
 * @param headers Request Headers
 * @param from_thread_created_at ISO 8601-like with explicit timezone designation. Sample: 2025-04-14T14:57:03+05:30
 * @param to_thread_created_at ISO 8601-like with explicit timezone designation. Sample: 2025-04-14T14:57:03+05:30
 * @param sample_artifacts Whether to sample table artifacts in the thread state. Default: true
 * @returns
 */
export async function getAllThreads(
  headers: sdk.JSONValue,
  from_thread_created_at?: string,
  to_thread_created_at?: string,
  sample_artifacts?: boolean
): Promise<Thread[]> {
  const { project_id, token, build_id } = await validatedDetails(headers);

  const threads = await getThreads(
    project_id,
    token,
    from_thread_created_at,
    to_thread_created_at,
    build_id,
    sample_artifacts
  );
  return threads;
}

/**
 * Get all Models Commands and ObjectTypes of all subgraphs of a build.
 * @readonly
 * @param headers
 * @returns Resources
 */
export async function getAllModelsCommandsAndTypes(headers: sdk.JSONValue): Promise<Resources> {
  const { project_id, build_id } = await validatedDetails(headers);
  const md = await getModelsCommandsAndTypes(project_id, build_id);
  return md;
}

/**
 * Creates a new supergraph build by applying the patches on the metadata of the applied build of a project.
 * @param headers
 * @param patches
 * @param description Optional description for the build
 * @returns CreateBuildOutput
 */
export async function createMetadataPatchBuild(
  headers: sdk.JSONValue,
  patches: MetadataPatch[],
  description?: string
): Promise<CreateBuildOutput> {
  const { project_id, build_id } = await validatedDetails(headers);
  const md = await createPatchBuild(project_id, patches, build_id, description);
  return md;
}

/**
 * Create Slack Block Kit blocks from simple text content with basic markdown support
 *
 * Converts plain text or simple markdown into properly formatted Slack Block Kit blocks.
 * Supports headers (# and ##) and automatically formats text into sections.
 *
 * @readonly
 * @param headers - Request headers containing authentication tokens and user context
 * @param content - Text content to convert. Can be:
 *   - Plain text string (will be converted to section blocks)
 *   - Markdown-style text with # headers and ## subheaders
 *   - Pre-built SlackBlock[] array (will be returned as-is)
 *
 *   Examples:
 *   - "Hello world" → Simple section block
 *   - "# Title\n## Subtitle\nContent" → Header + subheader + section blocks
 *   - [{type: "section", text: {...}}] → Returned unchanged
 *
 * @returns Array of Slack Block Kit blocks ready to be sent to Slack
 *
 * @example
 * const blocks = createSlackBlocksFromContent(headers, "# Report\n## Summary\nAll systems operational");
 * // Returns: [header block, section block with bold text, section block]
 */
export function createSlackBlocksFromContent(_headers: sdk.JSONValue, content: string): SlackBlock[] {
  // Note: This is a synchronous function, but we still validate for consistency
  // In a real implementation, you might want to make this async

  // Call the block creation function
  return createSlackBlocks(content);
}

/**
 * Send a rich message with Block Kit blocks to a Slack channel
 *
 * Posts a message to Slack using the Slack Web API. Supports rich formatting through
 * Block Kit blocks or simple text content. The message will appear from your bot
 * with customizable appearance.
 * @readonly
 * @param headers - Request headers containing authentication tokens and user context
 * @param blocks - Message content to send. Can be:
 *   - Array of SlackBlock objects (rich formatted content with sections, headers, etc.)
 *   - Simple text string (will be auto-converted to basic blocks)
 *
 *   Examples:
 *   - "Hello team!" → Simple text message
 *   - [{type: "header", text: {type: "plain_text", text: "Alert"}}] → Rich formatted message
 *
 * @param config - Slack channel and bot configuration:
 *   - channel: Target channel (e.g., "#general", "#alerts", or channel ID "C1234567890")
 *   - username: Display name for the bot (e.g., "PromptQL Bot", "Alert System")
 *   - iconEmoji: Bot avatar emoji (e.g., ":robot_face:", ":warning:", ":chart_with_upwards_trend:")
 *   - iconUrl: Custom bot avatar image URL (alternative to iconEmoji)
 *
 * @param text - Fallback text for push notifications and accessibility. If not provided,
 *   defaults to "New message". This text appears in:
 *   - Mobile push notifications
 *   - Desktop notifications
 *   - Screen readers
 *   - Slack search results
 *
 * @returns Promise resolving to SlackMessageResult with:
 *   - success: boolean indicating if message was sent
 *   - messageId: Slack timestamp ID for the sent message (for threading/updates)
 *   - error: Error message if sending failed
 *
 * @example
 * const result = await sendSlackMessageToChannel(
 *   headers,
 *   [{type: "section", text: {type: "mrkdwn", text: "*Alert:* System is down"}}],
 *   {channel: "#alerts", username: "System Monitor", iconEmoji: ":warning:"},
 *   "System Alert"
 * );
 */
export async function sendSlackMessageToChannel(
  headers: sdk.JSONValue,
  blocks: string,
  config: SlackConfig,
  text?: string
): Promise<SlackMessageResult> {
  // Call the Slack message sending function
  return await sendSlackMessage(blocks, config, text);
}

/**
 * Create a formatted data table from structured JSON data for Slack display
 *
 * Converts an array of objects into a nicely formatted table with headers and rows.
 * Perfect for displaying query results, reports, lists of records, or any tabular data.
 * Automatically handles column headers and formats data for optimal Slack readability.
 *
 * @readonly
 * @param headers - Request headers containing authentication tokens and user context
 * @param data - Array of objects representing table rows. Each object should have the same keys.
 *   The keys become column headers, values become cell data. Examples:
 *   - Sales data: [{product: "Widget A", sales: 1250, region: "North"}, ...]
 *   - User list: [{name: "John", email: "john@co.com", role: "Admin"}, ...]
 *   - Metrics: [{date: "2024-01-01", visitors: 1500, conversions: 45}, ...]
 *
 *   Limitations:
 *   - Maximum 10 rows displayed (shows "X of Y rows" if more)
 *   - All values converted to strings for display
 *   - Empty/null values show as empty cells
 *
 * @param title - Optional header title for the table (e.g., "Q4 Sales Report", "Active Users", "System Metrics")
 *   If provided, appears as a prominent header block above the table
 *
 * @returns Array of Slack Block Kit blocks forming a complete table:
 *   - Header block (if title provided)
 *   - Section block with bold column headers
 *   - Divider block
 *   - Section blocks for each data row
 *   - Context block showing row count (if data truncated)
 *
 * @example
 * const salesData = [
 *   {product: "Widget A", revenue: 15000, units: 150},
 *   {product: "Widget B", revenue: 12000, units: 120}
 * ];
 * const blocks = createSlackDataTable(headers, salesData, "Monthly Sales");
 * // Creates: Header "Monthly Sales" + table with product|revenue|units columns
 */
export function createSlackDataTable(_headers: sdk.JSONValue, data: string, title?: string): SlackBlock[] {
  return createDataTable(data, title);
}

/**
 * Create a key-value pairs display from a JSON object for detailed information presentation
 *
 * Transforms an object into a clean, organized display of key-value pairs with bold labels.
 * Perfect for showing configuration details, user profiles, system information, or any
 * structured data where you want to highlight specific fields and their values.
 *
 * @readonly
 * @param headers - Request headers containing authentication tokens and user context
 * @param data - Object containing key-value pairs to display. Keys become bold labels,
 *   values are displayed below each label. Examples:
 *   - User profile: {name: "John Doe", email: "john@company.com", department: "Engineering"}
 *   - System status: {uptime: "99.9%", memory: "4.2GB", cpu: "23%", disk: "67%"}
 *   - Order details: {orderId: "ORD-12345", customer: "Acme Corp", amount: "$1,250.00"}
 *
 *   Notes:
 *   - All values converted to strings for display
 *   - Nested objects will be displayed as "[object Object]" - flatten first if needed
 *   - Arrays will be displayed as comma-separated values
 *   - Maximum 10 fields per section (splits into multiple sections if more)
 *
 * @param title - Optional header title for the key-value section (e.g., "User Details",
 *   "System Information", "Order Summary"). If provided, appears as a prominent header
 *   block above the key-value pairs
 *
 * @returns Array of Slack Block Kit blocks with formatted key-value pairs:
 *   - Header block (if title provided)
 *   - Section blocks with fields containing "Key: Value" pairs
 *   - Multiple section blocks if more than 10 fields (Slack limitation)
 *
 * @example
 * const userInfo = {
 *   "Full Name": "Jane Smith",
 *   "Email": "jane.smith@company.com",
 *   "Department": "Product Management",
 *   "Start Date": "2023-03-15",
 *   "Manager": "Bob Johnson"
 * };
 * const blocks = createSlackKeyValueDisplay(headers, userInfo, "Employee Profile");
 * // Creates: Header "Employee Profile" + formatted key-value pairs
 */
export function createSlackKeyValueDisplay(_headers: sdk.JSONValue, data: string, title?: string): SlackBlock[] {
  return createKeyValueDisplay(data, title);
}

/**
 * Create a status alert block with visual indicators for notifications and system updates
 *
 * Generates eye-catching status messages with appropriate emoji indicators and formatting.
 * Perfect for system alerts, deployment notifications, error reports, or any status updates
 * that need to grab attention and convey urgency or success.
 *
 * @readonly
 * @param headers - Request headers containing authentication tokens and user context
 * @param message - Primary alert message that will be displayed prominently in bold.
 *   Should be concise but descriptive. Examples:
 *   - "Database Migration Complete"
 *   - "Payment Service Unavailable"
 *   - "New Feature Deployed Successfully"
 *   - "Security Alert: Unusual Login Activity"
 *
 * @param status - Alert severity level that determines the emoji and visual treatment:
 *   - "success": ✅ Green checkmark for completed tasks, successful operations
 *   - "warning": ⚠️ Yellow warning triangle for cautions, degraded performance
 *   - "error": ❌ Red X for failures, critical issues, system down
 *   - "info": ℹ️ Blue info circle for general updates, announcements, FYI messages
 *
 * @param details - Optional additional context or explanation text. Appears in a separate
 *   section below the main message. Use for:
 *   - Technical details (error codes, timing, affected systems)
 *   - Next steps or action items
 *   - Additional context that supports the main message
 *   - Links to dashboards, logs, or documentation
 *
 * @returns Array of Slack Block Kit blocks forming a complete status alert:
 *   - Section block with emoji + bold message
 *   - Additional section block with details (if provided)
 *
 * @example
 * const alertBlocks = createSlackStatusAlert(
 *   headers,
 *   "API Rate Limit Exceeded",
 *   "warning",
 *   "Current usage: 1,247 requests/minute. Limit: 1,000/minute. Consider upgrading plan."
 * );
 * // Creates: ⚠️ **API Rate Limit Exceeded** + details section
 */
export function createSlackStatusAlert(
  _headers: sdk.JSONValue,
  message: string,
  status: string,
  details?: string
): SlackBlock[] {
  return createStatusAlert(message, status, details);
}

/**
 * Create a metrics dashboard display from numeric data with automatic formatting
 *
 * Transforms numeric data into a clean, organized metrics display with proper number
 * formatting. Perfect for KPIs, analytics dashboards, performance metrics, or any
 * numeric data that needs to be presented in a professional, easy-to-scan format.
 *
 * @readonly
 * @param headers - Request headers containing authentication tokens and user context
 * @param metrics - Object containing metric names and their numeric values. Keys become
 *   metric labels, values are automatically formatted with thousand separators. Examples:
 *   - Business metrics: {revenue: 125000, customers: 1247, conversion_rate: 3.2}
 *   - System metrics: {cpu_usage: 67, memory_gb: 4.2, disk_usage: 89, uptime_hours: 720}
 *   - Analytics: {page_views: 45000, unique_visitors: 12500, bounce_rate: 2.1}
 *
 *   Notes:
 *   - All values must be numbers (integers or floats)
 *   - Numbers automatically formatted with commas (e.g., 1247 → "1,247")
 *   - Decimal numbers preserved (e.g., 3.14159 → "3.14159")
 *   - Maximum 10 metrics per section (splits into multiple sections if more)
 *
 * @param title - Optional header title for the metrics section (e.g., "Daily Analytics",
 *   "System Performance", "Q4 KPIs"). If provided, appears as a prominent header
 *   block above the metrics grid
 *
 * @returns Array of Slack Block Kit blocks with formatted metrics display:
 *   - Header block (if title provided)
 *   - Section blocks with fields showing "Metric Name: Formatted Value"
 *   - Multiple section blocks if more than 10 metrics (Slack field limitation)
 *
 * @example
 * const dailyMetrics = {
 *   "Active Users": 15420,
 *   "Revenue": 89750.50,
 *   "Conversion Rate": 3.2,
 *   "Support Tickets": 42,
 *   "Server Uptime": 99.9
 * };
 * const blocks = createSlackMetricsDisplay(headers, dailyMetrics, "Today's Performance");
 * // Creates: Header "Today's Performance" + formatted metrics grid
 */
export function createSlackMetricsDisplay(_headers: sdk.JSONValue, metrics: string, title?: string): SlackBlock[] {
  return createMetricsDisplay(metrics, title);
}

/**
 * Create a formatted list display from array data with bullet points or numbering
 *
 * Converts an array of items into a clean, readable list format. Perfect for displaying
 * todo items, error messages, feature lists, steps in a process, or any collection
 * of related items that need to be presented in an organized, scannable format.
 *
 * @readonly
 * @param headers - Request headers containing authentication tokens and user context
 * @param items - Array of items to display in the list. Each item will be converted to
 *   a string and displayed on its own line. Examples:
 *   - Error messages: ["Database connection failed", "API timeout", "Invalid credentials"]
 *   - Todo items: ["Review pull request #123", "Update documentation", "Deploy to staging"]
 *   - Features: ["Real-time notifications", "Advanced search", "Mobile app"]
 *   - Steps: ["Backup database", "Run migration", "Restart services", "Verify functionality"]
 *
 *   Notes:
 *   - All items converted to strings for display
 *   - Objects will show as "[object Object]" - convert to meaningful strings first
 *   - Empty array shows "No items to display" message
 *   - Very long lists may hit Slack message size limits
 *
 * @param title - Optional header title for the list (e.g., "Action Items", "System Errors",
 *   "Deployment Steps", "New Features"). If provided, appears as a prominent header
 *   block above the list
 *
 * @param ordered - Whether to use numbered list format instead of bullet points:
 *   - false (default): Uses bullet points (• Item 1, • Item 2, ...)
 *   - true: Uses numbers (1. Item 1, 2. Item 2, ...)
 *   Use numbered lists for sequential steps, priorities, or ranked items
 *
 * @returns Array of Slack Block Kit blocks with formatted list:
 *   - Header block (if title provided)
 *   - Section block containing the formatted list with bullets or numbers
 *   - Context block if list is empty
 *
 * @example
 * const deploymentSteps = [
 *   "Stop application servers",
 *   "Backup current database",
 *   "Deploy new application version",
 *   "Run database migrations",
 *   "Start application servers",
 *   "Verify all services are healthy"
 * ];
 * const blocks = createSlackListDisplay(headers, deploymentSteps, "Deployment Checklist", true);
 * // Creates: Header "Deployment Checklist" + numbered list (1. Stop application servers, 2. Backup...)
 */
export function createSlackListDisplay(
  _headers: sdk.JSONValue,
  items: string,
  title?: string,
  ordered: boolean = false
): SlackBlock[] {
  return createListDisplay(items, title, ordered);
}
