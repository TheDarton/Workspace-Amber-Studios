# GitHub Pages Deployment Guide

This application is now configured to run as a static site suitable for GitHub Pages deployment.

## Features

- **No Backend Required**: All authentication and configuration is handled client-side
- **Local Storage**: User settings and visible months configuration are stored in browser localStorage
- **JSON Configuration**: Countries, users, and initial settings are in `/public/config/`

## Default Login Credentials

**Global Admin**: username: `global_admin`, password: `admin123`

**Note:** The Global Admin has full access to all countries and features. To manage a specific country:
1. Login as global_admin
2. Select the country from the dropdown in the sidebar
3. Access all country-specific sections and data

Additional country administrators can be created through the Global Admin panel if needed.

## Deployment Steps

### Option 1: GitHub Pages (Recommended)

1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Select source: "Deploy from a branch"
4. Select branch: `main` and folder: `/dist`
5. Click Save
6. Your site will be available at `https://<username>.github.io/<repository>/`

**Important**: Before deploying, you may need to update the base path in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/<repository-name>/',  // Add this line
  plugins: [react()],
  // ...
});
```

Then rebuild:
```bash
npm run build
```

### Option 2: Manual Deployment

1. Build the project:
   ```bash
   npm install
   npm run build
   ```

2. The `dist` folder contains your static site

3. Upload the contents of `dist` to any static hosting service:
   - Netlify
   - Vercel
   - GitHub Pages
   - Any web server

## Configuration

### Adding/Modifying Users

Edit `/public/config/users.json`:

```json
{
  "users": [
    {
      "id": "unique-id",
      "username": "user_login",
      "password": "plaintext_password",
      "fullName": "First Last",
      "role": "admin|user|dealer|sm|global_admin",
      "countryId": "latvia|poland|null",
      "countryName": "Latvia|Poland|null"
    }
  ]
}
```

### Adding Countries

Edit `/public/config/countries.json`:

```json
{
  "countries": [
    {
      "id": "country_id",
      "name": "Country Name",
      "prefix": "CC"
    }
  ]
}
```

### Configuring Visible Months

Edit `/public/config/visible_months.json`:

```json
{
  "country_id": {
    "schedule": {
      "months": ["September", "October", "November"],
      "displayCount": 3
    },
    "mistake_statistics": {
      "months": ["September", "October", "November"],
      "displayCount": 3
    },
    "daily_mistakes": {
      "months": ["September", "October", "November"],
      "displayCount": 3
    }
  }
}
```

## CSV Files

Place your CSV files in `/public/<CountryName>/` directory following this naming convention:

- `Daily_Stats_<Month>.csv`
- `Dealer_Shift_<Month>.csv`
- `Dealer_Stats_<Month>.csv`
- `Dealer_WH_<Month>.csv`
- `SM_Shift_<Month>.csv`
- `SM_WH_<Month>.csv`

Example: `/public/Latvia/Dealer_Shift_September.csv`

## Features Not Available in Static Mode

The following features require a backend database and are disabled:
- Training Academy
- News & Updates
- Real-time user management

These sections will show a "not available" message when accessed.

## Development

Run locally:
```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Security Note

⚠️ **Important**: Since this is a static site, all passwords are stored in plain text in the JSON configuration file. This is suitable for:
- Internal tools
- Demo/testing purposes
- Non-sensitive data

**Do not use this for production systems with sensitive data** without implementing proper authentication through a backend service.

## Browser Compatibility

This app works in all modern browsers that support:
- ES6+ JavaScript
- LocalStorage API
- Fetch API
