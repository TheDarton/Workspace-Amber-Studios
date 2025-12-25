/*
  # Add CSV Configuration Tables

  1. New Tables
    - `visible_months`
      - `id` (uuid, primary key)
      - `country_id` (uuid, foreign key to countries)
      - `section` (text) - 'schedule', 'mistake_statistics', or 'daily_mistakes'
      - `priority` (integer) - 1, 2, or 3 for display order
      - `month` (text) - month name like 'September', 'October', 'November'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `visible_months` table
    - Add policies for authenticated users to read
    - Add policies for admin users to manage configurations
*/

-- Create visible_months table
CREATE TABLE IF NOT EXISTS visible_months (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  section text NOT NULL CHECK (section IN ('schedule', 'mistake_statistics', 'daily_mistakes')),
  priority integer NOT NULL CHECK (priority IN (1, 2, 3)),
  month text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(country_id, section, priority)
);

-- Enable RLS
ALTER TABLE visible_months ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read visible months for their country
CREATE POLICY "Users can read visible months for their country"
  ON visible_months
  FOR SELECT
  TO authenticated
  USING (
    country_id IN (
      SELECT country_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Admins can insert visible months for their country
CREATE POLICY "Admins can insert visible months for their country"
  ON visible_months
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
      AND users.country_id = visible_months.country_id
    )
  );

-- Policy: Admins can update visible months for their country
CREATE POLICY "Admins can update visible months for their country"
  ON visible_months
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
      AND users.country_id = visible_months.country_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
      AND users.country_id = visible_months.country_id
    )
  );

-- Policy: Admins can delete visible months for their country
CREATE POLICY "Admins can delete visible months for their country"
  ON visible_months
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
      AND users.country_id = visible_months.country_id
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_visible_months_country_section 
  ON visible_months(country_id, section);
