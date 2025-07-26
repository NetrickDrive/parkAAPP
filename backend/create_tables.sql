-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  subdomain VARCHAR(50) UNIQUE NOT NULL
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin' or 'user'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add company_id to vehicle_entries
ALTER TABLE vehicle_entries ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id); 