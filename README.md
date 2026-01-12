# FLESHBOOGIE - Music & Culture News Aggregator

**Curated music and culture links, updated 24/7 with the latest news, reviews, and discoveries in music, film, art, and underground culture.**

🎵 **Live Site:** [fleshboogie.com](https://fleshboogie.com)

---

## About

FLESHBOOGIE is an independent music and culture news aggregator that curates the best links from across the web. Every link is hand-selected to bring you breaking news, deep dives, and hidden gems in music, film, art, and culture. All content is aggregated under Fair Use (17 U.S.C. § 107).

### Key Features

- **24/7 Updated Feed** - Fresh content continuously added throughout the day
- **Featured Artists** - Spotlight on emerging and established musicians with links to their work
- **Newsletter Subscription** - "The Boogie Blast" - Daily digest delivered at 6 AM PST / 9 AM EST
- **Push Notifications** - Instant alerts for breaking news and new content (OneSignal)
- **Curated Collections** - Organized by music news, culture, film, and more
- **Social Integration** - Follow FLESHBOOGIE on X (Twitter) for real-time updates

---

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing

### Backend & Services
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Primary database
- **OneSignal** - Web push notifications
- **Resend** - Email delivery for newsletters

### Hosting & Deployment
- **Manus** - Full-stack hosting platform
- **Custom Domain** - fleshboogie.com
- **SSL/TLS** - Secure HTTPS
- **CDN** - Fast global content delivery

---

## Features in Detail

### Newsletter System
Users can subscribe to "The Boogie Blast," a daily email digest delivered every morning at 6 AM PST (9 AM EST) with hand-curated music and culture links. No spam, unsubscribe anytime.

### Push Notifications
Real-time push notifications keep users informed about breaking news and new featured content. Users can enable/disable notifications with a single click. Supports:
- Chrome, Edge, Opera (all platforms)
- Firefox (all platforms)
- Safari (macOS 16+, iOS 16.4+)

**Recent Fix (Jan 12, 2026):** Fixed push notification button to properly handle re-subscription after unsubscribing. Users can now toggle notifications on and off seamlessly.

### Featured Artists
Each week, FLESHBOOGIE highlights an emerging or established artist with:
- Artist bio and background
- Latest releases and albums
- Links to their music (Spotify, Bandcamp, etc.)
- Social media connections

### Content Curation
All content is carefully selected and organized by category:
- **Music News** - Industry updates, album releases, tour announcements
- **Culture & Film** - Entertainment news, reviews, interviews
- **Underground** - Indie, alternative, and experimental discoveries
- **Archive** - Browse past curated collections

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL 14+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Boptone/fleshboogie.git
cd fleshboogie

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Set up the database
pnpm db:push

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:3000`

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fleshboogie

# OneSignal (Push Notifications)
VITE_ONESIGNAL_APP_ID=your_app_id

# Resend (Email)
RESEND_API_KEY=your_resend_key

# Analytics
VITE_ANALYTICS_WEBSITE_ID=your_umami_id
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
```

---

## Project Structure

```
fleshboogie/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── styles/        # Global styles
│   │   └── main.tsx       # Entry point
│   ├── index.html         # HTML template with OneSignal SDK
│   └── vite.config.ts     # Vite configuration
├── server/                # Node.js backend
│   ├── routes/            # API endpoints
│   ├── db/                # Database schema (Drizzle)
│   └── index.ts           # Server entry point
├── public/                # Static assets
│   ├── OneSignalSDKWorker.js  # Service worker for push notifications
│   └── favicons/          # Favicon files
└── README.md              # This file
```

---

## Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
```

### Database Migrations
```bash
# Generate migration
pnpm db:generate

# Apply migrations
pnpm db:push

# View database studio
pnpm db:studio
```

---

## Push Notifications Setup

FLESHBOOGIE uses **OneSignal** for web push notifications. To set up push notifications:

1. Create a OneSignal account at [onesignal.com](https://onesignal.com)
2. Create a new Web App
3. Add your App ID to environment variables
4. Configure your domain in OneSignal settings
5. Users can enable notifications via the "ENABLE" button in the newsletter section

**Service Worker:** The OneSignal service worker is located at `/public/OneSignalSDKWorker.js` and must be accessible at the root of your domain.

---

## Newsletter & Email

Newsletters are sent via **Resend**. To configure:

1. Create a Resend account at [resend.com](https://resend.com)
2. Add your API key to environment variables
3. Verify your sending domain
4. Customize email templates in `server/emails/`

---

## Deployment

FLESHBOOGIE is hosted on **Manus**, a full-stack hosting platform that handles:
- Automatic SSL/TLS certificates
- Global CDN
- Database backups
- Environment variable management
- One-click deployments

### Publishing Updates

```bash
# Save a checkpoint before publishing
pnpm checkpoint

# Then publish via the Manus dashboard
# or use: pnpm publish
```

---

## Privacy & Legal

- **Privacy Policy:** [fleshboogie.com/privacy](https://fleshboogie.com/privacy)
- **Terms of Service:** [fleshboogie.com/terms](https://fleshboogie.com/terms)
- **Content:** All links are aggregated under Fair Use (17 U.S.C. § 107)
- **Data:** User emails and push notification preferences are stored securely

---

## Contributing

FLESHBOOGIE is currently maintained by the core team. For bug reports and feature requests, please open an issue on GitHub.

---

## License

All aggregated content is used under Fair Use (17 U.S.C. § 107). Links remain the property of their respective sources.

The FLESHBOOGIE platform code is proprietary. Contact [hello@fleshboogie.com](mailto:hello@fleshboogie.com) for licensing inquiries.

---

## Contact

- **Email:** [hello@fleshboogie.com](mailto:hello@fleshboogie.com)
- **X (Twitter):** [@fleshboogie](https://x.com/fleshboogie)
- **Website:** [fleshboogie.com](https://fleshboogie.com)

---

## Changelog

### January 12, 2026
- **Fixed:** Push notification button now properly handles re-subscription after unsubscribing
- **Improved:** OneSignal integration uses direct method calls instead of deferred queue
- **Tested:** Verified functionality on Chrome, Firefox, Safari (macOS 2025)

### January 11, 2026
- **Added:** OneSignal web push notifications integration
- **Added:** Service worker for push notification delivery
- **Updated:** Privacy Policy and Terms of Service with push notification disclosures

---

**Made with ❤️ for music and culture lovers everywhere.**
