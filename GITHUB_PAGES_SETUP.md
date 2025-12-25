# GitHub Pages Deployment Setup

This guide will help you deploy your application to GitHub Pages.

## Prerequisites

- GitHub repository created
- Code pushed to GitHub
- Admin access to repository settings

## Step 1: Configure GitHub Secrets

Your application requires Supabase credentials to function. These must be added as GitHub Secrets:

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add the following secrets:

   **Secret 1:**
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://yxrhyrkxldseuavjalzc.supabase.co`

   **Secret 2:**
   - Name: `VITE_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cmh5cmt4bGRzZXVhdmphbHpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzQxMjYsImV4cCI6MjA3NTk1MDEyNn0.P9CrvhJkceHobknli3L8s_Nl0KC_oQCpkzz7K84mNcY`

## Step 2: Enable GitHub Pages

1. Go to your repository **Settings**
2. Scroll down to **Pages** section (in the left sidebar under "Code and automation")
3. Under **Source**, select:
   - Source: **GitHub Actions**
4. Click **Save**

## Step 3: Verify Repository Name

The application is configured to deploy to a repository named `Workspace-Amber-Studios`.

If your repository has a different name, update the `base` path in `vite.config.ts`:

```typescript
base: process.env.GITHUB_PAGES ? '/YOUR-REPO-NAME/' : '/',
```

Replace `YOUR-REPO-NAME` with your actual repository name.

## Step 4: Deploy

Once you've completed the above steps:

1. Push your code to the `main` or `master` branch:
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

2. Go to the **Actions** tab in your GitHub repository
3. You should see a workflow running called "Deploy to GitHub Pages"
4. Wait for it to complete (usually 2-3 minutes)

## Step 5: Access Your Site

Once the deployment is complete:

1. Your site will be available at:
   ```
   https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
   ```

2. You can find the exact URL in:
   - Repository **Settings** → **Pages** section
   - Or in the **Actions** tab → Click on the latest workflow run → Check the deployment step

## Automatic Deployments

The workflow is configured to automatically deploy whenever you push to the `main` or `master` branch.

You can also manually trigger a deployment:
1. Go to **Actions** tab
2. Select "Deploy to GitHub Pages"
3. Click **Run workflow**

## Troubleshooting

### Build Fails

If the build fails:
1. Check that both GitHub Secrets are set correctly
2. Review the error in the Actions tab
3. Make sure all dependencies are in package.json

### 404 Error

If you get a 404 error:
1. Verify the `base` path in `vite.config.ts` matches your repository name
2. Check that GitHub Pages is enabled in repository settings
3. Make sure the deployment completed successfully

### Cannot Access Supabase

If the app loads but Supabase doesn't work:
1. Verify the secrets are set correctly (no extra spaces)
2. Check browser console for errors
3. Verify Supabase URL allows your GitHub Pages domain

## Initial Database Setup

After deployment, you'll need to set up your Supabase database:

1. Access your deployed site
2. You won't be able to log in until you create the database schema
3. Run the migrations in your Supabase project:
   - Go to Supabase Dashboard → SQL Editor
   - Run each migration file from `supabase/migrations/` in order

4. Create your first user in Supabase:
   ```sql
   INSERT INTO users (login, password_hash, role, must_change_password)
   VALUES ('admin', '$2a$10$...', 'global_admin', false);
   ```

## Need Help?

- Check the Actions tab for detailed error logs
- Verify all secrets are configured
- Ensure repository name matches the vite.config.ts base path
