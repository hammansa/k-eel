// app.js - extracted from inline script
/* exported changeQty, selectOption, handleSubmit, openKakao, openAdmin, closeAdmin */

// Defaults: placeholders use existing assets in your project
const DEFAULT_CONFIG = {
  pricePerKg: 49000,
  adminPhone: "010-3033-1860",
  kakaoLink: "https://open.kakao.com/o/sXxXxXx",

  brandName: "K-민물(홍삼)장어",
  brandLogo: "assets/logo.png",

  benefit1_Condition: 3,
  benefit1_Text: "🚚 3kg 이상 무료배송 적용!",
  benefit2_Condition: 5,
  benefit2_Text: "🎁 5kg 특전: 장어즙 1포 서비스 + 무료배송",

  midBannerTitle: "지금 혜택 챙기세요",
  midBannerDesc: "3kg 이상 무료배송 · 5kg 특전(장어즙 1포)",

  // Used for grids (best + popular). Same items repeated for now.
  options: [
    { kg: 1, label: "첫 구매 추천", badge: "BEST", thumb: "assets/eel_01.jpg", tags: ["best"] },
    { kg: 2, label: "가족 식사 추천", badge: "", thumb: "assets/eel_02.png", tags: ["family"] },
    { kg: 3, label: "무료배송 적용", badge: "혜택", thumb: "assets/eel_03.png", tags: ["free","best"] },
    { kg: 5, label: "특전+무료배송", badge: "특전", thumb: "assets/eel_01.jpg", tags: ["gift","free","best"] },
  ]
};

const STORAGE_KEY = "k-eel-simga-reskin-v1";
let runtimeConfig = { ...DEFAULT_CONFIG };
let currentQty = 1;
let selectedKg = 1;
let lastOrderMessage = "";

function loadConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return { ...DEFAULT_CONFIG };
    const parsed = JSON.parse(saved);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (e) {
    return { ...DEFAULT_CONFIG };
  }
}

function persistConfig(cfg) { localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)); }

function resetConfig() {
  localStorage.removeItem(STORAGE_KEY);
  runtimeConfig = { ...DEFAULT_CONFIG };
  applyConfigToUI();
  syncAdminInputs();
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function formatKRW(n) {
  try { return Number(n || 0).toLocaleString(); } catch { return String(n || 0); }
}

function applyConfigToUI() {
  const bLogo = document.getElementById("brandLogo");
  const bName = document.getElementById("brandName");
  if (bLogo && runtimeConfig.brandLogo) bLogo.src = runtimeConfig.brandLogo;
  if (bName && runtimeConfig.brandName) bName.textContent = runtimeConfig.brandName;

  document.getElementById("hero-price-per-kg").textContent = formatKRW(runtimeConfig.pricePerKg);
  document.getElementById("hero-benefit-summary").textContent = `${runtimeConfig.benefit1_Condition}kg 이상 무료배송 · ${runtimeConfig.benefit2_Condition}kg 특전`;

  document.getElementById("midBannerTitle").textContent = runtimeConfig.midBannerTitle || DEFAULT_CONFIG.midBannerTitle;
  document.getElementById("midBannerDesc").textContent = runtimeConfig.midBannerDesc || DEFAULT_CONFIG.midBannerDesc;

  document.getElementById("display-phone").textContent = runtimeConfig.adminPhone;
  const bizBanner = document.getElementById("biz-banner");
  bizBanner.onclick = () => (window.location.href = "tel:" + sanitizePhone(runtimeConfig.adminPhone));

  renderGrids("best");
  updatePrice();

  const mid = document.getElementById("mid-banner");
  mid.onclick = () => scrollToOrderAndMaybeSetQty(null);
  mid.onkeydown = (e) => { if (e.key === "Enter") scrollToOrderAndMaybeSetQty(null); };
}

function getOptions() {
  const opts = Array.isArray(runtimeConfig.options) && runtimeConfig.options.length ? runtimeConfig.options : DEFAULT_CONFIG.options;
  return opts.slice(0,4);
}

function optionHint(kg) {
  if (kg >= Number(runtimeConfig.benefit2_Condition)) return runtimeConfig.benefit2_Text;
  if (kg >= Number(runtimeConfig.benefit1_Condition)) return runtimeConfig.benefit1_Text;
  return "혜택 조건 확인";
}

function buildCardHTML(o) {
  const kg = Math.max(1, Number(o.kg || 1));
  const total = kg * Number(runtimeConfig.pricePerKg || 0);
  const hint = optionHint(kg);
  const badge = (o.badge || "").trim();
  const label = (o.label || "").trim();
  const thumb = (o.thumb || "").trim();

  return `
    <button class="product-card" type="button" data-kg="${kg}" onclick="selectOption(${kg})">
      <div class="thumb">
        <img src="${escapeHtml(thumb)}" alt="${kg}kg 옵션" loading="lazy"
             onerror="this.style.display='none'; this.parentElement.classList.add('thumb-fallback');" />
        <div class="thumb-fallback-text">이미지 준비중</div>
        ${badge ? `<span class="badge-pill">${escapeHtml(badge)}</span>` : ""}
      </div>
      <div class="p-body">
        <div class="p-title">${kg}kg <span class="p-sub">${escapeHtml(label)}</span></div>
        <div class="p-price">${formatKRW(total)}원</div>
        <div class="p-hint">${escapeHtml(hint)}</div>
        <div class="p-cta">담기 →</div>
      </div>
    </button>
  `;
}

function renderGrids(filterKey) {
  const opts = getOptions();
  const bestGrid = document.getElementById("option-grid");
  const popGrid = document.getElementById("popular-grid");

  const best = opts.filter(o => (o.tags || []).includes(filterKey));
  const bestFallback = best.length ? best : opts;
  bestGrid.innerHTML = bestFallback.map(buildCardHTML).join("");
  setSelectedCard(selectedKg);

  popGrid.innerHTML = opts.map(buildCardHTML).join("");
  setSelectedCard(selectedKg);
}

function setSelectedCard(kg){
  document.querySelectorAll(".product-card").forEach(el=>{
    const k = Number(el.getAttribute("data-kg")||0);
    if (k === Number(kg)) el.classList.add("selected");
    else el.classList.remove("selected");
  });
}

let toastTimer=null;
function showToast(msg){
  const t=document.getElementById("toast");
  if(!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove("show"), 2400);
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
  btn.classList.add("active");
  renderGrids(btn.dataset.filter || "best");
});

