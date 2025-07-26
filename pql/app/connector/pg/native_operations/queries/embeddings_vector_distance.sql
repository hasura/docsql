SELECT 
  id,
  chunk_content,
  page_title,
  page_url,
  page_description,
  version,
  embedding <=> :query_vector AS distance
FROM docs_bot.doc_chunk
WHERE version = 'promptql'
ORDER BY embedding <=> :query_vector
LIMIT :limit_count