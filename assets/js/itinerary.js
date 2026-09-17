
document.addEventListener('DOMContentLoaded', async () => {
  // Trang PRIVATE: bắt buộc đăng nhập mới được xem "Lịch trình của tôi"
  const allowed = await requireLogin();
  if (!allowed) return;

  initTabs();
  await renderTrips();
  await renderExpenses();
  await renderChecklist();
});

/* --- 1. QUẢN LÝ TABS --- */
function initTabs() {
  const tabBtns = document.querySelectorAll('.itinerary-tab-btn');
  const tabPanes = document.querySelectorAll('.itinerary-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.style.display = 'none');

      btn.classList.add('active');
      const targetPane = document.getElementById(btn.dataset.target);
      if (targetPane) targetPane.style.display = 'block';
    });
  });
}

/* --- 2. QUẢN LÝ CHUYẾN ĐI (MY TRIPS) --- */
async function getSavedTrips() {
  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;

  try {
    const res = await fetch('api/trips.php?action=list');
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success') {
        return json.data;
      }
    }
  } catch (e) {}

  // Chưa đăng nhập -> Trả về mảng rỗng ngay, không lấy dữ liệu cũ
  if (!user) return [];

  try {
    const key = `my_trip_planner_trips_${user.email || user.id}`;
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

async function renderTrips() {
  const container = document.getElementById('myTripsList');
  const emptyState = document.getElementById('noTripsSaved');
  if (!container) return;

  const trips = await getSavedTrips();
  if (trips.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  container.innerHTML = trips.map(trip => `
    <div class="itinerary-card animate-fade-in" id="trip_card_${trip.id}">
      <div class="itinerary-card-header">
        <div>
          <h3 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem;">
            ${escapeHtml(trip.destinationName || trip.destination_name)}
          </h3>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span class="trip-meta-badge">📍 ${trip.city}</span>
            <span class="trip-meta-badge">⏱️ ${trip.days} Ngày</span>
            <span class="trip-meta-badge">👥 ${trip.people} Người</span>
            <span class="trip-meta-badge">📅 Khởi hành: ${trip.startDate || trip.start_date || 'Tự do'}</span>
          </div>
        </div>

        <div class="itinerary-actions">
          <button class="btn btn-outline btn-sm" onclick="editTripName('${trip.id}')" title="Đổi tên">✏️ Sửa tên</button>
          <button class="btn btn-outline btn-sm" onclick="duplicateTrip('${trip.id}')" title="Nhân bản">📋 Nhân bản</button>
          <button class="btn btn-outline btn-sm" style="color: var(--danger); border-color: #fecaca;" onclick="deleteTrip('${trip.id}')" title="Xóa">🗑️ Xóa</button>
        </div>
      </div>

      <div class="itinerary-card-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.5rem;">
          <h4 style="font-weight: 700; color: var(--text-main);">Lộ trình từng ngày:</h4>
          <div style="font-size: 1.05rem; font-weight: 800; color: var(--accent);">
            Chi phí dự tính: ${formatVND(trip.totalCostPerPerson || trip.total_cost_per_person)} / người
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
          ${(trip.schedule || []).map(day => `
            <div style="background: var(--bg-alt); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-light);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <strong style="color: var(--primary); font-size: 0.95rem;">🗓️ Ngày ${day.dayNumber}</strong>
                <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted);">${formatVND(day.dayTotal)}</span>
              </div>
              <ul style="font-size: 0.85rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.5rem;">
                ${(day.activities || []).map(act => `
                  <li><strong>${(act.time || '').split(' ')[0]}:</strong> ${escapeHtml(act.title)}</li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

window.deleteTrip = async (tripId) => {
  if (!confirm('Bạn có chắc chắn muốn xóa chuyến đi này?')) return;
  try {
    await fetch('api/trips.php?action=delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tripId })
    });
  } catch (e) {}

  const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  const key = user ? `my_trip_planner_trips_${user.email || user.id}` : 'my_trip_planner_trips';
  let trips = JSON.parse(localStorage.getItem(key)) || [];
  trips = trips.filter(t => t.id !== tripId);
  localStorage.setItem(key, JSON.stringify(trips));
  
  await renderTrips();
  showToast('Đã xóa chuyến đi thành công!', 'info');
};

window.duplicateTrip = async (tripId) => {
  const trips = await getSavedTrips();
  const tripToCopy = trips.find(t => t.id === tripId);
  if (tripToCopy) {
    const copied = {
      ...tripToCopy,
      id: 'trip_' + Date.now(),
      destinationName: (tripToCopy.destinationName || tripToCopy.destination_name) + ' (Bản sao)',
      createdAt: new Date().toLocaleDateString('vi-VN')
    };

    try {
      await fetch('api/trips.php?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copied)
      });
    } catch (e) {}

    const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
    const key = user ? `my_trip_planner_trips_${user.email || user.id}` : 'my_trip_planner_trips';
    let localTrips = JSON.parse(localStorage.getItem(key)) || [];
    localTrips.unshift(copied);
    localStorage.setItem(key, JSON.stringify(localTrips));

    await renderTrips();
    showToast('Đã nhân bản lịch trình thành công!', 'success');
  }
};

window.editTripName = async (tripId) => {
  const trips = await getSavedTrips();
  const trip = trips.find(t => t.id === tripId);
  if (trip) {
    const newName = prompt('Nhập tên mới cho chuyến đi:', trip.destinationName || trip.destination_name);
    if (newName && newName.trim()) {
      try {
        await fetch('api/trips.php?action=update_name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: tripId, name: newName.trim() })
        });
      } catch (e) {}

      const user = typeof Auth !== 'undefined' ? Auth.getUser() : null;
      const key = user ? `my_trip_planner_trips_${user.email || user.id}` : 'my_trip_planner_trips';
      let localTrips = JSON.parse(localStorage.getItem(key)) || [];
      const lTrip = localTrips.find(t => t.id === tripId);
      if (lTrip) lTrip.destinationName = newName.trim();
      localStorage.setItem(key, JSON.stringify(localTrips));

      await renderTrips();
      showToast('Đã cập nhật tên chuyến đi!', 'success');
    }
  }
};

/* --- 3. QUẢN LÝ CHI TIÊU THỰC TẾ (EXPENSE TRACKER API) --- */
function getExpenseStorageKey() {
  const currentUser = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  return currentUser ? `smart_trip_expenses_${currentUser.email || currentUser.id}` : null;
}

async function renderExpenses() {
  const tableBody = document.getElementById('expenseTableBody');
  const totalDisplay = document.getElementById('expenseTotalSpent');
  if (!tableBody) return;

  const currentUser = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  let expenses = [];

  // CHƯA ĐĂNG NHẬP: Trả về bảng trống hoàn toàn
  if (!currentUser) {
    if (totalDisplay) totalDisplay.innerText = formatVND(0);
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">Vui lòng đăng nhập để xem sổ chi tiêu của bạn.</td></tr>`;
    return;
  }

  try {
    const res = await fetch('api/expenses.php?action=list');
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success') expenses = json.data;
    }
  } catch (e) {}

  if (expenses.length === 0) {
    const key = getExpenseStorageKey();
    expenses = key ? (JSON.parse(localStorage.getItem(key)) || []) : [];
  }

  const total = expenses.reduce((sum, e) => sum + parseInt(e.amount), 0);
  if (totalDisplay) totalDisplay.innerText = formatVND(total);

  if (expenses.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">Chưa có khoản chi tiêu nào được ghi nhận.</td></tr>`;
    return;
  }

  tableBody.innerHTML = expenses.map((exp, idx) => `
    <tr>
      <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-light);">${idx + 1}</td>
      <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-light); font-weight: 600;">${escapeHtml(exp.title)}</td>
      <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-light);"><span class="badge badge-primary">${escapeHtml(exp.category)}</span></td>
      <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-light); color: var(--text-muted); font-size: 0.85rem;">${escapeHtml(exp.expense_date || exp.date)}</td>
      <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-light); font-weight: 700; color: var(--accent);">${formatVND(exp.amount)}</td>
      <td style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-light); text-align: center;">
        <button onclick="deleteExpenseItem('${exp.id}')" class="btn btn-outline btn-sm" style="color: var(--danger); padding: 0.2rem 0.5rem;">✕</button>
      </td>
    </tr>
  `).join('');

  // Form thêm khoản chi
  const form = document.getElementById('addExpenseForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (!currentUser) {
        showToast('Vui lòng đăng nhập để thêm khoản chi tiêu!', 'error');
        return;
      }

      const title = document.getElementById('expTitle').value.trim();
      const amount = parseInt(document.getElementById('expAmount').value) || 0;
      const category = document.getElementById('expCategory').value;

      if (!title || amount <= 0) return;

      const newExp = {
        id: 'exp_' + Date.now(),
        title: title,
        amount: amount,
        category: category,
        date: new Date().toLocaleDateString('vi-VN')
      };

      try {
        await fetch('api/expenses.php?action=add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newExp)
        });
      } catch (err) {}

      const key = getExpenseStorageKey();
      if (key) {
        let currentList = JSON.parse(localStorage.getItem(key)) || [];
        currentList.unshift(newExp);
        localStorage.setItem(key, JSON.stringify(currentList));
      }

      form.reset();
      await renderExpenses();
      showToast('Đã ghi nhận khoản chi tiêu vào MySQL!', 'success');
    };
  }
}

