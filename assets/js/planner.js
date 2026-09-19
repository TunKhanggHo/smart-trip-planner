document.addEventListener("DOMContentLoaded", async () => {
  let currentGeneratedTrip = null;
  const form = document.getElementById("smartPlannerForm");
  const loading = document.getElementById("plannerLoading");
  const emptyState = document.getElementById("plannerEmpty");
  const resultArea = document.getElementById("plannerResultContent");
  const btnAI = document.getElementById("btnGenerateAI");

  const destSelect = document.getElementById("planDestination");
  const customWrap = document.getElementById("customDestWrap");
  const customInput = document.getElementById("customDestInput");

  if (destSelect) {
    destSelect.addEventListener("change", () => {
      if (destSelect.value === "custom") {
        customWrap.style.display = "block";
        if (customInput) customInput.focus();
      } else {
        if (customWrap) customWrap.style.display = "none";
      }
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("dest")) {
      destSelect.value = urlParams.get("dest");
    }
  }

  const dateInput = document.getElementById("planStartDate");
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split("T")[0];
  }

  async function resolveDestinationObject(destId) {
    if (destId === "custom") {
      const customName =
        customInput && customInput.value.trim()
          ? customInput.value.trim()
          : "Điểm Đến Tự Chọn";
      return {
        id: "custom",
        name: customName,
        city: customName,
        avgCostPerDay: 750000,
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      };
    }

    if (window.TripDataService) {
      const dest = await TripDataService.getDestinationById(destId);
      if (dest) return dest;
    }

    // Tên hiển thị từ select option
    const selectedOption = destSelect
      ? destSelect.options[destSelect.selectedIndex]
      : null;
    const optText = selectedOption ? selectedOption.text : destId;
    return {
      id: destId,
      name: optText,
      city: optText.split("(")[1]?.replace(")", "") || optText,
      avgCostPerDay: 750000,
      image:
        "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80",
    };
  }

  // Chặn hành vi submit mặc định của form (reload trang) phòng khi người dùng
  // lỡ nhấn Enter trong 1 ô nhập nào đó. Việc tạo lịch trình giờ chỉ chạy qua
  // nút "🤖 Tạo Bằng Trí Tuệ Nhân Tạo AI" bên dưới (không còn nút Thuật Toán riêng nữa).
  form.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  // CHẾ ĐỘ TRÍ TUỆ NHÂN TẠO AI (GEMINI AI)
  if (btnAI) {
    btnAI.addEventListener("click", async () => {
      const destId = destSelect.value;
      const startDate = document.getElementById("planStartDate").value;
      const days = parseInt(document.getElementById("planDays").value) || 3;
      const people = parseInt(document.getElementById("planPeople").value) || 2;
      const budget =
        parseInt(document.getElementById("planBudget").value) || 2500000;
      const style = document.getElementById("planStyle").value || "chill";
      const vehicle = document.getElementById("planVehicle").value || "xe máy";

      const destObj = await resolveDestinationObject(destId);

      emptyState.style.display = "none";
      resultArea.style.display = "none";
      loading.style.display = "block";

      const loadingTitle = loading.querySelector("h3");
      const loadingDesc = loading.querySelector("p");
      if (loadingTitle)
        loadingTitle.innerText =
          "🤖 Trí tuệ nhân tạo Gemini AI đang sáng tạo lịch trình...";
      if (loadingDesc)
        loadingDesc.innerText =
          "Có thể mất tới 30-40 giây, vui lòng không tắt trang trong lúc chờ...";

      try {
        const payload = {
          destinationId: destId,
          destinationName: destObj.name,
          city: destObj.city,
          startDate: startDate,
          days: days,
          people: people,
          userBudget: budget,
          style: style,
          vehicle: vehicle,
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 giây timeout — backend thử lần lượt nhiều model nên cần thời gian rộng rãi hơn

        const res = await fetch("api/ai_planner.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const resData = await res.json();
          if (
            resData.status === "success" &&
            resData.data &&
            resData.data.schedule
          ) {
            const aiSchedule = resData.data.schedule.map((day, dIdx) => ({
              dayNumber: day.dayNumber || dIdx + 1,
              dayTotal:
                day.dayTotal ||
                (day.activities
                  ? day.activities.reduce(
                      (s, a) => s + (parseInt(a.cost) || 0),
                      0,
                    )
                  : 750000),
              activities: (day.activities || []).map((act, aIdx) => ({
                id: `act_${dIdx + 1}_${aIdx + 1}`,
                time: act.time,
                title: act.title,
                cost: parseInt(act.cost) || 150000,
              })),
            }));

            const aiTotalCost = aiSchedule.reduce(
              (sum, d) => sum + d.dayTotal,
              0,
            );

            currentGeneratedTrip = {
              id: "trip_" + Date.now(),
              destinationId: destId,
              destinationName: destObj.name,
              city: destObj.city,
              image: destObj.image,
              startDate: startDate,
              days: days,
              people: people,
              vehicle: vehicle,
              style: style,
              userBudget: budget,
              totalCostPerPerson: aiTotalCost,
              generatedBy: "gemini_ai",
              createdAt: new Date().toLocaleDateString("vi-VN"),
              schedule: aiSchedule,
            };

            loading.style.display = "none";
            resultArea.style.display = "block";
            renderGeneratedResult();
            showToast(
              "✨ Lịch trình được sáng tạo thành công bởi Google Gemini AI!",
              "success",
            );
            return;
          }
        }
      } catch (err) {
        console.log("Lỗi khi gọi Gemini AI:", err);
      }

      // AI thất bại (mất mạng, hết quota, timeout...) -> báo lỗi rõ ràng,
      // KHÔNG còn tạo lịch trình giả bằng thuật toán nữa.
      loading.style.display = "none";
      emptyState.style.display = "block";
      resultArea.style.display = "none";
      showToast(
        "❌ Không thể tạo lịch trình bằng AI lúc này. Vui lòng kiểm tra kết nối mạng và thử lại!",
        "error",
      );
    });
  }

  // RENDER GIAO DIỆN LỊCH TRÌNH RA MÀN HÌNH
  function renderGeneratedResult() {
    if (!currentGeneratedTrip || !currentGeneratedTrip.schedule) return;

    const totalPerPerson = currentGeneratedTrip.totalCostPerPerson || 0;
    const userBudget = currentGeneratedTrip.userBudget || 0;

    const costDisplay = document.getElementById("resTotalCost");
    if (costDisplay)
      costDisplay.innerText = `${formatVND(totalPerPerson)} / người`;

    const budgetStatus = document.getElementById("resBudgetStatus");
    const isAI = currentGeneratedTrip.generatedBy === "gemini_ai";
    const badgeAI = isAI
      ? `<span class="badge" style="background: linear-gradient(135deg, #6366f1, #ec4899); color: white; margin-left: 0.5rem; font-size: 0.8rem;">🤖 Sáng tạo bởi Google Gemini AI</span>`
      : "";

    if (budgetStatus) {
      if (totalPerPerson <= userBudget) {
        budgetStatus.innerHTML = `✅ Ngân sách tối ưu tuyệt vời! ${badgeAI}`;
        budgetStatus.style.color = "var(--secondary)";
      } else {
        budgetStatus.innerHTML = `⚠️ Vượt ngân sách khoảng ${formatVND(totalPerPerson - userBudget)} ${badgeAI}`;
        budgetStatus.style.color = "var(--accent)";
      }
    }

    const container = document.getElementById("resDaysContainer");
    if (!container) return;

    container.innerHTML = currentGeneratedTrip.schedule
      .map(
        (day) => `
      <div class="result-day-card animate-fade-in-up" id="day_card_${day.dayNumber}" style="margin-bottom: 1.5rem; background: var(--bg-surface); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-light); box-shadow: var(--shadow-sm);">
        <div class="day-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-light); padding-bottom: 0.75rem;">
          <div class="day-title" style="font-size: 1.15rem; font-weight: 800; color: var(--primary);">🗓️ Ngày ${day.dayNumber}: Lịch trình chi tiết</div>
          <div class="badge badge-primary" style="font-size: 0.85rem;">Dự tính: ${formatVND(day.dayTotal)}/người</div>
        </div>
        
        <div class="schedule-list" id="day_list_${day.dayNumber}" style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${(day.activities || [])
            .map(
              (act) => `
            <div class="schedule-item" id="${act.id}" style="display: flex; gap: 1rem; align-items: center; padding: 0.85rem 1rem; background: var(--bg-alt); border-radius: var(--radius-md); border: 1px solid var(--border-light);">
              <div class="schedule-time" style="font-size: 0.85rem; font-weight: 700; color: var(--primary); min-width: 140px;">${act.time}</div>
              <div class="schedule-content" style="flex: 1;">
                <div class="schedule-title" style="font-weight: 600; color: var(--text-main); font-size: 0.95rem;">${escapeHtml(act.title)}</div>
                <div class="schedule-cost" style="font-size: 0.85rem; color: var(--accent); font-weight: 700; margin-top: 0.2rem;">${formatVND(act.cost)}</div>
              </div>
              <button class="btn btn-outline btn-sm" style="padding: 0.2rem 0.5rem; color: var(--danger); border-color: #fecaca;" onclick="removeActivity(${day.dayNumber}, '${act.id}')" title="Xóa hoạt động">✕</button>
            </div>
          `,
            )
            .join("")}
        </div>

        <div style="margin-top: 1rem; text-align: right;">
          <button class="btn btn-outline btn-sm" onclick="promptAddActivity(${day.dayNumber})">+ Thêm hoạt động vào Ngày ${day.dayNumber}</button>
        </div>
      </div>
    `,
      )
      .join("");
  }

  window.removeActivity = (dayNum, actId) => {
    const day = currentGeneratedTrip.schedule.find(
      (d) => d.dayNumber === dayNum,
    );
    if (day) {
      day.activities = day.activities.filter((a) => a.id !== actId);
      day.dayTotal = day.activities.reduce((sum, a) => sum + a.cost, 0);
      currentGeneratedTrip.totalCostPerPerson =
        currentGeneratedTrip.schedule.reduce((sum, d) => sum + d.dayTotal, 0);
      renderGeneratedResult();
      showToast("Đã xóa hoạt động!", "info");
    }
  };

  window.promptAddActivity = (dayNum) => {
    const title = prompt(`Nhập tên hoạt động muốn thêm vào Ngày ${dayNum}:`);
    if (!title) return;
    const costStr = prompt("Nhập chi phí dự tính (VNĐ):", "100000");
    const cost = parseInt(costStr) || 0;

    const day = currentGeneratedTrip.schedule.find(
      (d) => d.dayNumber === dayNum,
    );
    if (day) {
      day.activities.push({
        id: `act_${dayNum}_${Date.now()}`,
        time: "Tùy chọn",
        title: title,
        cost: cost,
      });
      day.dayTotal = day.activities.reduce((sum, a) => sum + a.cost, 0);
      currentGeneratedTrip.totalCostPerPerson =
        currentGeneratedTrip.schedule.reduce((sum, d) => sum + d.dayTotal, 0);
      renderGeneratedResult();
      showToast("Đã thêm hoạt động mới!", "success");
    }
  };

  // Lưu vào MySQL qua PHP API
  document.getElementById("btnSaveTrip").addEventListener("click", async () => {
    if (!currentGeneratedTrip) return;

    const user = typeof Auth !== "undefined" ? Auth.getUser() : null;
    if (!user) {
      showToast("Vui lòng đăng nhập để lưu chuyến đi!", "error");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);
      return;
    }

    let savedToServer = false;
    try {
      const res = await fetch("api/trips.php?action=create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentGeneratedTrip),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.status === "success") savedToServer = true;
      }
    } catch (e) {}

    const key = `my_trip_planner_trips_${user.email || user.id}`;
    let myTrips = [];
    try {
      myTrips = JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      myTrips = [];
    }
    myTrips.unshift(currentGeneratedTrip);
    localStorage.setItem(key, JSON.stringify(myTrips));

    if (savedToServer) {
      showToast("Đã lưu chuyến đi vào CSDL MySQL!", "success");
    } else {
      showToast(
        "Đã lưu chuyến đi (chế độ tạm thời, backend không phản hồi)!",
        "info",
      );
    }

    setTimeout(() => {
      window.location.href = "itinerary.html";
    }, 800);
  });
});
