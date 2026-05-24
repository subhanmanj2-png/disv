// ==========================================
// NEARDIS - DEAL MODAL LOGIC
// ==========================================

// This overrides the temporary alert function we put in app.js
function openDealModal(dealId) {
  const deal = AppState.deals.find(d => d.id === dealId);
  if (!deal) return;

  const modal = document.getElementById('deal-modal');
  const main = document.getElementById('modal-main');
  const side = document.getElementById('modal-side');
  
  const isSaved = AppState.savedDeals.has(deal.id);
  const savings = deal.originalPrice - deal.price;
  const worthItScore = Math.floor(deal.rating * 20); // Quick conversion of 4.8 to 96%
  
  main.innerHTML = `
    <div style="font-size: 72px; text-align: center; margin-bottom: 14px; background: var(--surface); border-radius: var(--radius); padding: 20px;">${deal.emoji}</div>
    <div style="font-size: 10px; color: var(--text3); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px;">${deal.shopName} · <span style="color: var(--text); font-weight: 600;">✓ Verified</span></div>
    <div style="font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 8px; line-height: 1.1;">${deal.title}</div>
    <div style="font-size: 13px; color: var(--text2); margin-bottom: 14px; line-height: 1.6;">${deal.description}</div>
    
    <div style="display: flex; gap: 10px; margin-bottom: 16px;">
      <div style="flex: 1; text-align: center; padding: 12px; background: var(--surface); border-radius: var(--radius2); border: 1px solid var(--border);">
        <div style="font-size: 36px; font-weight: 800; color: var(--accent);">-${deal.discount}%</div>
        <div style="font-size: 10px; color: var(--text3);">Discount</div>
      </div>
      <div style="flex: 1; text-align: center; padding: 12px; background: var(--surface); border-radius: var(--radius2); border: 1px solid var(--border);">
        <div style="text-decoration: line-through; font-size: 11px; color: var(--text3);">Rs ${deal.originalPrice.toLocaleString()}</div>
        <div style="font-size: 20px; font-weight: 700; color: var(--text);">Rs ${deal.price.toLocaleString()}</div>
        <div style="font-size: 10px; color: var(--text3);">Save Rs ${savings.toLocaleString()}</div>
      </div>
    </div>
    
    <div style="margin-bottom: 14px;">
      <div style="font-size: 10px; color: var(--text3); text-transform: uppercase; margin-bottom: 5px;">Community Verdict</div>
      <div style="height: 8px; border-radius: 4px; background: var(--border); overflow: hidden;">
        <div style="height: 100%; width: ${worthItScore}%; background: var(--text);"></div>
      </div>
      <div style="font-size: 11px; color: var(--text2); margin-top: 3px;">${worthItScore}% say "Worth it" · ⭐ ${deal.rating}</div>
    </div>
    
    <div style="display: flex; gap: 7px;">
      <button class="btn btn-primary" style="flex: 1;" onclick="alert('Routing to ${deal.shopName}...')">🗺️ Get Directions</button>
      <button class="btn btn-ghost" style="flex: 1;" onclick="toggleBookmark(event, ${deal.id}); openDealModal(${deal.id})">
        ${isSaved ? '🔖 Saved' : '🤍 Save Deal'}
      </button>
      ${deal.flash ? '<div style="display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; color: #000; background: var(--accent); padding: 0 10px; border-radius: 12px;">⚡ FLASH</div>' : ''}
    </div>
  `;
  
  side.innerHTML = `
    <div style="font-size: 11px; font-weight: 600; margin-bottom: 3px;">📍 Distance</div>
    <div style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">${deal.distance}km away</div>
    
    <div style="font-size: 11px; font-weight: 600; margin-bottom: 6px;">👀 User Sightings</div>
    <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius2); padding: 8px; margin-bottom: 7px; display: flex; gap: 8px;">
      <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--bg2); display: flex; align-items: center; justify-content: center; font-size: 12px;">✅</div>
      <div>
        <div style="font-size: 11px; color: var(--text2);">Confirmed active</div>
        <div style="font-size: 10px; color: var(--text3);">5 min ago</div>
      </div>
    </div>
    <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius2); padding: 8px; margin-bottom: 16px; display: flex; gap: 8px;">
      <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--bg2); display: flex; align-items: center; justify-content: center; font-size: 12px;">🚶</div>
      <div>
        <div style="font-size: 11px; color: var(--text2);">Queue is short</div>
        <div style="font-size: 10px; color: var(--text3);">25 min ago</div>
      </div>
    </div>
    
    <button class="btn btn-ghost" style="width: 100%; font-size: 11px;" onclick="alert('Sighting confirmed!')">+ Add Sighting</button>
  `;

  modal.style.display = 'flex';
}

function closeDealModal() {
  document.getElementById('deal-modal').style.display = 'none';
}

// Close when clicking outside the modal box
window.addEventListener('click', (e) => {
  const modal = document.getElementById('deal-modal');
  if (e.target === modal) {
    closeDealModal();
  }
});
