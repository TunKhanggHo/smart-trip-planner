
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const destId = urlParams.get('id') || 'dalat';
  const dest = await TripDataService.getDestinationById(destId);

  if (!dest) {
    alert('Không tìm thấy điểm đến này!');
    window.location.href = 'destinations.html';
    return;
  }

  // 1. Đổ dữ liệu Hero & Header
  document.title = `${dest.name} - Smart Trip Planner`;
  document.getElementById('detailHeroImg').src = dest.image;
  document.getElementById('detailBadge').innerText = dest.badge || 'Nổi bật';
  document.getElementById('detailTitle').innerText = dest.name;
  document.getElementById('detailCity').innerText = `📍 ${dest.city}`;
  document.getElementById('detailRating').innerText = `★ ${dest.rating} (${dest.reviewCount} đánh giá)`;
  document.getElementById('detailDays').innerText = `⏱️ ${dest.idealDays || '3 ngày 2 đêm'}`;
  document.getElementById('detailCostLevel').innerText = `💰 Chi phí: ${dest.costLevel || 'Vừa phải'}`;
  document.getElementById('detailDesc').innerText = dest.description;
  document.getElementById('detailBestTime').innerText = dest.bestTime || 'Quanh năm';
  document.getElementById('detailAvgCost').innerText = `${formatVND(dest.avgCostPerDay)} / người / ngày`;
  document.getElementById('detailTips').innerText = dest.tips || 'Hãy chuẩn bị hành lý phù hợp với thời tiết.';

  // 2. Weather Widget
  if (dest.weather) {
    document.getElementById('weatherTemp').innerText = dest.weather.temp || '25°C';
    document.getElementById('weatherDesc').innerText = dest.weather.desc || 'Nắng đẹp';
    document.getElementById('weatherIcon').innerText = dest.weather.icon || '☀️';
    document.getElementById('weatherHumidity').innerText = `Độ ẩm: ${dest.weather.humidity || '70%'}`;
  }

  // 3. Interactive Gallery Thumbnails
  const galleryContainer = document.getElementById('detailGalleryThumbs');
  if (galleryContainer && dest.gallery) {
    galleryContainer.innerHTML = dest.gallery.map(imgUrl => `
      <img src="${imgUrl}" class="gallery-thumb" onclick="changeMainHeroImg('${imgUrl}')" alt="${dest.name}">
    `).join('');
  }

  window.changeMainHeroImg = (src) => {
    document.getElementById('detailHeroImg').src = src;
    document.querySelectorAll('.gallery-thumb').forEach(img => {
      img.classList.toggle('active', img.src === src);
    });
  };

  // 4. Tags & Highlights
  document.getElementById('detailTags').innerHTML = (dest.tags || []).map(t => 
    `<span class="badge badge-primary">#${t}</span>`
  ).join('');

  document.getElementById('detailHighlights').innerHTML = (dest.highlights || []).map(h => 
    `<li>✨ ${h}</li>`
  ).join('');

  // 5. Timeline Hoạt động mẫu
  const activities = dest.activities && dest.activities.length > 0 ? dest.activities : [
    { time: "Sáng (07:30 - 11:30)", title: `Khám phá danh thắng ${dest.name}`, cost: Math.round(dest.avgCostPerDay * 0.35) },
    { time: "Trưa (12:00 - 13:30)", title: `Thưởng thức ẩm thực trưa tại ${dest.city}`, cost: Math.round(dest.avgCostPerDay * 0.25) },
    { time: "Chiều (14:30 - 17:30)", title: `Trải nghiệm văn hóa & chụp ảnh check-in`, cost: Math.round(dest.avgCostPerDay * 0.20) },
    { time: "Tối (18:30 - 22:00)", title: `Dạo phố đêm & thư giãn ngắm cảnh`, cost: Math.round(dest.avgCostPerDay * 0.20) }
  ];

  document.getElementById('detailActivities').innerHTML = activities.map((a, idx) => `
    <div class="activity-timeline-item">
      <div class="activity-dot">${idx + 1}</div>
      <div style="flex: 1;">
        <div style="font-size: 0.85rem; color: var(--primary); font-weight: 700;">${a.time_slot || a.time}</div>
        <div style="font-weight: 700; color: var(--text-main); margin: 0.25rem 0;">${a.title}</div>
        <div style="font-size: 0.85rem; color: var(--accent); font-weight: 600;">Chi phí ước tính: ${formatVND(a.cost)}</div>
      </div>
    </div>
  `).join('');

  // 6. Nút chuyển sang Planner
  document.getElementById('btnPlanWithThisDest').href = `planner.html?dest=${dest.id}`;

  // 7. Nút Yêu thích
  const favBtn = document.getElementById('detailFavBtn');
  if (favBtn) {
    const favs = await TripDataService.getFavorites();
    const isFav = Array.isArray(favs) && favs.includes(dest.id);
    favBtn.classList.toggle('active', isFav);
    favBtn.innerHTML = isFav ? '❤️ Đã lưu yêu thích' : '🤍 Lưu vào yêu thích';

    favBtn.addEventListener('click', async () => {
      const updated = await TripDataService.toggleFavorite(dest.id);
      favBtn.classList.toggle('active', updated);
      favBtn.innerHTML = updated ? '❤️ Đã lưu yêu thích' : '🤍 Lưu vào yêu thích';
      showToast(updated ? 'Đã thêm vào yêu thích!' : 'Đã xóa khỏi yêu thích!', 'info');
    });
  }

  // 8. Quản lý Đánh giá Reviews
  await renderReviews(dest.id);
  initReviewForm(dest.id);
});

async function renderReviews(destId) {
  const container = document.getElementById('reviewsList');
  if (!container) return;

  const reviews = await TripDataService.getReviews(destId);
  container.innerHTML = reviews.map(r => `
    <div style="padding: 1.25rem 0; border-bottom: 1px solid var(--border-light);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
        <strong style="color: var(--text-main); font-size: 0.95rem;">👤 ${escapeHtml(r.userName)}</strong>
        <span style="color: var(--warning); font-size: 0.9rem;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
      </div>
      <p style="color: var(--text-muted); font-size: 0.92rem; line-height: 1.5;">${escapeHtml(r.comment)}</p>
      <div style="font-size: 0.75rem; color: var(--text-subtle); margin-top: 0.35rem;">Đăng ngày: ${escapeHtml(r.date)}</div>
    </div>
  `).join('');
}

function initReviewForm(destId) {
  let selectedRating = 5;
  const stars = document.querySelectorAll('.star-rating .star');
  
  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.val);
      stars.forEach(s => {
        s.classList.toggle('selected', parseInt(s.dataset.val) <= selectedRating);
      });
    });
  });

  const form = document.getElementById('reviewForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reviewName').value.trim();
    const comment = document.getElementById('reviewComment').value.trim();

    if (!name || !comment) return;

    const newReview = {
      userName: name,
      rating: selectedRating,
      comment: comment,
      date: new Date().toLocaleDateString('vi-VN')
    };

    await TripDataService.addReview(destId, newReview);
    await renderReviews(destId);
    form.reset();
    showToast('Cảm ơn bạn đã gửi đánh giá vào CSDL!', 'success');
  });
}
