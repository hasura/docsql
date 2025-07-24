# Notes

## Shit to do:

- [x] Relate `docs_bot_doc_chunk` to `docs_bot_doc_content` in the schema
- [x] Add the TS connector and create a function that transforms a user's query into an embedding
- [x] Use that function to query the `docs_bot_doc_chunk` table and return the five(?) most relevant chunks along with
      their content
- [x] Pair that with their question and create a response that "answers" the question
- [ ] Create a chat interface that will use the automation endpoint for the first message in a conversation and then use
      the Natural Language API to progressively add context and have the conversation with the user

### Testing the Chat API

#### Simple message (no history):

```bash
xh POST localhost:4000/chat/conversations/test-123/messages message="How do I connect PostgreSQL to PromptQL?"
```

#### Message with conversation history:

```bash
xh POST localhost:4000/chat/conversations/test-123/messages \
  message="What did you just tell me about PostgreSQL?" \
  history:='[
    {"role": "user", "content": "How do I connect PostgreSQL to PromptQL?"},
    {"role": "assistant", "content": "You need to configure the pg connector in your metadata files and set up the connection URL in your environment variables."},
    {"role": "user", "content": "What environment variables do I need?"},
    {"role": "assistant", "content": "You need APP_PG_READ_URL, APP_PG_WRITE_URL, and APP_PG_AUTHORIZATION_HEADER in your .env file."}
  ]'
```
