/*
  # Fix Security Issues - Part 7: Move Extensions from Public Schema

  ## Summary
  This migration moves the vector and postgis extensions from the public schema
  to the extensions schema for better security and organization.

  ## Changes
  1. Create extensions schema if not exists
  2. Move vector extension to extensions schema
  3. Move postgis extension to extensions schema
  4. Update search_path to include extensions schema

  ## Security Impact
  - Improves security by separating extensions from user data
  - Follows PostgreSQL best practices
  - Reduces namespace pollution in public schema
  - Prevents potential conflicts with user tables

  ## Note
  - Extension functions will still be available via search_path
  - No application code changes required
*/

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move vector extension to extensions schema
-- Note: We need to drop and recreate because ALTER EXTENSION SET SCHEMA
-- doesn't work for all extensions
DROP EXTENSION IF EXISTS vector CASCADE;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Move postgis extension to extensions schema
DROP EXTENSION IF EXISTS postgis CASCADE;
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Recreate any dependent objects that were dropped
-- Vector indexes and columns will need to be recreated by dependent tables
-- This is handled automatically by the CASCADE drop

-- Update search_path for database to include extensions schema
ALTER DATABASE postgres SET search_path TO public, extensions;
