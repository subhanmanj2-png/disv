// ==========================================
// NEARDIS - ROUTE ALERTS LOGIC
// ==========================================

const RouteState = {
  routes: [
    { id: 1, from: 'Gulberg III', to: 'Liberty Market', active: true, radius: 400 },
    { id: 2, from: 'Gulberg III', to: 'DHA Phase 5', active: false, radius: 600 }
  ]
};

function initRoute() {
  renderRoutesList();
  renderRouteDeals();
}

function renderRoutesList() {
  const container = document.getElementById('routes-list');
  if (!container) return;

  if (RouteState.routes.length === 0) {
    container.innerHTML = `<div style="font-size: 12px; color: var(--text3);">No routes configured.</div>`;
    return;
  }

  container.innerHTML = RouteState.routes.map(r => `
    <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius2); padding: 12px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: 600;">${r.from} ➔ ${r.to}</div>
        <div style="font-size: 10px; color: var(--text3); margin-top: 2px;">Alert radius: ${r.radius}m</div>
      </div>
      <div style="cursor: pointer; width: 38px; height: 20px; border-radius: 10px; background: ${r.active ? 'var(--accent)' : 'var(--border)'}; position: relative; transition: background .2s;" onclick="toggleRoute(${r.id})">
        <div style="width: 16px; height: 16px; border-radius: 50%; background: #000; position: absolute; top: 2px; left: 2px; transition: transform .2s; ${r.active ? 'transform: translateX(18px);' : ''}"></div>
      </div>
    </div>
  `).join('');
}

function renderRouteDeals() {
  const container = document.getElementById('route-deals');
  if (!container) return;

  // Simulate finding deals along the active routes from the global AppState
  const activeRoutes = RouteState.routes.filter(r => r.active);
  
  if (activeRoutes.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text3); padding: 40px;">Activate a route to see deals along your commute.</div>`;
    return;
  }

  // Pull top 4 deals as a simulation of path-intersection logic
  const pathDeals = AppState.deals.slice(0, 4);

  container.innerHTML = pathDeals.map(d => `
    <div class="deal-card" onclick="openDealModal(${d.id})">
      <div class="deal-img">
        ${d.emoji}
        <div class="deal-badge">-${d.discount}%</div>
      </div>
      <div class="deal-body">
        <div class="deal-shop">${d.shopName}</div>
        <div class="deal-title">${d.title}</div>
        <div style="margin-top: 6px; font-size: 10px; color: #4d9fff; font-weight: 600;">On your morning route</div>
      </div>
    </div>
  `).join('');
}

function toggleRoute(routeId) {
  const route = RouteState.routes.find(r => r.id === routeId);
  if (route) {
    route.active = !route.active;
    renderRoutesList();
    renderRouteDeals();
  }
}
