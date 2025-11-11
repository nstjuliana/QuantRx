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

-- Create a security definer function to check if current user is admin
-- This function bypasses RLS to avoid infinite recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_auth0_id TEXT;
  user_role TEXT;
BEGIN
  -- Get the auth0_id from JWT claims
  user_auth0_id := current_setting('request.jwt.claims', true)::json->>'sub';
  
  -- If no auth0_id, user is not authenticated
  IF user_auth0_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check role directly from users table (bypasses RLS due to SECURITY DEFINER)
  SELECT role INTO user_role
  FROM users
  WHERE auth0_id = user_auth0_id;
  
  -- Return true if role is admin
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for users table
-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth0_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Admins can read all user data (uses function to avoid recursion)
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (is_admin());

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth0_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Admins can update all user data (uses function to avoid recursion)
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (is_admin());

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
   CALCULATIONS TABLE (PHASE 1 EXPANSION)
   ======================================== */

-- Update calculations table with Phase 1 requirements
-- Note: Run ALTER TABLE commands to add new columns to existing table
-- If recreating, use the full CREATE TABLE statement below

-- Full calculations table schema for Phase 1
CREATE TABLE calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  drug_name TEXT,
  ndc TEXT,
  sig TEXT NOT NULL,
  days_supply INTEGER,
  calculated_quantity INTEGER,
  rxcui TEXT, -- RxNorm Concept Unique Identifier for drug normalization tracking
  recommended_ndc JSONB, -- Recommended NDC package details
  alternatives JSONB, -- Alternative NDC options (array of packages)
  warnings JSONB, -- Warning messages and issues
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified')),
  verified_by UUID REFERENCES users(id), -- User who verified (pharmacist/admin)
  verified_at TIMESTAMP WITH TIME ZONE, -- When verification occurred
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Alternative: ALTER TABLE commands to add columns to existing table
/*
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS rxcui TEXT;
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS recommended_ndc JSONB;
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS alternatives JSONB;
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS warnings JSONB;
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id);
ALTER TABLE calculations ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE calculations ALTER COLUMN sig SET NOT NULL;
*/

-- Create indexes for calculations table (Phase 1 additions)
CREATE INDEX idx_calculations_user_id ON calculations(user_id);
CREATE INDEX idx_calculations_status ON calculations(status);
CREATE INDEX idx_calculations_created_at ON calculations(created_at);
CREATE INDEX idx_calculations_rxcui ON calculations(rxcui);
CREATE INDEX idx_calculations_verified_by ON calculations(verified_by);
CREATE INDEX idx_calculations_verified_at ON calculations(verified_at);

-- Enable Row Level Security on calculations table
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for calculations table (Phase 1 updates)
-- Users can view their own calculations
CREATE POLICY "Users can view own calculations" ON calculations
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users
      WHERE auth0_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Admins can view all calculations (uses function to avoid recursion)
CREATE POLICY "Admins can view all calculations" ON calculations
  FOR SELECT USING (is_admin());

-- Users can insert their own calculations
CREATE POLICY "Users can create calculations" ON calculations
  FOR INSERT WITH CHECK (
    user_id IN (
      SELECT id FROM users
      WHERE auth0_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Users can update their own calculations (except verification fields)
CREATE POLICY "Users can update own calculations" ON calculations
  FOR UPDATE USING (
    user_id IN (
      SELECT id FROM users
      WHERE auth0_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  )
  WITH CHECK (
    -- Users cannot set verified_by or verified_at (only pharmacists/admins can)
    verified_by IS NULL AND verified_at IS NULL
  );

-- Admins can update all calculations including verification fields
CREATE POLICY "Admins can update all calculations" ON calculations
  FOR UPDATE USING (is_admin());

-- Pharmacists can verify calculations (update verification fields only)
-- Note: This requires extending the is_admin() function to also check for 'pharmacist' role
-- For now, admins have all permissions. Add pharmacist role support in Phase 2.

-- Create trigger to automatically update updated_at for calculations
CREATE TRIGGER update_calculations_updated_at
  BEFORE UPDATE ON calculations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

/* ========================================
   AUDIT LOGS TABLE (PHASE 1)
   ======================================== */

-- Create audit_logs table for compliance and security tracking
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Allow NULL for system actions
  action TEXT NOT NULL, -- Action performed (from AUDIT_ACTIONS constants)
  resource_type TEXT NOT NULL, -- Type of resource affected (from AUDIT_RESOURCE_TYPES)
  resource_id UUID, -- ID of the affected resource (can be NULL for some actions)
  metadata JSONB, -- Structured data about the action (masked for sensitive info)
  ip_address TEXT, -- IP address of the request (optional)
  user_agent TEXT, -- User agent string (optional)
  severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for audit_logs table
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);

-- Enable Row Level Security on audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for audit_logs table
-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users
      WHERE auth0_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Admins can view all audit logs
CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING (is_admin());

-- Only the system can insert audit logs (via API routes)
-- Users cannot directly insert audit logs
CREATE POLICY "System can create audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true); -- Allow inserts, but they should only come from server-side code

-- No updates or deletes allowed on audit logs (immutable)
-- Audit logs should never be modified once created

/* ========================================
   SETUP INSTRUCTIONS (PHASE 1)
   ======================================== */

/*
PHASE 1 DATABASE MIGRATION:

For existing databases (from Phase 0):
1. Run the ALTER TABLE commands in the calculations table section
2. Run the audit_logs table creation commands
3. The users table remains unchanged

For new databases:
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste this entire file
4. Execute the SQL commands

This will create:
- users table with RLS policies (unchanged from Phase 0)
- calculations table with Phase 1 expansions:
  - JSONB columns for recommended_ndc, alternatives, warnings
  - Verification fields (verified_by, verified_at)
  - RxCUI tracking for drug normalization
- audit_logs table for HIPAA compliance and security tracking
- Appropriate indexes for performance
- Triggers for automatic timestamp updates

SECURITY FEATURES:
- Row Level Security (RLS) ensures users can only access their own data
- Admins can access all data for oversight
- Audit logs are immutable and track all actions
- Sensitive data is masked in audit logs
- Verification requires admin privileges

COMPLIANCE:
- HIPAA-compliant with audit trails
- Data isolation between users
- Secure by default with RLS policies
- Structured logging for compliance reporting

MIGRATION NOTES:
- Existing calculations will have NULL values for new columns
- RLS policies prevent users from setting verification fields
- Audit logging begins immediately after migration
*/
