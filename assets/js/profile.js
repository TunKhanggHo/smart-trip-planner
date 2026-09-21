document.addEventListener('DOMContentLoaded', async () => {
  await loadUserProfile();
  await loadFavoritesList();
  initProfileForm();
});

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
    showToast('Vui lòng đăng nhập trước!', 'error');
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

    let user = JSON.parse(localStorage.getItem('trip_planner_user')) || {};
    user.name = name;
    user.phone = phone;
    user.bio = bio;
    user.avatar = name.charAt(0).toUpperCase();
    localStorage.setItem('trip_planner_user', JSON.stringify(user));

    await loadUserProfile();

    if (backendOk) {
      showToast('Cập nhật thông tin thành công!', 'success');
    } else {
      showToast('Lỗi cập nhật. Vui lòng đăng nhập lại!', 'error');
    }
  });
}