import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadCSVFiles() {
  console.log('Starting CSV file upload to Supabase Storage...\n');

  const publicDir = join(__dirname, 'public');
  const countries = readdirSync(publicDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  console.log(`Found countries: ${countries.join(', ')}\n`);

  let totalUploaded = 0;
  let totalFailed = 0;

  for (const country of countries) {
    console.log(`Processing ${country}...`);
    const countryDir = join(publicDir, country);
    const files = readdirSync(countryDir).filter(f => f.endsWith('.csv'));

    console.log(`  Found ${files.length} CSV files`);

    for (const file of files) {
      const filePath = join(countryDir, file);
      const fileContent = readFileSync(filePath);
      const storagePath = `${country}/${file}`;

      try {
        const { data, error } = await supabase.storage
          .from('csv-files')
          .upload(storagePath, fileContent, {
            contentType: 'text/csv',
            upsert: true
          });

        if (error) {
          console.error(`  ❌ Failed to upload ${file}:`, error.message);
          totalFailed++;
        } else {
          console.log(`  ✓ Uploaded ${file}`);
          totalUploaded++;
        }
      } catch (err) {
        console.error(`  ❌ Error uploading ${file}:`, err.message);
        totalFailed++;
      }
    }
    console.log('');
  }

  console.log('Upload Summary:');
  console.log(`  ✓ Successfully uploaded: ${totalUploaded} files`);
  console.log(`  ❌ Failed: ${totalFailed} files`);

  if (totalFailed === 0) {
    console.log('\n✨ All CSV files uploaded successfully!');
    console.log('\nNext steps:');
    console.log('1. You can now safely delete the public/[Country]/ directories');
    console.log('2. The app will now load CSV files from Supabase Storage');
    console.log('3. To migrate to another storage provider, just export from Supabase Storage and import to new provider');
  }
}

uploadCSVFiles().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
