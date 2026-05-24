// ==========================================
// NEARDIS - AUTHENTICATION LOGIC
// ==========================================

let isLoginMode = true;

function initAuth() {
  renderAuthForm();
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

      <button class="btn btn-ghost" style="width: 100%; padding: 10px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="handleSSO('Google')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Continue with Google
      </button>
      
      <button class="btn btn-ghost" style="width: 100%; padding: 10px; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="handleSSO('Apple')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.7 3.59-.79 1.8-.13 3.23.63 4.12 1.95-3.52 2.06-2.92 6.64.47 8.01-.84 1.25-1.74 2.22-3.26 2.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
        Continue with Apple
      </button>

      <div style="display: flex; align-items: center; text-align: center; color: var(--text3); font-size: 10px; margin-bottom: 20px;">
        <div style="flex: 1; height: 1px; background: var(--border);"></div>
        <span style="padding: 0 10px; text-transform: uppercase; letter-spacing: 1px;">Or</span>
        <div style="flex: 1; height: 1px; background: var(--border);"></div>
      </div>

      <form onsubmit="handleAuth(event, 'email')">
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

function handleSSO(provider) {
  // Simulate SSO login
  processLogin("Subhan Manj", `user@${provider.toLowerCase()}.com`);
}

function handleAuth(event, method) {
  event.preventDefault(); 
  const email = document.getElementById('auth-email').value;
  const nameInput = document.getElementById('auth-name');
  const name = nameInput ? nameInput.value : "Subhan Manj"; 
  
  processLogin(name, email);
}

function processLogin(name, email) {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  AppState.user = {
    name: name,
    email: email,
    initials: initials
  };

  const topbarAvatar = document.getElementById('topbar-avatar');
  const profileAvatar = document.getElementById('profile-avatar');
  const profileName = document.getElementById('profile-name');

  if (topbarAvatar) topbarAvatar.textContent = AppState.user.initials;
  if (profileAvatar) profileAvatar.textContent = AppState.user.initials;
  if (profileName) profileName.textContent = AppState.user.name;

  document.querySelector('.sidebar').style.display = 'flex';
  showPage('feed');
}