function changeQty(delta) {
  currentQty = Math.max(1, currentQty + delta);
  document.getElementById("quantity").value = currentQty;
  updatePrice();
}

function updatePrice() {
  const total = currentQty * Number(runtimeConfig.pricePerKg || 0);
  document.getElementById("total-price").textContent = formatKRW(total) + "원";

  const osQty = document.getElementById("os-qty");
  const osTotal = document.getElementById("os-total");
  const osBenefit = document.getElementById("os-benefit");
  if (osQty) osQty.textContent = String(currentQty);
  if (osTotal) osTotal.textContent = formatKRW(total) + "원";
  if (osBenefit) osBenefit.textContent = currentBenefitText();

  const badge = document.getElementById("benefit-badge");
  if (currentQty >= Number(runtimeConfig.benefit2_Condition)) {
    badge.textContent = runtimeConfig.benefit2_Text;
    badge.classList.add("active");
  } else if (currentQty >= Number(runtimeConfig.benefit1_Condition)) {
    badge.textContent = runtimeConfig.benefit1_Text;
    badge.classList.add("active");
  } else {
    badge.classList.remove("active");
  }
}

function selectOption(kg) {
  const targetKg = Math.max(1, Number(kg || 1));
  selectedKg = targetKg;
  scrollToOrderAndMaybeSetQty(targetKg);
  setSelectedCard(targetKg);
  showToast(`${targetKg}kg 옵션 선택됨 · ${currentBenefitText()}`);
}

function scrollToOrderAndMaybeSetQty(targetKg) {
  const section = document.getElementById("order-section");
  if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  if (targetKg && Number.isFinite(targetKg)) {
    currentQty = targetKg;
    document.getElementById("quantity").value = String(currentQty);
    updatePrice();
  }
}

function sanitizePhone(p){
  return String(p||"").replaceAll(/[^0-9+]/g,"");
}

function currentBenefitText(){
  if (currentQty >= Number(runtimeConfig.benefit2_Condition)) return runtimeConfig.benefit2_Text;
  if (currentQty >= Number(runtimeConfig.benefit1_Condition)) return runtimeConfig.benefit1_Text;
  return "혜택 조건 확인";
}

function createOrderMessage(formData){
  const name = (formData.get("name")||"").toString().trim();
  const phone = (formData.get("phone")||"").toString().trim();
  const address = (formData.get("address")||"").toString().trim();
  const memo = (formData.get("memo")||"").toString().trim() || "없음";
  const benefit = currentBenefitText();
  const total = formatKRW(currentQty * Number(runtimeConfig.pricePerKg || 0)) + "원";
  const pricePerKg = formatKRW(runtimeConfig.pricePerKg) + "원";

  return (
    `[${runtimeConfig.brandName || "K-민물(홍삼)장어"} 주문]\n` +
    `옵션: ${currentQty}kg\n` +
    `단가: ${pricePerKg}/kg\n` +
    `총액: ${total}\n` +
    `혜택: ${benefit}\n` +
    "---\n" +
    `이름: ${name}\n` +
    `연락처: ${phone}\n` +
    `주소: ${address}\n` +
    `메모: ${memo}`
  );
}

