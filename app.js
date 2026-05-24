// ==========================================
// NEARDIS - FIREBASE BACKEND & UI LOGIC
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8DvmRmJygJo31qv6CER7m0KDto547zZc",
  authDomain: "neardis.firebaseapp.com",
  projectId: "neardis",
  storageBucket: "neardis.firebasestorage.app",
  messagingSenderId: "703848374164",
  appId: "1:703848374164:web:64462329b430a71a3f7981",
  measurementId: "G-4F405CJ2ZN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const AppState = {
  user: null, userLocation: null, deals: [],
  activeCategory: 'all', flashFilter: false, searchQuery: '',
  savedDeals: new Set(), verifyStep: 0, history: []
};

// ==========================================
// AUTHENTICATION & ROUTING
// ==========================================

onAuthStateChanged(auth, async (user) => {
  if (user) {
    AppState.user = {
      name: user.displayName || "Subhan Manj", 
      email: user.email, 
      uid: user.uid,
      initials: (user.displayName || "SM").substring(0, 2).toUpperCase()
    };
    
    document.getElementById('topbar-avatar').textContent = AppState.user.initials;
    document.getElementById('profile-avatar').textContent = AppState.user.initials;
    document.getElementById('profile-name').textContent = AppState.user.name;
    
    document.getElementById('main-sidebar').style.display = 'flex';
    
    fetchUserLocation();
    await fetchDeals();
    window.showPage('feed');
  } else {
    AppState.user = null;
    document.getElementById('main-sidebar').style.display = 'none';
    renderAuthForm();
    window.showPage('auth');
  }
});

// Google SSO with Graceful Error Handling
window.realGoogleLogin = async () => {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error) {
    if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
      console.log("Login popup closed by user.");
    } else {
      alert("Login Failed: " + error.message);
    }
  }
};

window.realEmailSignUp = async () => {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-password').value;
  if (!email || !pass) return alert("Please enter an email and password.");
  try {
    await createUserWithEmailAndPassword(auth, email, pass);
  } catch (error) {
    alert("Sign Up Failed: " + error.message);
  }
};

window.realEmailLogin = async () => {
  const email = document.getElementById('auth-email').value;
  const pass = document.getElementById('auth-password').value;
  if (!email || !pass) return alert("Please enter an email and password.");
  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (error) {
    alert("Login Failed: " + error.message);
  }
};

window.realLogout = () => signOut(auth);

