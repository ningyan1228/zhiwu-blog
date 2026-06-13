const calendarDays = document.querySelector("#calendar-days");
const calendarTitle = document.querySelector("#calendar-title");
const prevMonthButton = document.querySelector("#prev-month");
const nextMonthButton = document.querySelector("#next-month");
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const weekPlan = document.querySelector("#week-plan");
const countdownForm = document.querySelector("#countdown-form");
const countdownTitle = document.querySelector("#countdown-title");
const countdownDate = document.querySelector("#countdown-date");
const countdownResult = document.querySelector("#countdown-result");
const diaryInput = document.querySelector("#diary-input");
const saveDiaryButton = document.querySelector("#save-diary");
const openDiaryLinkButton = document.querySelector("#open-diary-link");
const recentRecords = document.querySelector("#recent-records");
const calendarDateLabel = document.querySelector("#calendar-date-label");
const calendarTimeLabel = document.querySelector("#calendar-time-label");
const overviewTasks = document.querySelector("#overview-tasks");
const overviewWeek = document.querySelector("#overview-week");
const overviewCountdown = document.querySelector("#overview-countdown");
const overviewDiary = document.querySelector("#overview-diary");

const today = new Date();
let visibleDate = new Date(today.getFullYear(), today.getMonth(), 1);

function pad(value) {
  return String(value).padStart(2, "0");
}

function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getStore() {
  try {
    return JSON.parse(localStorage.getItem("zhiwuCalendar") || "{}");
  } catch {
    return {};
  }
}

function setStore(store) {
  try {
    localStorage.setItem("zhiwuCalendar", JSON.stringify(store));
  } catch {
    // The calendar still renders when storage is unavailable.
  }
}

function getTodayEntry(store = getStore()) {
  const key = toDateKey(today);
  store.entries ||= {};
  store.entries[key] ||= { tasks: [], diary: "" };
  return store.entries[key];
}

function renderCalendar() {
  if (!calendarDays || !calendarTitle) {
    return;
  }

  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const todayKey = toDateKey(today);
  const store = getStore();
  const entries = store.entries || {};

  calendarTitle.textContent = `${year} 年 ${month + 1} 月`;
  calendarDays.innerHTML = "";

  for (let index = 0; index < 42; index += 1) {
    const dayButton = document.createElement("button");
    const dayNumber = index - startOffset + 1;
    let cellDate;

    if (dayNumber < 1) {
      cellDate = new Date(year, month - 1, previousMonthDays + dayNumber);
      dayButton.classList.add("is-muted");
    } else if (dayNumber > daysInMonth) {
      cellDate = new Date(year, month + 1, dayNumber - daysInMonth);
      dayButton.classList.add("is-muted");
    } else {
      cellDate = new Date(year, month, dayNumber);
    }

    const dateKey = toDateKey(cellDate);
    dayButton.type = "button";
    dayButton.className = `calendar-day ${dayButton.className}`.trim();
    dayButton.textContent = String(cellDate.getDate());
    dayButton.setAttribute("aria-label", dateKey);

    if (dateKey === todayKey) {
      dayButton.classList.add("is-today");
    }

    if (entries[dateKey]?.tasks?.length || entries[dateKey]?.diary) {
      dayButton.classList.add("has-record");
    }

    calendarDays.appendChild(dayButton);
  }
}

function renderTasks() {
  const entry = getTodayEntry();
  taskList.innerHTML = "";

  if (!entry.tasks.length) {
    const empty = document.createElement("li");
    empty.className = "calendar-empty";
    empty.textContent = "今天还没有事项。";
    taskList.appendChild(empty);
    return;
  }

  entry.tasks.forEach((task, index) => {
    const item = document.createElement("li");
    item.className = task.done ? "is-done" : "";
    item.innerHTML = `
      <label>
        <input type="checkbox" ${task.done ? "checked" : ""} data-task-index="${index}" />
        <span>${task.text}</span>
      </label>
      <button type="button" data-delete-task="${index}" aria-label="删除事项">×</button>
    `;
    taskList.appendChild(item);
  });
}

function saveTodayEntry(entry) {
  const store = getStore();
  const key = toDateKey(today);
  store.entries ||= {};
  store.entries[key] = entry;
  setStore(store);
}

function renderSidePanels() {
  const store = getStore();
  const entry = getTodayEntry(store);
  weekPlan.value = store.weekPlan || "";
  diaryInput.value = entry.diary || "";

  if (store.countdown?.title && store.countdown?.date) {
    countdownTitle.value = store.countdown.title;
    countdownDate.value = store.countdown.date;
  }

  renderCountdown();
  renderTasks();
  renderRecentRecords();
  renderOverview();
}

function getCountdownText(store = getStore()) {
  if (!store.countdown?.title || !store.countdown?.date) {
    return "还没有设置倒计时。";
  }

  const target = new Date(`${store.countdown.date}T00:00:00`);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.ceil((target - startOfToday) / 86400000);
  const unitText = diffDays >= 0 ? `还有 ${diffDays} 天` : `已过去 ${Math.abs(diffDays)} 天`;
  return `${store.countdown.title}：${unitText}`;
}

function renderCountdown() {
  const store = getStore();

  if (!store.countdown?.title || !store.countdown?.date) {
    countdownResult.textContent = "还没有设置倒计时。";
    return;
  }

  countdownResult.textContent = getCountdownText(store);
}

