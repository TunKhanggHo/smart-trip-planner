document.addEventListener("DOMContentLoaded", () => {
  let currentCategory = "all";
  const searchInput = document.getElementById("searchInput");
  const budgetFilter = document.getElementById("budgetFilter");
  const sortFilter = document.getElementById("sortFilter");
  const catTabsContainer = document.getElementById("categoryTabs");
  const grid = document.getElementById("destinationsGrid");
  const noResults = document.getElementById("noResults");
  const resultCountBadge = document.getElementById("resultCountBadge");

  // Đọc tham số URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("search")) searchInput.value = urlParams.get("search");
  if (urlParams.has("budget")) budgetFilter.value = urlParams.get("budget");
  if (urlParams.has("category")) currentCategory = urlParams.get("category");

  // Render danh sách nút phân loại danh mục
  const categories = TripDataService.getCategories();
  catTabsContainer.innerHTML = categories
    .map(
      (c) => `
    <button class="cat-tab-btn ${c.id === currentCategory ? "active" : ""}" data-cat="${c.id}">
      ${c.icon} ${c.name}
    </button>
  `,
    )
    .join("");

  // Hàm render danh sách điểm đến bất đồng bộ từ MySQL / PHP API
  async function render() {
    const search = searchInput.value.trim();
    const budget = budgetFilter.value ? parseInt(budgetFilter.value) : null;
    const sort = sortFilter.value;

    if (resultCountBadge)
      resultCountBadge.innerText = "Đang tải dữ liệu từ CSDL...";

    // Đã tự động kéo dữ liệu tươi nhất từ MySQL thông qua TripDataService đã nâng cấp
    const results = await TripDataService.filterDestinations(
      currentCategory,
      search,
      budget,
      sort,
    );
    const favs = await TripDataService.getFavorites();

    if (resultCountBadge) {
      resultCountBadge.innerText = `Tìm thấy ${results.length} địa điểm`;
    }

    if (!results || results.length === 0) {
      grid.innerHTML = "";
      noResults.style.display = "block";
      return;
    }

    noResults.style.display = "none";
    grid.innerHTML = results
      .map((item) => {
        const isFav = Array.isArray(favs) && favs.includes(item.id);
        return `
        <article class="card destination-card hover-lift animate-fade-in">
          <div class="card-media">
            <span class="badge badge-accent card-badge">${item.badge || "Khám phá"}</span>
            <button class="btn-fav card-fav-btn ${isFav ? "active" : ""}" onclick="toggleDestinationFav(event, '${item.id}')" title="Yêu thích">
              ${isFav ? "❤️" : "🤍"}
            </button>
            <span class="card-rating">★ ${item.rating}</span>
            <img src="${item.image}" alt="${item.name}" loading="lazy">
          </div>
          <div class="card-body">
            <div class="card-location">📍 ${item.city} &bull; ${item.categoryName}</div>
            <h3 class="card-title">${item.name}</h3>
            <p class="card-desc">${item.description}</p>
            
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 1rem;">
              ${(item.tags || []).map((t) => `<span class="badge badge-primary" style="font-size: 0.7rem;">#${t}</span>`).join("")}
            </div>

            <div class="card-footer">
              <div class="card-price">
                <span class="price-label">Chi phí / Ngày</span>
                <span class="price-value">${formatVND(item.avgCostPerDay)}</span>
              </div>
              <a href="destination-detail.html?id=${item.id}" class="btn btn-primary btn-sm">Xem chi tiết ➔</a>
            </div>
          </div>
        </article>
      `;
      })
      .join("");
  }

  // Xử lý nút Thả tim
  window.toggleDestinationFav = async (e, destId) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowFav = await TripDataService.toggleFavorite(destId);
    const btn = e.currentTarget;
    btn.classList.toggle("active", isNowFav);
    btn.innerHTML = isNowFav ? "❤️" : "🤍";
    showToast(
      isNowFav
        ? "Đã lưu vào danh sách yêu thích!"
        : "Đã xóa khỏi danh sách yêu thích!",
      "info",
    );
  };

  // Lắng nghe sự kiện người dùng
  catTabsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-tab-btn");
    if (!btn) return;
    document
      .querySelectorAll(".cat-tab-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.cat;
    render();
  });

  let debounceTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(render, 250);
  });

  budgetFilter.addEventListener("change", render);
  sortFilter.addEventListener("change", render);

  document.getElementById("btnResetFilter").addEventListener("click", () => {
    searchInput.value = "";
    budgetFilter.value = "";
    sortFilter.value = "rating";
    currentCategory = "all";
    document
      .querySelectorAll(".cat-tab-btn")
      .forEach((b) => b.classList.toggle("active", b.dataset.cat === "all"));
    render();
    showToast("Đã đặt lại toàn bộ bộ lọc!", "info");
  });

  // Render lần đầu khi mở trang
  render();
});
