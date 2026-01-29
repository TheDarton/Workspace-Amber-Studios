/*
  # Create visible_months_settings table

  1. New Tables
    - `visible_months_settings`
      - `id` (uuid, primary key)
      - `country_id` (uuid, foreign key to countries, unique)
      - `display_count` (integer, 1-3)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `visible_months_settings` table
    - Add policies for anonymous read/write access (matching visible_months pattern)
    - This table stores the number of months to display in the UI
*/

CREATE TABLE IF NOT EXISTS visible_months_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid NOT NULL UNIQUE REFERENCES countries(id),
  display_count integer NOT NULL DEFAULT 3 CHECK (display_count >= 1 AND display_count <= 3),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE visible_months_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to visible_months_settings"
  ON visible_months_settings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert access to visible_months_settings"
  ON visible_months_settings FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to visible_months_settings"
  ON visible_months_settings FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated read access to visible_months_settings"
  ON visible_months_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert access to visible_months_settings"
  ON visible_months_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update access to visible_months_settings"
  ON visible_months_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
