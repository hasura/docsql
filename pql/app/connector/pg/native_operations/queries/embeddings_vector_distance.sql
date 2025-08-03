SELECT 
  id,
  chunk_content,
  page_title,
  page_url,
  page_description,
  embedding <=> :query_vector AS distance
FROM pql_docs.doc_chunk
ORDER BY embedding <=> :query_vector
LIMIT :limit_count