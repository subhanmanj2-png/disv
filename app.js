// ==========================================
// NEARDIS - COMPLETE UNIFIED BACKEND & LOGIC
// ==========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
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

const AppState = {
  user: null, userLocation: null, deals: [],
  activeCategory: 'all', flashFilter: false, searchQuery: '',
  savedDeals: new Set(), verifyStep: 0
};

// ==========================================
// ROUTING GUARD
// ==========================================

onAuthStateChanged(auth, async (user) => {
  if (user) {
    AppState.user = {
      name: user.displayName || "User", 
      email: user.email, 
      uid: user.uid,
      initials: (user.displayName || "U").substring(0, 2).toUpperCase()
    };
    
    document.getElementById('topbar-avatar').textContent = AppState.user.initials;
    document.getElementById('profile-avatar').textContent = AppState.user.initials;
    document.getElementById('profile-name').textContent = AppState.user.name;
    
    fetchUserLocation();
    await fetchDeals();
    window.showPage('feed');
  } else {
    // KICK OUT TO LOGIN PAGE
    window.location.href = 'login.html';
  }
});

window.realLogout = () => {
  signOut(auth).then(() => {
    window.location.href = 'login.html';
  });
};

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
  if (pageId === 'bookmarks') renderBookmarks();
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

window.toggleBookmark = (id) => { 
  AppState.savedDeals.has(id) ? AppState.savedDeals.delete(id) : AppState.savedDeals.add(id); 
  renderFeed(); 
  if (document.getElementById('page-bookmarks').classList.contains('active')) renderBookmarks();
};

function renderBookmarks() {
  const grid = document.getElementById('bookmark-grid');
  if(!grid) return;
  const saved = AppState.deals.filter(d => AppState.savedDeals.has(d.id));
  grid.innerHTML = saved.length ? saved.map(d => generateCard(d)).join('') : `<div style="grid-column: 1/-1; text-align: center; color: var(--text3); padding: 40px;">No saved deals yet.</div>`;
}

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
  const p = steps.map((_, i) => `<div style="flex:1; height:3px; border-radius:2px; background: ${i < AppState.verifyStep ? '#ffffff' : i === AppState.verifyStep ? 'var(--accent)' : 'var(--border)'};"></div>`).join('');
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
    <div style="font-size: 72px; text-align: center; margin-bottom: 14px; background: var(--surface); border-radius: var(--radius); padding: 20px;">${deal.emoji}</div>
    <div style="font-size: 10px; color: var(--text3); text-transform: uppercase; margin-bottom: 4px;">${deal.shopName}</div>
    <div style="font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 8px;">${deal.title}</div>
    <div style="display: flex; gap: 10px; margin-bottom: 16px;">
      <div style="flex: 1; text-align: center; padding: 12px; background: var(--surface); border-radius: var(--radius2); border: 1px solid var(--border);">
        <div style="font-size: 36px; font-weight: 800; color: var(--accent);">-${deal.discount}%</div><div style="font-size: 10px; color: var(--text3);">Discount</div>
      </div>
      <div style="flex: 1; text-align: center; padding: 12px; background: var(--surface); border-radius: var(--radius2); border: 1px solid var(--border);">
        <div style="text-decoration: line-through; font-size: 11px; color: var(--text3);">Rs ${deal.originalPrice}</div>
        <div style="font-size: 20px; font-weight: 700; color: var(--text);">Rs ${deal.price}</div>
      </div>
    </div>
  `;
  document.getElementById('modal-side').innerHTML = `<div style="font-size: 11px; font-weight: 600; margin-bottom: 3px;">📍 Distance</div><div style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">${deal.distance}km away</div>`;
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
