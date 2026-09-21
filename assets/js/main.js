document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  checkAuthState();
  initHeroSearch();
});

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const isOpen = navLinks.classList.contains('active');
    toggleBtn.innerHTML = isOpen ? '✕' : '☰';
  });

  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target) && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      toggleBtn.innerHTML = '☰';
    }
  });
}

const Auth = {
  getUser: () => {
    try {
      const user = localStorage.getItem('trip_planner_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setUser: (userData) => {
    localStorage.setItem('trip_planner_user', JSON.stringify(userData));
    checkAuthState();
  },

  logout: async () => {
    try {
      await fetch('api/auth.php?action=logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('trip_planner_user');
    showToast('Đã đăng xuất!', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  },

  isLoggedIn: () => {
    return Auth.getUser() !== null;
  }
};

async function requireLogin(redirectTo = 'login.html') {
  try {
    const res = await fetch('api/auth.php?action=me');
    if (res.ok) {
      const data = await res.json();
      if (data.isLoggedIn) return true;
      showToast('Vui lòng đăng nhập trước!', 'error');
      setTimeout(() => { window.location.href = redirectTo; }, 900);
      return false;
    }
  } catch (e) {}

  if (Auth.isLoggedIn()) return true;

  showToast('Vui lòng đăng nhập trước!', 'error');
  setTimeout(() => { window.location.href = redirectTo; }, 900);
  return false;
}

async function requireAdminPage(redirectTo = 'index.html') {
  try {
    const res = await fetch('api/auth.php?action=me');
    if (res.ok) {
      const data = await res.json();
      if (data.isLoggedIn && data.user && data.user.role === 'admin') return true;
    }
  } catch (e) {}

  showToast('Bạn không có quyền vào trang này!', 'error');
  setTimeout(() => { window.location.href = redirectTo; }, 900);
  return false;
}

function checkAuthState() {
  const user = Auth.getUser();
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  if (user) {
    const isAdmin = user.role === 'admin';
    navActions.innerHTML = `
      ${isAdmin ? `<a href="admin.html" class="btn btn-outline btn-sm" style="border-color: var(--accent); color: var(--accent);" title="Trang Quản Trị">🛠️ Quản Trị</a>` : ''}
      <a href="profile.html" class="user-menu-btn" title="Hồ sơ cá nhân">
        <div class="user-avatar">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
        <span>${user.name || 'Người dùng'}</span>
      </a>
      <button class="btn btn-outline btn-sm" onclick="Auth.logout()">Đăng xuất</button>
    `;
  } else {
    navActions.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm">Đăng nhập</a>
      <a href="register.html" class="btn btn-primary btn-sm">Đăng ký</a>
    `;
  }
}

function showToast(message, type = 'info', duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';

  toast.innerHTML = `
    <span>${icon}</span>
    <span style="flex: 1;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.innerText = (str === null || str === undefined) ? '' : str;
  return div.innerHTML;
}

function initHeroSearch() {
  const searchForm = document.getElementById('heroSearchForm');
  if (!searchForm) return;

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const destinationInput = document.getElementById('heroDestinationInput');
    const budgetInput = document.getElementById('heroBudgetSelect');
    
    const dest = destinationInput ? destinationInput.value.trim() : '';
    const budget = budgetInput ? budgetInput.value : '';

    let url = 'destinations.html';
    const params = new URLSearchParams();
    if (dest) params.append('search', dest);
    if (budget) params.append('budget', budget);

    if (params.toString()) {
      url += '?' + params.toString();
    }
    window.location.href = url;
  });
}

window.showToast = showToast;
window.formatVND = formatVND;
window.escapeHtml = escapeHtml;
window.Auth = Auth;
window.requireLogin = requireLogin;
window.requireAdminPage = requireAdminPage;