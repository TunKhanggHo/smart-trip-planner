/**
 * ==============================================================================
 * DỰ ÁN: SMART TRIP PLANNER (LÊN LỊCH ĐI TRỐN)
 * FILE: assets/js/admin.js
 * ==============================================================================
 * Trang Quản Trị (admin.html) - CHỈ DÀNH CHO TÀI KHOẢN CÓ role = admin.
 * Lưu ý bảo mật: mọi hành động ở đây đều được backend kiểm tra lại bằng
 * requireAdmin() (api/*.php) — giao diện chỉ ẩn nút cho gọn, không phải lớp
 * bảo mật thật. Không được bỏ qua kiểm tra ở backend dù đã gate ở đây.
 */

let currentAdminId = null; // ID của chính admin đang đăng nhập (để tự chặn tự khóa mình)

document.addEventListener('DOMContentLoaded', async () => {
  const allowed = await requireAdminPage();
  if (!allowed) return;

  // Lấy ID admin hiện tại để so sánh khi hiển thị nút Khóa/Mở user
  try {
    const res = await fetch('api/auth.php?action=me');
    if (res.ok) {
      const data = await res.json();
      if (data.isLoggedIn && data.user) currentAdminId = data.user.id;
    }
  } catch (e) {}

  initAdminTabs();
  await loadStats();
  await loadCategoriesIntoForm();
  await loadDestinations();
  await loadUsers();
  await loadReviewDestinationSelect();
  initDestinationForm();
});

/* --- 1. TAB NAVIGATION --- */
function initAdminTabs() {
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.style.display = 'none');
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.target);
      if (target) target.style.display = 'block';
    });
  });
}

/* --- 2. TAB THỐNG KÊ --- */
async function loadStats() {
  try {
    const res = await fetch('api/admin_stats.php');
    if (!res.ok) return;
    const json = await res.json();
    if (json.status !== 'success') return;

    const s = json.data;
    document.getElementById('statTotalUsers').innerText = s.totalUsers;
    document.getElementById('statTotalDestinations').innerText = s.totalDestinations;
    document.getElementById('statTotalTrips').innerText = s.totalTrips;
    document.getElementById('statTotalReviews').innerText = s.totalReviews;

    const tbody = document.getElementById('topDestinationsBody');
    tbody.innerHTML = s.topDestinations.map(d => `
      <tr>
        <td style="font-weight: 600;">${escapeHtml(d.name)}</td>
        <td>${escapeHtml(d.city)}</td>
        <td>⭐ ${d.rating}</td>
        <td>${d.real_review_count}</td>
      </tr>
    `).join('');
  } catch (e) {
    showToast('Không thể tải dữ liệu thống kê!', 'error');
  }
}

/* --- 3. TAB QUẢN LÝ ĐIỂM ĐẾN --- */
let categoriesCache = [];

async function loadCategoriesIntoForm() {
  try {
    const res = await fetch('api/destinations.php?action=categories');
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success') categoriesCache = json.data;
    }
  } catch (e) {}

  const select = document.getElementById('destFormCategory');
  select.innerHTML = categoriesCache.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}

