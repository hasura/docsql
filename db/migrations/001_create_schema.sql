SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE SCHEMA docs_bot;
ALTER SCHEMA docs_bot OWNER TO docs;

CREATE FUNCTION docs_bot.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;

ALTER FUNCTION docs_bot.set_current_timestamp_updated_at() OWNER TO docs;

SET default_tablespace = '';
SET default_table_access_method = heap;

CREATE TABLE docs_bot.doc_chunk (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    doc_content_id_fk uuid NOT NULL,
    chunk_content text NOT NULL,
    page_description text,
    page_keywords text[],
    page_title text,
    page_url text NOT NULL,
    chunk_line_start integer NOT NULL,
    chunk_line_end integer,
    embedding public.vector(1536)
);

ALTER TABLE docs_bot.doc_chunk OWNER TO docs;

CREATE TABLE docs_bot.doc_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    content text,
    is_checked boolean DEFAULT false NOT NULL,
    page_url text,
    title text,
    description text,
    keywords text[]
);

ALTER TABLE docs_bot.doc_content OWNER TO docs;

ALTER TABLE ONLY docs_bot.doc_chunk
    ADD CONSTRAINT doc_chunk_pkey PRIMARY KEY (id);

ALTER TABLE ONLY docs_bot.doc_content
    ADD CONSTRAINT doc_content_pkey PRIMARY KEY (id);

CREATE TRIGGER set_public_doc_chunk_updated_at BEFORE UPDATE ON docs_bot.doc_chunk FOR EACH ROW EXECUTE FUNCTION docs_bot.set_current_timestamp_updated_at();

CREATE TRIGGER set_public_doc_content_updated_at BEFORE UPDATE ON docs_bot.doc_content FOR EACH ROW EXECUTE FUNCTION docs_bot.set_current_timestamp_updated_at();

ALTER TABLE ONLY docs_bot.doc_chunk
    ADD CONSTRAINT doc_chunk_doc_content_id_fk_fkey FOREIGN KEY (doc_content_id_fk) REFERENCES docs_bot.doc_content(id) ON UPDATE CASCADE ON DELETE CASCADE;
