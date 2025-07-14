# Notes

## Shit to do:

- [x] Relate `docs_bot_doc_chunk` to `docs_bot_doc_content` in the schema
- [x] Add the TS connector and create a function that transforms a user's query into an embedding
- [ ] Use that function to query the `docs_bot_doc_chunk` table and return the five(?) most relevant chunks along with
      their content
- [ ] Pair that with their question and create a response that "answers" the question

## Sample queries for testing

```gql
query GET_CHUNK_AND_CORRESPONDING_CONTENT {
  docs_bot_doc_chunk(limit: 1) {
    page_url
    embedding
    content {
      content
    }
  }
}
```

☝️ This is a POC for the first step above in our shit-list. Good news: easy to connect. Though, I'm less optimistic
about the next steps.
