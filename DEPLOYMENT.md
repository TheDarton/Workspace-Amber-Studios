# Deployment Guide - GitHub Pages + Supabase

This application uses Supabase for backend (database and authentication) and can be deployed as a static frontend on GitHub Pages.

## Prerequisites

1. **Supabase Account**: Create a project at [supabase.com](https://supabase.com)
2. **GitHub Account**: For hosting the frontend

## Default Login Credentials

**Global Admin**:
- Username: `global_admin`
- Password: `admin123`

**Important:** After first login, you will be prompted to change the password.

### Using the Application

The Global Admin has full access to all countries and features. To manage a specific country:
1. Login as global_admin
2. Select the country from the dropdown in the sidebar
3. Access all country-specific sections and data

Additional country administrators can be created through the Global Admin panel if needed.

## Setup Instructions

### 1. Setup Supabase Backend

1. Create a new project at [Supabase Dashboard](https://app.supabase.com)
2. Copy your project URL and anon key from Project Settings → API
3. Run the migrations:
   - Go to SQL Editor in Supabase Dashboard
   - Run each migration file from `supabase/migrations/` in order (by timestamp)
   - This will create all necessary tables and the default global_admin account

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

**Important:** Never commit `.env` to GitHub. It's already in `.gitignore`.

### 3. Deploy to GitHub Pages

#### Option A: Automatic Deployment with GitHub Actions (Recommended)

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Build
        env:
          VITE_SUPABASE_URL: \${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: \${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. Add secrets to your GitHub repository:
   - Go to Settings → Secrets and variables → Actions
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`

3. Enable GitHub Pages:
   - Go to Settings → Pages
   - Source: GitHub Actions

4. Push to main branch and deployment will happen automatically

#### Option B: Manual Deployment

1. Update `vite.config.ts` if deploying to a subdirectory:
```typescript
export default defineConfig({
  base: '/repository-name/', // Add your repository name
  plugins: [react()],
  // ...
});
```

2. Build the project:
```bash
npm install
npm run build
```

3. Deploy the `dist` folder:
   - Push to `gh-pages` branch, OR
   - Use Settings → Pages → Deploy from a branch → select `gh-pages`

## Development

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## CSV Data Files

Place your CSV files in `/public/<CountryName>/` following this naming convention:

- `Daily_Stats_<Month>.csv`
- `Dealer_Shift_<Month>.csv`
- `Dealer_Stats_<Month>.csv`
- `Dealer_WH_<Month>.csv`
- `SM_Shift_<Month>.csv`
- `SM_WH_<Month>.csv`

Example: `/public/Latvia/Dealer_Shift_September.csv`

## Database Management

### Adding Countries

Use the Global Admin panel to add countries through the UI, or directly in Supabase:

```sql
INSERT INTO countries (name, prefix) VALUES ('Country Name', 'CN');
```

### Creating Additional Admins

Use the Global Admin panel → Add Admin section to create country-specific administrators.

## Security Notes

### Important Security Practices

1. **Environment Variables**: Never commit `.env` to version control
2. **Supabase Keys**:
   - The anon key is safe to expose in frontend code (it's public)
   - Never expose the service_role key in frontend
3. **Row Level Security (RLS)**: All tables have RLS enabled - verify policies are correct
4. **Password Changes**: Force users to change default passwords on first login

### CORS Configuration

If deploying to a custom domain, update CORS settings in Supabase Dashboard:
- Go to Authentication → URL Configuration
- Add your GitHub Pages URL to "Site URL" and "Redirect URLs"

## Troubleshooting

### Build Fails
- Check that all environment variables are set correctly
- Run `npm install` to ensure dependencies are installed
- Check for TypeScript errors: `npm run typecheck`

### Can't Login
- Verify Supabase credentials in `.env`
- Check that migrations have been run in Supabase
- Verify the global_admin user exists in the `users` table

### Pages Not Loading
- Check browser console for errors
- Verify `base` path in `vite.config.ts` matches your repository name
- Ensure GitHub Pages is enabled and pointing to correct source

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Hosting**: GitHub Pages (Frontend), Supabase (Backend)
- **Icons**: Lucide React

## Additional Features

- Progressive Web App (PWA) support
- Multi-language support (7 languages)
- Role-based access control
- Real-time updates with Supabase
- CSV file parsing and visualization
