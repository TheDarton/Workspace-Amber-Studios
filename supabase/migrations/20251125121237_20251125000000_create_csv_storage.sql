/*
  # Create CSV Files Storage Bucket

  1. Storage Setup
    - Creates a public bucket named 'csv-files' for storing CSV data files
    - CSV files will be organized by country: csv-files/{country_id}/{filename}.csv

  2. Security
    - Public read access for all authenticated and anonymous users
    - Insert/update/delete restricted to authenticated users with admin roles

  3. Structure
    - Files organized as: csv-files/latvia/Daily_Stats_November.csv
    - Allows easy migration to other storage providers in the future
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('csv-files', 'csv-files', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

CREATE POLICY "Public CSV read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'csv-files');

CREATE POLICY "Admin CSV upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'csv-files'
  AND (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.login = auth.jwt()->>'login'
      AND users.role IN ('admin', 'global_admin')
    )
  )
);

CREATE POLICY "Admin CSV update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'csv-files'
  AND (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.login = auth.jwt()->>'login'
      AND users.role IN ('admin', 'global_admin')
    )
  )
);

CREATE POLICY "Admin CSV delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'csv-files'
  AND (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.login = auth.jwt()->>'login'
      AND users.role IN ('admin', 'global_admin')
    )
  )
);