async function copyToClipboard(text){
  try{
    if (navigator.clipboard && navigator.clipboard.writeText){
      await navigator.clipboard.writeText(text);
      return true;
    }
  }catch(e){/* ignore */}
  try{
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position="fixed";
    ta.style.left="-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }catch(e){
    return false;
  }
}

function openFlowModal(message){
  const overlay = document.getElementById("flow-overlay");
  const modal = document.getElementById("flow-modal");
  const preview = document.getElementById("order-preview");
  if (!overlay || !modal || !preview) return;
  preview.textContent = message;
  overlay.classList.add("open");
  modal.classList.add("open");
  overlay.setAttribute("aria-hidden","false");
  modal.setAttribute("aria-hidden","false");
}

function closeFlowModal(){
  const overlay = document.getElementById("flow-overlay");
  const modal = document.getElementById("flow-modal");
  if (!overlay || !modal) return;
  overlay.classList.remove("open");
  modal.classList.remove("open");
  overlay.setAttribute("aria-hidden","true");
  modal.setAttribute("aria-hidden","true");
}

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const message = createOrderMessage(formData);
  lastOrderMessage = message;
  openFlowModal(message);
  copyToClipboard(message).then((ok)=>{
    const sub = document.getElementById("flow-sub");
    if (sub) sub.textContent = ok ? "1) 복사 완료! 2) 카카오 열기 → 3) 붙여넣기 후 전송" : "복사가 안 되면 안내 박스 내용을 길게 눌러 복사해 주세요.";
  });
}

function openKakao(event) {
  if (event) event.preventDefault();
  if (!lastOrderMessage) {
    lastOrderMessage = "주문 정보가 아직 생성되지 않았습니다.\n아래 주문폼을 입력 후 “주문 문구 생성”을 눌러주세요.";
  }
  window.open(runtimeConfig.kakaoLink, "_blank");
}

const flowOverlay = document.getElementById("flow-overlay");
const flowClose = document.getElementById("flow-close");
const flowCopy = document.getElementById("flow-copy");
const flowOpen = document.getElementById("flow-open");
const flowDone = document.getElementById("flow-done");
const flowCall = document.getElementById("flow-call");
const flowRetry = document.getElementById("flow-retry");

if (flowClose) flowClose.addEventListener("click", closeFlowModal);
if (flowOverlay) flowOverlay.addEventListener("click", closeFlowModal);
document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeFlowModal(); });

if (flowCopy) flowCopy.addEventListener("click", async ()=>{
  if (!lastOrderMessage) return;
  const ok = await copyToClipboard(lastOrderMessage);
  showToast(ok ? "주문 문구 복사 완료" : "복사 실패: 박스 내용을 길게 눌러 복사해 주세요");
});

if (flowOpen) flowOpen.addEventListener("click", ()=>{
  window.open(runtimeConfig.kakaoLink, "_blank");
  showToast("카카오 열림 · 입력창에 붙여넣기 후 전송");
  setTimeout(()=>{ closeFlowModal(); }, 600);
});

if (flowDone) flowDone.addEventListener("click", ()=>{
  showToast("붙여넣기 완료! 확인 후 안내드릴게요.");
  closeFlowModal();
});

if (flowRetry) flowRetry.addEventListener("click", ()=>{
  window.open(runtimeConfig.kakaoLink, "_blank");
});

if (flowCall) flowCall.addEventListener("click", (e)=>{
  e.preventDefault();
  window.location.href = "tel:" + sanitizePhone(runtimeConfig.adminPhone);
});

const mCall = document.getElementById("mact-call");
const mKakao = document.getElementById("mact-kakao");
if (mCall) mCall.addEventListener("click", ()=>{
  window.location.href = "tel:" + sanitizePhone(runtimeConfig.adminPhone);
});
if (mKakao) mKakao.addEventListener("click", ()=>{
  if (lastOrderMessage){
    openFlowModal(lastOrderMessage);
  } else {
    const sec = document.getElementById("order-section");
    if (sec) sec.scrollIntoView({behavior:"smooth", block:"start"});
    showToast("주문 정보 입력 후 버튼을 눌러주세요");
  }
});

const adminPanel = document.getElementById("admin-panel");
const adminOverlay = document.getElementById("admin-overlay");

function openAdmin() {
  adminPanel.classList.add("open");
  adminOverlay.classList.add("open");
  adminPanel.setAttribute("aria-hidden", "false");
  adminOverlay.setAttribute("aria-hidden", "false");
  syncAdminInputs();
}

