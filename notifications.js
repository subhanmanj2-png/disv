// ==========================================
// NEARDIS - NOTIFICATIONS LOGIC
// ==========================================

const NotifState = {
  activeTab: 'all',
  alerts: [
    { id: 1, type: 'deals', icon: '🔥', bg: 'rgba(255,255,255,.1)', title: 'Flash Deal Alert', desc: 'Café Zest just dropped 50% off all beverages — 200m from you!', time: '2 min ago', read: false },
    { id: 2, type: 'expiry', icon: '⏳', bg: 'rgba(245,158,11,.15)', title: 'Saved Deal Expiring', desc: 'Your bookmarked "GlowUp Facial Combo" expires in 2 hours.', time: '30 min ago', read: false },
    { id: 3, type: 'sightings', icon: '👀', bg: 'rgba(46,204,113,.15)', title: 'Sighting Confirmed', desc: '3 users confirmed Burger Bros deal is still active & in stock.', time: '1 hr ago', read: false },
    { id: 4, type: 'route', icon: '🛣️', bg: 'rgba(168,85,247,.15)', title: 'Route Alert', desc: 'Sushi Maru has a flash lunch deal along your morning commute.', time: '3 hr ago', read: true }
  ]
};

function initNotifications() {
  renderNotifs();
}

function setNotifTab(tab, element) {
  NotifState.activeTab = tab;
  
  // Update Tab UI
  document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
  if (element) element.classList.add('active');
  
  renderNotifs();
}

function renderNotifs() {
  const container = document.getElementById('notif-list');
  if (!container) return;

  let filteredAlerts = NotifState.alerts;
  if (NotifState.activeTab !== 'all') {
    filteredAlerts = filteredAlerts.filter(n => n.type === NotifState.activeTab);
  }

  if (filteredAlerts.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text3); padding: 40px;">No alerts in this category.</div>`;
    return;
  }

  container.innerHTML = filteredAlerts.map(n => `
    <div style="display: flex; gap: 10px; padding: 12px 14px; border-bottom: 1px solid var(--border); cursor: pointer; background: ${n.read ? 'transparent' : 'rgba(255, 255, 255, 0.03)'};" onclick="markRead(${n.id})">
      <div style="width: 38px; height: 38px; border-radius: 50%; background: ${n.bg}; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0;">
        ${n.icon}
      </div>
      <div style="flex: 1;">
        <div style="font-size: 12px; font-weight: 600; margin-bottom: 2px;">${n.title}</div>
        <div style="font-size: 11px; color: var(--text2); line-height: 1.4;">${n.desc}</div>
        <div style="font-size: 10px; color: var(--text3); margin-top: 3px;">${n.time}</div>
      </div>
      ${n.read ? '' : `<div style="width: 7px; height: 7px; border-radius: 50%; background: var(--accent); flex-shrink: 0; margin-top: 4px;"></div>`}
    </div>
  `).join('');
  
  updateBadge();
}

function markRead(id) {
  const alert = NotifState.alerts.find(n => n.id === id);
  if (alert) {
    alert.read = true;
    renderNotifs();
  }
}

function markAllRead() {
  NotifState.alerts.forEach(n => n.read = true);
  renderNotifs();
}

function updateBadge() {
  const unreadCount = NotifState.alerts.filter(n => !n.read).length;
  const badge = document.getElementById('nav-notif-badge');
  if (badge) {
    badge.style.display = unreadCount > 0 ? 'block' : 'none';
  }
}
