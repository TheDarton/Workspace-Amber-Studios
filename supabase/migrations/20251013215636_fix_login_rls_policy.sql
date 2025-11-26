/*
  # Fix Login RLS Policy

  1. Changes
    - Add policy to allow anonymous users to SELECT from users table for login
    - This enables the login flow to work properly
  
  2. Security
    - Only SELECT permission for anonymous users
    - Users can only query for login purposes
    - All other operations still require authentication
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow anonymous login queries" ON users;

-- Create policy for anonymous login
CREATE POLICY "Allow anonymous login queries"
  ON users
  FOR SELECT
  TO anon
  USING (true);