function closeAdmin() {
  adminPanel.classList.remove("open");
  adminOverlay.classList.remove("open");
  adminPanel.setAttribute("aria-hidden", "true");
  adminOverlay.setAttribute("aria-hidden", "true");
  if (location.hash === "#admin") history.replaceState(null, "", location.pathname + location.search);
}

function syncAdminInputs() {
  document.getElementById("adm_pricePerKg").value = runtimeConfig.pricePerKg ?? "";
  document.getElementById("adm_adminPhone").value = runtimeConfig.adminPhone ?? "";
  document.getElementById("adm_kakaoLink").value = runtimeConfig.kakaoLink ?? "";

  document.getElementById("adm_brandName").value = runtimeConfig.brandName ?? "";
  document.getElementById("adm_brandLogo").value = runtimeConfig.brandLogo ?? "";

  document.getElementById("adm_benefit1_Condition").value = runtimeConfig.benefit1_Condition ?? "";
  document.getElementById("adm_benefit1_Text").value = runtimeConfig.benefit1_Text ?? "";
  document.getElementById("adm_benefit2_Condition").value = runtimeConfig.benefit2_Condition ?? "";
  document.getElementById("adm_benefit2_Text").value = runtimeConfig.benefit2_Text ?? "";

  document.getElementById("adm_midBannerTitle").value = runtimeConfig.midBannerTitle ?? "";
  document.getElementById("adm_midBannerDesc").value = runtimeConfig.midBannerDesc ?? "";

  const lines = getOptions().map(o => `${o.kg}|${o.label}|${o.thumb}`).join("\n");
  document.getElementById("adm_optionLines").value = lines;
}

function readAdminInputs() {
  const optionLines = String(document.getElementById("adm_optionLines").value || "")
    .split("\n").map(v => v.trim()).filter(Boolean).slice(0,4);

  const base = DEFAULT_CONFIG.options;
  const options = optionLines.map((line, idx) => {
    const parts = line.split("|");
    const kg = Math.max(1, Number((parts[0] || "").trim() || base[idx]?.kg || 1));
    const label = (parts[1] || "").trim() || base[idx]?.label || "";
    const thumb = (parts[2] || "").trim() || base[idx]?.thumb || "";
    const badge = base[idx]?.badge || "";
    const tags = base[idx]?.tags || ["best"];
    return { kg, label, thumb, badge, tags };
  });
  while (options.length < 4) options.push(base[options.length]);

  return {
    ...runtimeConfig,
    pricePerKg: Number(document.getElementById("adm_pricePerKg").value || 0),
    adminPhone: String(document.getElementById("adm_adminPhone").value || "").trim(),
    kakaoLink: String(document.getElementById("adm_kakaoLink").value || "").trim(),
    brandName: String(document.getElementById("adm_brandName").value || "").trim(),
    brandLogo: String(document.getElementById("adm_brandLogo").value || "").trim(),
    benefit1_Condition: Number(document.getElementById("adm_benefit1_Condition").value || 0),
    benefit1_Text: String(document.getElementById("adm_benefit1_Text").value || "").trim(),
    benefit2_Condition: Number(document.getElementById("adm_benefit2_Condition").value || 0),
    benefit2_Text: String(document.getElementById("adm_benefit2_Text").value || "").trim(),
    midBannerTitle: String(document.getElementById("adm_midBannerTitle").value || "").trim(),
    midBannerDesc: String(document.getElementById("adm_midBannerDesc").value || "").trim(),
    options
  };
}

document.getElementById("admin-close").addEventListener("click", closeAdmin);
adminOverlay.addEventListener("click", closeAdmin);
document.getElementById("admin-save").addEventListener("click", () => {
  const next = readAdminInputs();
  runtimeConfig = next;
  persistConfig(next);
  applyConfigToUI();
  alert("저장 완료! 즉시 반영되었습니다.");
  closeAdmin();
});
document.getElementById("admin-reset").addEventListener("click", () => {
  if (confirm("기본값으로 초기화할까요?")) resetConfig();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeAdmin();
  if (e.ctrlKey && e.altKey && (e.key === "a" || e.key === "A")) { e.preventDefault(); openAdmin(); }
});

window.addEventListener("hashchange", () => { if (location.hash === "#admin") openAdmin(); });

// init
runtimeConfig = loadConfig();
applyConfigToUI();
setSelectedCard(selectedKg);
updatePrice();
if (location.hash === "#admin") openAdmin();

// Expose functions used by inline HTML attributes
window.changeQty = changeQty;
window.selectOption = selectOption;
window.handleSubmit = handleSubmit;
window.openKakao = openKakao;
window.openAdmin = openAdmin;
window.closeAdmin = closeAdmin;
