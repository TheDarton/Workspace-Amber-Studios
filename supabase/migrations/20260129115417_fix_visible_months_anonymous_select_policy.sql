/*
  # Fix Anonymous Select Access for Visible Months

  1. Changes
    - Add SELECT policy for anonymous users on visible_months table
    - This allows the upsert logic to check for existing records before inserting
  
  2. Security
    - Policy allows anonymous users to read visible_months data
    - This is safe as the data is configuration data needed for the UI
    - Anonymous users already have INSERT, UPDATE, DELETE permissions
*/

-- Add SELECT policy for anonymous users on visible_months
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'visible_months' 
    AND policyname = 'Allow anonymous users to read visible months'
  ) THEN
    CREATE POLICY "Allow anonymous users to read visible months"
      ON visible_months
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;
