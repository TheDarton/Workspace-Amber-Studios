# Amber Studios Workspace

A comprehensive multi-role, multi-country workspace management system for Amber Studios Game Presenters and Shift Managers.

## Features

### Implemented ✅

1. **Authentication System**
   - Role-based access control (Global Admin, Admin, Operation, Dealer, SM)
   - Forced password change on first login
   - Secure password hashing

2. **Multi-language Support (i18n)**
   - 7 languages: English, Russian, Latvian, Lithuanian, Polish, Georgian, Spanish
   - Host Grotesk font (primary)
   - Noto Sans Georgian Condensed for Georgian language
   - Language switcher in header

3. **Brand Identity**
   - Primary color: Amber (RGB 255, 165, 0)
   - Accent color: Purple (RGB 79, 6, 167)
   - Typography system with 6 sizes (24, 20, 18, 16, 14, 12px)
   - Responsive design for desktop, tablet, and mobile

4. **Global Admin Panel**
   - Add and manage countries
   - Add and manage country administrators
   - Settings management
   - Country selection for viewing country-specific data

5. **Admin Panel (Country-specific)**
   - Navigation for all sections:
     - Users
     - Schedule
     - Mistake Statistics
     - Daily Mistakes
     - Training Academy
     - News & Updates
     - Request Schedule
     - Handover / Takeover
     - Social Media & Entertainment
     - Mobile Application

6. **User Panels**
   - Role-based navigation (Dealer, SM, Operation)
   - Filtered access to sections based on role

7. **PWA (Progressive Web App)**
   - Installable as mobile/desktop app
   - Service worker for offline support
   - Web push notification infrastructure
   - Manifest for app-like experience

8. **Database Schema**
   - Comprehensive Supabase database with RLS policies
   - Tables for users, countries, training materials, news, schedules, handovers, etc.

9. **CSV Data Integration**
   - Parser for 6 table types (Daily_Stats, Dealer_Shift, Dealer_WH, Dealer_Stats, SM_Shift, SM_WH)
   - Excel serial date conversion support
   - Color-coded shift display with 15+ shift types
   - Weekend highlighting
   - Role-based data filtering (users see only their rows)

10. **Schedule Management**
    - Month tab navigation support
    - Color-coded shifts with visual legend
    - Weekend highlighting (light red background)
    - Working hours tables (Dealer_WH, SM_WH)
    - Shift schedule tables with complete color mapping

11. **Mistake Statistics**
    - Error categorization display (1xx, 2xx, 3xx, 4xx, 5xx)
    - Dealer/SM statistics tables
    - Role-based filtering (Dealer/SM see only own data)
    - Daily mistakes tracking

12. **Training Academy**
    - Video embedding support (OneDrive/YouTube)
    - Collapsible content blocks
    - Multi-column layouts (1, 2, 3 columns)
    - Question system with admin Q&A
    - Separate Dealer and SM academies
    - Text, video, and image content types

13. **News & Updates**
    - Rich content management
    - Date-based filtering by month
    - Video/image/text embedding
    - Chronological sorting
    - Date display formatting

### To Be Implemented 🚧

1. **User Management (Admin Panel)**
   - Create/edit/delete users
   - Role management (Operation, Dealer, SM)
   - Profile photo upload
   - Nickname/ID assignment

2. **Admin Content Management**
   - Training materials editor (add/edit/delete blocks)
   - News posting interface
   - Question answering for Training Academy

3. **Request Schedule**
   - Calendar-based shift selection
   - Hour calculation (day/night)
   - Weekly minimum validations
   - Slot capacity limits (27 for Dealers)
   - Pre-filled boundary days from actual schedule
   - Excel export

7. **Handover/Takeover**
   - Information feed with acknowledgment tracking
   - Time window management (UTC)
   - SM confirmation workflow
   - CSM approval system

8. **Social Media Links**
   - Configurable social platform links
   - Quick access for users

9. **Push Notifications**
   - 12-hour pre-shift notifications
   - Configurable notification preferences

10. **Password Recovery**
    - SMTP integration for password reset emails
    - Microsoft 365 SMTP support

## Quick Start

### Prerequisites

- Node.js 18+
- Supabase account

### Installation

\`\`\`bash
npm install
\`\`\`

### Environment Variables

Create a \`.env\` file:

\`\`\`env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SMTP_ACCOUNT=amber.studios.workspace@outlook.com
SMTP_APP_PASSWORD=your_smtp_password
\`\`\`

### Run Development Server

\`\`\`bash
npm run dev
\`\`\`

### Build for Production

\`\`\`bash
npm run build
\`\`\`

## Default Login

- **Username:** global_admin
- **Password:** admin123
- You will be prompted to change the password on first login

**Note:** The Global Admin can select any country from the sidebar to manage country-specific data and settings. There are no default country-specific admin accounts. Global Admin has full access to all countries and can create additional country administrators as needed.

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Authentication:** Custom auth with Supabase
- **i18n:** Custom translation system
- **PWA:** Service Worker, Web Push API
- **Build:** Vite

## Project Structure

\`\`\`
src/
├── components/        # Reusable UI components
├── contexts/          # React contexts (Auth)
├── hooks/             # Custom hooks (useTranslation)
├── i18n/              # Translation files
├── lib/               # Utilities (auth, supabase)
├── pages/             # Page components
│   ├── LoginPage.tsx
│   ├── GlobalAdminPage.tsx
│   ├── AdminPage.tsx
│   └── UserPage.tsx
└── App.tsx            # Main app component
\`\`\`

## CSV Data Format

CSV files should be placed in \`public/<CountryName>/\` directory:

- \`Daily_Stats_[Month].csv\`
- \`Dealer_Shift_[Month].csv\`
- \`Dealer_WH_[Month].csv\`
- \`Dealer_Stats_[Month].csv\`
- \`SM_Shift_[Month].csv\`
- \`SM_WH_[Month].csv\`

## Role Permissions

| Feature | Global Admin | Admin | Operation | Dealer | SM |
|---------|--------------|-------|-----------|--------|-----|
| Manage Countries | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Admins | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Users | ✅ | ✅ | ❌ | ❌ | ❌ |
| View All Tables | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Own Data | ✅ | ✅ | ✅ | ✅ | ✅ |
| Training Academy (Dealer) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Training Academy (SM) | ✅ | ✅ | ✅ | ❌ | ✅ |
| Request Schedule | ✅ | ✅ | ❌ | ✅ | ✅ |
| Handover/Takeover | ✅ | ✅ | ✅ | ❌ | ✅ |

## Security Features

- Row Level Security (RLS) on all tables
- Password hashing (bcrypt-compatible)
- Role-based access control
- JWT session management
- Rate limiting (planned)
- SMTP configuration via environment variables

## Future Enhancements

- Microsoft 365 SSO integration
- Advanced analytics and reporting
- Mobile native apps (iOS/Android)
- Real-time notifications via WebSocket
- File upload for training materials
- Multi-factor authentication (MFA)

## Support

For issues or questions, contact the development team.

## License

Proprietary - Amber Studios © 2025
