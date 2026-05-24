// ==========================================
// NEARDIS - AUTHENTICATION LOGIC
// ==========================================

let isLoginMode = true;

function initAuth() {
  renderAuthForm();
  // Hide the sidebar when on the auth page to make it feel like a true landing screen
  document.querySelector('.sidebar').style.display = 'none';
}

function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  renderAuthForm();
}

function renderAuthForm() {
  const container = document.getElementById('auth-content');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; margin-bottom: 8px;">Neardis</div>
      <div style="font-size: 13px; color: var(--text2);">Hyperlocal deal discovery</div>
    </div>

    <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px;">
      <div style="font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 20px; text-align: center;">
        ${isLoginMode ? 'Welcome Back' : 'Create Account'}
      </div>

      <form onsubmit="handleAuth(event)">
        ${!isLoginMode ? `
          <div style="margin-bottom: 14px;">
            <label style="font-size: 10px; color: var(--text3); display: block; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Full Name</label>
            <input type="text" id="auth-name" placeholder="Your name" required style="width: 100%; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 10px 14px; border-radius: var(--radius2); outline: none; font-family: inherit;">
          </div>
        ` : ''}

        <div style="margin-bottom: 14px;">
          <label style="font-size: 10px; color: var(--text3); display: block; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</label>
          <input type="email" id="auth-email" placeholder="you@example.com" required style="width: 100%; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 10px 14px; border-radius: var(--radius2); outline: none; font-family: inherit;">
        </div>

        <div style="margin-bottom: 24px;">
          <label style="font-size: 10px; color: var(--text3); display: block; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Password</label>
          <input type="password" id="auth-password" placeholder="••••••••" required style="width: 100%; background: var(--bg2); border: 1px solid var(--border); color: var(--text); padding: 10px 14px; border-radius: var(--radius2); outline: none; font-family: inherit;">
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-size: 14px;">
          ${isLoginMode ? 'Sign In ➔' : 'Create Account ➔'}
        </button>
      </form>

      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: var(--text3);">
        ${isLoginMode ? "Don't have an account?" : "Already have an account?"} 
        <span style="color: var(--text); font-weight: 600; cursor: pointer;" onclick="toggleAuthMode()">
          ${isLoginMode ? 'Sign up' : 'Log in'}
        </span>
      </div>
    </div>
  `;
}

function handleAuth(event) {
  event.preventDefault(); // Prevent page reload
  
  // 1. Extract data (In the future, send this to Firebase/Supabase)
  const email = document.getElementById('auth-email').value;
  const nameInput = document.getElementById('auth-name');
  const name = nameInput ? nameInput.value : "Subhan Manj"; 
  
  // 2. Generate Initials
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  // 3. Update Global AppState
  AppState.user = {
    name: name,
    email: email,
    initials: initials
  };

  // 4. Update UI avatars
  const topbarAvatar = document.getElementById('topbar-avatar');
  const profileAvatar = document.getElementById('profile-avatar');
  const profileName = document.getElementById('profile-name');

  if (topbarAvatar) topbarAvatar.textContent = AppState.user.initials;
  if (profileAvatar) profileAvatar.textContent = AppState.user.initials;
  if (profileName) profileName.textContent = AppState.user.name;

  // 5. Restore Sidebar & Navigate to Feed
  document.querySelector('.sidebar').style.display = 'flex';
  showPage('feed');
}
