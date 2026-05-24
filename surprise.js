// ==========================================
// NEARDIS - SURPRISE ME LOGIC
// ==========================================

const SurpriseState = {
  history: []
};

// Initializes the Surprise page
function initSurprise() {
  renderSurpriseHistory();
  
  // Reset the UI state if the user navigates away and comes back
  document.getElementById('surp-emoji').textContent = '🎲';
  document.getElementById('surp-title').textContent = 'Ready for a discovery?';
  document.getElementById('surp-desc').textContent = 'Let us pick a highly-rated deal near you right now.';
  document.getElementById('surp-info').style.display = 'none';
}

// The core algorithm to pick a deal
function rollSurprise() {
  // 1. Filter the global deals for high quality & close proximity
  // (Assuming < 1km distance and rating >= 4.0)
  const eligibleDeals = AppState.deals.filter(d => d.distance <= 1.0 && d.rating >= 4.0);
  
  if (eligibleDeals.length === 0) {
    document.getElementById('surp-title').textContent = 'No deals match right now';
    document.getElementById('surp-desc').textContent = 'Expand your search radius or try again later.';
    return;
  }

  // 2. Pick a random deal from the eligible pool
  const randomIndex = Math.floor(Math.random() * eligibleDeals.length);
  const pick = eligibleDeals[randomIndex];
  
  // 3. Update the UI
  document.getElementById('surp-emoji').textContent = pick.emoji;
  document.getElementById('surp-title').textContent = pick.title;
  document.getElementById('surp-desc').textContent = `📍 ${pick.distance}km away · ⭐ ${pick.rating}`;
  
  const infoContainer = document.getElementById('surp-info');
  infoContainer.style.display = 'block';
  infoContainer.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
      <div style="font-size:36px;">${pick.emoji}</div>
      <div>
        <div style="font-weight:700;">${pick.shopName}</div>
        <div style="font-size:11px; color:#4d9fff; font-weight:600;">✓ Verified</div>
      </div>
      <div style="margin-left:auto; font-size:26px; font-weight:800; color:var(--accent);">-${pick.discount}%</div>
    </div>
    <div style="font-size:12px; color:var(--text2); margin-bottom:14px; line-height:1.5;">${pick.description}</div>
    <div style="display:flex; gap:6px;">
      <button class="btn btn-primary" style="flex: 1;" onclick="openDealModal(${pick.id})">View Deal</button>
      <button class="btn btn-ghost" style="flex: 1;">Directions 🗺️</button>
    </div>
  `;

  // 4. Save to history (keep only the last 5)
  SurpriseState.history.unshift({
    emoji: pick.emoji,
    shop: pick.shopName,
    title: pick.title,
    time: 'Just now'
  });
  if (SurpriseState.history.length > 5) SurpriseState.history.pop();
  
  renderSurpriseHistory();
}

function renderSurpriseHistory() {
  const container = document.getElementById('surp-history');
  if (!container) return;
  
  if (SurpriseState.history.length === 0) {
    container.innerHTML = `<div style="color: var(--text3); font-size: 12px;">No past surprises yet.</div>`;
    return;
  }
  
  container.innerHTML = SurpriseState.history.map(s => `
    <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius2); padding: 10px; display: flex; gap: 8px; margin-bottom: 7px; align-items: center;">
      <div style="font-size: 26px; flex-shrink: 0;">${s.emoji}</div>
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 10px; color: var(--text3);">${s.time}</div>
        <div style="font-size: 12px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.shop}</div>
        <div style="font-size: 10px; color: var(--text2); margin-top: 1px;">${s.title}</div>
      </div>
    </div>
  `).join('');
}
