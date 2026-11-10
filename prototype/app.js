const mockRows = [
  { id: "amazon", platform: "amazon_ads", name: "Amazon Ads", logo: "a", source: "Sponsored Ads weekly report · 合成", sessions: 4200, orders: 168, adSpend: 2100, newCustomers: 132, syncStatus: "success", statusLabel: "同步正常", lastUpdated: "2026-11-02 08:42", completeness: "complete", comparisonStatus: "comparable", dedupStatus: "unverified" },
  { id: "alibaba", platform: "alibaba_com", name: "Alibaba.com", logo: "阿", source: "Marketing summary · 合成", sessions: 3150, orders: 79, adSpend: 1360, newCustomers: 52, syncStatus: "success", statusLabel: "同步正常", lastUpdated: "2026-11-02 08:38", completeness: "complete", comparisonStatus: "comparable", dedupStatus: "unverified" },
  { id: "site", platform: "brand_site", name: "品牌官網", logo: "✳", source: "GA4 sample report · 合成", sessions: 5800, orders: 290, adSpend: 1950, newCustomers: 182, syncStatus: "success", statusLabel: "同步正常", lastUpdated: "2026-11-02 08:45", completeness: "complete", comparisonStatus: "comparable", dedupStatus: "unverified" },
];

const scenarioCopy = {
  normal: "所有示範來源資料完整",
  delayed: "Amazon Ads 更新延遲；保留最近成功時間並暫停示意建議",
  partial: "Alibaba.com 訪問數缺漏，相關彙總已停用",
  mismatch: "品牌官網口徑待確認；跨平台 CVR 彙總已停用",
  failure: "Amazon Ads 同步失敗，保留最近成功更新時間",
};
const recommendation = {
  platform: "Amazon Ads",
  title: "檢視 Amazon Ads 的預算配置",
  body: "示意案例：在正常資料情境中，展示如何根據平台 CVR 與資料完整度提出審閱提示。範例中的 +5% 僅用來示範呈現方式，並非經驗證或核准的預算建議。",
  example: "示意數字：+5%",
  period: "2026/10/26 — 2026/11/01",
  evidence: ["Amazon Ads CVR 4.00%（示意）", "同步狀態：正常", "資料期間：7 天"],
};

const state = { scenario: "normal", view: "overview", pending: null, history: loadHistory() };
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const percent = (value) => `${(value * 100).toFixed(2)}%`;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

function loadHistory() {
  try { return JSON.parse(localStorage.getItem("northstar-demo-history") || "[]"); }
  catch { return []; }
}
function saveHistory() {
  try { localStorage.setItem("northstar-demo-history", JSON.stringify(state.history)); }
  catch { /* Storage can be unavailable in private or restricted contexts. */ }
}
function getRows() {
  const rows = structuredClone(mockRows);
  if ($("#period-select")?.selectedIndex === 1) {
    const priorWeek = {
      amazon: { sessions: 3800, orders: 142, adSpend: 1950, newCustomers: 115, lastUpdated: "2026-10-26 08:40" },
      alibaba: { sessions: 2900, orders: 83, adSpend: 1280, newCustomers: 49, lastUpdated: "2026-10-26 08:36" },
      site: { sessions: 5400, orders: 260, adSpend: 1840, newCustomers: 170, lastUpdated: "2026-10-26 08:43" },
    };
    rows.forEach((row) => Object.assign(row, priorWeek[row.id]));
  }
  if (state.scenario === "delayed") {
    const row = rows.find((item) => item.id === "amazon");
    row.syncStatus = "delayed";
    row.statusLabel = "更新延遲";
  }
  if (state.scenario === "mismatch") {
    const row = rows.find((item) => item.id === "site");
    row.comparisonStatus = "review";
  }
  if (state.scenario === "partial") {
    const row = rows.find((item) => item.id === "alibaba");
    row.sessions = null;
    row.completeness = "partial";
    row.comparisonStatus = "review";
    row.syncStatus = "partial";
    row.statusLabel = "部分缺漏";
  }
  if (state.scenario === "failure") {
    const row = rows.find((item) => item.id === "amazon");
    row.sessions = row.orders = row.adSpend = row.newCustomers = null;
    row.completeness = "missing";
    row.comparisonStatus = "unverified";
    row.syncStatus = "failed";
    row.statusLabel = "同步失敗";
  }
  return rows;
}
function selectedPeriod() { return $("#period-select")?.value || recommendation.period; }
function selectedRecommendationId() { return `weekly-allocation-demo-${selectedPeriod()}`; }
function rowClass(id) { return id === "amazon" ? "amazon" : id === "alibaba" ? "alibaba" : "site"; }
function rowLogo(row) { return `<span class="platform-logo ${rowClass(row.id)}">${row.logo}</span>`; }
function cvr(row) { return Number.isFinite(row.orders) && Number.isFinite(row.sessions) && row.sessions > 0 ? row.orders / row.sessions : null; }
function cac(row) { return Number.isFinite(row.adSpend) && Number.isFinite(row.newCustomers) && row.newCustomers > 0 ? row.adSpend / row.newCustomers : null; }
function statusBadge(row) {
  if (row.comparisonStatus === "review" && row.syncStatus === "success") return `<span class="status-badge partial"><i></i>口徑待確認</span>`;
  return `<span class="status-badge ${row.syncStatus}"><i></i>${row.statusLabel}</span>`;
}
function showValue(value, formatter = (item) => item.toLocaleString("en-US")) { return Number.isFinite(value) ? formatter(value) : `<span class="na">—</span>`; }

