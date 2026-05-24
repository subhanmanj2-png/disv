// ==========================================
// NEARDIS - SHOP VERIFICATION LOGIC
// ==========================================

let verifyStep = 0;

function initVerify() {
  verifyStep = 0; 
  renderVerify();
}

function renderVerify() {
  const steps = ['Business Info', 'Address', 'Upload ID', 'Done'];
  
  const progressHTML = steps.map((_, i) => `
    <div style="flex: 1; height: 3px; border-radius: 2px; background: ${i < verifyStep ? '#2ecc71' : i === verifyStep ? 'var(--accent)' : 'var(--border)'};"></div>
  `).join('');
  
  document.getElementById('verify-steps').innerHTML = `<div style="display: flex; gap: 6px; margin-bottom: 20px;">${progressHTML}</div>`;

  const container = document.getElementById('verify-content');
  
  if (verifyStep === 0) {
    container.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px;">
        <div style="font-size: 14px; font-weight: 700; margin-bottom: 14px;">Step 1: Business Information</div>
        <div style="margin-bottom: 14px;"><label style="font-size: 10px; color: var(--text3); display: block; margin-bottom: 5px;">Business Name</label><input type="text" placeholder="Your shop name" style="width: 100%; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 9px 12px; border-radius: var(--radius2); outline: none;"></div>
        <div style="margin-bottom: 14px;"><label style="font-size: 10px; color: var(--text3); display: block; margin-bottom: 5px;">Owner Name</label><input type="text" placeholder="Full name" style="width: 100%; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 9px 12px; border-radius: var(--radius2); outline: none;"></div>
        <button class="btn btn-primary" onclick="verifyStep=1; renderVerify()">Next: Address ➔</button>
      </div>`;
  } else if (verifyStep === 1) {
    container.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px;">
        <div style="font-size: 14px; font-weight: 700; margin-bottom: 14px;">Step 2: Verify Address</div>
        <div style="margin-bottom: 14px;"><label style="font-size: 10px; color: var(--text3); display: block; margin-bottom: 5px;">Street Address</label><input type="text" placeholder="14-A, MM Alam Road" style="width: 100%; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 9px 12px; border-radius: var(--radius2); outline: none;"></div>
        <div style="background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius2); height: 140px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; cursor: pointer; font-size: 12px; color: var(--text3);">📍 Click to pin exact location on map</div>
        <div style="display: flex; gap: 7px;">
          <button class="btn btn-ghost" onclick="verifyStep=0; renderVerify()">← Back</button>
          <button class="btn btn-primary" onclick="verifyStep=2; renderVerify()">Next: Upload ID ➔</button>
        </div>
      </div>`;
  } else if (verifyStep === 2) {
    container.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px;">
        <div style="font-size: 14px; font-weight: 700; margin-bottom: 14px;">Step 3: Identity Verification</div>
        <div style="border: 2px dashed var(--border); border-radius: var(--radius2); padding: 20px; text-align: center; cursor: pointer; margin-bottom: 10px; transition: border-color .2s;" onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--border)'">
          <div style="font-size: 20px; margin-bottom: 3px;">🪪</div>
          <div style="font-size: 12px; font-weight: 600;">CNIC / ID Proof</div>
          <div style="font-size: 10px; color: var(--text3);">Clear photo of owner's identity card</div>
        </div>
        <div style="display: flex; gap: 7px; margin-top: 10px;">
          <button class="btn btn-ghost" onclick="verifyStep=1; renderVerify()">← Back</button>
          <button class="btn btn-primary" onclick="verifyStep=3; renderVerify()">Submit ID ✓</button>
        </div>
      </div>`;
  } else {
    container.innerHTML = `
      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); text-align: center; padding: 32px;">
        <div style="font-size: 52px; margin-bottom: 14px;">⏳</div>
        <div style="font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; margin-bottom: 6px;">ID Submitted!</div>
        <div style="font-size: 13px; color: var(--text2); max-width: 380px; margin: 0 auto 16px; line-height: 1.6;">Our team will review your ID card and verify your address within 24 hours.</div>
        <div style="font-size: 13px; color: #4d9fff; font-weight: 600; justify-content: center; margin-bottom: 16px;">✓ Verification Pending</div>
        <button class="btn btn-ghost" onclick="verifyStep=0; renderVerify()">Start Over</button>
      </div>`;
  }
}
