
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initMobileNav();
  checkAuthState();
  initHeroSearch();
});

/* --- 1. STICKY HEADER EFFECT --- */
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

/* --- 2. MOBILE NAVIGATION TOGGLE --- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const isOpen = navLinks.classList.contains('active');
    toggleBtn.innerHTML = isOpen ? '✕' : '☰';
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target) && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
      toggleBtn.innerHTML = '☰';
    }
  });
}

/* --- 3. AUTH STATE MANAGEMENT (LOCALSTORAGE) --- */
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
    showToast('Đã đăng xuất thành công!', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  },

  isLoggedIn: () => {
    return Auth.getUser() !== null;
  }
};

/**
 * Dùng cho các trang PRIVATE (bắt buộc đăng nhập mới xem được, ví dụ itinerary.html).
 * Kiểm tra session thật với server trước (đáng tin cậy nhất), nếu server không phản hồi
 * mới rớt xuống kiểm tra localStorage tạm thời. Nếu cả 2 đều không có -> đá về login.html.
 * Cách dùng: đặt `if (!(await requireLogin())) return;` ở đầu DOMContentLoaded.
 */
async function requireLogin(redirectTo = 'login.html') {
  try {
    const res = await fetch('api/auth.php?action=me');
    if (res.ok) {
      const data = await res.json();
      if (data.isLoggedIn) return true;
      // Server xác nhận rõ ràng là CHƯA đăng nhập -> chặn luôn, không cần rớt xuống local nữa
      showToast('Vui lòng đăng nhập để truy cập trang này!', 'error');
      setTimeout(() => { window.location.href = redirectTo; }, 900);
      return false;
    }
  } catch (e) {}

  // Server không phản hồi được (mất mạng/DB lỗi) -> tạm chấp nhận session lưu cục bộ
  if (Auth.isLoggedIn()) return true;

  showToast('Vui lòng đăng nhập để truy cập trang này!', 'error');
  setTimeout(() => { window.location.href = redirectTo; }, 900);
  return false;
}

/**
 * Dùng riêng cho trang admin.html. Kiểm tra CHẶT hơn requireLogin():
 * phải vừa đăng nhập, vừa có role = admin, mới được vào.
 * Vì đây là trang có dữ liệu nhạy cảm (quản lý user, xóa dữ liệu...), nếu server
 * không phản hồi được thì CHẶN LUÔN chứ không rớt xuống localStorage như requireLogin()
 * (localStorage dễ bị người dùng tự sửa tay để giả làm admin).
 */
async function requireAdminPage(redirectTo = 'index.html') {
  try {
    const res = await fetch('api/auth.php?action=me');
    if (res.ok) {
      const data = await res.json();
      if (data.isLoggedIn && data.user && data.user.role === 'admin') return true;
    }
  } catch (e) {}

  showToast('Bạn không có quyền truy cập trang này!', 'error');
  setTimeout(() => { window.location.href = redirectTo; }, 900);
  return false;
}

function checkAuthState() {
  const user = Auth.getUser();
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  if (user) {
    // Render logged in UI
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
    // Render guest UI
    navActions.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm">Đăng nhập</a>
      <a href="register.html" class="btn btn-primary btn-sm">Đăng ký</a>
    `;
  }
}

/* --- 4. TOAST NOTIFICATION UTILITY --- */
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

/* --- 5. FORMAT UTILITIES --- */
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

/**
 * Chống XSS: dùng hàm này bọc quanh MỌI nội dung do người dùng tự nhập
 * (tên chuyến đi, khoản chi tiêu, checklist, đánh giá, hoạt động tùy chỉnh...)
 * trước khi chèn vào trang bằng innerHTML/template string.
 */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.innerText = (str === null || str === undefined) ? '' : str;
  return div.innerHTML;
}

/* --- 6. HERO SEARCH BAR HANDLER --- */
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

// Make helper functions globally accessible
window.showToast = showToast;
window.formatVND = formatVND;
window.escapeHtml = escapeHtml;
window.Auth = Auth;
window.requireLogin = requireLogin;
window.requireAdminPage = requireAdminPage;