function renderOverview() {
  const rows = getRows();
  const allComparable = rows.every((row) => row.completeness === "complete" && row.comparisonStatus === "comparable");
  const validSessions = rows.every((row) => Number.isFinite(row.sessions));
  const validOrders = rows.every((row) => Number.isFinite(row.orders));
  const totalCvr = allComparable && validSessions && validOrders ? rows.reduce((sum, row) => sum + row.orders, 0) / rows.reduce((sum, row) => sum + row.sessions, 0) : null;
  const availableSpend = rows.reduce((sum, row) => sum + (Number.isFinite(row.adSpend) ? row.adSpend : 0), 0);
  const healthy = rows.filter((row) => row.syncStatus === "success" && row.completeness === "complete" && row.comparisonStatus === "comparable").length;
  const available = rows.filter((row) => row.syncStatus !== "failed").length;
  $("#total-cvr").textContent = totalCvr === null ? "不可用" : percent(totalCvr);
  $("#total-cvr").classList.toggle("unavailable", totalCvr === null);
  $("#cvr-caption").textContent = totalCvr === null ? "平台資料不完整或不可比較" : "三平台加權轉換率（示意）";
  $("#total-spend").textContent = money(availableSpend);
  $("#source-count").innerHTML = `${available} <small>/ 3</small>`;
  $("#source-caption").textContent = healthy === 3 ? "來源同步正常" : "至少一個來源需留意";
  $("#scenario-note").textContent = scenarioCopy[state.scenario];
  $("#health-score").textContent = `${healthy}/3`;
  $("#platform-rows").innerHTML = rows.map((row) => `<tr>
    <td><div class="platform-cell">${rowLogo(row)}<span>${row.name}</span></div></td>
    <td>${statusBadge(row)}</td><td>${showValue(row.sessions)}</td><td>${showValue(row.orders)}</td>
    <td>${showValue(cvr(row), percent)}</td><td>${showValue(row.adSpend, money)}</td>
    <td>${showValue(cac(row), (value) => money(value))}</td><td>${row.lastUpdated || '<span class="na">尚無成功紀錄</span>'}</td>
  </tr>`).join("");
  $("#health-list").innerHTML = rows.map((row) => {
    const quality = row.syncStatus === "failed" ? "同步失敗 · 顯示前次成功時間" : row.syncStatus === "partial" ? "訪問數缺漏 · 彙總停用" : row.syncStatus === "delayed" ? "更新延遲 · 最近成功時間已保留" : row.comparisonStatus === "review" ? "口徑待確認 · 彙總停用" : "資料完整 · 去重未核准";
    const level = row.syncStatus === "failed" ? "error" : ["delayed", "partial"].includes(row.syncStatus) || row.comparisonStatus === "review" ? "warn" : "";
    return `<div class="health-row"><i class="health-indicator ${level}"></i>${rowLogo(row)}<strong>${row.name}</strong><small>${quality}</small></div>`;
  }).join("");
  renderGuidancePreview(rows);
}

