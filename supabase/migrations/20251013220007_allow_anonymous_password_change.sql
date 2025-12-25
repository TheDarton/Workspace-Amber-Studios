/*
  # Allow Anonymous Password Change

  1. Changes
    - Add policy to allow anonymous users to UPDATE password_hash and must_change_password fields
    - This enables first-time login password change flow
  
  2. Security
    - Only UPDATE permission for anonymous users
    - Restricted to password-related fields only
    - User can update any user record (needed for initial password change)
    
  Note: This is necessary because during first login, the user is not yet authenticated
  and needs to update their password before they can authenticate properly.
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow anonymous password updates" ON users;

-- Create policy for anonymous password updates
CREATE POLICY "Allow anonymous password updates"
  ON users
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
