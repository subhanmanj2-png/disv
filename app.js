// ==========================================
// NEARDIS - CORE APPLICATION LOGIC
// ==========================================

// NOTE: Replace this with your actual GitHub Raw URL before deploying
const GITHUB_DATA_URL = 'https://raw.githubusercontent.com/username/neardis-app/main/neardis-deals.json'; 

// Application State
const AppState = {
  user: null, // Starts null to enforce authentication
  userLocation: null, 
  deals: [],
  activeCategory: 'all',
  flashFilter: false,
  searchQuery: '',
  savedDeals: new Set()
};

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});

async function initApp() {
  // 1. Enforce Auth Wall Immediately
  showPage('auth');

  // 2. Fetch User Geolocation (Happens in background)
  fetchUserLocation();

  // 3. Fetch Deals from GitHub (Happens in background)
  try {
    const response = await fetch(GITHUB_DATA_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    AppState.deals = data;
    
  } catch (error) {
    console.error("Failed to load deals:", error);
    const grid = document.getElementById('deal-grid');
    if (grid) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--text3); padding: 40px;">
          ⚠️ Waiting on GitHub database link. Update GITHUB_DATA_URL in app.js.
        </div>
      `;
    }
  }
}

// ==========================================
// USER AUTHENTICATION & LOCATION
// ==========================================

function fetchUserLocation() {
  const geoStatus = document.getElementById('geo-status');
  
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        AppState.userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        if (geoStatus) geoStatus.textContent = "📍 Location synced.";
        setTimeout(() => { if (geoStatus) geoStatus.style.display = 'none'; }, 2000);
      },
      (error) => {
        console.error("Error getting location", error);
        if (geoStatus) geoStatus.textContent = "⚠️ Location access denied. Using default map center.";
        AppState.userLocation = { lat: 31.5204, lng: 74.3587 };
      }
    );
  } else {
    if (geoStatus) geoStatus.textContent = "Geolocation is not supported by your browser.";
    AppState.userLocation = { lat: 31.5204, lng: 74.3587 };
  }
}

// ==========================================
// EVENT LISTENERS & ROUTING GUARD
// ==========================================

function setupEventListeners() {
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value.toLowerCase();
      renderFeed();
    });
  }
}

function showPage(pageId) {
  // AUTH ROUTE GUARD: If no user is logged in, force navigation to the auth page.
  if (!AppState.user && pageId !== 'auth') {
    console.warn("Unauthorized access attempt intercepted. Redirecting to Auth.");
    pageId = 'auth';
  }

  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show target page
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) targetPage.classList.add('active');
  
  // Toggle Sidebar Visibility: Hide on Auth, Show on others
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.style.display = pageId === 'auth' ? 'none' : 'flex';
  }

  // Update Navigation Active State
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(pageId)) {
      btn.classList.add('active');
    }
  });

  // Route logic to trigger initialization functions in separate files
  if (pageId === 'auth' && typeof initAuth === 'function') initAuth();
  if (pageId === 'feed') renderFeed(); // Ensure feed renders fresh on return
  if (pageId === 'map' && typeof initMap === 'function') initMap();
  if (pageId === 'surprise' && typeof initSurprise === 'function') initSurprise();
  if (pageId === 'route' && typeof initRoute === 'function') initRoute();
  if (pageId === 'bookmarks') renderBookmarks();
  if (pageId === 'notifications' && typeof initNotifications === 'function') initNotifications();
  if (pageId === 'business' && typeof initBusiness === 'function') initBusiness();
  if (pageId === 'verify' && typeof initVerify === 'function') initVerify();
}

// ==========================================
// FILTERING LOGIC
// ==========================================

function setCategory(category, element) {
  AppState.activeCategory = category;
  
  document.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
  if (element) element.classList.add('active');
  
  renderFeed();
}

function toggleFlashFilter(element) {
  AppState.flashFilter = !AppState.flashFilter;
  if (element) element.classList.toggle('active', AppState.flashFilter);
  renderFeed();
}

// ==========================================
// RENDERING ENGINES
// ==========================================

function renderFeed() {
  const grid = document.getElementById('deal-grid');
  if (!grid) return;
  
  let filteredDeals = [...AppState.deals];

  // Apply Filters
  if (AppState.activeCategory !== 'all') {
    filteredDeals = filteredDeals.filter(d => d.category === AppState.activeCategory);
  }
  if (AppState.flashFilter) {
    filteredDeals = filteredDeals.filter(d => d.flash === true);
  }
  if (AppState.searchQuery) {
    filteredDeals = filteredDeals.filter(d => 
      d.title.toLowerCase().includes(AppState.searchQuery) || 
      d.shopName.toLowerCase().includes(AppState.searchQuery)
    );
  }

  // Sort by Distance
  filteredDeals.sort((a, b) => a.distance - b.distance);

  if (filteredDeals.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text3); padding: 40px;">No deals found matching your criteria.</div>`;
    return;
  }

  grid.innerHTML = filteredDeals.map(d => generateDealCard(d)).join('');
}

function generateDealCard(deal) {
  const isSaved = AppState.savedDeals.has(deal.id);
  
  return `
    <div class="deal-card ${deal.flash ? 'flash' : ''}" onclick="openDealModal(${deal.id})">
      <div class="deal-img">
        ${deal.emoji}
        <div class="deal-badge">-${deal.discount}%</div>
      </div>
      <div class="deal-body">
        <div class="deal-shop">${deal.shopName}</div>
        <div class="deal-title">${deal.title}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <span style="font-size: 11px; color: var(--text3);">📍 ${deal.distance}km away</span>
          <button style="background: none; border: none; font-size: 16px; cursor: pointer;" 
                  onclick="toggleBookmark(event, ${deal.id})">
            ${isSaved ? '🔖' : '🤍'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderBookmarks() {
  const grid = document.getElementById('bookmark-grid');
  const savedList = AppState.deals.filter(d => AppState.savedDeals.has(d.id));

  if (savedList.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text3); padding: 40px;">No saved deals yet.</div>`;
    return;
  }

  grid.innerHTML = savedList.map(d => generateDealCard(d)).join('');
}

// ==========================================
// USER ACTIONS
// ==========================================

function toggleBookmark(event, dealId) {
  event.stopPropagation(); 
  
  if (AppState.savedDeals.has(dealId)) {
    AppState.savedDeals.delete(dealId);
  } else {
    AppState.savedDeals.add(dealId);
  }
  
  if (document.getElementById('page-feed').classList.contains('active')) renderFeed();
  if (document.getElementById('page-bookmarks').classList.contains('active')) renderBookmarks();
}