function renderGuidancePreview(rows = getRows()) {
  const usable = state.scenario === "normal" && rows.every((row) => row.completeness === "complete");
  $("#guidance-preview-content").innerHTML = usable
    ? `<div class="preview-recommendation"><div class="recommendation-platform"><span class="platform-logo amazon">a</span> ${recommendation.title}</div><p>示意案例：提供可供審閱的方向，建議數字只用於展示介面。</p><small>${selectedPeriod()} · 合成資料依據</small></div>`
    : `<div class="preview-recommendation"><div class="recommendation-platform">資料狀態不足</div><p>目前無法顯示可靠的示意依據。請先檢視來源缺漏或同步狀態。</p><small>${selectedPeriod()} · ${scenarioCopy[state.scenario]}</small></div>`;
}

function renderGuidance() {
  const usable = state.scenario === "normal";
  const latest = state.history.find((entry) => entry.recommendationId === selectedRecommendationId());
  const amazonRow = getRows().find((row) => row.id === "amazon");
  const evidence = [
    `Amazon Ads CVR ${cvr(amazonRow) === null ? "不可用" : percent(cvr(amazonRow))}（示意）`,
    `同步狀態：${amazonRow.statusLabel}`,
    "資料期間：7 天",
  ];
  const actionButtons = latest
    ? `<span class="status-badge success"><i></i>已記錄：${escapeHtml(latest.statusLabel)}</span>`
    : `<div class="guidance-actions"><button class="button button-dark" data-decision="accepted" ${usable ? "" : "disabled"}>採納示意</button><button class="button button-secondary" data-decision="partial" ${usable ? "" : "disabled"}>部分採納</button><button class="button button-secondary" data-decision="rejected">不採納</button></div>`;
  $("#guidance-list").innerHTML = `<article class="guidance-card">
    <div class="guidance-card-head"><div class="recommendation-platform">${rowLogo(mockRows[0])} ${recommendation.platform}</div><span class="illustrative-tag">示意案例</span></div>
    <h3>${recommendation.title}</h3><p>${recommendation.body}</p>
    <div class="guidance-evidence">${evidence.map((item) => `<span class="evidence-chip">${item}</span>`).join("")}<span class="evidence-chip">${recommendation.example}</span></div>
    ${!usable ? `<p class="warning-copy">目前資料品質不足，暫停顯示可採納的示意案例；你仍可記錄不採納。</p>` : ""}
    ${actionButtons}
  </article>`;
  $$("[data-decision]", $("#guidance-list")).forEach((button) => button.addEventListener("click", () => openDecision(button.dataset.decision)));
}

function renderHistory() {
  const accepted = state.history.filter((entry) => entry.status !== "rejected").length;
  const rejected = state.history.filter((entry) => entry.status === "rejected").length;
  const withAdjustment = state.history.filter((entry) => Number.isFinite(entry.actualChange)).length;
  $("#history-summary").innerHTML = `<div class="summary-tile"><span>已記錄決策</span><strong>${state.history.length}</strong></div><div class="summary-tile"><span>採納 / 部分採納</span><strong>${accepted}</strong></div><div class="summary-tile"><span>含手動調整金額</span><strong>${withAdjustment}</strong></div>`;
  const sorted = [...state.history].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  $("#history-list").innerHTML = sorted.length ? sorted.map((entry) => `<div class="history-item"><span class="history-symbol">${entry.status === "rejected" ? "×" : "✓"}</span><div><strong>${escapeHtml(entry.recommendationTitle)}</strong><p>${escapeHtml(entry.statusLabel)}${Number.isFinite(entry.actualChange) ? ` · 手動調整 ${money(entry.actualChange)}` : " · 未記錄金額"} · ${escapeHtml(entry.period)}</p></div><time>${escapeHtml(entry.date)}</time></div>`).join("") : `<div class="history-empty"><strong>還沒有決策紀錄</strong>前往「每週建議」記錄一個示意案例，紀錄只保存在此瀏覽器。</div>`;
  if (rejected > 0) $("#history-summary .summary-tile:nth-child(2) span").textContent = `採納 / 部分採納 · 不採納 ${rejected}`;
}

