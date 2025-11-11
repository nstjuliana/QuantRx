/**
 * Supabase Database Schema
 *
 * Initial database schema for the QuantRx application.
 * This file documents the SQL commands to run in Supabase SQL Editor.
 *
 * Execute these commands in order in your Supabase project.
 */

/* ========================================
   USERS TABLE
   ======================================== */

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  auth0_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('technician', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for users table
CREATE INDEX idx_users_auth0_id ON users(auth0_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Enable Row Level Security on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth0_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Admins can read all user data
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth0_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role = 'admin'
    )
  );

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth0_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Admins can update all user data
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth0_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role = 'admin'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

/* ========================================
   CALCULATIONS TABLE (BASIC STRUCTURE)
   ======================================== */

-- Create calculations table (basic structure for Phase 0)
-- Full schema will be expanded in Phase 1
CREATE TABLE calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  drug_name TEXT,
  ndc TEXT,
  sig TEXT,
  days_supply INTEGER,
  calculated_quantity INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for calculations table
CREATE INDEX idx_calculations_user_id ON calculations(user_id);
CREATE INDEX idx_calculations_status ON calculations(status);
CREATE INDEX idx_calculations_created_at ON calculations(created_at);

-- Enable Row Level Security on calculations table
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for calculations table
-- Users can view their own calculations
CREATE POLICY "Users can view own calculations" ON calculations
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users
      WHERE auth0_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Admins can view all calculations
CREATE POLICY "Admins can view all calculations" ON calculations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth0_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role = 'admin'
    )
  );

-- Users can insert their own calculations
CREATE POLICY "Users can create calculations" ON calculations
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users
      WHERE auth0_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Users can update their own calculations
CREATE POLICY "Users can update own calculations" ON calculations
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users
      WHERE auth0_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Admins can update all calculations
CREATE POLICY "Admins can update all calculations" ON calculations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth0_id = current_setting('request.jwt.claims', true)::json->>'sub'
      AND role = 'admin'
    )
  );

-- Create trigger to automatically update updated_at for calculations
CREATE TRIGGER update_calculations_updated_at
  BEFORE UPDATE ON calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

/* ========================================
   SETUP INSTRUCTIONS
   ======================================== */

/*
To set up the database:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste this entire file
4. Execute the SQL commands

This will create:
- users table with RLS policies
- calculations table with basic structure and RLS policies
- Appropriate indexes for performance
- Triggers for automatic timestamp updates

The schema is designed for HIPAA compliance with Row Level Security
ensuring users can only access their own data (except admins).
*/