function renderAuthForm() {
  const container = document.getElementById('auth-content');
  if (!container) return;
  
  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; margin-bottom: 8px;">Neardis</div>
      <div style="font-size: 13px; color: var(--text2);">Hyperlocal deal discovery</div>
    </div>
    
    <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px;">
      
      <div style="margin-bottom: 14px;">
        <label style="font-size: 10px; color: var(--text3); display: block; margin-bottom: 5px; text-transform: uppercase;">Email Address</label>
        <input type="email" id="auth-email" placeholder="you@example.com" style="width: 100%; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 10px 14px; border-radius: var(--radius2); outline: none;">
      </div>
      
      <div style="margin-bottom: 18px;">
        <label style="font-size: 10px; color: var(--text3); display: block; margin-bottom: 5px; text-transform: uppercase;">Password</label>
        <input type="password" id="auth-password" placeholder="••••••••" style="width: 100%; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 10px 14px; border-radius: var(--radius2); outline: none;">
      </div>

      <div style="display: flex; gap: 10px; margin-bottom: 24px;">
        <button class="btn btn-primary" style="flex: 1; padding: 12px; background: var(--surface2); color: var(--text); border: 1px solid var(--border2);" onclick="realEmailLogin()">Log In</button>
        <button class="btn btn-primary" style="flex: 1; padding: 12px;" onclick="realEmailSignUp()">Sign Up</button>
      </div>

      <div style="display: flex; align-items: center; text-align: center; color: var(--text3); font-size: 10px; margin-bottom: 20px;">
        <div style="flex: 1; height: 1px; background: var(--border);"></div>
        <span style="padding: 0 10px; text-transform: uppercase; letter-spacing: 1px;">Or continue with</span>
        <div style="flex: 1; height: 1px; background: var(--border);"></div>
      </div>
      
      <button class="btn btn-ghost" style="width: 100%; padding: 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="realGoogleLogin()">
        <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Google
      </button>

      <button class="btn btn-ghost" style="width: 100%; padding: 12px; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="alert('Apple Login coming soon.')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.7 3.59-.79 1.8-.13 3.23.63 4.12 1.95-3.52 2.06-2.92 6.64.47 8.01-.84 1.25-1.74 2.22-3.26 2.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
        Apple
      </button>
    </div>
  `;
}

// ==========================================
// CORE DATA & NAVIGATION
// ==========================================

async function fetchDeals() {
  try {
    const querySnapshot = await getDocs(collection(db, "deals"));
    if (querySnapshot.empty) {
      // Seed UI with test deals if Firebase is empty
      AppState.deals = [
        { id: 1, shopName: "Café Zest", emoji: "☕", category: "food", title: "50% off Beverages", discount: 50, distance: 0.2, flash: true, originalPrice: 650, price: 325, coordinates: { lat: 31.5204, lng: 74.3587 } },
        { id: 2, shopName: "TechZone", emoji: "📱", category: "electronics", title: "Phone Cases 3-for-1", discount: 66, distance: 0.8, flash: false, originalPrice: 3000, price: 1000, coordinates: { lat: 31.5215, lng: 74.3599 } }
      ];
    } else {
      AppState.deals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    renderFeed();
  } catch (e) {
    console.error("Firebase read error:", e);
  }
}

function fetchUserLocation() {
  const geoStatus = document.getElementById('geo-status');
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        AppState.userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (geoStatus) geoStatus.style.display = 'none';
      },
      () => { AppState.userLocation = { lat: 31.5204, lng: 74.3587 }; }
    );
  }
}

window.showPage = function(pageId) {
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
  const target = document.getElementById(`page-${pageId}`);
  if (target) { target.classList.add('active'); target.style.display = 'flex'; }
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(pageId)) btn.classList.add('active');
  });

  if (pageId === 'map') initMap();
  if (pageId === 'verify') { AppState.verifyStep = 0; renderVerify(); }
};

// ==========================================
// FEED LOGIC
// ==========================================

window.setCategory = (cat, el) => { AppState.activeCategory = cat; document.querySelectorAll('.chip').forEach(c => c.classList.remove('active')); if (el) el.classList.add('active'); renderFeed(); };
window.toggleFlashFilter = (el) => { AppState.flashFilter = !AppState.flashFilter; if (el) el.classList.toggle('active'); renderFeed(); };
document.getElementById('search-input').addEventListener('input', (e) => { AppState.searchQuery = e.target.value.toLowerCase(); renderFeed(); });

function renderFeed() {
  const grid = document.getElementById('deal-grid');
  if(!grid) return;
  let filtered = AppState.deals.filter(d => 
    (AppState.activeCategory === 'all' || d.category === AppState.activeCategory) &&
    (!AppState.flashFilter || d.flash) &&
    (!AppState.searchQuery || d.title.toLowerCase().includes(AppState.searchQuery))
  );
  grid.innerHTML = filtered.length ? filtered.map(d => generateCard(d)).join('') : `<div style="grid-column: 1/-1; text-align: center; color: var(--text3); padding: 40px;">No deals found.</div>`;
}

function generateCard(deal) {
  const isSaved = AppState.savedDeals.has(deal.id);
  return `
    <div class="deal-card ${deal.flash ? 'flash' : ''}" onclick="openDealModal(${deal.id})">
      <div class="deal-img">${deal.emoji}<div class="deal-badge">-${deal.discount}%</div></div>
      <div class="deal-body">
        <div class="deal-shop">${deal.shopName}</div>
        <div class="deal-title">${deal.title}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <span style="font-size: 11px; color: var(--text3);">📍 ${deal.distance}km away</span>
          <button style="background: none; border: none; font-size: 16px; cursor: pointer;" onclick="event.stopPropagation(); toggleBookmark(${deal.id})">${isSaved ? '🔖' : '🤍'}</button>
        </div>
      </div>
    </div>
  `;
}
window.toggleBookmark = (id) => { AppState.savedDeals.has(id) ? AppState.savedDeals.delete(id) : AppState.savedDeals.add(id); renderFeed(); };

// ==========================================
// MAP LOGIC
// ==========================================
let mapInstance = null;

function initMap() {
  const mapContainer = document.getElementById('real-map-container');
  if (!mapContainer) return;

  if (mapInstance !== null) {
    setTimeout(() => { mapInstance.invalidateSize(); }, 100);
    return;
  }

  mapInstance = L.map('real-map-container').setView([31.5204, 74.3587], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { className: 'map-tiles-dark' }).addTo(mapInstance);

  AppState.deals.forEach(deal => {
    if (!deal.coordinates) return;
    const dealIcon = L.divIcon({
      className: 'custom-deal-marker',
      html: `<div style="background:var(--accent); color:var(--bg); font-weight:700; font-size:10px; padding:3px 7px; border-radius:5px 5px 5px 0;">-${deal.discount}%</div><div style="width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid var(--accent); margin-left:2px;"></div>`,
      iconSize: [40, 40], iconAnchor: [0, 15] 
    });
    L.marker([deal.coordinates.lat, deal.coordinates.lng], { icon: dealIcon }).addTo(mapInstance).bindPopup(`<b>${deal.shopName}</b><br>${deal.title}`);
  });

  setTimeout(() => { mapInstance.invalidateSize(); }, 100);
}

// ==========================================
// ID-ONLY VERIFICATION LOGIC
// ==========================================

function renderVerify() {
  const steps = ['Business Info', 'Address', 'Upload ID', 'Done'];
  const p = steps.map((_, i) => `<div style="flex:1; height:3px; border-radius:2px; background: ${i < AppState.verifyStep ? 'var(--text)' : i === AppState.verifyStep ? 'var(--accent)' : 'var(--border)'};"></div>`).join('');
  document.getElementById('verify-steps').innerHTML = `<div style="display:flex; gap:6px; margin-bottom:20px;">${p}</div>`;

  const c = document.getElementById('verify-content');
  if (AppState.verifyStep === 0) {
    c.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px;">
        <div style="font-size: 14px; font-weight: 700; margin-bottom: 14px;">Step 1: Business Information</div>
        <div style="margin-bottom: 14px;"><label style="font-size: 10px; color: var(--text3); display: block; margin-bottom: 5px;">Business Name</label><input type="text" placeholder="Your shop name" style="width: 100%; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 9px 12px; border-radius: var(--radius2); outline: none;"></div>
        <button class="btn btn-primary" onclick="AppState.verifyStep=1; renderVerify()">Next: Address ➔</button>
      </div>`;
  } else if (AppState.verifyStep === 1) {
    c.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px;">
        <div style="font-size: 14px; font-weight: 700; margin-bottom: 14px;">Step 2: Verify Address</div>
        <div style="margin-bottom: 14px;"><label style="font-size: 10px; color: var(--text3); display: block; margin-bottom: 5px;">Street Address</label><input type="text" style="width: 100%; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 9px 12px; border-radius: var(--radius2); outline: none;"></div>
        <div style="display: flex; gap: 7px;"><button class="btn btn-ghost" onclick="AppState.verifyStep=0; renderVerify()">← Back</button><button class="btn btn-primary" onclick="AppState.verifyStep=2; renderVerify()">Next: Upload ID ➔</button></div>
      </div>`;
  } else if (AppState.verifyStep === 2) {
    c.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px;">
        <div style="font-size: 14px; font-weight: 700; margin-bottom: 14px;">Step 3: Identity Verification</div>
        <div style="border: 2px dashed var(--border); border-radius: var(--radius2); padding: 20px; text-align: center; cursor: pointer; margin-bottom: 10px;">
          <div style="font-size: 20px; margin-bottom: 3px;">🪪</div><div style="font-size: 12px; font-weight: 600;">CNIC / ID Proof</div><div style="font-size: 10px; color: var(--text3);">Clear photo of owner's identity card</div>
        </div>
        <div style="display: flex; gap: 7px; margin-top: 10px;"><button class="btn btn-ghost" onclick="AppState.verifyStep=1; renderVerify()">← Back</button><button class="btn btn-primary" onclick="AppState.verifyStep=3; renderVerify()">Submit ID ✓</button></div>
      </div>`;
  } else {
    c.innerHTML = `<div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); text-align: center; padding: 32px;"><div style="font-size: 52px; margin-bottom: 14px;">⏳</div><div style="font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; margin-bottom: 6px;">ID Submitted!</div><div style="font-size: 13px; color: var(--text2); margin-bottom: 16px;">We will review your ID card within 24 hours.</div><button class="btn btn-ghost" onclick="AppState.verifyStep=0; renderVerify()">Start Over</button></div>`;
  }
}
window.renderVerify = renderVerify;

// ==========================================
// MODALS & SURPRISE
// ==========================================

window.openDealModal = function(id) {
  const deal = AppState.deals.find(d => d.id === id);
  if (!deal) return;
  document.getElementById('modal-main').innerHTML = `
    <div style="font-size: 72px; text-align: center; margin-bottom: 14px;">${deal.emoji}</div>
    <div style="font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 8px;">${deal.title}</div>
    <div style="font-size: 13px; color: var(--text2); margin-bottom: 14px;">${deal.shopName} - Original Price: Rs ${deal.originalPrice} | Now: Rs ${deal.price}</div>
  `;
  document.getElementById('modal-side').innerHTML = `<div style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">📍 ${deal.distance}km away</div>`;
  document.getElementById('deal-modal').style.display = 'flex';
};
window.closeDealModal = () => { document.getElementById('deal-modal').style.display = 'none'; };

window.rollSurprise = function() {
  if (AppState.deals.length === 0) return;
  const pick = AppState.deals[Math.floor(Math.random() * AppState.deals.length)];
  document.getElementById('surp-emoji').textContent = pick.emoji;
  document.getElementById('surp-title').textContent = pick.title;
  document.getElementById('surp-desc').textContent = `📍 ${pick.distance}km away`;
};
