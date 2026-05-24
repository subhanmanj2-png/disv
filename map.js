// ==========================================
// NEARDIS - REAL INTERACTIVE MAP LOGIC
// ==========================================

let mapInstance = null;
let dealMarkers = [];

// Initialize Map (Called when the Map tab is opened)
function initMap() {
  // Prevent re-initializing if it already exists
  if (mapInstance !== null) {
    mapInstance.invalidateSize(); // Fixes rendering glitch if map loaded while hidden
    return;
  }

  // 1. Create the Map (Centered on Lahore based on our JSON data)
  // Coordinates: [Latitude, Longitude], Zoom Level
  mapInstance = L.map('real-map-container').setView([31.5204, 74.3587], 15);

  // 2. Add Real Map Tiles (OpenStreetMap - Free & No API Key required)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
    className: 'map-tiles-dark' // Custom class for dark mode filtering (added in CSS later)
  }).addTo(mapInstance);

  // 3. Add User Location Marker (Simulated based on our dataset)
  const userIcon = L.divIcon({
    className: 'custom-user-marker',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:var(--blue, #4d9fff);border:3px solid #fff;box-shadow:0 0 0 6px rgba(77,159,255,.3);"></div>`,
    iconSize: [22, 22]
  });
  L.marker([31.5204, 74.3587], { icon: userIcon }).addTo(mapInstance)
   .bindPopup('<b>You are here</b>');

  // 4. Plot the Deals
  renderMapMarkers();
}

function renderMapMarkers() {
  // Clear existing markers if re-rendering
  dealMarkers.forEach(marker => mapInstance.removeLayer(marker));
  dealMarkers = [];

  // Loop through our live database
  AppState.deals.forEach(deal => {
    if (!deal.coordinates) return;

    // Create a custom HTML marker for the deal
    const dealIcon = L.divIcon({
      className: 'custom-deal-marker',
      html: `
        <div style="background:var(--accent); color:#000; font-weight:700; font-size:10px; padding:3px 7px; border-radius:5px 5px 5px 0; box-shadow:0 2px 8px rgba(255,255,255,0.2); white-space:nowrap;">
          -${deal.discount}%
        </div>
        <div style="width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid var(--accent); margin-left:2px;"></div>
      `,
      iconSize: [40, 40],
      iconAnchor: [0, 15] // Points the bottom of the arrow at the exact GPS coordinate
    });

    // Add marker to map
    const marker = L.marker([deal.coordinates.lat, deal.coordinates.lng], { icon: dealIcon }).addTo(mapInstance);
    
    // Add interactive popup
    marker.bindPopup(`
      <div style="font-family:'Space Grotesk',sans-serif; color:#000; padding:4px;">
        <div style="font-size:24px; margin-bottom:4px;">${deal.emoji}</div>
        <strong style="font-size:14px; display:block;">${deal.shopName}</strong>
        <span style="font-size:12px; color:#555;">${deal.title}</span><br>
        <button style="margin-top:8px; background:#000; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; width:100%;" onclick="openDealModal(${deal.id})">View Deal</button>
      </div>
    `);

    dealMarkers.push(marker);
  });
}
