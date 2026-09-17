/**
 * Kết nối PHP API & MySQL:
 * - Tải thông tin tài khoản người dùng và thống kê số chuyến đi, số yêu thích.
 * - Cập nhật thông tin cá nhân vào bảng `users`.
 * - Hiển thị danh sách các địa điểm đã thả tim từ bảng `favorites`.
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadUserProfile();
  await loadFavoritesList();
  initProfileForm();
});

// 1. Tải thông tin cá nhân & Thống kê
async function loadUserProfile() {
  let user = null;
  try {
    const res = await fetch('api/auth.php?action=me');
    if (res.ok) {
      const data = await res.json();
      if (data.isLoggedIn && data.user) user = data.user;
    }
  } catch (e) {}

  if (!user) {
    try {
      user = JSON.parse(localStorage.getItem('trip_planner_user'));
    } catch {
      user = null;
    }
  }

  if (!user) {
    showToast('Vui lòng đăng nhập để xem hồ sơ cá nhân!', 'error');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    return;
  }

  document.getElementById('profileName').innerText = user.name;
  document.getElementById('profileEmail').innerText = user.email;
  document.getElementById('profileAvatar').innerText = user.avatar || user.name.charAt(0).toUpperCase();

  const editName = document.getElementById('editName');
  const editEmail = document.getElementById('editEmail');
  const editPhone = document.getElementById('editPhone');
  const editBio = document.getElementById('editBio');

  if (editName) editName.value = user.name || '';
  if (editEmail) editEmail.value = user.email || '';
  if (editPhone) editPhone.value = user.phone || '';
  if (editBio) editBio.value = user.bio || '';

  // Đếm số chuyến đi đã lập
  let tripsCount = 0;
  try {
    const tripRes = await fetch('api/trips.php?action=list');
    if (tripRes.ok) {
      const tripData = await tripRes.json();
      tripsCount = tripData.data ? tripData.data.length : 0;
    }
  } catch (e) {
    const key = `my_trip_planner_trips_${user.email || user.id}`;
    const localTrips = JSON.parse(localStorage.getItem(key)) || [];
    tripsCount = localTrips.length;
  }
  document.getElementById('statTripsCount').innerText = tripsCount;
}

// 2. Tải danh sách Địa điểm Yêu thích
async function loadFavoritesList() {
  const grid = document.getElementById('favoritesGrid');
  const empty = document.getElementById('noFavoritesSaved');
  const countBadge = document.getElementById('statFavsCount');
  if (!grid) return;

  const favIds = await TripDataService.getFavorites();
  if (countBadge) countBadge.innerText = Array.isArray(favIds) ? favIds.length : 0;

  if (!favIds || favIds.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }

  if (empty) empty.style.display = 'none';

  const allDest = await TripDataService.getAllDestinations();
  const favDests = allDest.filter(d => favIds.includes(d.id));

  grid.innerHTML = favDests.map(item => `
    <article class="card destination-card hover-lift">
      <div class="card-media">
        <span class="badge badge-accent card-badge">${item.badge || 'Yêu thích'}</span>
        <button class="btn-fav card-fav-btn active" onclick="removeFavFromProfile('${item.id}')" title="Bỏ yêu thích">
          ❤️
        </button>
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="card-body">
        <div class="card-location">📍 ${item.city}</div>
        <h3 class="card-title">${item.name}</h3>
        <div class="card-footer">
          <div class="card-price">
            <span class="price-value">${formatVND(item.avgCostPerDay)}</span>
          </div>
          <a href="destination-detail.html?id=${item.id}" class="btn btn-primary btn-sm">Xem ngay ➔</a>
        </div>
      </div>
    </article>
  `).join('');
}

window.removeFavFromProfile = async (destId) => {
  await TripDataService.toggleFavorite(destId);
  await loadFavoritesList();
  showToast('Đã bỏ yêu thích địa điểm!', 'info');
};

// 3. Xử lý Cập nhật thông tin cá nhân
function initProfileForm() {
  const form = document.getElementById('profileForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('editName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const bio = document.getElementById('editBio').value.trim();

    let backendOk = false;
    try {
      const res = await fetch('api/auth.php?action=update_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, bio })
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.status === 'success') backendOk = true;
      }
    } catch (e) {}

    // Cập nhật LocalStorage
    let user = JSON.parse(localStorage.getItem('trip_planner_user')) || {};
    user.name = name;
    user.phone = phone;
    user.bio = bio;
    user.avatar = name.charAt(0).toUpperCase();
    localStorage.setItem('trip_planner_user', JSON.stringify(user));

    await loadUserProfile();

    if (backendOk) {
      showToast('Cập nhật hồ sơ vào MySQL thành công!', 'success');
    } else {
      showToast('Không thể cập nhật hồ sơ lên máy chủ. Vui lòng đăng nhập lại!', 'error');
    }
  });
}