function renderOverview() {
  const store = getStore();
  const entry = getTodayEntry(store);
  const finished = entry.tasks.filter((task) => task.done).length;
  const total = entry.tasks.length;

  if (calendarDateLabel) {
    calendarDateLabel.textContent = today.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  }

  if (calendarTimeLabel) {
    calendarTimeLabel.textContent = new Date().toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (overviewTasks) {
    overviewTasks.textContent = `${finished}/${total}`;
  }

  if (overviewWeek) {
    overviewWeek.textContent = store.weekPlan?.trim() ? "已填写" : "未填写";
  }

  if (overviewCountdown) {
    overviewCountdown.textContent = store.countdown?.title ? getCountdownText(store) : "未设置";
  }

  if (overviewDiary) {
    overviewDiary.textContent = entry.diary?.trim() ? "已记录" : "未记录";
  }
}

function renderRecentRecords() {
  const store = getStore();
  const entries = Object.entries(store.entries || {})
    .filter(([, entry]) => entry.tasks?.length || entry.diary)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 6);

  recentRecords.innerHTML = "";

  if (!entries.length) {
    recentRecords.innerHTML = '<p class="calendar-empty">还没有最近记录。</p>';
    return;
  }

  entries.forEach(([dateKey, entry]) => {
    const card = document.createElement("article");
    const finished = entry.tasks?.filter((task) => task.done).length || 0;
    const total = entry.tasks?.length || 0;
    card.className = "recent-record";
    card.innerHTML = `
      <time>${dateKey}</time>
      <strong>${total ? `事项 ${finished}/${total}` : "日记记录"}</strong>
      <p>${entry.diary ? entry.diary.slice(0, 72) : "今天留下了事项记录。"}</p>
    `;
    recentRecords.appendChild(card);
  });
}

prevMonthButton?.addEventListener("click", () => {
  visibleDate = new Date(visibleDate.getFullYear(), visibleDate.getMonth() - 1, 1);
  renderCalendar();
});

nextMonthButton?.addEventListener("click", () => {
  visibleDate = new Date(visibleDate.getFullYear(), visibleDate.getMonth() + 1, 1);
  renderCalendar();
});

taskForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();

  if (!text) {
    return;
  }

  const entry = getTodayEntry();
  entry.tasks.push({ text, done: false });
  saveTodayEntry(entry);
  taskInput.value = "";
  renderTasks();
  renderCalendar();
  renderRecentRecords();
  renderOverview();
});

taskList?.addEventListener("click", (event) => {
  const checkbox = event.target.closest("[data-task-index]");
  const deleteButton = event.target.closest("[data-delete-task]");
  const entry = getTodayEntry();

  if (checkbox) {
    const index = Number(checkbox.dataset.taskIndex);
    entry.tasks[index].done = checkbox.checked;
    saveTodayEntry(entry);
  }

  if (deleteButton) {
    const index = Number(deleteButton.dataset.deleteTask);
    entry.tasks.splice(index, 1);
    saveTodayEntry(entry);
  }

  renderTasks();
  renderCalendar();
  renderRecentRecords();
  renderOverview();
});

weekPlan?.addEventListener("input", () => {
  const store = getStore();
  store.weekPlan = weekPlan.value;
  setStore(store);
  renderOverview();
});

countdownForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const store = getStore();
  store.countdown = {
    title: countdownTitle.value.trim(),
    date: countdownDate.value,
  };
  setStore(store);
  renderCountdown();
  renderOverview();
});

saveDiaryButton?.addEventListener("click", () => {
  const entry = getTodayEntry();
  entry.diary = diaryInput.value.trim();
  saveTodayEntry(entry);
  renderCalendar();
  renderRecentRecords();
  renderOverview();
});

function closeDiaryLock() {
  document.querySelector(".diary-lock-backdrop")?.remove();
}

function openDiaryLock() {
  if (!openDiaryLinkButton) {
    return;
  }

  closeDiaryLock();

  const backdrop = document.createElement("div");
  backdrop.className = "diary-lock-backdrop";
  backdrop.innerHTML = `
    <form class="diary-lock-dialog" aria-label="日记密码验证">
      <button class="diary-lock-close" type="button" aria-label="关闭">×</button>
      <p class="eyebrow">Private Diary</p>
      <h2>输入密码</h2>
      <p>验证通过后会打开你的 Notion 日记库。</p>
      <input id="diary-password" type="password" placeholder="请输入日记密码" autocomplete="current-password" />
      <div class="diary-lock-error" role="alert" aria-live="polite"></div>
      <button class="button button-primary" type="submit">解锁日记</button>
    </form>
  `;

  document.body.appendChild(backdrop);
  const form = backdrop.querySelector("form");
  const input = backdrop.querySelector("#diary-password");
  const error = backdrop.querySelector(".diary-lock-error");
  const closeButton = backdrop.querySelector(".diary-lock-close");

  input.focus();

  closeButton.addEventListener("click", closeDiaryLock);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) {
      closeDiaryLock();
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const password = openDiaryLinkButton.dataset.password || "";

    if (input.value.trim() !== password) {
      error.textContent = "密码不正确，再试一次。";
      input.select();
      return;
    }

    window.open(openDiaryLinkButton.dataset.url, "_blank", "noopener,noreferrer");
    closeDiaryLock();
  });
}

openDiaryLinkButton?.addEventListener("click", openDiaryLock);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDiaryLock();
  }
});

renderCalendar();
renderSidePanels();
window.setInterval(renderOverview, 30000);
