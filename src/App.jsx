import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Map, List, Plus, Sparkles, Navigation } from 'lucide-react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import SpotCard from './components/SpotCard';
import MapView from './components/MapView';
import SpotDetailModal from './components/SpotDetailModal';
import AddSpotModal from './components/AddSpotModal';
import SavedListView from './components/SavedListView';
import LiveFeedView from './components/LiveFeedView';
import ProfileModal from './components/ProfileModal';
import LiveToast from './components/LiveToast';
import RadarHero from './components/RadarHero';
import WelcomePage from './components/WelcomePage';
import AuthModal from './components/AuthModal';
import FriendsView from './components/FriendsView';
import FriendDetailModal from './components/FriendDetailModal';
import PlanPlaceModal from './components/PlanPlaceModal';
import BlipedNotificationModal from './components/BlipedNotificationModal';

import { authService } from './services/authService';
import { dbService } from './services/dbService';
import { placesService } from './services/placesService';
import { syncService } from './services/syncService';
import { friendService } from './services/friendService';
import { CITY_PRESETS } from './data/seedSpots';

export default function App() {
  // User Session
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [showAuth, setShowAuth] = useState(false);

  // App Data
  const [spots, setSpots] = useState([]);
  const [savedSpotIds, setSavedSpotIds] = useState([]);
  const [activities, setActivities] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Friend System State
  const [friends, setFriends] = useState(() => friendService.getFriends(user?.uid));
  const [requests, setRequests] = useState(() => friendService.getRequests(user?.uid));
  const [plans, setPlans] = useState(() => friendService.getPlans(user?.uid));
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [planSpot, setPlanSpot] = useState(null);
  const [planPreselectedFriend, setPlanPreselectedFriend] = useState(null);
  const [incomingBlipInvite, setIncomingBlipInvite] = useState(null);

  // UI State
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'feed' | 'friends' | 'saved' | 'profile'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [highlightedSpotId, setHighlightedSpotId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Welcome Screen State — always show on every page load
  const [showWelcome, setShowWelcome] = useState(true);

  // Network & Location
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [userLocation, setUserLocation] = useState({ lat: 25.1972, lng: 55.2744 });
  const [selectedCityPreset, setSelectedCityPreset] = useState('Downtown Dubai');

  // Synchronize nearby live Map API places (food places, coffee shops, events, culture, fun)
  const syncNearbyPlaces = async (lat, lng) => {
    if (!navigator.onLine) return;
    try {
      const liveOsm = await placesService.fetchLiveOSMSpots(lat, lng, 3500);
      if (liveOsm.length > 0) {
        setSpots((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const existingNames = new Set(prev.map((s) => s.name?.toLowerCase().trim()));
          const newSpots = liveOsm.filter(
            (s) => !existingIds.has(s.id) && !existingNames.has(s.name?.toLowerCase().trim())
          );
          if (newSpots.length > 0) {
            newSpots.forEach((s) => dbService.saveSpot(s));
            return [...newSpots, ...prev];
          }
          return prev;
        });
      }
    } catch (e) {
      console.warn('Live map sync fallback:', e);
    }
  };

  // Subscribe to Firebase auth state changes
  useEffect(() => {
    authService.checkRedirectResult().then((redirectUser) => {
      if (redirectUser) {
        setUser(redirectUser);
      }
    });
    const unsubscribeAuth = authService.onAuthStateChanged((blipUser) => {
      setUser(blipUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // 1. Initial Load & Setup
  useEffect(() => {
    // Register Service Worker for offline PWA
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    }

    // Initialize local DB and load cached data
    async function loadInitialData() {
      await dbService.init();
      const loadedSpots = await dbService.getAllSpots();
      setSpots(loadedSpots);

      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      const savedIds = await dbService.getUserSavedSpotIds(currentUser.uid);
      setSavedSpotIds(savedIds);

      // Initial nearby Map API hydration
      if (navigator.onLine) {
        syncNearbyPlaces(25.1972, 55.2744);
      }
    }

    loadInitialData();

    // Fetch browser location
    placesService.getCurrentPosition().then((pos) => {
      setUserLocation({ lat: pos.lat, lng: pos.lng });
      if (navigator.onLine && !pos.isFallback) {
        syncNearbyPlaces(pos.lat, pos.lng);
      }
    });

    // Window network listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for custom auth change events
    const handleAuthChange = async (e) => {
      setUser(e.detail);
      const ids = await dbService.getUserSavedSpotIds(e.detail.uid);
      setSavedSpotIds(ids);
    };
    window.addEventListener('blip_auth_changed', handleAuthChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('blip_auth_changed', handleAuthChange);
    };
  }, []);

  // Reload friends and plans when user session changes
  useEffect(() => {
    if (user?.uid) {
      setFriends(friendService.getFriends(user.uid));
      setRequests(friendService.getRequests(user.uid));
      setPlans(friendService.getPlans(user.uid));
    }
  }, [user?.uid]);

  // 2. Real-Time Multi-User Sync Subscription (BroadcastChannel & Peer Activity)
  useEffect(() => {
    const unsubscribe = syncService.subscribe((event) => {
      // Record activity into live feed
      setActivities((prev) => [event, ...prev.slice(0, 49)]);

      // Show toast if not generated by current local action
      if (event.user?.uid !== user.uid && event.type !== 'FRIEND_REQUEST' && event.type !== 'BLIP_INVITE') {
        setToasts((prev) => [event, ...prev.slice(0, 2)]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== event.id));
        }, 4500);
      }

      // If new spot added by peer, dynamically add to spots and highlight
      if (event.type === 'NEW_SPOT' && event.spot) {
        setSpots((prev) => {
          const exists = prev.some((s) => s.id === event.spot.id);
          return exists ? prev : [event.spot, ...prev];
        });
        dbService.saveSpot(event.spot);
        setHighlightedSpotId(event.spot.id);
        setTimeout(() => setHighlightedSpotId(null), 4000);
      }

      // If peer saved a spot, increment saveCount locally
      if (event.type === 'SPOT_SAVED' && event.spot?.id) {
        setSpots((prev) =>
          prev.map((s) =>
            s.id === event.spot.id ? { ...s, saveCount: (s.saveCount || 0) + 1 } : s
          )
        );
        dbService.incrementSaveCount(event.spot.id);
        setHighlightedSpotId(event.spot.id);
        setTimeout(() => setHighlightedSpotId(null), 3500);
      }

      // Friend Request Received
      if (event.type === 'FRIEND_REQUEST' && event.request) {
        if (event.request.toUser?.uid === user.uid) {
          friendService.receiveIncomingRequest(user.uid, event.request);
          setRequests(friendService.getRequests(user.uid));
          const toastEvt = {
            id: `toast_${Date.now()}`,
            type: 'FRIEND_REQ_TOAST',
            message: `${event.request.fromUser.displayName} sent you a friend request!`
          };
          setToasts((prev) => [toastEvt, ...prev.slice(0, 2)]);
          setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastEvt.id)), 4500);
        }
      }

      // Friend Request Accepted
      if (event.type === 'FRIEND_REQUEST_ACCEPTED') {
        if (event.toUser?.uid === user.uid || event.fromUser?.uid === user.uid) {
          const otherUser = event.fromUser?.uid === user.uid ? event.toUser : event.fromUser;
          const updatedFriends = friendService.getFriends(user.uid);
          if (!updatedFriends.some((f) => f.uid === otherUser.uid)) {
            updatedFriends.unshift({
              uid: otherUser.uid,
              displayName: otherUser.displayName,
              handle: otherUser.handle || `@${otherUser.displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
              avatarColor: otherUser.avatarColor,
              initials: otherUser.initials || otherUser.displayName.substring(0, 2).toUpperCase(),
              savedSpotIds: otherUser.savedSpotIds || ['spot_1', 'spot_2'],
              addedAt: Date.now()
            });
            friendService.saveFriends(user.uid, updatedFriends);
          }
          setFriends([...updatedFriends]);
          setRequests(friendService.getRequests(user.uid));

          const toastEvt = {
            id: `toast_${Date.now()}`,
            type: 'FRIEND_ACCEPTED_TOAST',
            message: `⚡ You and ${otherUser.displayName} are now friends!`
          };
          setToasts((prev) => [toastEvt, ...prev.slice(0, 2)]);
          setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastEvt.id)), 4500);
        }
      }

      // Collaborative Place Plan / "You Have Been Bliped!" Buzz Alert
      if (event.type === 'BLIP_INVITE' && event.plan) {
        const isInvited = event.plan.invitedFriends?.some((f) => f.uid === user.uid);
        if (isInvited && event.plan.creator?.uid !== user.uid) {
          friendService.receiveIncomingPlan(user.uid, event.plan);
          setPlans(friendService.getPlans(user.uid));
          setIncomingBlipInvite(event);
        }
      }

      // Friend responded to your plan
      if (event.type === 'PLAN_RESPONSE') {
        setPlans((prev) =>
          prev.map((p) => {
            if (p.id === event.planId) {
              const updatedFriends = (p.invitedFriends || []).map((f) =>
                f.uid === event.responder?.uid || f.displayName === event.responder?.displayName
                  ? { ...f, status: event.status }
                  : f
              );
              return { ...p, status: event.status, invitedFriends: updatedFriends };
            }
            return p;
          })
        );
        const toastEvt = {
          id: `toast_${Date.now()}`,
          type: 'PLAN_RESP_TOAST',
          message: `${event.responder?.displayName || 'Friend'} ${event.status === 'accepted' ? 'accepted your Blip invite! ⚡' : 'declined the invite.'}`
        };
        setToasts((prev) => [toastEvt, ...prev.slice(0, 2)]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastEvt.id)), 4500);
      }

      // Friend updated saved spots sync
      if (event.type === 'FRIEND_SAVED_SPOTS_SYNC' && event.user?.uid !== user.uid) {
        friendService.updateFriendSavedSpots(user.uid, event.user.uid, event.savedSpotIds);
        setFriends(friendService.getFriends(user.uid));
      }
    });

    return () => unsubscribe();
  }, [user.uid]);

  // 3. Ambient Social Activity Simulator (Online only)
  useEffect(() => {
    if (isOnline && spots.length > 0) {
      syncService.startAmbientActivity(isOnline, spots, (ambientEvent) => {
        setActivities((prev) => [ambientEvent, ...prev.slice(0, 49)]);
        setToasts((prev) => [ambientEvent, ...prev.slice(0, 2)]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== ambientEvent.id));
        }, 4500);

        if (ambientEvent.spot?.id) {
          setSpots((prev) =>
            prev.map((s) =>
              s.id === ambientEvent.spot.id ? { ...s, saveCount: (s.saveCount || 0) + 1 } : s
            )
          );
        }
      });
    } else {
      syncService.stopAmbientActivity();
    }

    return () => syncService.stopAmbientActivity();
  }, [isOnline, spots.length]);

  // Handle Bookmark / Save Toggle
  const handleToggleSave = async (spot) => {
    const isNowSaved = await dbService.toggleSaveSpot(user.uid, spot.id);
    if (isNowSaved) {
      setSavedSpotIds((prev) => [...prev, spot.id]);
      setSpots((prev) =>
        prev.map((s) => (s.id === spot.id ? { ...s, saveCount: (s.saveCount || 0) + 1 } : s))
      );
      // Broadcast save event to peers
      syncService.broadcastSpotSaved(spot, user, true);
    } else {
      setSavedSpotIds((prev) => prev.filter((id) => id !== spot.id));
      setSpots((prev) =>
        prev.map((s) =>
          s.id === spot.id ? { ...s, saveCount: Math.max(0, (s.saveCount || 1) - 1) } : s
        )
      );
    }
  };

  // Handle Dropping a New Blip
  const handleAddSpot = async (newSpot) => {
    await dbService.saveSpot(newSpot);
    setSpots((prev) => [newSpot, ...prev]);

    // Automatically bookmark creator's new spot
    await dbService.toggleSaveSpot(user.uid, newSpot.id);
    setSavedSpotIds((prev) => [...prev, newSpot.id]);

    // Broadcast in real-time across tabs/network
    syncService.broadcastNewSpot(newSpot, user);

    // Highlight & open
    setHighlightedSpotId(newSpot.id);
    setTimeout(() => setHighlightedSpotId(null), 4000);
    setSelectedSpot(newSpot);
  };

  // Friend System Handlers
  const handleSendFriendRequest = (targetUser) => {
    if (!targetUser || !user) return;
    const req = friendService.sendFriendRequest(user, targetUser);
    if (!req) return;
    if (req.status === 'already_friends') {
      const toastEvt = {
        id: `toast_${Date.now()}`,
        type: 'FRIEND_REQ_TOAST',
        message: `You and ${targetUser.displayName} are already friends!`
      };
      setToasts((prev) => [toastEvt, ...prev.slice(0, 2)]);
      return;
    }
    syncService.broadcastFriendRequest(req);
    setRequests(friendService.getRequests(user.uid));
    const toastEvt = {
      id: `toast_${Date.now()}`,
      type: 'FRIEND_REQ_TOAST',
      message: `Friend request sent to ${targetUser.displayName}!`
    };
    setToasts((prev) => [toastEvt, ...prev.slice(0, 2)]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastEvt.id)), 4500);
  };

  const handleSendFriendRequestByName = (nameOrHandle) => {
    const clean = nameOrHandle.trim().replace(/^@/, '');
    if (!clean) return { error: 'Please enter a name or handle' };
    if (clean.toLowerCase() === user.displayName?.toLowerCase()) {
      return { error: 'You cannot add yourself' };
    }
    if (
      friends.some(
        (f) =>
          f.displayName?.toLowerCase() === clean.toLowerCase() ||
          f.handle?.toLowerCase() === `@${clean.toLowerCase()}`
      )
    ) {
      return { error: `${nameOrHandle} is already your friend!` };
    }
    const targetUser = {
      uid: `user_${clean.toLowerCase()}_${Math.random().toString(36).substr(2, 4)}`,
      displayName: clean,
      handle: `@${clean.toLowerCase()}`,
      avatarColor: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
      initials: clean.substring(0, 2).toUpperCase()
    };
    handleSendFriendRequest(targetUser);
    return { success: true };
  };

  const handleAcceptRequest = (requestId) => {
    const friendInfo = friendService.acceptFriendRequest(user, requestId);
    if (friendInfo) {
      syncService.broadcastFriendAccepted(requestId, user, friendInfo);
      setFriends(friendService.getFriends(user.uid));
      setRequests(friendService.getRequests(user.uid));
      const toastEvt = {
        id: `toast_${Date.now()}`,
        type: 'FRIEND_ACCEPTED_TOAST',
        message: `⚡ Accepted friend request from ${friendInfo.displayName}!`
      };
      setToasts((prev) => [toastEvt, ...prev.slice(0, 2)]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastEvt.id)), 4500);
    }
  };

  const handleDeclineRequest = (requestId) => {
    friendService.declineFriendRequest(user, requestId);
    setRequests(friendService.getRequests(user.uid));
  };

  const handleCancelRequest = (requestId) => {
    friendService.declineFriendRequest(user, requestId);
    setRequests(friendService.getRequests(user.uid));
  };

  const handleRemoveFriend = (friendUid) => {
    const updated = friendService.removeFriend(user, friendUid);
    setFriends(updated);
  };

  const handleAcceptBlipInvite = (invite) => {
    if (!invite?.plan) return;
    friendService.respondToPlan(user.uid, invite.plan.id, 'accepted');
    syncService.broadcastPlanResponse(invite.plan.id, user, 'accepted');
    setPlans(friendService.getPlans(user.uid));
    setIncomingBlipInvite(null);

    const spot = spots.find((s) => s.id === invite.plan.spotId);
    if (spot) {
      setSelectedSpot(spot);
    }
    setActiveTab('friends');

    const toastEvt = {
      id: `toast_${Date.now()}`,
      type: 'BLIP_INVITE_TOAST',
      message: `⚡ Accepted Blip to ${invite.plan.spotName}!`
    };
    setToasts((prev) => [toastEvt, ...prev.slice(0, 2)]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastEvt.id)), 4500);
  };

  const handleDeclineBlipInvite = (invite) => {
    if (!invite?.plan) return;
    friendService.respondToPlan(user.uid, invite.plan.id, 'declined');
    syncService.broadcastPlanResponse(invite.plan.id, user, 'declined');
    setPlans(friendService.getPlans(user.uid));
    setIncomingBlipInvite(null);
  };

  // City preset switcher
  const handleCityChange = (cityName) => {
    setSelectedCityPreset(cityName);
    const preset = CITY_PRESETS.find((p) => p.name === cityName);
    if (preset) {
      setUserLocation({ lat: preset.lat, lng: preset.lng });
      syncNearbyPlaces(preset.lat, preset.lng);
    }
  };

  // Filtered Discover Spots
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      // Category filter
      if (selectedCategory !== 'all' && spot.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = spot.name?.toLowerCase().includes(q);
        const matchDesc = spot.description?.toLowerCase().includes(q);
        const matchCategory = spot.category?.toLowerCase().includes(q);
        const matchTags = spot.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchCategory && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [spots, selectedCategory, searchQuery]);

  // Saved spots list
  const savedSpotsList = useMemo(() => {
    return spots.filter((s) => savedSpotIds.includes(s.id));
  }, [spots, savedSpotIds]);

  // Enter App from Welcome Page
  const handleEnterApp = (chosenCity) => {
    if (chosenCity && chosenCity !== selectedCityPreset) {
      handleCityChange(chosenCity);
    }
    try {
      localStorage.setItem('blip_welcome_dismissed', 'true');
    } catch {}
    setShowWelcome(false);
  };

  // Render Welcome Page if active
  if (showWelcome) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="welcome"
          initial={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.96, filter: 'blur(16px)' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
        >
          <WelcomePage
            selectedCity={selectedCityPreset}
            onSelectCity={handleCityChange}
            onEnterApp={handleEnterApp}
            onOpenAuth={() => setShowAuth(true)}
            user={user}
          />

          {showAuth && (
            <AuthModal
              onClose={() => setShowAuth(false)}
              onAuthSuccess={(nextUser) => {
                setUser(nextUser);
                setShowAuth(false);
                handleEnterApp(selectedCityPreset);
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="app"
        className="app-container"
        initial={{ opacity: 0, scale: 1.03, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
      {/* Real-time Peer Notification Toasts */}
      <LiveToast
        toasts={toasts}
        onDismissToast={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
        onSelectSpot={(spot) => setSelectedSpot(spot)}
      />

      {/* Header */}
      <Header
        isOnline={isOnline}
        toggleNetworkSimulation={() => setIsOnline((prev) => !prev)}
        user={user}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenWelcome={() => setShowWelcome(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={(catId) => setSelectedCategory(catId)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main View Area */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          {/* Tab 1: Discover Feed (List & Map views) */}
          {activeTab === 'discover' && (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* 21st.dev Sonar Radar Hero Scanner */}
              <RadarHero
                activeSpotsCount={filteredSpots.length}
                cityName={selectedCityPreset}
                isOnline={isOnline}
                viewMode={viewMode}
                onViewMap={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
              />

              {/* View Switcher Controls */}
              <div className="view-toggle-wrap">
                <div className="view-segment">
                  <button
                    className={`segment-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={14} />
                    <span>List</span>
                  </button>
                  <button
                    className={`segment-btn ${viewMode === 'map' ? 'active' : ''}`}
                    onClick={() => setViewMode('map')}
                  >
                    <Map size={14} />
                    <span>Map</span>
                  </button>
                </div>

                {/* Location / Preset selector */}
                <div className="location-indicator">
                  <Navigation size={12} color="#38bdf8" />
                  <select
                    value={selectedCityPreset}
                    onChange={(e) => handleCityChange(e.target.value)}
                  >
                    {CITY_PRESETS.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* List View */}
              {viewMode === 'list' && (
                <div>
                  {filteredSpots.length > 0 ? (
                    <div className="spots-grid">
                      {filteredSpots.map((spot) => (
                        <SpotCard
                          key={spot.id}
                          spot={spot}
                          isSaved={savedSpotIds.includes(spot.id)}
                          onToggleSave={handleToggleSave}
                          onSelectSpot={setSelectedSpot}
                          userLocation={userLocation}
                          isHighlighted={highlightedSpotId === spot.id}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <Sparkles size={32} />
                      </div>
                      <h3>No spots found</h3>
                      <p>Try searching for a different keyword or category.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Map View */}
              {viewMode === 'map' && (
                <div className="relative">
                  <MapView
                    spots={filteredSpots}
                    userLocation={userLocation}
                    selectedSpot={selectedSpot}
                    onSelectSpot={setSelectedSpot}
                    highlightedSpotId={highlightedSpotId}
                  />
                  {/* Floating Preview Card on Map */}
                  {filteredSpots.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[0.72rem] font-bold text-slate-400 mb-1.5 flex items-center justify-between">
                        <span>Selected Spot on Map:</span>
                        <span className="text-cyan-400">Tap pin to switch</span>
                      </div>
                      <SpotCard
                        spot={selectedSpot || filteredSpots[0]}
                        isSaved={savedSpotIds.includes((selectedSpot || filteredSpots[0]).id)}
                        onToggleSave={handleToggleSave}
                        onSelectSpot={setSelectedSpot}
                        userLocation={userLocation}
                        isHighlighted={true}
                      />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 2: Live Activity Feed */}
          {activeTab === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <LiveFeedView
                activities={activities}
                isOnline={isOnline}
                currentUser={user}
                friends={friends}
                requests={requests}
                onSelectSpotById={(id) => {
                  const spot = spots.find((s) => s.id === id);
                  if (spot) setSelectedSpot(spot);
                }}
                onSendFriendRequest={handleSendFriendRequest}
                onOpenFriendDetail={(f) => setSelectedFriend(f)}
              />
            </motion.div>
          )}

          {/* Tab 3: Friends Hub & Outings */}
          {activeTab === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <FriendsView
                friends={friends}
                requests={requests}
                plans={plans}
                user={user}
                allSpots={spots}
                onOpenFriendDetail={(f) => setSelectedFriend(f)}
                onOpenPlanModalWithFriend={(f) => {
                  setPlanPreselectedFriend(f);
                  setPlanSpot(spots[0] || null);
                }}
                onAcceptRequest={handleAcceptRequest}
                onDeclineRequest={handleDeclineRequest}
                onCancelRequest={handleCancelRequest}
                onSendFriendRequestByName={handleSendFriendRequestByName}
                onSelectSpotById={(id) => {
                  const spot = spots.find((s) => s.id === id);
                  if (spot) setSelectedSpot(spot);
                }}
                onGoToDiscover={() => setActiveTab('discover')}
              />
            </motion.div>
          )}

          {/* Tab 4: My Saved Spots (Offline-Ready) */}
          {activeTab === 'saved' && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <SavedListView
                savedSpots={savedSpotsList}
                onToggleSave={handleToggleSave}
                onSelectSpot={setSelectedSpot}
                userLocation={userLocation}
                onGoToDiscover={() => setActiveTab('discover')}
              />
            </motion.div>
          )}

          {/* Tab 5: Profile & Sync Settings */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              style={{ padding: '8px 0' }}
            >
              <ProfileModal
                user={user}
                savedCount={savedSpotIds.length}
                totalSpotsCount={spots.length}
                onClose={() => setActiveTab('discover')}
                onUserUpdated={(updated) => setUser(updated)}
                onOpenWelcome={() => setShowWelcome(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button: Drop a Blip */}
      {activeTab === 'discover' && (
        <button
          className="fab-add"
          onClick={() => setIsAddModalOpen(true)}
          title="Drop a new spot on the map"
        >
          <Plus size={18} />
          <span>Drop a Blip</span>
        </button>
      )}

      {/* Spot Detail Modal */}
      {selectedSpot && (
        <SpotDetailModal
          spot={selectedSpot}
          isSaved={savedSpotIds.includes(selectedSpot.id)}
          onToggleSave={handleToggleSave}
          onClose={() => setSelectedSpot(null)}
          userLocation={userLocation}
          onPlanSpot={(spot) => {
            setPlanSpot(spot);
            setPlanPreselectedFriend(null);
          }}
        />
      )}

      {/* Plan Place Modal */}
      {planSpot && (
        <PlanPlaceModal
          spot={planSpot}
          user={user}
          friends={friends}
          preselectedFriendUid={planPreselectedFriend?.uid}
          onClose={() => {
            setPlanSpot(null);
            setPlanPreselectedFriend(null);
          }}
          onPlanCreated={(newPlan) => {
            setPlans(friendService.getPlans(user.uid));
            const toastEvt = {
              id: `toast_${Date.now()}`,
              type: 'BLIP_INVITE_TOAST',
              message: `⚡ Sent Blip invite for ${planSpot.name}!`
            };
            setToasts((prev) => [toastEvt, ...prev.slice(0, 2)]);
            setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== toastEvt.id)), 4500);
          }}
          onOpenFriendsTab={() => setActiveTab('friends')}
        />
      )}

      {/* Friend Detail Modal */}
      {selectedFriend && (
        <FriendDetailModal
          friend={selectedFriend}
          allSpots={spots}
          userSavedSpotIds={savedSpotIds}
          onToggleSaveSpot={handleToggleSave}
          onSelectSpot={(s) => setSelectedSpot(s)}
          onPlanWithFriend={(f) => {
            setPlanPreselectedFriend(f);
            setPlanSpot(spots[0] || null);
          }}
          onRemoveFriend={handleRemoveFriend}
          onClose={() => setSelectedFriend(null)}
          userLocation={userLocation}
        />
      )}

      {/* "You Have Been Bliped" Buzzing Modal */}
      {incomingBlipInvite && (
        <BlipedNotificationModal
          invite={incomingBlipInvite}
          onAccept={handleAcceptBlipInvite}
          onDecline={handleDeclineBlipInvite}
          onSelectSpot={(plan) => {
            const spot = spots.find((s) => s.id === plan.spotId);
            if (spot) {
              setSelectedSpot(spot);
              setIncomingBlipInvite(null);
            }
          }}
        />
      )}

      {/* Add Spot Modal */}
      {isAddModalOpen && (
        <AddSpotModal
          userLocation={userLocation}
          user={user}
          onAddSpot={handleAddSpot}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Profile Modal (when clicked from header) */}
      {isProfileOpen && (
        <ProfileModal
          user={user}
          savedCount={savedSpotIds.length}
          totalSpotsCount={spots.length}
          onClose={() => setIsProfileOpen(false)}
          onUserUpdated={(updated) => setUser(updated)}
          onOpenWelcome={() => setShowWelcome(true)}
        />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuthSuccess={(nextUser) => {
            setUser(nextUser);
            setShowAuth(false);
          }}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'profile') {
            setIsProfileOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        savedCount={savedSpotIds.length}
        liveCount={activities.length}
        friendsBadge={
          requests.filter((r) => r.status === 'pending' && r.toUser?.uid === user.uid).length +
          (incomingBlipInvite ? 1 : 0)
        }
      />
      </motion.div>
    </AnimatePresence>
  );
}
