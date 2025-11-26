/*
  # Add Visible Months Display Count Settings

  1. New Tables
    - `visible_months_settings`
      - `id` (uuid, primary key)
      - `country_id` (uuid, foreign key to countries, unique)
      - `display_count` (integer) - 1, 2, or 3 for how many month options to display
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `visible_months_settings` table
    - Add policies for authenticated users to read settings for their country
    - Add policies for admin users to manage settings

  3. Important Notes
    - Each country can have only one display count setting (enforced by unique constraint)
    - Default display count is 3 if no setting exists
    - Admins can update the display count to show 1, 2, or 3 month options to users
*/

-- Create visible_months_settings table
CREATE TABLE IF NOT EXISTS visible_months_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL UNIQUE REFERENCES countries(id) ON DELETE CASCADE,
  display_count integer NOT NULL DEFAULT 3 CHECK (display_count IN (1, 2, 3)),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE visible_months_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read display settings for their country
CREATE POLICY "Users can read display settings for their country"
  ON visible_months_settings
  FOR SELECT
  TO authenticated
  USING (
    country_id IN (
      SELECT country_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Admins can insert display settings for their country
CREATE POLICY "Admins can insert display settings for their country"
  ON visible_months_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
      AND users.country_id = visible_months_settings.country_id
    )
  );

-- Policy: Admins can update display settings for their country
CREATE POLICY "Admins can update display settings for their country"
  ON visible_months_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
      AND users.country_id = visible_months_settings.country_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
      AND users.country_id = visible_months_settings.country_id
    )
  );

-- Policy: Admins can delete display settings for their country
CREATE POLICY "Admins can delete display settings for their country"
  ON visible_months_settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
      AND users.country_id = visible_months_settings.country_id
    )
  );

-- Policy: Global admins can read all display settings
CREATE POLICY "Global admins can read all display settings"
  ON visible_months_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'global_admin'
    )
  );

-- Policy: Global admins can insert display settings for any country
CREATE POLICY "Global admins can insert display settings for any country"
  ON visible_months_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'global_admin'
    )
  );

-- Policy: Global admins can update display settings for any country
CREATE POLICY "Global admins can update display settings for any country"
  ON visible_months_settings
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

-- Policy: Global admins can delete display settings for any country
CREATE POLICY "Global admins can delete display settings for any country"
  ON visible_months_settings
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'global_admin'
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_visible_months_settings_country 
  ON visible_months_settings(country_id);