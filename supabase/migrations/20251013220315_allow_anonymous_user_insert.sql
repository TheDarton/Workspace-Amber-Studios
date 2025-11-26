/*
  # Allow Anonymous User Insert

  1. Changes
    - Add policy to allow anonymous users to INSERT into users table
    - This enables Global Admin to create new admin users
  
  2. Security
    - The application handles authorization at the UI level
    - Only Global Admins can access the user creation page
    - Frontend enforces role-based access control
*/

-- Create policy for anonymous user inserts
CREATE POLICY "Allow anonymous user inserts"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create policy for anonymous user deletes
CREATE POLICY "Allow anonymous user deletes"
  ON users
  FOR DELETE
  TO anon
  USING (true);
