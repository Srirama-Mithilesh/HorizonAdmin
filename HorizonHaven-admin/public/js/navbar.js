// ---------------------------------------
// NAVBAR LOGIN HANDLING (same as dashboard)
// ---------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  setupAuthNavbar();
});

async function setupAuthNavbar() {
  const authArea = document.getElementById('auth-area');
  if (!authArea) return;

  const token = localStorage.getItem('token');
  if (!token) {
    // Not logged in → keep default "Log in / Sign up" button
    return;
  }

  try {
    const res = await fetch('/api/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      // Invalid/expired token → clear and show default guest state
      localStorage.removeItem('token');
      return;
    }

    const data = await res.json();
    const user = data.user || {};

    // Prefer: user_metadata.name, then email, then generic "User"
    const displayName =
      (user.user_metadata && user.user_metadata.name) ||
      user.email ||
      'User';

      // Replace old innerHTML with this:
      authArea.innerHTML = `
        <a href="listing.html">List your property</a>
        <span class="user-greeting" id="profileBtn">Hi, ${escapeHtml(displayName)}</span>
        <button class="login-btn" id="logoutBtn">Logout</button>
      `;

    const profileBtn = document.getElementById("profileBtn");
    if (profileBtn) {
      profileBtn.style.cursor = "pointer";
      profileBtn.addEventListener("click", () => {
        window.location.href = "user.html";  // redirect to profile page
      });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.reload();
      });
    }
  } catch (err) {
    console.error('Error loading profile for navbar:', err);
    localStorage.removeItem('token');
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