function renderAll() { renderOverview(); renderGuidance(); renderHistory(); }
function setScenario(scenario) {
  state.scenario = scenario;
  $$(".scenario").forEach((button) => button.classList.toggle("active", button.dataset.scenario === scenario));
  renderAll();
}
function setView(view) {
  state.view = view;
  $$(".page-view").forEach((section) => section.classList.toggle("active", section.id === `view-${view}`));
  $$(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  const labels = { overview: "成效總覽", guidance: "每週建議", history: "決策紀錄" };
  $("#breadcrumb-current").textContent = labels[view];
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function openDecision(status) {
  state.pending = status;
  const select = $("#decision-status");
  select.value = status;
  $("#decision-title").textContent = recommendation.title;
  $("#decision-context").textContent = `期間：${selectedPeriod()}。記錄的是原型示意案例的決策，不會對 ${recommendation.platform} 執行任何操作。`;
  $("#actual-change").value = "";
  $("#decision-date").value = new Date().toISOString().slice(0, 10);
  $("#decision-dialog").showModal();
}
function statusName(status) { return ({ accepted: "採納示意", partial: "部分採納", rejected: "不採納" })[status]; }

$("#decision-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const status = $("#decision-status").value;
  const rawAmount = $("#actual-change").value.trim();
  const record = {
    id: crypto.randomUUID(), recommendationId: selectedRecommendationId(), recommendationTitle: recommendation.title,
    status, statusLabel: statusName(status), actualChange: rawAmount === "" ? null : Number(rawAmount),
    date: $("#decision-date").value, createdAt: new Date().toISOString(), period: selectedPeriod(),
  };
  state.history.push(record); saveHistory(); $("#decision-dialog").close(); renderAll();
});

function showInfo(kind) {
  const content = kind === "metrics" ? `<h3>暫定指標定義</h3><p><b>分平台 CVR</b> = 訂單數 ÷ 訪問數。<b>分平台 CAC</b> = 廣告支出 ÷ 該來源新客數。公式只用於合成資料示意。</p><p>跨平台 CVR 僅在三個來源皆完整且示意口徑可比較時顯示。<b>跨平台 CAC 不提供數值</b>，因為跨平台去重與歸因尚未核准。</p><p>實際平台指標、歸因與 SAP 必須由研究負責人核准後才能用於正式研究。</p>` : `<h3>示範欄位映射</h3><ul><li>Amazon Ads · Sponsored Ads weekly report（合成）：detail-page visits → visits；attributed orders → orders；spend → adSpend；new-to-brand customers → newCustomers。</li><li>Alibaba.com · Marketing summary（合成）：visits、orders、spend、new buyers 映射至共通欄位。</li><li>品牌官網 · GA4 sample report（合成）：sessions、transactions、advertiser ad cost、new users 映射至共通欄位。</li></ul><p>以上只是原型名稱，並非已核實 API 欄位。平台定義可能不同，跨平台 CAC 因去重未核准而不可用。</p>`;
  $("#dialog-content").innerHTML = content;
  $("#info-dialog").showModal();
}

$$('[data-view]').forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
$$('[data-go]').forEach((button) => button.addEventListener("click", () => setView(button.dataset.go)));
$$('[data-scenario]').forEach((button) => button.addEventListener("click", () => setScenario(button.dataset.scenario)));
$("#refresh-button").addEventListener("click", () => { setScenario("normal"); $("#refresh-button").innerHTML = "✓ 已更新示範資料"; setTimeout(() => { $("#refresh-button").innerHTML = "<span>↻</span> 更新示範資料"; }, 1400); });
$("#period-select").addEventListener("change", (event) => { const isPrevious = event.target.selectedIndex === 1; document.querySelectorAll(".eyebrow")[0].textContent = isPrevious ? "MONDAY, OCTOBER 26, 2026" : "MONDAY, NOVEMBER 2, 2026"; $("#report-title").textContent = isPrevious ? "前一週成效" : "本週成效"; renderAll(); });
$("#metrics-info").addEventListener("click", () => showInfo("metrics"));
$("#mapping-info").addEventListener("click", () => showInfo("mapping"));
$("#dismiss-banner").addEventListener("click", () => $(".prototype-banner").remove());
$("#clear-history").addEventListener("click", () => { if (state.history.length && window.confirm("要清除這個瀏覽器中的所有示範紀錄嗎？")) { state.history = []; saveHistory(); renderHistory(); renderGuidance(); } });
$$(".close-dialog").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
$("#info-dialog").addEventListener("click", (event) => { if (event.target === event.currentTarget) event.currentTarget.close(); });
$("#decision-dialog").addEventListener("click", (event) => { if (event.target === event.currentTarget) event.currentTarget.close(); });

renderAll();
