// ==========================================
// NEARDIS - CORE APPLICATION LOGIC
// ==========================================

// GitHub Raw URL (Replace with your actual URL once hosted)
const GITHUB_DATA_URL = 'https://raw.githubusercontent.com/username/repo/main/neardis-deals.json'; 

// Application State
const AppState = {
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
  try {
    const response = await fetch(GITHUB_DATA_URL);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    AppState.deals = data;
    
    renderFeed();
  } catch (error) {
    console.error("Failed to load deals:", error);
    document.getElementById('deal-grid').innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text3); padding: 40px;">
        ⚠️ Error connecting to the deal database. Check your network or GitHub URL.
      </div>
    `;
  }
}

// ==========================================
// EVENT LISTENERS & NAVIGATION
// ==========================================

function setupEventListeners() {
  // Search Bar
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      AppState.searchQuery = e.target.value.toLowerCase();
      renderFeed();
    });
  }
}

function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show target page
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) targetPage.classList.add('active');
  
  // Update Navigation Active State
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('onclick').includes(pageId)) {
      btn.classList.add('active');
    }
  });

  // Re-render specific page content if needed
  if (pageId === 'bookmarks') renderBookmarks();
}

// ==========================================
// FILTERING LOGIC
// ==========================================

function setCategory(category, element) {
  AppState.activeCategory = category;
  
  // Update visual chips (assumes you add IDs to your HTML chips later)
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
  let filteredDeals = [...AppState.deals];

  // Apply Category Filter
  if (AppState.activeCategory !== 'all') {
    filteredDeals = filteredDeals.filter(d => d.category === AppState.activeCategory);
  }

  // Apply Flash Filter
  if (AppState.flashFilter) {
    filteredDeals = filteredDeals.filter(d => d.flash === true);
  }

  // Apply Search Filter
  if (AppState.searchQuery) {
    filteredDeals = filteredDeals.filter(d => 
      d.title.toLowerCase().includes(AppState.searchQuery) || 
      d.shopName.toLowerCase().includes(AppState.searchQuery)
    );
  }

  // Sort by Distance
  filteredDeals.sort((a, b) => a.distance - b.distance);

  // Render HTML
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

// ==========================================
// USER ACTIONS
// ==========================================

function toggleBookmark(event, dealId) {
  event.stopPropagation(); // Prevent opening the modal when clicking the save button
  
  if (AppState.savedDeals.has(dealId)) {
    AppState.savedDeals.delete(dealId);
  } else {
    AppState.savedDeals.add(dealId);
  }
  
  // Re-render feed to update icon states
  renderFeed();
}

function openDealModal(dealId) {
  const deal = AppState.deals.find(d => d.id === dealId);
  if (deal) {
    alert(`Viewing details for: ${deal.title}\nOriginal Price: ${deal.originalPrice}\nDeal Price: ${deal.price}`);
    // Future implementation: populate and show a proper custom modal
  }
}