window.deleteExpenseItem = async (expId) => {
  try {
    await fetch('api/expenses.php?action=delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: expId })
    });
  } catch (e) {}

  const key = getExpenseStorageKey();
  if (key) {
    let expenses = JSON.parse(localStorage.getItem(key)) || [];
    expenses = expenses.filter(e => e.id !== expId);
    localStorage.setItem(key, JSON.stringify(expenses));
  }

  await renderExpenses();
  showToast('Đã xóa khoản chi tiêu!', 'info');
};

/* --- 4. QUẢN LÝ CHECKLIST HÀNH LÝ API --- */
async function renderChecklist() {
  const container = document.getElementById('checklistContainer');
  const progressText = document.getElementById('checklistProgressText');
  const progressBar = document.getElementById('checklistProgressBar');
  if (!container) return;

  const currentUser = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  let items = [];

  // CHƯA ĐĂNG NHẬP: Trả về giao diện trống hoàn toàn
  if (!currentUser) {
    if (progressText) progressText.innerText = `Đã chuẩn bị 0/0 món (0%)`;
    if (progressBar) progressBar.style.width = `0%`;
    container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Vui lòng đăng nhập để xem danh sách hành lý của bạn.</div>`;
    return;
  }

  try {
    const res = await fetch('api/checklists.php?action=list');
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success') items = json.data;
    }
  } catch (e) {}

  if (items.length === 0) {
    const key = `smart_trip_checklist_${currentUser.email || currentUser.id}`;
    items = JSON.parse(localStorage.getItem(key)) || [];
  }

  const checkedCount = items.filter(i => i.checked).length;
  const percent = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  if (progressText) progressText.innerText = `Đã chuẩn bị ${checkedCount}/${items.length} món (${percent}%)`;
  if (progressBar) progressBar.style.width = `${percent}%`;

  if (items.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Chưa có vật dụng nào trong danh sách hành lý.</div>`;
    return;
  }

  const categories = [...new Set(items.map(i => i.category))];

  container.innerHTML = categories.map(cat => {
    const catItems = items.filter(i => i.category === cat);
    return `
      <div style="margin-bottom: 1.5rem;">
        <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--primary); margin-bottom: 0.75rem;">📁 ${escapeHtml(cat)}</h4>
        <div>
          ${catItems.map(item => `
            <div class="checklist-item ${item.checked ? 'checked' : ''}" onclick="toggleChecklistItem('${item.id}')">
              <input type="checkbox" class="checklist-checkbox" ${item.checked ? 'checked' : ''} onclick="event.stopPropagation(); toggleChecklistItem('${item.id}')">
              <span class="checklist-text" style="flex: 1; font-weight: 600; font-size: 0.95rem;">${escapeHtml(item.name)}</span>
              <button onclick="event.stopPropagation(); deleteChecklistItem('${item.id}')" style="color: var(--text-subtle); padding: 0.2rem;" title="Xóa món này">✕</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  const form = document.getElementById('addChecklistForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      if (!currentUser) {
        showToast('Vui lòng đăng nhập để thêm vật dụng!', 'error');
        return;
      }

      const name = document.getElementById('chkItemName').value.trim();
      const cat = document.getElementById('chkItemCategory').value;

      if (!name) return;

      const newItem = {
        id: 'chk_' + Date.now(),
        category: cat,
        name: name,
        checked: false
      };

      try {
        await fetch('api/checklists.php?action=add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        });
      } catch (err) {}

      const key = `smart_trip_checklist_${currentUser.email || currentUser.id}`;
      let currentItems = JSON.parse(localStorage.getItem(key)) || [];
      currentItems.push(newItem);
      localStorage.setItem(key, JSON.stringify(currentItems));

      form.reset();
      await renderChecklist();
      showToast('Đã thêm món đồ vào CSDL!', 'success');
    };
  }
}

window.toggleChecklistItem = async (itemId) => {
  try {
    await fetch('api/checklists.php?action=toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId })
    });
  } catch (e) {}

  const currentUser = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  if (!currentUser) return;

  const key = `smart_trip_checklist_${currentUser.email || currentUser.id}`;
  let items = JSON.parse(localStorage.getItem(key)) || [];
  const item = items.find(i => i.id === itemId);
  if (item) {
    item.checked = !item.checked;
    localStorage.setItem(key, JSON.stringify(items));
  }
  await renderChecklist();
};

window.deleteChecklistItem = async (itemId) => {
  try {
    await fetch('api/checklists.php?action=delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId })
    });
  } catch (e) {}

  const currentUser = typeof Auth !== 'undefined' ? Auth.getUser() : null;
  if (!currentUser) return;

  const key = `smart_trip_checklist_${currentUser.email || currentUser.id}`;
  let items = JSON.parse(localStorage.getItem(key)) || [];
  items = items.filter(i => i.id !== itemId);
  localStorage.setItem(key, JSON.stringify(items));

  await renderChecklist();
  showToast('Đã xóa món đồ!', 'info');
};