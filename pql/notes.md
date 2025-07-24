# Notes

## Shit to do:

- [x] Relate `docs_bot_doc_chunk` to `docs_bot_doc_content` in the schema
- [x] Add the TS connector and create a function that transforms a user's query into an embedding
- [x] Use that function to query the `docs_bot_doc_chunk` table and return the five(?) most relevant chunks along with
      their content
- [x] Pair that with their question and create a response that "answers" the question
- [ ] Create a chat interface that will use the automation endpoint for the first message in a conversation and then use
      the Natural Language API to progressively add context and have the conversation with the user
