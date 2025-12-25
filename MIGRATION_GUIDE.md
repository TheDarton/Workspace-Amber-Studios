# CSV Files Migration Guide

This guide explains how to migrate your CSV files from the local filesystem to Supabase Storage, and how to export them to another storage provider in the future.

## Why Store CSV Files in Supabase Storage?

1. **Easy Migration**: All your data is in one place (Supabase), making it simple to export and move to another provider
2. **No GitHub Bloat**: CSV files don't clutter your repository
3. **Centralized Management**: Update CSV files without redeploying your app
4. **Version Control**: Supabase tracks file versions automatically

## Initial Setup: Upload CSV Files to Supabase

### Step 1: Run the Storage Migration

First, ensure your database has the storage bucket set up. The migration `20251125000000_create_csv_storage.sql` should already be applied.

Verify in Supabase Dashboard → Storage that the `csv-files` bucket exists.

### Step 2: Upload Your CSV Files

Run the upload script:

```bash
npm run upload-csv
```

This will:
- Read all CSV files from `public/[Country]/` directories
- Upload them to Supabase Storage at `csv-files/[country]/[filename].csv`
- Report success/failure for each file

Expected output:
```
Starting CSV file upload to Supabase Storage...

Found countries: Latvia

Processing Latvia...
  Found 18 CSV files
  ✓ Uploaded Daily_Stats_November.csv
  ✓ Uploaded Daily_Stats_October.csv
  ...

Upload Summary:
  ✓ Successfully uploaded: 18 files
  ❌ Failed: 0 files

✨ All CSV files uploaded successfully!
```

### Step 3: Test the Application

Start your app and verify CSV files load correctly:

```bash
npm run dev
```

Navigate to Schedule, Mistakes pages and confirm data displays.

### Step 4: Clean Up Local Files (Optional)

Once you've verified everything works, you can remove the CSV files from your repository:

```bash
rm -rf public/Latvia/
# Or keep them as backup until you're confident
```

## Future: Migrating to Another Storage Provider

When you need to move to a different storage provider (AWS S3, Azure Blob, etc.):

### Step 1: Export from Supabase

Go to Supabase Dashboard → Storage → csv-files bucket

Option A - Manual Download:
- Click on each folder (Latvia, etc.)
- Select all files
- Download as ZIP

Option B - Using Supabase CLI:
```bash
# Download all files from bucket
supabase storage download --bucket csv-files --output ./csv-backup/
```

### Step 2: Upload to New Provider

Use your new provider's upload tool:

**AWS S3:**
```bash
aws s3 cp ./csv-backup/ s3://your-bucket/csv-files/ --recursive
```

**Azure Blob:**
```bash
az storage blob upload-batch -d csv-files -s ./csv-backup/
```

**Google Cloud Storage:**
```bash
gsutil -m cp -r ./csv-backup/* gs://your-bucket/csv-files/
```

### Step 3: Update Code

Update `src/lib/csvService.ts` to point to your new storage:

```typescript
// Replace Supabase storage calls with your provider
export async function loadCSVFile(
  country: string,
  fileType: CSVFileType,
  month: string
): Promise<string[][]> {
  const fileName = `${fileType}_${month}.csv`;
  const filePath = `${country}/${fileName}`;

  // Example for AWS S3
  const url = `https://your-bucket.s3.amazonaws.com/csv-files/${filePath}`;
  const response = await fetch(url);
  const text = await response.text();
  return parseCSVToArray(text);
}
```

## Directory Structure in Storage

```
csv-files/
├── latvia/
│   ├── Daily_Stats_September.csv
│   ├── Daily_Stats_October.csv
│   ├── Daily_Stats_November.csv
│   ├── Dealer_Shift_September.csv
│   ├── Dealer_Shift_October.csv
│   ├── Dealer_Shift_November.csv
│   └── ...
├── estonia/
│   └── (your files)
└── lithuania/
    └── (your files)
```

## Troubleshooting

### Files not uploading?
- Check your `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Verify you ran the storage migration
- Check Supabase Dashboard → Storage for the `csv-files` bucket

### App can't load CSV files?
- Open browser console and check for errors
- Verify files exist in Supabase Dashboard → Storage → csv-files
- Check the file paths match: `country/Filename.csv` (case-sensitive)

### Upload script fails?
- Make sure Node.js can read the `.env` file
- Try running with explicit env vars:
  ```bash
  VITE_SUPABASE_URL=your_url VITE_SUPABASE_ANON_KEY=your_key npm run upload-csv
  ```

## Benefits of This Approach

1. **Single Source of Truth**: All data in Supabase (database + files)
2. **Easy Backup**: Export entire project from one place
3. **Flexible**: Can switch storage providers by changing one service file
4. **Scalable**: No need to redeploy when updating CSV files
5. **Portable**: Export/import to any storage provider that supports HTTP
