// ==========================================
// NEARDIS - BUSINESS DASHBOARD LOGIC
// ==========================================

const BusinessState = {
  activeTab: 'overview',
  stats: {
    views: 2847,
    redemptions: 312,
    rating: 4.7,
    activeDeals: 3
  },
  peakHours: [30, 20, 55, 75, 95, 88, 98, 82, 60, 42, 30, 18],
  peakLabels: ['8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p']
};

function initBusiness() {
  setBizTab('overview', document.querySelector('.biz-tab'));
}

function setBizTab(tab, element) {
  BusinessState.activeTab = tab;
  
  // Update Tab UI
  document.querySelectorAll('.biz-tab').forEach(t => t.classList.remove('active'));
  if (element) element.classList.add('active');
  
  const content = document.getElementById('biz-content');
  
  // Render View based on Tab
  switch(tab) {
    case 'overview':
      renderBizOverview(content);
      break;
    case 'deals':
      renderBizDeals(content);
      break;
    case 'analytics':
      renderBizAnalytics(content);
      break;
    case 'insights':
      content.innerHTML = `<div style="color: var(--text3); padding: 20px; text-align: center;">Competitor Insights loading...</div>`;
      break;
    case 'occupancy':
      renderBizOccupancy(content);
      break;
  }
}

function renderBizOverview(container) {
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 18px;">
      <div style="background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px;">
        <div style="font-size: 10px; color: var(--text3); text-transform: uppercase;">Total Views</div>
        <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #4d9fff;">${BusinessState.stats.views.toLocaleString()}</div>
        <div style="font-size: 10px; color: #2ecc71; margin-top: 3px;">↑ 23% this week</div>
      </div>
      <div style="background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px;">
        <div style="font-size: 10px; color: var(--text3); text-transform: uppercase;">Redemptions</div>
        <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #2ecc71;">${BusinessState.stats.redemptions}</div>
        <div style="font-size: 10px; color: #2ecc71; margin-top: 3px;">↑ 18% vs last week</div>
      </div>
      <div style="background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px;">
        <div style="font-size: 10px; color: var(--text3); text-transform: uppercase;">Avg Rating</div>
        <div style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px; color: #f59e0b;">${BusinessState.stats.rating}⭐</div>
      </div>
    </div>
    
    <div style="background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px;">
      <div style="font-size: 13px; font-weight: 600; margin-bottom: 3px;">Peak Activity Hours</div>
      <div style="font-size: 10px; color: var(--text3); margin-bottom: 10px;">When users engage with your deals</div>
      <div style="display: flex; align-items: flex-end; gap: 5px; height: 110px;" id="peak-chart"></div>
      <div style="display: flex; margin-top: 3px;" id="peak-labels"></div>
    </div>
  `;

  // Animate the chart
  setTimeout(() => {
    const maxVal = Math.max(...BusinessState.peakHours);
    const chart = document.getElementById('peak-chart');
    const labels = document.getElementById('peak-labels');
    
    if (chart) {
      chart.innerHTML = BusinessState.peakHours.map((val, i) => `
        <div style="flex: 1; border-radius: 3px 3px 0 0; background: ${val >= 88 ? 'var(--accent)' : 'var(--border2)'}; transition: height 0.5s ease-out; height: 0%;" 
             data-height="${(val / maxVal) * 100}%" title="${BusinessState.peakLabels[i]}: ${val}%">
        </div>
      `).join('');
      
      // Trigger animation
      setTimeout(() => {
        chart.querySelectorAll('div').forEach(bar => {
          bar.style.height = bar.getAttribute('data-height');
        });
      }, 50);
    }
    
    if (labels) {
      labels.innerHTML = BusinessState.peakLabels.map(l => `
        <div style="flex: 1; font-size: 9px; color: var(--text3); text-align: center;">${l}</div>
      `).join('');
    }
  }, 50);
}

function renderBizDeals(container) {
  // Pulls from the global AppState defined in app.js
  const myDeals = AppState.deals.slice(0, 2); 
  
  container.innerHTML = `
    <div style="font-size: 13px; font-weight: 600; margin-bottom: 10px;">Active Deals</div>
    ${myDeals.map(d => `
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius2); padding: 12px; margin-bottom: 8px; display: flex; gap: 10px; align-items: center;">
        <div style="font-size: 30px;">${d.emoji}</div>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 13px;">${d.title}</div>
          <div style="font-size: 10px; color: var(--text3); margin-top: 1px;">-${d.discount}%</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 10px; font-weight: 700; color: #000; background: var(--accent); padding: 3px 7px; border-radius: 12px; text-align: center;">LIVE</span>
          <button class="btn btn-ghost btn-sm">Edit</button>
        </div>
      </div>
    `).join('')}
    <button class="btn btn-primary" style="width: 100%; margin-top: 10px;">+ Post New Deal</button>
  `;
}

function renderBizOccupancy(container) {
  const options = [
    { id: 'opt1', l: 'Limited Stock', d: 'Show "Limited Stock!" badge', i: '📦', on: true },
    { id: 'opt2', l: 'Tables Available', d: 'Show remaining table count', i: '🪑', on: false },
    { id: 'opt3', l: 'Queue Short', d: 'Signal minimal wait time', i: '🚶', on: true }
  ];
  
  container.innerHTML = `
    <div style="font-size: 13px; font-weight: 600; margin-bottom: 4px;">Live Occupancy Signals</div>
    <div style="font-size: 12px; color: var(--text2); margin-bottom: 16px; line-height: 1.6;">These badges appear on your deal cards in real-time, alerting users to visit now.</div>
    
    ${options.map(o => `
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius2); padding: 12px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
        <div style="font-size: 22px;">${o.i}</div>
        <div style="flex: 1;">
          <div style="font-size: 12px; font-weight: 600;">${o.l}</div>
          <div style="font-size: 10px; color: var(--text3);">${o.d}</div>
        </div>
        <div style="cursor: pointer; width: 38px; height: 20px; border-radius: 10px; background: ${o.on ? 'var(--accent)' : 'var(--border)'}; position: relative; transition: background .2s;" onclick="this.style.background = this.style.background.includes('border') ? 'var(--accent)' : 'var(--border)'; const thumb = this.querySelector('div'); thumb.style.transform = thumb.style.transform ? '' : 'translateX(18px)';">
          <div style="width: 16px; height: 16px; border-radius: 50%; background: #000; position: absolute; top: 2px; left: 2px; transition: transform .2s; ${o.on ? 'transform: translateX(18px);' : ''}"></div>
        </div>
      </div>
    `).join('')}
  `;
}
