# ⚡ blip — Nearby Now

> **Offline-first, real-time discovery of nearby food, events, and hidden gems.**  
> Built for the ACM-W Hackathon.

![Blip Architecture](public/favicon.svg)

---

## 🌟 What is Blip?

**Blip** is a mobile-first Progressive Web Application (PWA) designed for instant local exploration. It resolves the two classic hackathon tensions:
1. **"Works great with no signal" vs. "Live updates when friends find something cool"**  
   *Resolution*: Full offline resilience via Service Worker asset caching and an IndexedDB / LocalStorage local data store. Users can browse previously-loaded spots and their saved list completely offline with zero friction. When connectivity is present, a real-time social sync stream quietly lights up.
2. **"No fancy accounts system" vs. "Saved list follows them around"**  
   *Resolution*: Zero-friction anonymous identity created silently on first open. Saves work immediately. A single 1-tap "Keep my list on other devices" upgrade links Google/cloud identity and automatically migrates all local saved spots.

---

## 🚀 Quick Start (Local Run)

No backend or cloud setup required to test right away. The site runs completely locally!

```bash
# 1. Clone the repository
git clone https://github.com/mayank-coder837/acmw_hackathon.git
cd acmw_hackathon

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at:  
👉 **http://localhost:5173**

### Sign-in in local/demo mode

The project now includes a safe fallback auth flow so the sign-in button works even before Firebase credentials are configured. If Firebase is not set up yet, the app uses a local demo identity store in browser storage instead of crashing or silently failing.

- You can sign in with any email/password pair created during a sign-up flow in this browser.
- The app preserves the session in local storage for quick local testing.
- Real Firebase auth still activates automatically when valid environment values are added.

### Add real Firebase auth

Create a `.env` file using the template in `.env.example` and add your Firebase values:

```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Then enable Email/Password authentication in the Firebase console and reload the app.

---

## 👥 Multi-User Local Testing

Since the site runs locally, you can test multi-user real-time interaction on a single machine:

1. Open **Tab 1** (`http://localhost:5173`) — this gets a unique anonymous identity (e.g. `NeonNomad_412`).
2. Open **Tab 2** (`http://localhost:5173`) in an incognito window or separate profile — this gets another unique identity (e.g. `UrbanFox_821`).
3. **Test Real-Time Saves**: Bookmark any spot in Tab 1. Tab 2 immediately displays a live notification toast: `NeonNomad just saved Arabica Roastery` and updates the live save counter!
4. **Test "Drop a Blip"**: In Tab 1, click **+ Drop a Blip** and pin a new ramen spot. Tab 2's map and feed will instantly receive and pulse the newly dropped pin via the `BroadcastChannel` real-time sync engine!

---

## 📶 Offline-First Verification

You can verify offline capabilities in two ways:
1. **In-App Network Simulator**: Click the green **Live** pill in the top header. It toggles into **Offline** mode, letting you test how the app gracefully pauses live streams while keeping cached spots and the **My Saved** list 100% interactive.
2. **Browser DevTools**: Open Chrome/Edge DevTools (`F12`), navigate to **Network**, select **Offline**, and reload the page. The Service Worker will serve the app shell and IndexedDB will serve the cached spots!

---

## 🧱 Architecture & Phased Roadmap

This repository was designed in modular phases to allow multiple team members to contribute simultaneously:

| Phase | Focus Area | Status | Key Modules |
|---|---|---|---|
| **Phase 1** | Project Scaffolding & PWA App Shell | ✅ Done | `index.html`, `vite.config.js`, `public/sw.js`, `src/styles/` |
| **Phase 2** | Offline Data Store & Silent Identity | ✅ Done | `src/services/authService.js`, `src/services/dbService.js` |
| **Phase 3** | Location Discovery & Leaflet Map | ✅ Done | `src/components/MapView.jsx`, `src/services/placesService.js` |
| **Phase 4** | Real-Time Sync & Social Feed | ✅ Done | `src/services/syncService.js`, `src/components/LiveFeedView.jsx` |
| **Phase 5** | Team Modularity & Community Dropping | ✅ Done | `src/components/AddSpotModal.jsx`, `src/components/ProfileModal.jsx` |

---

## 📂 Project Structure

```text
acmw_hackathon/
├── public/
│   ├── favicon.svg          # Custom vector neon radar icon
│   ├── manifest.json        # PWA configuration
│   └── sw.js                # Service worker offline asset caching
├── src/
│   ├── components/
│   │   ├── AddSpotModal.jsx      # "Drop a Blip" community pin creator
│   │   ├── BottomNav.jsx         # Mobile-first floating navigation
│   │   ├── Header.jsx            # Brand header with network simulator
│   │   ├── LiveFeedView.jsx      # Real-time peer activity stream
│   │   ├── LiveToast.jsx         # Live peer alert notifications
│   │   ├── MapView.jsx           # Leaflet interactive map with custom pins
│   │   ├── ProfileModal.jsx      # Silent identity & 1-tap account upgrade
│   │   ├── SavedListView.jsx     # 100% offline personal bookmarks
│   │   ├── SpotCard.jsx          # Discovery card with instant save action
│   │   └── SpotDetailModal.jsx   # Spot details, directions, & sharing
│   ├── data/
│   │   └── seedSpots.js          # Seed dataset across 5 categories & cities
│   ├── services/
│   │   ├── authService.js        # Silent anonymous auth & Google upgrade
│   │   ├── dbService.js          # IndexedDB / LocalStorage persistence
│   │   ├── placesService.js      # Geolocation & OpenStreetMap queries
│   │   └── syncService.js        # BroadcastChannel multi-client sync broker
│   ├── styles/
│   │   └── index.css             # Polished dark theme mobile UI styles
│   ├── App.jsx                   # Central orchestrator & reactive state
│   └── main.jsx                  # React DOM root mounting
├── index.html
├── package.json
└── vite.config.js
```

---

## 🛠️ Tech Stack

- **UI Framework**: React 18 with modern React Hooks (`useState`, `useEffect`, `useMemo`, `useRef`)
- **Bundler & Dev Server**: Vite 5
- **Mapping & Geodata**: Leaflet & OpenStreetMap CartoDB Dark Matter tiles
- **Local Storage Engine**: IndexedDB (via `idb`) + LocalStorage resilient fallback
- **Offline PWA**: Cache Storage API & Service Worker (`sw.js`)
- **Real-Time Layer**: Cross-tab `BroadcastChannel` real-time sync with peer event emitters
- **Icons**: Lucide React

---

## 📜 License

MIT © 2026 Blip Team. Built for the ACM-W Hackathon.