async function loadDestinations() {
  const tbody = document.getElementById('destinationsTableBody');
  try {
    const res = await fetch('api/destinations.php?action=list');
    const json = await res.json();
    if (json.status !== 'success') return;

    window._allDestinationsCache = json.data; // dùng lại cho edit modal & dropdown review

    tbody.innerHTML = json.data.map(d => `
      <tr>
        <td style="font-family: monospace; font-size: 0.85rem;">${escapeHtml(d.id)}</td>
        <td style="font-weight: 600;">${escapeHtml(d.name)}</td>
        <td>${escapeHtml(d.city)}</td>
        <td>${formatVND(d.avg_cost_per_day)}</td>
        <td>⭐ ${d.rating}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="openDestinationModal('${d.id}')">✏️ Sửa</button>
          <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: #fecaca;" onclick="deleteDestination('${d.id}', '${escapeHtml(d.name).replace(/'/g, "\\'")}')">✕ Xóa</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    showToast('Không thể tải danh sách điểm đến!', 'error');
  }
}

window.openDestinationModal = (destId = null) => {
  const modal = document.getElementById('destinationModal');
  const form = document.getElementById('destinationForm');
  const title = document.getElementById('destinationModalTitle');
  const modeInput = document.getElementById('destFormMode');
  const idInput = document.getElementById('destFormId');

  form.reset();

  if (destId) {
    const dest = (window._allDestinationsCache || []).find(d => d.id === destId);
    if (!dest) return;
    title.innerText = 'Sửa Điểm Đến';
    modeInput.value = 'update';
    idInput.value = dest.id;
    idInput.disabled = true; // Không cho đổi ID khi sửa
    document.getElementById('destFormName').value = dest.name;
    document.getElementById('destFormCity').value = dest.city;
    document.getElementById('destFormCategory').value = dest.category_id;
    document.getElementById('destFormBadge').value = dest.badge || '';
    document.getElementById('destFormImage').value = dest.image;
    document.getElementById('destFormCost').value = dest.avg_cost_per_day;
    document.getElementById('destFormDesc').value = dest.description;
  } else {
    title.innerText = 'Thêm Điểm Đến Mới';
    modeInput.value = 'create';
    idInput.disabled = false;
  }

  modal.style.display = 'flex';
};

window.closeDestinationModal = () => {
  document.getElementById('destinationModal').style.display = 'none';
};

function initDestinationForm() {
  const form = document.getElementById('destinationForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const mode = document.getElementById('destFormMode').value;

    const payload = {
      id: document.getElementById('destFormId').value.trim(),
      name: document.getElementById('destFormName').value.trim(),
      city: document.getElementById('destFormCity').value.trim(),
      category_id: document.getElementById('destFormCategory').value,
      badge: document.getElementById('destFormBadge').value.trim(),
      image: document.getElementById('destFormImage').value.trim(),
      avg_cost_per_day: document.getElementById('destFormCost').value,
      description: document.getElementById('destFormDesc').value.trim()
    };

    const action = mode === 'update' ? 'update' : 'create';

    try {
      const res = await fetch(`api/destinations.php?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        showToast(data.message, 'success');
        closeDestinationModal();
        await loadDestinations();
        await loadReviewDestinationSelect();
      } else {
        showToast(data.message || 'Có lỗi xảy ra!', 'error');
      }
    } catch (err) {
      showToast('Không thể kết nối đến máy chủ!', 'error');
    }
  });
}

window.deleteDestination = async (destId, destName) => {
  if (!confirm(`Xóa vĩnh viễn điểm đến "${destName}"? Hành động này không thể hoàn tác!`)) return;

  try {
    const res = await fetch('api/destinations.php?action=delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: destId })
    });
    const data = await res.json();
    if (res.ok && data.status === 'success') {
      showToast('Đã xóa điểm đến!', 'success');
      await loadDestinations();
      await loadReviewDestinationSelect();
    } else {
      showToast(data.message || 'Không thể xóa!', 'error');
    }
  } catch (e) {
    showToast('Không thể kết nối đến máy chủ!', 'error');
  }
};

