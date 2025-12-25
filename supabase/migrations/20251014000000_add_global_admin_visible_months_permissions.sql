/*
  # Add Global Admin Permissions for Visible Months

  1. Changes
    - Add policies for global_admin role to manage visible_months for any country
    - Global admins can read, insert, update, and delete visible_months across all countries
    - Existing admin policies remain unchanged (restricted to their country)

  2. Security
    - Global admin policies allow access to visible_months for any country
    - Regular admin policies continue to restrict access to their assigned country only
*/

-- Policy: Global admins can read all visible months
CREATE POLICY "Global admins can read all visible months"
  ON visible_months
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'global_admin'
    )
  );

-- Policy: Global admins can insert visible months for any country
CREATE POLICY "Global admins can insert visible months for any country"
  ON visible_months
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'global_admin'
    )
  );

-- Policy: Global admins can update visible months for any country
CREATE POLICY "Global admins can update visible months for any country"
  ON visible_months
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'global_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'global_admin'
    )
  );

-- Policy: Global admins can delete visible months for any country
CREATE POLICY "Global admins can delete visible months for any country"
  ON visible_months
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'global_admin'
    )
  );
