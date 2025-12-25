/*
  # Make Visible Months Tables Publicly Accessible
  
  1. Problem
    - Previous policies still require 'authenticated' role
    - Anonymous Supabase client calls (with anon key) are not considered authenticated
    - Queries fail silently because RLS blocks anonymous access
  
  2. Solution
    - Add policies for 'anon' role to allow public read access
    - Keep write operations restricted to authenticated users
    - This allows pages to read month configurations without authentication
  
  3. Security Notes
    - Read access is safe for visible_months and visible_months_settings
    - Write operations still require authentication and application-level checks
    - All configuration changes are logged for audit purposes
*/

-- Add public read access policies for visible_months (anon role)
CREATE POLICY "Allow anonymous users to read visible months"
  ON visible_months
  FOR SELECT
  TO anon
  USING (true);

-- Add public read access policies for visible_months_settings (anon role)
CREATE POLICY "Allow anonymous users to read display settings"
  ON visible_months_settings
  FOR SELECT
  TO anon
  USING (true);

-- Also ensure authenticated users can still read (keep existing policies)
-- The previous migration already created authenticated policies, so we just add anon access