/* --- 4. TAB QUẢN LÝ NGƯỜI DÙNG --- */
async function loadUsers() {
  const tbody = document.getElementById('usersTableBody');
  try {
    const res = await fetch('api/admin_users.php?action=list');
    const json = await res.json();
    if (json.status !== 'success') return;

    tbody.innerHTML = json.data.map(u => {
      const isBanned = Number(u.is_banned) === 1;
      const isSelf = currentAdminId && Number(u.id) === Number(currentAdminId);
      return `
        <tr>
          <td>${u.id}</td>
          <td style="font-weight: 600;">${escapeHtml(u.full_name)}${isSelf ? ' <span style="color: var(--text-muted); font-size: 0.8rem;">(Bạn)</span>' : ''}</td>
          <td>${escapeHtml(u.email)}</td>
          <td><span class="badge ${u.role === 'admin' ? 'badge-accent' : 'badge-primary'}">${escapeHtml(u.role)}</span></td>
          <td><span class="badge ${isBanned ? 'badge-danger' : 'badge-success'}">${isBanned ? 'Đã khóa' : 'Hoạt động'}</span></td>
          <td>
            ${isSelf
              ? `<span style="color: var(--text-muted); font-size: 0.85rem;">—</span>`
              : isBanned
                ? `<button class="btn btn-outline btn-sm" onclick="toggleBanUser(${u.id}, 'unban')">🔓 Mở khóa</button>`
                : `<button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: #fecaca;" onclick="toggleBanUser(${u.id}, 'ban')">🔒 Khóa</button>`
            }
          </td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    showToast('Không thể tải danh sách người dùng!', 'error');
  }
}

window.toggleBanUser = async (userId, action) => {
  const confirmMsg = action === 'ban' ? 'Khóa tài khoản này?' : 'Mở khóa tài khoản này?';
  if (!confirm(confirmMsg)) return;

  try {
    const res = await fetch(`api/admin_users.php?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId })
    });
    const data = await res.json();
    if (res.ok && data.status === 'success') {
      showToast(data.message, 'success');
      await loadUsers();
    } else {
      showToast(data.message || 'Có lỗi xảy ra!', 'error');
    }
  } catch (e) {
    showToast('Không thể kết nối đến máy chủ!', 'error');
  }
};

/* --- 5. TAB QUẢN LÝ ĐÁNH GIÁ --- */
async function loadReviewDestinationSelect() {
  const select = document.getElementById('reviewDestSelect');
  const list = window._allDestinationsCache || [];

  const currentVal = select.value;
  select.innerHTML = '<option value="">-- Chọn điểm đến --</option>' +
    list.map(d => `<option value="${d.id}">${escapeHtml(d.name)} (${escapeHtml(d.city)})</option>`).join('');
  select.value = currentVal;

  select.onchange = () => loadReviewsForDestination(select.value);
}

async function loadReviewsForDestination(destId) {
  const tbody = document.getElementById('reviewsTableBody');
  if (!destId) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">Chọn 1 điểm đến ở trên để xem đánh giá.</td></tr>`;
    return;
  }

  try {
    const res = await fetch(`api/reviews.php?action=list&destination_id=${destId}`);
    const json = await res.json();
    if (json.status !== 'success') return;

    if (json.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">Điểm đến này chưa có đánh giá nào.</td></tr>`;
      return;
    }

    tbody.innerHTML = json.data.map(r => `
      <tr>
        <td style="font-weight: 600;">${escapeHtml(r.user_name)}</td>
        <td>${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
        <td style="max-width: 320px;">${escapeHtml(r.comment)}</td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">${escapeHtml(r.date_posted)}</td>
        <td>
          <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: #fecaca;" onclick="deleteReview(${r.id}, '${destId}')">✕ Xóa</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    showToast('Không thể tải danh sách đánh giá!', 'error');
  }
}

window.deleteReview = async (reviewId, destId) => {
  if (!confirm('Xóa vĩnh viễn đánh giá này?')) return;

  try {
    const res = await fetch('api/reviews.php?action=delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: reviewId })
    });
    const data = await res.json();
    if (res.ok && data.status === 'success') {
      showToast('Đã xóa đánh giá!', 'success');
      await loadReviewsForDestination(destId);
      await loadStats();
    } else {
      showToast(data.message || 'Không thể xóa!', 'error');
    }
  } catch (e) {
    showToast('Không thể kết nối đến máy chủ!', 'error');
  }
};
