# ⚡ blip — Real-Time Nearby Discovery & Friend Outings

> **Offline-first, real-time discovery of nearby food, events, and cool spots — with collaborative planning and buzzing friend alerts.**  
> Built for the ACM-W Hackathon.

---

## 🌟 Features Overview

### 1. ⚡ Instant Local Discovery & Dynamic Places
- **Radar View**: Live nearby activity radar with category filters (Food, Coffee, Culture, Events, Hidden Gems).
- **Curated & Live OSM Spots**: High-quality imagery, ratings, tags, distance indicators, and live save counters.
- **Interactive Map**: Custom Leaflet pins featuring spot photo badges, category-colored glow sonars, and quick detail previews.
- **Offline-First Resilience**: Full IndexedDB caching and Service Worker asset persistence so discovery works with zero network signal.

### 2. 🔐 Authentication: Google OAuth + Email / Password + Guest Mode
- **Google Sign-In**: 1-tap sign-in and sign-up with real Google credentials via Firebase Authentication.
- **Email & Password**: Secure email auth with password strength meter, email verification, and password reset flows.
- **Guest-First Exploration**: Launch into the app immediately without account friction; link to Google or Email at any time.

### 3. 👥 Friend System & "You Have Been Bliped!" Alerts
- **Friend Connections**: Add friends by search or 1-tap friend request anyone saving places on the live feed.
- **Inspect Friends' Saved Spots**: View friends' curated spot lists and bookmark them to your personal favorites.
- **Collaborative Outing Planning**: Select any spot and invite friends with preset times ("Tonight @ 8:00 PM", "Tomorrow Afternoon", etc.).
- **Buzzing "YOU HAVE BEEN BLIPED!" Alerts**: Real-time modal with Web Audio synthesizer buzzes, haptic vibration, and radar pulses when friends invite you out.

### 4. 🌐 Real-Time Cross-Device Synchronization
- **Firestore Real-Time Stream**: Live sync across all deployed devices via Firestore `blip_live_events` collection.
- **Local Tab Sync**: Same-machine browser tabs communicate via `BroadcastChannel` with deduplication.
- **Live Feed & Toasts**: Instant activity toasts whenever a friend saves a spot, drops a pin, or sends a Blip invite.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/mayank-coder837/acmw_hackathon.git
cd acmw_hackathon

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for local testing)
# Copy .env.example to .env.local and add your Firebase credentials
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Open your browser at:  
👉 **http://localhost:5173**

---

## 🔑 Firebase Configuration

Create a `.env.local` file in the project root with your Firebase web credentials:

```env
VITE_FIREBASE_API_KEY=AIzaSyC2u0cbq2C7xT3fG08fUTXAuyCFVlR0sjo
VITE_FIREBASE_AUTH_DOMAIN=acmw-hackathon.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=acmw-hackathon
VITE_FIREBASE_STORAGE_BUCKET=acmw-hackathon.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=831480521796
VITE_FIREBASE_APP_ID=1:831480521796:web:50f36704ad5c4577b6c811
VITE_FIREBASE_MEASUREMENT_ID=G-4FV1XZFCF9
```

> [!IMPORTANT]
> **Firebase Console Checklist**:
> 1. **Authentication → Sign-in method**: Ensure **Google** and **Email/Password** are **Enabled**.
> 2. **Authentication → Settings → Authorized domains**: Add your Vercel deployment domain (e.g. `*.vercel.app` or custom domain).
> 3. **Firestore Database**: Create Firestore database in test/production mode to allow `blip_live_events` reads/writes.

---

## 📦 Deployment to Vercel

The project is configured for single-command zero-config deployment using Vite and [`vercel.json`](file:///c:/Users/vijay/acmw_hackathon/vercel.json):

```bash
# Build for production
npm run build

# Deploy via Vercel CLI
npx vercel --prod
```

Or connect the GitHub repository directly at [vercel.com/new](https://vercel.com/new) for automated CI/CD on every `git push origin main`.

---

## 👥 Multi-User Real-Time Testing

1. **Tab 1**: Open `http://localhost:5173` and sign in or continue as guest.
2. **Tab 2**: Open an incognito tab or second browser.
3. **Feed Interactions**: Save any place in Tab 1 — Tab 2 receives a real-time live toast and updates the save counter.
4. **Blip an Invite**: In Tab 1, open any spot, click **⚡ Plan with Friends**, select a friend and time. Tab 2 immediately receives the buzzing **YOU HAVE BEEN BLIPED!** alert modal!

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide React, Framer Motion
- **Maps**: Leaflet, OpenStreetMap CartoDB Dark Matter tiles
- **Persistence**: IndexedDB (`idb`), LocalStorage resilient fallback, Service Worker (`sw.js`)
- **Backend & Auth**: Firebase Auth (Google OAuth, Email/Password), Cloud Firestore
- **Real-Time Engine**: Cloud Firestore `onSnapshot` + browser `BroadcastChannel`
- **Audio / Haptics**: Web Audio API oscillator synthesis + `navigator.vibrate`

---

## 📜 License

MIT © 2026 Blip Team. Built for the ACM-W Hackathon.