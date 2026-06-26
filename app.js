const STORAGE_KEY = "printer_repair_records_v3";
const CUSTOMER_SUBMISSIONS_STORAGE_KEY = "printer_customer_submissions_v1";
const LAST_CUSTOMER_SUBMISSION_KEY = "printer_last_customer_submission_v1";
const PUBLIC_SHARE_BASE_URL = "https://hihu-hu.github.io/repair-register/";
const CUSTOMER_REGISTER_URL = `${PUBLIC_SHARE_BASE_URL}customer.html`;
const LOCAL_CUSTOMER_REGISTER_URL = "http://192.168.1.211:5173/customer.html";
const ADMIN_USERNAME = "CCCC";
const ADMIN_EMAIL = "1041852311@qq.com";
const SUPABASE_URL = "https://olvkyqmlbpqzffypabzj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vCjqGjgyz9E4XhtOcOS1Yg_SV-DBJGG";
const MULTI_VALUE_SEPARATOR = "、";

const optionSets = {
  hasPower: ["有", "没有"],
  area: ["直营", "代理商"],
  finalStatus: ["维修中", "邮寄并结束", "已寄出", "返厂中", "今天需要寄", "待寄出", "测试中"],
  faultOwnership: ["硬件损坏", "非硬件", "外接因素"],
  faultCategory: ["传感器", "主板", "打印头", "模块", "屏幕", "塑料件", "其他"],
  model: ["GMX", "GMI", "GMT", "GMH", "GMX-5G", "GMT-5G", "DK110A", "DK110B", "DK110S", "DK80", "新北洋110", "芯烨80"]
};

const modelPrefixRules = [
  ["1009", "GMX"],
  ["10064", "GMI"],
  ["2003", "GMT"],
  ["10063", "GMH"],
  ["2009", "GMX-5G"],
  ["3003", "GMT-5G"],
  ["1002", "DK110A"],
  ["1007", "DK110B"],
  ["2002", "DK110S"],
  ["1003", "DK80"],
  ["7", "新北洋110"],
  ["9", "芯烨80"]
];

const directCities = ["杭州", "广州", "郑州", "苏州", "武汉", "株洲", "成都"];

const exportFields = [
  ["createdTime", "创建时间"],
  ["trackingNumber", "快递单号"],
  ["region", "地区"],
  ["area", "区域"],
  ["deviceNumber", "编号"],
  ["hasPower", "有无电源"],
  ["companyName", "公司名"],
  ["customerIssue", "客户描述问题"],
  ["repairProcess", "维修过程"],
  ["returnTime", "寄回时间"],
  ["finalStatus", "最终状态"],
  ["returnTrackingNumber", "寄回单号"],
  ["faultOwnership", "故障归属"],
  ["faultCategory", "故障分类"],
  ["customerAddress", "客户地址"],
  ["model", "型号"]
];

const els = {
  totalCount: document.querySelector("#totalCount"),
  repairViewBtn: document.querySelector("#repairViewBtn"),
  submissionsViewBtn: document.querySelector("#submissionsViewBtn"),
  customerViewBtn: document.querySelector("#customerViewBtn"),
  repairViews: document.querySelectorAll(".repair-view"),
  customerPage: document.querySelector("#customerPage"),
  customerIntro: document.querySelector(".customer-intro"),
  customerRecent: document.querySelector("#customerRecent"),
  customerRecentDetail: document.querySelector("#customerRecentDetail"),
  newCustomerSubmissionBtn: document.querySelector("#newCustomerSubmissionBtn"),
  submissionsPage: document.querySelector("#submissionsPage"),
  customerQrImage: document.querySelector("#customerQrImage"),
  copyCustomerLinkBtn: document.querySelector("#copyCustomerLinkBtn"),
  customerForm: document.querySelector("#customerForm"),
  customerSubmitBtn: document.querySelector("#customerSubmitBtn"),
  areaPickerDialog: document.querySelector("#areaPickerDialog"),
  areaPickerTitle: document.querySelector("#areaPickerTitle"),
  areaPickerOptions: document.querySelector("#areaPickerOptions"),
  closeAreaPickerBtn: document.querySelector("#closeAreaPickerBtn"),
  submissionDialog: document.querySelector("#submissionDialog"),
  submissionForm: document.querySelector("#submissionForm"),
  closeSubmissionDialogBtn: document.querySelector("#closeSubmissionDialogBtn"),
  cancelSubmissionDialogBtn: document.querySelector("#cancelSubmissionDialogBtn"),
  submissionsBody: document.querySelector("#submissionsBody"),
  submissionCount: document.querySelector("#submissionCount"),
  submissionsEmptyState: document.querySelector("#submissionsEmptyState"),
  testingCount: document.querySelector("#testingCount"),
  readyCount: document.querySelector("#readyCount"),
  finishedCount: document.querySelector("#finishedCount"),
  testStatusCount: document.querySelector("#testStatusCount"),
  filteredCount: document.querySelector("#filteredCount"),
  filterSummaryCount: document.querySelector("#filterSummaryCount"),
  recordsBody: document.querySelector("#recordsBody"),
  emptyState: document.querySelector("#emptyState"),
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
  ownershipFilter: document.querySelector("#ownershipFilter"),
  categoryFilter: document.querySelector("#categoryFilter"),
  categoryFilterToggle: document.querySelector("#categoryFilterToggle"),
  categoryFilterMenu: document.querySelector("#categoryFilterMenu"),
  modelFilter: document.querySelector("#modelFilter"),
  regionFilter: document.querySelector("#regionFilter"),
  areaFilter: document.querySelector("#areaFilter"),
  dateFrom: document.querySelector("#dateFrom"),
  dateTo: document.querySelector("#dateTo"),
  resetFiltersBtn: document.querySelector("#resetFiltersBtn"),
  exportCsvBtn: document.querySelector("#exportCsvBtn"),
  importExcelBtn: document.querySelector("#importExcelBtn"),
  importExcelInput: document.querySelector("#importExcelInput"),
  authToggleBtn: document.querySelector("#authToggleBtn"),
  authDialog: document.querySelector("#authDialog"),
  authForm: document.querySelector("#authForm"),
  closeAuthDialogBtn: document.querySelector("#closeAuthDialogBtn"),
  cancelAuthDialogBtn: document.querySelector("#cancelAuthDialogBtn"),
  newRecordBtn: document.querySelector("#newRecordBtn"),
  recordDialog: document.querySelector("#recordDialog"),
  recordForm: document.querySelector("#recordForm"),
  recordId: document.querySelector("#recordId"),
  dialogTitle: document.querySelector("#dialogTitle"),
  faultCategoryToggle: document.querySelector("#faultCategoryToggle"),
  faultCategoryMenu: document.querySelector("#faultCategoryMenu"),
  closeDialogBtn: document.querySelector("#closeDialogBtn"),
  cancelDialogBtn: document.querySelector("#cancelDialogBtn"),
  deleteRecordBtn: document.querySelector("#deleteRecordBtn"),
  saveRecordBtn: document.querySelector("#saveRecordBtn"),
  matchBox: document.querySelector("#matchBox"),
  shareDialog: document.querySelector("#shareDialog"),
  shareUrlOutput: document.querySelector("#shareUrlOutput"),
  copyShareUrlBtn: document.querySelector("#copyShareUrlBtn"),
  closeShareDialogBtn: document.querySelector("#closeShareDialogBtn"),
  doneShareDialogBtn: document.querySelector("#doneShareDialogBtn"),
  modeNote: document.querySelector("#modeNote"),
  toast: document.querySelector("#toast"),
  addressPopover: document.querySelector("#addressPopover")
};

let toastTimer = null;
let readonlyMode = false;
let cloudMode = false;
let adminMode = false;
let forceReadonlyMode = false;
let supabaseClient = null;
const sharedData = readSharedData();
let records = sharedData ? sharedData.records : loadRecords();
let filteredRecords = [];
let customerSubmissions = sharedData ? sharedData.submissions : loadCustomerSubmissions();
let currentView = "repair";
let areaData = null;
let appliedSubmissionSnapshot = null;
let appliedSubmissionId = "";
let ignoredSubmissionId = "";
let matchedSubmissionForRecord = null;
let isCustomerSubmitting = false;
let lastCustomerSubmitFingerprint = "";
let lastCustomerSubmitTime = 0;

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).map(normalizeRecord) : [];
  } catch {
    return [];
  }
}

function loadCustomerSubmissions() {
  try {
    const raw = localStorage.getItem(CUSTOMER_SUBMISSIONS_STORAGE_KEY);
    return raw ? JSON.parse(raw).map(normalizeCustomerSubmission) : [];
  } catch {
    return [];
  }
}

function readSharedData() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ""));
  const payload = params.get("view") || params.get("v");
  forceReadonlyMode = location.hash.replace(/^#/, "") === "readonly" || Boolean(payload);
  if (forceReadonlyMode) setReadonlyMode(true);
  if (!payload) return null;

  try {
    return unpackSharedData(decodePayload(payload));
  } catch {
    showToast("分享链接无法读取");
    return { records: [], submissions: [] };
  }
}

function applyHashRoute() {
  if (applyViewFromHash()) return;

  const hashSharedData = readSharedData();
  if (hashSharedData) {
    records = hashSharedData.records;
    customerSubmissions = hashSharedData.submissions;
    closeOpenDialogs();
    render();
    return;
  }

  if (cloudMode) {
    refreshAccessMode();
    loadCloudRecords();
    return;
  }

  setReadonlyMode(false);
  setView("repair");
  records = loadRecords();
  render();
}

function closeOpenDialogs() {
  [els.recordDialog, els.shareDialog].forEach((dialog) => {
    if (dialog.open) dialog.close();
  });
}

function normalizeCustomerSubmission(item = {}) {
  return {
    id: String(item.id || createCustomerSubmissionId()),
    createdTime: normalizeDateTime(item.createdTime || item.created_at || new Date()),
    deviceNumber: String(item.deviceNumber || item.device_number || "").trim(),
    model: normalizeOption(item.model, optionSets.model, "GMX"),
    companyName: String(item.companyName || item.company_name || "").trim(),
    contactName: String(item.contactName || item.contact_name || "").trim(),
    phone: String(item.phone || "").trim(),
    trackingNumber: String(item.trackingNumber || item.tracking_number || "").trim(),
    customerIssue: String(item.customerIssue || item.customer_issue || "").trim(),
    customerAddress: String(item.customerAddress || item.customer_address || "").trim(),
    updatedAt: String(item.updatedAt || item.updated_at || new Date().toISOString())
  };
}

function normalizeRecord(record = {}) {
  const region = String(record.region || "");
  return {
    id: String(record.id || createId()),
    createdTime: normalizeDateTime(record.createdTime || record.createdAt || record.repairDate),
    trackingNumber: String(record.trackingNumber || record.inboundTracking || ""),
    region,
    area: classifyArea(region),
    deviceNumber: String(record.deviceNumber || record.printerId || ""),
    hasPower: normalizeOption(record.hasPower, optionSets.hasPower, "有"),
    companyName: String(record.companyName || record.customer || ""),
    customerIssue: String(record.customerIssue || record.issue || ""),
    repairProcess: String(record.repairProcess || record.process || ""),
    returnTime: normalizeDate(record.returnTime || record.returnedDate || ""),
    finalStatus: normalizeOption(record.finalStatus || record.status, optionSets.finalStatus, "测试中"),
    returnTrackingNumber: String(record.returnTrackingNumber || record.outboundTracking || ""),
    faultOwnership: normalizeOption(record.faultOwnership, optionSets.faultOwnership, "硬件损坏"),
    faultCategory: normalizeFaultCategories(record.faultCategory).join(MULTI_VALUE_SEPARATOR),
    customerAddress: String(record.customerAddress || record.address || ""),
    model: normalizeOption(record.model, optionSets.model, "GMX"),
    updatedAt: String(record.updatedAt || new Date().toISOString())
  };
}

function normalizeOption(value, options, fallback) {
  const text = String(value || "").trim();
  return options.includes(text) ? text : fallback;
}

function inferModelFromDeviceNumber(deviceNumber) {
  const number = String(deviceNumber || "").replace(/\D/g, "");
  const rule = modelPrefixRules.find(([prefix]) => number.startsWith(prefix));
  return rule?.[1] || "";
}

function normalizeFaultCategories(value) {
  const rawItems = Array.isArray(value)
    ? value
    : String(value || "").split(/[、,，;；/|]/);
  const selected = rawItems
    .map((item) => String(item || "").trim())
    .filter((item) => optionSets.faultCategory.includes(item));
  return [...new Set(selected)].length > 0 ? [...new Set(selected)] : ["其他"];
}

function getMultiSelectValues(select) {
  return Array.from(select.selectedOptions)
    .map((option) => option.value)
    .filter(Boolean);
}

function setMultiSelectValues(select, values) {
  const selected = new Set(normalizeFaultCategories(values));
  Array.from(select.options).forEach((option) => {
    option.selected = selected.has(option.value);
  });
}

function clearMultiSelect(select) {
  Array.from(select.options).forEach((option) => {
    option.selected = false;
  });
}

function buildCheckboxMenu(menu, values) {
  menu.replaceChildren(
    ...values.map((value) => {
      const label = document.createElement("label");
      label.className = "checkbox-select-option";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = value;

      const text = document.createElement("span");
      text.textContent = value;

      label.append(checkbox, text);
      return label;
    })
  );
}

function syncCheckboxMenu(menu, selectedValues) {
  menu.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    const checked = selectedValues.includes(checkbox.value);
    checkbox.checked = checked;
    checkbox.closest(".checkbox-select-option")?.classList.toggle("is-selected", checked);
  });
}

function updateCategoryFilterPicker() {
  const selected = getMultiSelectValues(els.categoryFilter);
  els.categoryFilterToggle.textContent = selected.length > 0 ? selected.join(MULTI_VALUE_SEPARATOR) : "全部";
  els.categoryFilterToggle.classList.toggle("is-placeholder", selected.length === 0);
  syncCheckboxMenu(els.categoryFilterMenu, selected);
}

function updateFaultCategoryPicker() {
  const select = els.recordForm.elements.faultCategory;
  const selected = getMultiSelectValues(select);
  els.faultCategoryToggle.textContent = selected.length > 0 ? selected.join(MULTI_VALUE_SEPARATOR) : "请选择";
  els.faultCategoryToggle.classList.toggle("is-placeholder", selected.length === 0);
  els.faultCategoryToggle.classList.toggle("is-invalid", selected.length === 0 && els.faultCategoryToggle.classList.contains("is-invalid"));
  syncCheckboxMenu(els.faultCategoryMenu, selected);
}

function showFaultCategoryRequired() {
  showToast("请选择故障分类");
  els.faultCategoryToggle.classList.add("is-invalid");
  els.faultCategoryToggle.scrollIntoView({ block: "center", behavior: "smooth" });
  els.faultCategoryToggle.focus();
  if (els.faultCategoryMenu.hidden) toggleFaultCategoryPicker();
}

function closeCategoryFilterPicker() {
  els.categoryFilterMenu.hidden = true;
  els.categoryFilterToggle.setAttribute("aria-expanded", "false");
}

function closeFaultCategoryPicker() {
  els.faultCategoryMenu.hidden = true;
  els.faultCategoryToggle.setAttribute("aria-expanded", "false");
}

function toggleCategoryFilterPicker() {
  const willOpen = els.categoryFilterMenu.hidden;
  els.categoryFilterMenu.hidden = !willOpen;
  els.categoryFilterToggle.setAttribute("aria-expanded", String(willOpen));
  closeFaultCategoryPicker();
}

function toggleFaultCategoryPicker() {
  const willOpen = els.faultCategoryMenu.hidden;
  els.faultCategoryMenu.hidden = !willOpen;
  els.faultCategoryToggle.setAttribute("aria-expanded", String(willOpen));
  closeCategoryFilterPicker();
}

function classifyArea(region) {
  const text = String(region || "").trim();
  return directCities.some((city) => text.includes(city)) ? "直营" : "代理商";
}

function normalizeDateTime(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 16);
  }
  return toInputDateTime(date);
}

function normalizeDate(value) {
  if (!value) return "";
  const text = String(value);
  const isoDate = text.match(/^\d{4}-\d{2}-\d{2}/);
  if (isoDate) return isoDate[0];

  const date = value instanceof Date ? value : new Date(text);
  if (Number.isNaN(date.getTime())) return text.slice(0, 10);
  return toInputDate(date);
}

function parseRecordTime(value) {
  if (!value) return 0;
  const text = String(value).trim();
  const normalizedText = text
    .replace(/[年月]/g, "-")
    .replace(/日/g, "")
    .replace(/\//g, "-")
    .replace(/\s+/g, " ");
  const match = normalizedText.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2}))?/);
  if (match) {
    const [, year, month, day, hour = "0", minute = "0"] = match;
    const parsed = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute)
    );
    return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function recordDateKey(value) {
  const parsed = parseRecordTime(value);
  return parsed ? toInputDate(new Date(parsed)) : String(value || "").slice(0, 10);
}

function compareRecordsNewestFirst(a, b) {
  const timeDiff = parseRecordTime(b.createdTime) - parseRecordTime(a.createdTime);
  if (timeDiff !== 0) return timeDiff;
  return (b.updatedAt || "").localeCompare(a.updatedAt || "");
}

function sortRecordsNewestFirst(items) {
  return items.sort(compareRecordsNewestFirst);
}

function sortCustomerSubmissionsNewestFirst(items) {
  return items.sort((a, b) => {
    const timeDiff = parseRecordTime(b.createdTime) - parseRecordTime(a.createdTime);
    if (timeDiff !== 0) return timeDiff;
    return (b.updatedAt || "").localeCompare(a.updatedAt || "");
  });
}

function compareItemsOldestFirst(a, b) {
  const timeDiff = parseRecordTime(a.createdTime) - parseRecordTime(b.createdTime);
  if (timeDiff !== 0) return timeDiff;
  return String(a.updatedAt || "").localeCompare(String(b.updatedAt || ""));
}

function getReviewedSubmissionIds() {
  const submissionsByDevice = new Map();
  customerSubmissions.forEach((submission) => {
    const deviceNumber = String(submission.deviceNumber || "").trim().toLowerCase();
    if (!deviceNumber) return;
    if (!submissionsByDevice.has(deviceNumber)) submissionsByDevice.set(deviceNumber, []);
    submissionsByDevice.get(deviceNumber).push(submission);
  });

  submissionsByDevice.forEach((items) => items.sort(compareItemsOldestFirst));

  const recordCountsByDevice = new Map();
  const reviewedIds = new Set();
  records
    .filter((record) => String(record.deviceNumber || "").trim())
    .sort(compareItemsOldestFirst)
    .forEach((record) => {
      const deviceNumber = String(record.deviceNumber || "").trim().toLowerCase();
      const recordCount = recordCountsByDevice.get(deviceNumber) || 0;
      const matchedSubmission = submissionsByDevice.get(deviceNumber)?.[recordCount];
      recordCountsByDevice.set(deviceNumber, recordCount + 1);
      if (matchedSubmission) reviewedIds.add(matchedSubmission.id);
    });

  return reviewedIds;
}

function toInputDateTime(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toInputDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function saveRecords() {
  if (readonlyMode) return;
  sortRecordsNewestFirst(records);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function saveCustomerSubmissions() {
  sortCustomerSubmissionsNewestFirst(customerSubmissions);
  localStorage.setItem(CUSTOMER_SUBMISSIONS_STORAGE_KEY, JSON.stringify(customerSubmissions));
}

function setReadonlyMode(value) {
  readonlyMode = value;
  document.body.classList.toggle("readonly", readonlyMode);
  els.modeNote.hidden = !readonlyMode;
}

function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase?.createClient);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = Array.from(document.scripts).find((script) => script.src === src);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      if (hasSupabaseConfig()) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function ensureSupabaseLoaded() {
  if (hasSupabaseConfig()) return true;

  const sources = [
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
    "https://unpkg.com/@supabase/supabase-js@2"
  ];

  for (const source of sources) {
    try {
      await loadScript(source);
      if (hasSupabaseConfig()) return true;
    } catch (error) {
      console.warn("Supabase 脚本加载失败", source, error);
    }
  }

  showToast("云端连接加载失败，请刷新页面");
  return false;
}

function refreshAccessMode() {
  if (!cloudMode) return;
  setReadonlyMode(forceReadonlyMode || !adminMode);
  els.authToggleBtn.hidden = forceReadonlyMode;
  els.authToggleBtn.textContent = adminMode ? "退出登录" : "管理员登录";
  renderSubmissions();
}

function toDatabaseRecord(record) {
  return {
    id: record.id,
    created_time: record.createdTime || "",
    tracking_number: record.trackingNumber || "",
    region: record.region || "",
    area: record.area || "",
    device_number: record.deviceNumber || "",
    has_power: record.hasPower || "",
    company_name: record.companyName || "",
    customer_issue: record.customerIssue || "",
    repair_process: record.repairProcess || "",
    return_time: record.returnTime || "",
    final_status: record.finalStatus || "",
    return_tracking_number: record.returnTrackingNumber || "",
    fault_ownership: record.faultOwnership || "",
    fault_category: record.faultCategory || "",
    customer_address: record.customerAddress || "",
    model: record.model || "",
    updated_at: record.updatedAt || new Date().toISOString()
  };
}

function fromDatabaseRecord(record) {
  return normalizeRecord({
    id: record.id,
    createdTime: record.created_time,
    trackingNumber: record.tracking_number,
    region: record.region,
    area: record.area,
    deviceNumber: record.device_number,
    hasPower: record.has_power,
    companyName: record.company_name,
    customerIssue: record.customer_issue,
    repairProcess: record.repair_process,
    returnTime: record.return_time,
    finalStatus: record.final_status,
    returnTrackingNumber: record.return_tracking_number,
    faultOwnership: record.fault_ownership,
    faultCategory: record.fault_category,
    customerAddress: record.customer_address,
    model: record.model,
    updatedAt: record.updated_at
  });
}

function toDatabaseSubmission(item) {
  return {
    id: item.id,
    created_time: item.createdTime || "",
    device_number: item.deviceNumber || "",
    model: item.model || "",
    company_name: item.companyName || "",
    contact_name: item.contactName || "",
    phone: item.phone || "",
    tracking_number: item.trackingNumber || "",
    customer_issue: item.customerIssue || "",
    customer_address: item.customerAddress || "",
    updated_at: item.updatedAt || new Date().toISOString()
  };
}

function fromDatabaseSubmission(item) {
  return normalizeCustomerSubmission({
    id: item.id,
    createdTime: item.created_time,
    deviceNumber: item.device_number,
    model: item.model,
    companyName: item.company_name,
    contactName: item.contact_name,
    phone: item.phone,
    trackingNumber: item.tracking_number,
    customerIssue: item.customer_issue,
    customerAddress: item.customer_address,
    updatedAt: item.updated_at
  });
}

async function initializeCloud() {
  if ((forceReadonlyMode && location.hash.includes("view=")) || !(await ensureSupabaseLoaded())) return;

  cloudMode = true;
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data } = await supabaseClient.auth.getSession();
  const email = data.session?.user?.email || "";
  adminMode = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  refreshAccessMode();
  await loadCloudRecords();
  await loadCloudSubmissions();

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    const sessionEmail = session?.user?.email || "";
    adminMode = sessionEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    refreshAccessMode();
    loadCloudRecords();
    loadCloudSubmissions();
  });
}

async function loadCloudRecords() {
  if (!cloudMode || !supabaseClient || (forceReadonlyMode && location.hash.includes("view="))) return;

  const { data, error } = await supabaseClient
    .from("repair_records")
    .select("*")
    .order("created_time", { ascending: false });

  if (error) {
    console.error(error);
    showToast("云端数据读取失败");
    return;
  }

  if (adminMode && data.length === 0 && !forceReadonlyMode) {
    const localRecords = loadRecords();
    if (localRecords.length > 0 && confirm("检测到本机有旧记录，是否同步到云端？")) {
      try {
        await saveCloudRecords(localRecords);
        records = sortRecordsNewestFirst(localRecords);
        render();
        showToast("本机记录已同步到云端");
        return;
      } catch (saveError) {
        console.error(saveError);
        showToast("本机记录同步失败");
      }
    }
  }

  records = sortRecordsNewestFirst(data.map(fromDatabaseRecord));
  render();
}

async function saveCloudRecord(record) {
  const { error } = await supabaseClient
    .from("repair_records")
    .upsert(toDatabaseRecord(record), { onConflict: "id" });
  if (error) throw error;
}

async function saveCloudRecords(items) {
  const { error } = await supabaseClient
    .from("repair_records")
    .upsert(items.map(toDatabaseRecord), { onConflict: "id" });
  if (error) throw error;
}

async function deleteCloudRecord(id) {
  const { error } = await supabaseClient.from("repair_records").delete().eq("id", id);
  if (error) throw error;
}

async function loadCloudSubmissions() {
  if (!cloudMode || !supabaseClient) return;

  const { data, error } = await supabaseClient
    .from("customer_repair_submissions")
    .select("*")
    .order("created_time", { ascending: false });

  if (error) {
    console.error(error);
    showToast("客户提交读取失败，请确认数据库已更新");
    renderSubmissions();
    return;
  }

  customerSubmissions = sortCustomerSubmissionsNewestFirst(data.map(fromDatabaseSubmission));
  renderSubmissions();
}

async function saveCloudSubmission(item) {
  const { error } = await supabaseClient
    .from("customer_repair_submissions")
    .upsert(toDatabaseSubmission(item), { onConflict: "id" });
  if (error) throw error;
}

async function deleteCloudSubmission(id) {
  const { error } = await supabaseClient.from("customer_repair_submissions").delete().eq("id", id);
  if (error) throw error;
}

function createId() {
  return `repair-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createCustomerSubmissionId() {
  return `customer-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function fillSelect(select, values, includeAll = false) {
  select.replaceChildren();
  if (includeAll) select.append(new Option("全部", ""));
  values.forEach((value) => select.append(new Option(value, value)));
}

function fillRequiredSelect(select, values) {
  select.replaceChildren(new Option("请选择", ""));
  values.forEach((value) => select.append(new Option(value, value)));
}

function fillMultiSelect(select, values) {
  select.replaceChildren();
  values.forEach((value) => select.append(new Option(value, value)));
}

function fillCategoryFilterPicker() {
  fillMultiSelect(els.categoryFilter, optionSets.faultCategory);
  buildCheckboxMenu(els.categoryFilterMenu, optionSets.faultCategory);
  updateCategoryFilterPicker();
}

function fillFaultCategoryPicker() {
  const select = els.recordForm.elements.faultCategory;
  fillMultiSelect(select, optionSets.faultCategory);
  buildCheckboxMenu(els.faultCategoryMenu, optionSets.faultCategory);
  updateFaultCategoryPicker();
}

function fillStaticOptions() {
  fillSelect(els.statusFilter, optionSets.finalStatus, true);
  fillSelect(els.ownershipFilter, optionSets.faultOwnership, true);
  fillCategoryFilterPicker();
  fillSelect(els.modelFilter, optionSets.model, true);
  fillSelect(els.areaFilter, optionSets.area, true);
  fillRequiredSelect(els.submissionForm.elements.model, optionSets.model);
  fillRequiredSelect(els.recordForm.elements.hasPower, optionSets.hasPower);
  fillSelect(els.recordForm.elements.finalStatus, optionSets.finalStatus);
  fillRequiredSelect(els.recordForm.elements.faultOwnership, optionSets.faultOwnership);
  fillFaultCategoryPicker();
  fillAddressSelects();
}

function fillAddressSelects() {
  const form = els.customerForm.elements;
  if (!form.addressProvince || !form.addressCity || !form.addressDistrict) return;
  fillRequiredSelect(form.addressProvince, []);
  fillRequiredSelect(form.addressCity, []);
  fillRequiredSelect(form.addressDistrict, []);
}

function fillAreaSelect(select, items, placeholder = "请选择") {
  select.replaceChildren(new Option(placeholder, ""));
  Object.entries(items || {}).forEach(([code, name]) => {
    select.append(new Option(name, code));
  });
}

function setAreaButton(level, text, isPlaceholder = false) {
  const button = els.customerForm.querySelector(`[data-area-level="${level}"]`);
  if (!button) return;
  button.textContent = text;
  button.classList.toggle("is-placeholder", isPlaceholder);
}

function syncAreaButtons() {
  const form = els.customerForm.elements;
  const province = selectedOptionText(form.addressProvince);
  const city = selectedOptionText(form.addressCity);
  const district = selectedOptionText(form.addressDistrict);
  setAreaButton("province", province || "请选择省", !province);
  setAreaButton("city", city || (form.addressProvince.value ? "请选择市" : "请先选择省"), !city);
  setAreaButton("district", district || (form.addressCity.value ? "请选择区 / 县" : "请先选择市"), !district);
}

function syncSimpleSelectButton(selectName) {
  const select = els.customerForm.elements[selectName];
  const button = els.customerForm.querySelector(`[data-simple-select="${selectName}"]`);
  if (!select || !button) return;
  const text = selectedOptionText(select);
  button.textContent = text || "请选择";
  button.classList.toggle("is-placeholder", !text);
}

function openSimpleSelectPicker(selectName, title) {
  const select = els.customerForm.elements[selectName];
  if (!select) return;
  els.areaPickerTitle.textContent = title;
  els.areaPickerOptions.replaceChildren();

  Array.from(select.options).forEach((option) => {
    const button = document.createElement("button");
    button.className = "area-option";
    button.type = "button";
    button.textContent = option.textContent;
    button.dataset.simpleSelect = selectName;
    button.dataset.optionValue = option.value;
    button.classList.toggle("is-active", select.value === option.value);
    els.areaPickerOptions.append(button);
  });
  els.areaPickerDialog.showModal();
}

function chooseSimpleSelectOption(selectName, value) {
  const select = els.customerForm.elements[selectName];
  if (!select) return;
  select.value = value;
  syncSimpleSelectButton(selectName);
  els.areaPickerDialog.close();
}

function getAreaPickerConfig(level) {
  const form = els.customerForm.elements;
  if (level === "province") {
    return {
      title: "选择省",
      select: form.addressProvince,
      items: areaData?.["86"] || {},
      emptyText: "省市区数据加载中"
    };
  }
  if (level === "city") {
    return {
      title: "选择市",
      select: form.addressCity,
      items: areaData?.[form.addressProvince.value] || {},
      emptyText: form.addressProvince.value ? "暂无城市数据" : "请先选择省"
    };
  }
  return {
    title: "选择区 / 县",
    select: form.addressDistrict,
    items: areaData?.[form.addressCity.value] || {},
    emptyText: form.addressCity.value ? "暂无区县数据" : "请先选择市"
  };
}

function openAreaPicker(level) {
  const config = getAreaPickerConfig(level);
  els.areaPickerTitle.textContent = config.title;
  els.areaPickerOptions.replaceChildren();

  const entries = Object.entries(config.items || {});
  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state compact-empty";
    empty.textContent = config.emptyText;
    els.areaPickerOptions.append(empty);
    els.areaPickerDialog.showModal();
    return;
  }

  entries.forEach(([code, name]) => {
    const button = document.createElement("button");
    button.className = "area-option";
    button.type = "button";
    button.textContent = name;
    button.dataset.areaLevel = level;
    button.dataset.areaCode = code;
    button.classList.toggle("is-active", config.select.value === code);
    els.areaPickerOptions.append(button);
  });
  els.areaPickerDialog.showModal();
}

function chooseAreaOption(level, code) {
  const config = getAreaPickerConfig(level);
  config.select.value = code;
  if (level === "province") updateAddressCities();
  if (level === "city") updateAddressDistricts();
  if (level === "district") syncAreaButtons();
  els.areaPickerDialog.close();
}

async function loadAreaData() {
  const form = els.customerForm.elements;
  if (!form.addressProvince) return;

  try {
    if (window.CHINA_AREA_DATA) {
      areaData = window.CHINA_AREA_DATA;
    } else {
      const response = await fetch("area-data.json");
      if (!response.ok) throw new Error("area data failed");
      areaData = await response.json();
    }
    fillAreaSelect(form.addressProvince, areaData["86"], "请选择省");
    fillAreaSelect(form.addressCity, {}, "请先选择省");
    fillAreaSelect(form.addressDistrict, {}, "请先选择市");
    syncAreaButtons();
  } catch (error) {
    console.error(error);
    showToast("省市区数据加载失败，请刷新页面");
  }
}

function updateAddressCities() {
  const form = els.customerForm.elements;
  const provinceCode = form.addressProvince.value;
  fillAreaSelect(form.addressCity, areaData?.[provinceCode], provinceCode ? "请选择市" : "请先选择省");
  fillAreaSelect(form.addressDistrict, {}, "请先选择市");
  syncAreaButtons();
}

function updateAddressDistricts() {
  const form = els.customerForm.elements;
  const cityCode = form.addressCity.value;
  fillAreaSelect(form.addressDistrict, areaData?.[cityCode], cityCode ? "请选择区 / 县" : "请先选择市");
  syncAreaButtons();
}

function selectedOptionText(select) {
  return select.selectedOptions[0]?.textContent || "";
}

function getCustomerAddressFromForm() {
  const form = els.customerForm.elements;
  const province = selectedOptionText(form.addressProvince);
  const city = selectedOptionText(form.addressCity);
  const district = selectedOptionText(form.addressDistrict);
  const detail = String(form.addressDetail.value || "").trim();
  return [province, city, district, detail].filter(Boolean).join("");
}

function setCustomerSubmitting(isSubmitting) {
  isCustomerSubmitting = isSubmitting;
  if (!els.customerSubmitBtn) return;
  els.customerSubmitBtn.disabled = isSubmitting;
  els.customerSubmitBtn.textContent = isSubmitting ? "提交中..." : "提交登记";
}

function getCustomerSubmissionFingerprint(submission) {
  return [
    submission.deviceNumber,
    submission.companyName,
    submission.contactName,
    submission.phone,
    submission.trackingNumber,
    submission.customerIssue,
    submission.customerAddress
  ].join("|");
}

function getCustomerRegisterUrl() {
  if (["localhost", "127.0.0.1"].includes(location.hostname)) {
    return LOCAL_CUSTOMER_REGISTER_URL;
  }
  return CUSTOMER_REGISTER_URL;
}

function updateCustomerQrCode() {
  const url = getCustomerRegisterUrl();
  els.customerQrImage.src = "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" + encodeURIComponent(url);
}

function getLastCustomerSubmission() {
  try {
    const raw = localStorage.getItem(LAST_CUSTOMER_SUBMISSION_KEY);
    return raw ? normalizeCustomerSubmission(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function saveLastCustomerSubmission(submission) {
  try {
    localStorage.setItem(LAST_CUSTOMER_SUBMISSION_KEY, JSON.stringify(submission));
  } catch {
    // 本机保存失败不影响云端提交。
  }
}

function showCustomerForm() {
  els.customerForm.hidden = false;
  els.customerRecent.hidden = true;
}

function startNewCustomerSubmission() {
  if (currentView === "customer") {
    history.replaceState(null, "", `${location.pathname}?page=customer&entry=form`);
  }
  showCustomerForm();
}

function showCustomerPortal() {
  const forceCustomerForm = new URLSearchParams(location.search).get("entry") === "form";
  const lastSubmission = getLastCustomerSubmission();
  const powerAdapterAnswer = extractPowerAdapterAnswer(lastSubmission);
  const recipientInfo = [
    lastSubmission?.contactName,
    lastSubmission?.phone,
    lastSubmission?.customerAddress
  ].filter(Boolean).join(" ");
  if (!lastSubmission || forceCustomerForm) {
    showCustomerForm();
    return;
  }

  els.customerForm.hidden = true;
  els.customerRecent.hidden = false;
  els.customerRecentDetail.innerHTML = `
    <div class="success-panel">
      <strong>登记成功</strong>
      <span>维修人员会尽快处理您的机器信息。</span>
    </div>
    <div class="wechat-card">
      <div class="wechat-qr-placeholder">
        <img src="assets/enterprise-wechat-qr.png" alt="企业微信二维码">
      </div>
      <div>
        <strong>长按/扫描二维码添加好友（以便咨询维修进度）</strong>
      </div>
    </div>
    <dl>
      <div><dt>提交时间</dt><dd>${compact(formatDateTime(lastSubmission.createdTime))}</dd></div>
      <div><dt>寄出单号</dt><dd>${compact(lastSubmission.trackingNumber)}</dd></div>
      <div><dt>打印机编号</dt><dd>${compact(lastSubmission.deviceNumber)}</dd></div>
      <div><dt>型号</dt><dd>${compact(lastSubmission.model)}</dd></div>
      <div><dt>电源适配器是否寄回</dt><dd>${compact(powerAdapterAnswer)}</dd></div>
      <div><dt>公司名</dt><dd>${compact(lastSubmission.companyName)}</dd></div>
      <div><dt>故障原因</dt><dd>${compact(cleanCustomerIssueForRecord(lastSubmission))}</dd></div>
      <div><dt>收件信息</dt><dd>${compact(recipientInfo)}</dd></div>
    </dl>
  `;
}

function setView(view) {
  document.documentElement.classList.remove("boot-customer");
  currentView = view;
  const isCustomerPortal = view === "customer";
  const isCustomerAdmin = view === "customerAdmin";
  document.body.classList.toggle("customer-portal", isCustomerPortal);
  els.repairViews.forEach((section) => {
    section.hidden = view !== "repair";
  });
  els.customerPage.hidden = !isCustomerPortal && !isCustomerAdmin;
  els.submissionsPage.hidden = view !== "submissions";
  els.customerIntro.hidden = !isCustomerAdmin;

  els.repairViewBtn.classList.toggle("is-active", view === "repair");
  els.customerViewBtn.classList.toggle("is-active", isCustomerAdmin);
  els.submissionsViewBtn.classList.toggle("is-active", view === "submissions");

  const adminActionsHidden = view !== "repair";
  els.importExcelBtn.hidden = adminActionsHidden || readonlyMode;
  els.newRecordBtn.hidden = adminActionsHidden || readonlyMode;

  if (view === "submissions") renderSubmissions();
  if (isCustomerAdmin) {
    updateCustomerQrCode();
    showCustomerForm();
  }
  if (isCustomerPortal) showCustomerPortal();
}

function applyViewFromHash() {
  const hash = location.hash.replace(/^#/, "");
  const page = new URLSearchParams(location.search).get("page");
  if (page === "customer") {
    setReadonlyMode(false);
    setView("customer");
    return true;
  }
  if (hash === "customer-admin") {
    setView("customerAdmin");
    return true;
  }
  if (hash === "customer") {
    setReadonlyMode(false);
    setView("customer");
    return true;
  }
  if (hash === "submissions") {
    setView("submissions");
    return true;
  }
  return false;
}

function updateDynamicFilterOptions() {
  updateFilterOptions(els.regionFilter, records.map((record) => record.region));
}

function updateFilterOptions(select, values) {
  const selected = select.value;
  const options = [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-CN"));
  select.replaceChildren(new Option("全部", ""));
  options.forEach((value) => select.append(new Option(value, value)));
  select.value = options.includes(selected) ? selected : "";
}

function getFilters() {
  return {
    search: els.searchInput.value.trim().toLowerCase(),
    status: els.statusFilter.value,
    ownership: els.ownershipFilter.value,
    categories: getMultiSelectValues(els.categoryFilter),
    model: els.modelFilter.value,
    region: els.regionFilter.value,
    area: els.areaFilter.value,
    dateFrom: els.dateFrom.value,
    dateTo: els.dateTo.value
  };
}

function applyFilters() {
  const filters = getFilters();
  filteredRecords = records.filter((record) => {
    const text = exportFields
      .map(([key]) => record[key])
      .join(" ")
      .toLowerCase();
    const date = recordDateKey(record.createdTime);

    return (
      (!filters.search || text.includes(filters.search)) &&
      (!filters.status || record.finalStatus === filters.status) &&
      (!filters.ownership || record.faultOwnership === filters.ownership) &&
      (filters.categories.length === 0 ||
        filters.categories.some((category) => normalizeFaultCategories(record.faultCategory).includes(category))) &&
      (!filters.model || record.model === filters.model) &&
      (!filters.region || record.region === filters.region) &&
      (!filters.area || record.area === filters.area) &&
      (!filters.dateFrom || date >= filters.dateFrom) &&
      (!filters.dateTo || date <= filters.dateTo)
    );
  });

  sortRecordsNewestFirst(filteredRecords);
}

function updateStats() {
  els.totalCount.textContent = records.length;
  els.testingCount.textContent = records.filter((record) => record.finalStatus === "维修中").length;
  els.readyCount.textContent = records.filter((record) => record.finalStatus === "今天需要寄").length;
  els.finishedCount.textContent = records.filter((record) => record.finalStatus === "返厂中").length;
  els.testStatusCount.textContent = records.filter((record) => record.finalStatus === "测试中").length;
  els.filteredCount.textContent = `${filteredRecords.length} 条`;
  els.filterSummaryCount.textContent = filteredRecords.length;
}

function statusClass(status) {
  if (status === "测试中") return "testing";
  if (status === "返厂中") return "factory";
  if (["待寄出", "今天需要寄"].includes(status)) return "ready";
  if (["已寄出", "邮寄并结束"].includes(status)) return "done";
  return "";
}

function ownershipClass(ownership) {
  if (ownership === "硬件损坏") return "hardware";
  if (ownership === "非硬件") return "done";
  return "";
}

function areaClass(area) {
  return area === "直营" ? "direct" : "agency";
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function compact(value, fallback = "-") {
  return value ? escapeHtml(value) : `<span class="muted">${fallback}</span>`;
}

function isPointInsideRect(x, y, rect) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function isDoubleClickOnRowContent(event, row) {
  if (!(event.target instanceof Element)) return false;
  if (event.target.closest("button, a, input, select, textarea, label, .tag, .cell-main, .cell-sub, .address-preview")) {
    return true;
  }

  const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  let node = walker.nextNode();
  while (node) {
    const range = document.createRange();
    range.selectNodeContents(node);
    const isTextHit = Array.from(range.getClientRects()).some((rect) =>
      isPointInsideRect(event.clientX, event.clientY, rect)
    );
    range.detach();
    if (isTextHit) return true;
    node = walker.nextNode();
  }

  return false;
}

function renderFaultCategoryTags(record) {
  return normalizeFaultCategories(record.faultCategory)
    .map((category) => `<span class="tag">${escapeHtml(category)}</span>`)
    .join("");
}

function powerClass(hasPower) {
  return hasPower === "有" ? "power-yes" : "";
}

function formatDateTime(value) {
  if (!value) return "";
  return String(value).replace("T", " ");
}

function renderAddress(record) {
  if (!record.customerAddress) return `<span class="muted">-</span>`;
  return `
    <button class="address-preview" type="button" data-action="address" data-id="${escapeHtml(record.id)}">
      ${escapeHtml(record.customerAddress)}
    </button>
  `;
}

function renderTable() {
  els.recordsBody.innerHTML = filteredRecords
    .map(
      (record) => `
        <tr data-id="${escapeHtml(record.id)}">
          <td>${compact(formatDateTime(record.createdTime))}</td>
          <td><span class="cell-main">${compact(record.trackingNumber)}</span></td>
          <td>${compact(record.region)}</td>
          <td><span class="tag ${areaClass(record.area)}">${compact(record.area)}</span></td>
          <td>
            <span class="cell-main">${compact(record.deviceNumber)}</span>
            <span class="cell-sub">${compact(record.model)}</span>
          </td>
          <td><span class="tag ${powerClass(record.hasPower)}">${compact(record.hasPower)}</span></td>
          <td><span class="cell-main">${compact(record.companyName)}</span></td>
          <td class="text-cell">${compact(record.customerIssue)}</td>
          <td class="text-cell">${compact(record.repairProcess)}</td>
          <td>
            <span class="cell-main">${compact(record.returnTime)}</span>
            <span class="cell-sub">${compact(record.returnTrackingNumber)}</span>
          </td>
          <td><span class="tag ${statusClass(record.finalStatus)}">${compact(record.finalStatus)}</span></td>
          <td><span class="tag ${ownershipClass(record.faultOwnership)}">${compact(record.faultOwnership)}</span></td>
          <td><div class="tag-list">${renderFaultCategoryTags(record)}</div></td>
          <td class="address-cell">${renderAddress(record)}</td>
          <td class="actions-col">
            <div class="row-actions">
              <button class="secondary" type="button" data-action="edit" data-id="${escapeHtml(record.id)}">编辑</button>
              <button class="danger" type="button" data-action="delete" data-id="${escapeHtml(record.id)}">删除</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  els.emptyState.hidden = filteredRecords.length > 0;
}

function render() {
  updateDynamicFilterOptions();
  applyFilters();
  updateStats();
  renderTable();
  renderSubmissions();
  if (currentView === "customer") updateCustomerQrCode();
}

function renderSubmissions() {
  const reviewedSubmissionIds = getReviewedSubmissionIds();
  els.submissionCount.textContent = `${customerSubmissions.length} 条`;
  els.submissionsBody.innerHTML = customerSubmissions
    .map((item) => {
      const isReviewed = reviewedSubmissionIds.has(item.id);
      const statusText = isReviewed ? "已检修" : "未检修";
      const statusClass = isReviewed ? "reviewed" : "unreviewed";
      return `
        <tr data-id="${escapeHtml(item.id)}">
          <td>${compact(formatDateTime(item.createdTime))}</td>
          <td>${compact(item.trackingNumber)}</td>
          <td>
            <span class="cell-main">${compact(item.deviceNumber)}</span>
            <span class="cell-sub">${compact(item.model)}</span>
          </td>
          <td>${compact(extractPowerAdapterAnswer(item))}</td>
          <td>${compact(item.companyName)}</td>
          <td class="contact-detail-cell">
            <span class="contact-line">
              <span>${compact(item.contactName)}</span>
              <span>${compact(item.phone)}</span>
            </span>
            <span class="cell-sub">${compact(item.customerAddress)}</span>
          </td>
          <td class="text-cell">${compact(cleanCustomerIssueForRecord(item))}</td>
          ${
            adminMode && !readonlyMode
              ? `<td class="actions-col">
                  <div class="row-actions">
                    <button class="secondary ${isReviewed ? "reviewed" : ""}" type="button" data-action="use-submission" data-id="${escapeHtml(item.id)}" ${isReviewed ? "disabled" : ""}>${isReviewed ? "已检修" : "生成维修"}</button>
                    <button class="secondary" type="button" data-action="edit-submission" data-id="${escapeHtml(item.id)}">编辑</button>
                    <button class="danger" type="button" data-action="delete-submission" data-id="${escapeHtml(item.id)}">删除</button>
                  </div>
                </td>`
              : `<td class="submission-status-col">
                  <span class="submission-status ${statusClass}">${statusText}</span>
                </td>`
          }
        </tr>
      `;
    })
    .join("");
  els.submissionsEmptyState.hidden = customerSubmissions.length > 0;
}

function resetForm() {
  els.recordForm.reset();
  els.recordId.value = "";
  els.dialogTitle.textContent = "新增记录";
  els.deleteRecordBtn.hidden = true;
  els.recordForm.elements.createdTime.value = toInputDateTime(new Date());
  els.recordForm.elements.hasPower.value = "";
  els.recordForm.elements.finalStatus.value = "维修中";
  els.recordForm.elements.faultOwnership.value = "";
  clearMultiSelect(els.recordForm.elements.faultCategory);
  updateFaultCategoryPicker();
  els.faultCategoryToggle.classList.remove("is-invalid");
  closeFaultCategoryPicker();
  els.recordForm.elements.model.value = "";
  lockAutoField(els.recordForm.elements.companyName);
  lockAutoField(els.recordForm.elements.customerIssue);
  els.recordForm.elements.customerPowerAdapter.value = "";
  hideMatchBox();
}

function openNewDialog() {
  if (readonlyMode) return;
  resetForm();
  els.recordDialog.showModal();
}

function findSubmissionByDeviceNumber(deviceNumber) {
  const key = String(deviceNumber || "").trim().toLowerCase();
  if (!key) return null;
  const matches = customerSubmissions.filter((item) => item.deviceNumber.toLowerCase() === key);
  return sortCustomerSubmissionsNewestFirst([...matches])[0] || null;
}

function buildAddressWithContact(submission) {
  const parts = [
    submission.customerAddress,
    submission.contactName,
    submission.phone
  ].filter(Boolean);
  return parts.join(" ");
}

function extractPowerAdapterAnswer(submission) {
  const match = String(submission?.customerIssue || "").match(/电源适配器是否寄回[:：]\s*(是|否)/);
  return match?.[1] || "";
}

function cleanCustomerIssueForRecord(submission) {
  return String(submission?.customerIssue || "")
    .replace(/^\s*电源适配器是否寄回[:：]\s*(是|否)\s*\n?/m, "")
    .replace(/^\s*故障描述[:：]\s*/m, "")
    .trim();
}

function applySubmissionToRecordForm(submission, { keepDeviceNumber = true } = {}) {
  if (!submission) return;
  if (appliedSubmissionId === submission.id) return;
  const form = els.recordForm.elements;
  if (appliedSubmissionSnapshot && appliedSubmissionId && appliedSubmissionId !== submission.id) {
    form.companyName.value = appliedSubmissionSnapshot.companyName;
    form.customerPowerAdapter.value = appliedSubmissionSnapshot.customerPowerAdapter;
    form.customerIssue.value = appliedSubmissionSnapshot.customerIssue;
    form.customerAddress.value = appliedSubmissionSnapshot.customerAddress;
    appliedSubmissionSnapshot = null;
    appliedSubmissionId = "";
  }
  if (!appliedSubmissionSnapshot) {
    appliedSubmissionSnapshot = {
      companyName: form.companyName.value,
      customerPowerAdapter: form.customerPowerAdapter.value,
      customerIssue: form.customerIssue.value,
      customerAddress: form.customerAddress.value
    };
  }
  if (!keepDeviceNumber) form.deviceNumber.value = submission.deviceNumber;
  autoFillRecordModel();
  form.customerPowerAdapter.value = extractPowerAdapterAnswer(submission);
  form.companyName.value = submission.companyName || form.companyName.value;
  form.customerIssue.value = cleanCustomerIssueForRecord(submission) || form.customerIssue.value;
  form.customerAddress.value = buildAddressWithContact(submission) || form.customerAddress.value;
  appliedSubmissionId = submission.id;
  showToast("已带入客户提交的信息");
}

function undoSubmissionToRecordForm() {
  if (!appliedSubmissionSnapshot) {
    hideMatchBox();
    return;
  }

  const form = els.recordForm.elements;
  form.companyName.value = appliedSubmissionSnapshot.companyName;
  form.customerPowerAdapter.value = appliedSubmissionSnapshot.customerPowerAdapter;
  form.customerIssue.value = appliedSubmissionSnapshot.customerIssue;
  form.customerAddress.value = appliedSubmissionSnapshot.customerAddress;
  appliedSubmissionSnapshot = null;
  ignoredSubmissionId = appliedSubmissionId;
  appliedSubmissionId = "";
  showToast("已取消带入");
  showMatchedSubmission(matchedSubmissionForRecord, { autoApply: false });
}

function showMatchedSubmission(submission, { autoApply = true } = {}) {
  matchedSubmissionForRecord = submission || null;
  if (!submission || els.recordId.value) {
    hideMatchBox();
    return;
  }

  const isIgnored = submission.id === ignoredSubmissionId;
  const isApplied = appliedSubmissionId === submission.id;
  if (autoApply && !isIgnored) applySubmissionToRecordForm(submission);

  els.matchBox.hidden = false;
  els.matchBox.innerHTML = `
    <div>
      <strong>${isIgnored && !isApplied ? "已取消带入客户提交的信息" : "已自动带入客户提交的信息"}</strong>
    </div>
    <div class="match-actions">
      <button class="secondary" type="button" id="toggleSubmissionBtn">${isIgnored && !isApplied ? "带入" : "取消带入"}</button>
    </div>
  `;
  document.querySelector("#toggleSubmissionBtn").addEventListener("click", () => {
    if (isIgnored && !isApplied) {
      ignoredSubmissionId = "";
      applySubmissionToRecordForm(submission);
      showMatchedSubmission(submission, { autoApply: false });
      return;
    }
    undoSubmissionToRecordForm();
  });
}

function hideMatchBox() {
  els.matchBox.hidden = true;
  els.matchBox.replaceChildren();
  appliedSubmissionSnapshot = null;
  appliedSubmissionId = "";
  matchedSubmissionForRecord = null;
}

function checkDeviceNumberMatch() {
  autoFillRecordModel();
  const submission = findSubmissionByDeviceNumber(els.recordForm.elements.deviceNumber.value);
  if (submission?.id !== ignoredSubmissionId) ignoredSubmissionId = "";
  showMatchedSubmission(submission);
}

function autoFillRecordModel() {
  const form = els.recordForm.elements;
  const model = inferModelFromDeviceNumber(form.deviceNumber.value);
  if (model) form.model.value = model;
}

function autoFillSubmissionModel(form) {
  const model = inferModelFromDeviceNumber(form.deviceNumber.value);
  if (model) form.model.value = model;
}

function lockAutoField(input) {
  input.readOnly = true;
  input.classList.add("readonly-field");
}

function unlockAutoField(input) {
  input.readOnly = false;
  input.classList.remove("readonly-field");
  input.focus();
  input.select();
}

function openNewDialogFromSubmission(id) {
  if (readonlyMode) return;
  const submission = customerSubmissions.find((item) => item.id === id);
  if (!submission) return;
  resetForm();
  applySubmissionToRecordForm(submission, { keepDeviceNumber: false });
  els.recordDialog.showModal();
}

function openSubmissionEditDialog(id) {
  if (cloudMode && !adminMode) {
    showToast("请先管理员登录");
    return;
  }

  const submission = customerSubmissions.find((item) => item.id === id);
  if (!submission) return;

  const form = els.submissionForm.elements;
  form.id.value = submission.id;
  form.deviceNumber.value = submission.deviceNumber || "";
  form.companyName.value = submission.companyName || "";
  form.contactName.value = submission.contactName || "";
  form.phone.value = submission.phone || "";
  form.trackingNumber.value = submission.trackingNumber || "";
  form.model.value = inferModelFromDeviceNumber(submission.deviceNumber) || submission.model || "";
  form.customerIssue.value = submission.customerIssue || "";
  form.customerAddress.value = submission.customerAddress || "";
  els.submissionDialog.showModal();
}

function fillForm(record) {
  els.recordId.value = record.id;
  els.dialogTitle.textContent = "编辑记录";
  els.deleteRecordBtn.hidden = false;

  exportFields.forEach(([key]) => {
    if (els.recordForm.elements[key]) {
      if (key === "faultCategory") {
        setMultiSelectValues(els.recordForm.elements.faultCategory, record[key]);
        updateFaultCategoryPicker();
        els.faultCategoryToggle.classList.remove("is-invalid");
        closeFaultCategoryPicker();
        return;
      }
      els.recordForm.elements[key].value = record[key] || "";
    }
  });
  lockAutoField(els.recordForm.elements.companyName);
  lockAutoField(els.recordForm.elements.customerIssue);
  els.recordForm.elements.customerPowerAdapter.value = "";
  hideMatchBox();
}

function openEditDialog(id) {
  if (readonlyMode) return;
  const record = records.find((item) => item.id === id);
  if (!record) return;
  fillForm(record);
  els.recordDialog.showModal();
}

function getFormRecord() {
  const formData = new FormData(els.recordForm);
  const id = els.recordId.value || createId();
  const record = { id };
  exportFields.forEach(([key]) => {
    record[key] = key === "faultCategory"
      ? formData.getAll(key).map((value) => String(value).trim()).filter(Boolean)
      : String(formData.get(key) || "").trim();
  });
  record.model = inferModelFromDeviceNumber(record.deviceNumber) || record.model;
  if (record.faultCategory.length === 0) {
    showFaultCategoryRequired();
    return null;
  }
  record.updatedAt = new Date().toISOString();
  return normalizeRecord(record);
}

async function upsertRecord(record) {
  if (readonlyMode) return;
  if (cloudMode && !adminMode) {
    showToast("请先管理员登录");
    return;
  }

  try {
    if (cloudMode) await saveCloudRecord(record);
  } catch (error) {
    console.error(error);
    showToast("云端保存失败");
    return;
  }

  const index = records.findIndex((item) => item.id === record.id);
  if (index >= 0) {
    records[index] = { ...records[index], ...record };
  } else {
    records.unshift(record);
  }
  sortRecordsNewestFirst(records);
  if (!cloudMode) saveRecords();
  render();
  showToast("已保存");
}

function getCustomerSubmissionFromForm() {
  const deviceNumber = String(els.customerForm.elements.deviceNumber.value || "").trim();
  if (!/^\d{10}$/.test(deviceNumber)) {
    showToast("打印机编号必须填写 10 位数字");
    els.customerForm.elements.deviceNumber.focus();
    return null;
  }
  const phone = String(els.customerForm.elements.phone.value || "").trim();
  if (!/^\d{11}$/.test(phone)) {
    showToast("手机号码必须填写 11 位数字");
    els.customerForm.elements.phone.focus();
    return null;
  }

  const formData = new FormData(els.customerForm);
  const customerIssue = String(formData.get("customerIssue") || "").trim();
  const powerAdapterReturned = String(formData.get("powerAdapterReturned") || "").trim();
  if (!powerAdapterReturned) {
    showToast("请选择电源适配器是否寄回");
    els.customerForm.elements.powerAdapterReturned.focus();
    return null;
  }
  return normalizeCustomerSubmission({
    id: createCustomerSubmissionId(),
    createdTime: toInputDateTime(new Date()),
    deviceNumber,
    model: inferModelFromDeviceNumber(deviceNumber),
    companyName: String(formData.get("companyName") || ""),
    contactName: String(formData.get("contactName") || ""),
    phone,
    trackingNumber: String(formData.get("trackingNumber") || ""),
    customerIssue: `电源适配器是否寄回：${powerAdapterReturned}\n故障描述：${customerIssue}`,
    customerAddress: getCustomerAddressFromForm(),
    updatedAt: new Date().toISOString()
  });
}

async function submitCustomerForm() {
  if (isCustomerSubmitting) return;

  const submission = getCustomerSubmissionFromForm();
  if (!submission) return;

  const fingerprint = getCustomerSubmissionFingerprint(submission);
  const now = Date.now();
  if (fingerprint === lastCustomerSubmitFingerprint && now - lastCustomerSubmitTime < 30000) {
    showToast("已经提交过了，请不要重复点击");
    return;
  }

  setCustomerSubmitting(true);
  try {
    if (cloudMode) await saveCloudSubmission(submission);
  } catch (error) {
    console.error(error);
    if (error?.code === "PGRST205" || String(error?.message || "").includes("customer_repair_submissions")) {
      showToast("云端还没升级客户登记表，请先执行数据库 SQL");
    } else if (error?.code === "42501") {
      showToast("云端权限没打开，请检查客户登记表权限");
    } else {
      showToast("提交失败，请稍后再试");
    }
    setCustomerSubmitting(false);
    return;
  }

  lastCustomerSubmitFingerprint = fingerprint;
  lastCustomerSubmitTime = now;
  customerSubmissions.unshift(submission);
  sortCustomerSubmissionsNewestFirst(customerSubmissions);
  if (!cloudMode) saveCustomerSubmissions();
  saveLastCustomerSubmission(submission);
  els.customerForm.reset();
  updateAddressCities();
  syncAreaButtons();
  syncSimpleSelectButton("powerAdapterReturned");
  if (currentView === "customer") {
    history.replaceState(null, "", `${location.pathname}?page=customer`);
    showCustomerPortal();
  }
  renderSubmissions();
  showToast("登记成功，工作人员会尽快处理");
  setCustomerSubmitting(false);
}

function getSubmissionEditFormValue() {
  const form = els.submissionForm.elements;
  const id = String(form.id.value || "").trim();
  const oldSubmission = customerSubmissions.find((item) => item.id === id);
  if (!oldSubmission) return null;

  const deviceNumber = String(form.deviceNumber.value || "").trim();
  if (!/^\d{10}$/.test(deviceNumber)) {
    showToast("打印机编号必须填写 10 位数字");
    form.deviceNumber.focus();
    return null;
  }

  const phone = String(form.phone.value || "").trim();
  if (!/^\d{11}$/.test(phone)) {
    showToast("手机号码必须填写 11 位数字");
    form.phone.focus();
    return null;
  }

  return normalizeCustomerSubmission({
    ...oldSubmission,
    deviceNumber,
    model: inferModelFromDeviceNumber(deviceNumber) || String(form.model.value || ""),
    companyName: String(form.companyName.value || ""),
    contactName: String(form.contactName.value || ""),
    phone,
    trackingNumber: String(form.trackingNumber.value || ""),
    customerIssue: String(form.customerIssue.value || ""),
    customerAddress: String(form.customerAddress.value || ""),
    updatedAt: new Date().toISOString()
  });
}

async function updateSubmissionFromEditForm() {
  if (cloudMode && !adminMode) {
    showToast("请先管理员登录");
    return false;
  }

  const submission = getSubmissionEditFormValue();
  if (!submission) return false;

  try {
    if (cloudMode) await saveCloudSubmission(submission);
  } catch (error) {
    console.error(error);
    showToast("客户提交保存失败");
    return false;
  }

  customerSubmissions = customerSubmissions.map((item) => (
    item.id === submission.id ? submission : item
  ));
  sortCustomerSubmissionsNewestFirst(customerSubmissions);
  if (!cloudMode) saveCustomerSubmissions();
  renderSubmissions();
  showToast("客户提交已保存");
  return true;
}

async function deleteSubmission(id) {
  if (cloudMode && !adminMode) {
    showToast("请先管理员登录");
    return;
  }

  const submission = customerSubmissions.find((item) => item.id === id);
  if (!submission) return;
  const label = submission.deviceNumber || submission.companyName || "这条客户提交";
  if (!confirm(`确认删除 ${label}？`)) return;

  try {
    if (cloudMode) await deleteCloudSubmission(id);
  } catch (error) {
    console.error(error);
    showToast("客户提交删除失败");
    return;
  }

  customerSubmissions = customerSubmissions.filter((item) => item.id !== id);
  if (!cloudMode) saveCustomerSubmissions();
  renderSubmissions();
  showToast("已删除客户提交");
}

async function deleteRecord(id) {
  if (readonlyMode) return;
  if (cloudMode && !adminMode) {
    showToast("请先管理员登录");
    return;
  }

  const record = records.find((item) => item.id === id);
  if (!record) return;
  const label = record.deviceNumber || record.trackingNumber || "这条记录";
  if (!confirm(`确认删除 ${label}？`)) return;

  try {
    if (cloudMode) await deleteCloudRecord(id);
  } catch (error) {
    console.error(error);
    showToast("云端删除失败");
    return;
  }

  records = records.filter((item) => item.id !== id);
  if (!cloudMode) saveRecords();
  render();
  showToast("已删除");
}

function resetFilters() {
  els.searchInput.value = "";
  els.statusFilter.value = "";
  els.ownershipFilter.value = "";
  clearMultiSelect(els.categoryFilter);
  updateCategoryFilterPicker();
  closeCategoryFilterPicker();
  els.modelFilter.value = "";
  els.regionFilter.value = "";
  els.areaFilter.value = "";
  els.dateFrom.value = "";
  els.dateTo.value = "";
  render();
}

function toCsvValue(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function exportCsv() {
  const header = exportFields.map(([, label]) => toCsvValue(label)).join(",");
  const rows = filteredRecords.map((record) => exportFields.map(([key]) => toCsvValue(record[key])).join(","));
  downloadFile(`打印机维修记录_${dateStamp()}.csv`, "\ufeff" + [header, ...rows].join("\n"), "text/csv;charset=utf-8");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

async function loadSampleRecords() {
  if (readonlyMode) return;
  if (records.length > 0 && !confirm("当前已有记录，是否追加示例数据？")) return;
  const incoming = sampleRecords();

  try {
    if (cloudMode) await saveCloudRecords(incoming);
  } catch (error) {
    console.error(error);
    showToast("云端保存失败");
    return;
  }

  records = sortRecordsNewestFirst(incoming.concat(records));
  if (!cloudMode) saveRecords();
  render();
  showToast("示例数据已载入");
}

function sampleRecords() {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);
  const twoDaysAgo = new Date(now.getTime() - 172800000);
  return [
    normalizeRecord({
      createdTime: toInputDateTime(twoDaysAgo),
      trackingNumber: "SF1234567890",
      region: "上海",
      deviceNumber: "GMX-260528-001",
      hasPower: "有",
      companyName: "上海恒远贸易",
      customerIssue: "客户反馈蓝牙无法连接，打印一半断开。",
      repairProcess: "重置蓝牙模块，升级固件，连续测试 50 张标签正常。",
      returnTime: "",
      finalStatus: "测试中",
      returnTrackingNumber: "",
      faultOwnership: "非硬件",
      faultCategory: "模块",
      customerAddress: "上海市浦东新区示例路 88 号",
      model: "GMX"
    }),
    normalizeRecord({
      createdTime: toInputDateTime(yesterday),
      trackingNumber: "YT9876543210",
      region: "杭州",
      deviceNumber: "DK110A-260527-006",
      hasPower: "没有",
      companyName: "杭州云启设计",
      customerIssue: "开机后不进纸，指示灯闪烁。",
      repairProcess: "更换传感器并清理进纸通道，测试正常。",
      returnTime: toInputDate(now),
      finalStatus: "今天需要寄",
      returnTrackingNumber: "",
      faultOwnership: "硬件损坏",
      faultCategory: "传感器",
      customerAddress: "浙江省杭州市西湖区示例街 18 号",
      model: "DK110A"
    }),
    normalizeRecord({
      createdTime: toInputDateTime(new Date(now.getTime() - 345600000)),
      trackingNumber: "JD555666777",
      region: "苏州",
      deviceNumber: "DK80-260524-013",
      hasPower: "有",
      companyName: "苏州凌创科技",
      customerIssue: "屏幕不显示，WiFi 配网失败。",
      repairProcess: "更换屏幕排线，重新烧录配置，打印测试页通过。",
      returnTime: toInputDate(yesterday),
      finalStatus: "已寄出",
      returnTrackingNumber: "SF1098765432",
      faultOwnership: "硬件损坏",
      faultCategory: "屏幕",
      customerAddress: "江苏省苏州市工业园区示例大道 66 号",
      model: "DK80"
    })
  ];
}

async function importExcelFile(file) {
  if (readonlyMode || !file) return;
  try {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      showToast("请导入 .xlsx 格式的 Excel");
      return;
    }

    const rows = await readXlsxRows(file);
    const incoming = rowsToRecords(rows);
    if (incoming.length === 0) throw new Error("empty workbook");

    const normalized = sortRecordsNewestFirst(incoming.map(normalizeRecord));
    if (cloudMode) await saveCloudRecords(normalized);
    records = sortRecordsNewestFirst(normalized.concat(records));
    if (!cloudMode) saveRecords();
    render();
    showToast("已导入 " + incoming.length + " 条");
  } catch (error) {
    console.error(error);
    showToast("Excel 文件无法导入，请检查表头和格式");
  } finally {
    els.importExcelInput.value = "";
  }
}

async function readXlsxRows(file) {
  const entries = await unzipXlsx(await file.arrayBuffer());
  const workbookXml = await readZipText(entries, "xl/workbook.xml");
  const relsXml = await readZipText(entries, "xl/_rels/workbook.xml.rels");
  const sharedStrings = entries.has("xl/sharedStrings.xml")
    ? parseSharedStrings(await readZipText(entries, "xl/sharedStrings.xml"))
    : [];
  const sheetPath = getFirstSheetPath(workbookXml, relsXml);
  const sheetXml = await readZipText(entries, sheetPath);
  return parseSheetRows(sheetXml, sharedStrings);
}

async function unzipXlsx(buffer) {
  const view = new DataView(buffer);
  let eocd = -1;
  for (let offset = view.byteLength - 22; offset >= 0; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) {
      eocd = offset;
      break;
    }
  }
  if (eocd < 0) throw new Error("missing zip directory");

  const entryCount = view.getUint16(eocd + 10, true);
  let centralOffset = view.getUint32(eocd + 16, true);
  const entries = new Map();

  for (let i = 0; i < entryCount; i += 1) {
    if (view.getUint32(centralOffset, true) !== 0x02014b50) throw new Error("invalid zip entry");
    const method = view.getUint16(centralOffset + 10, true);
    const compressedSize = view.getUint32(centralOffset + 20, true);
    const nameLength = view.getUint16(centralOffset + 28, true);
    const extraLength = view.getUint16(centralOffset + 30, true);
    const commentLength = view.getUint16(centralOffset + 32, true);
    const localOffset = view.getUint32(centralOffset + 42, true);
    const name = decodeUtf8(buffer.slice(centralOffset + 46, centralOffset + 46 + nameLength));

    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.slice(dataStart, dataStart + compressedSize);
    const data = method === 0 ? compressed : await inflateRaw(compressed, method);
    entries.set(name.replace(/^\//, ""), data);

    centralOffset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

async function inflateRaw(buffer, method) {
  if (method !== 8) throw new Error("unsupported zip compression");
  if (typeof DecompressionStream === "undefined") throw new Error("missing decompression support");
  const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return await new Response(stream).arrayBuffer();
}

async function readZipText(entries, path) {
  const data = entries.get(path);
  if (!data) throw new Error("missing " + path);
  return decodeUtf8(data);
}

function decodeUtf8(buffer) {
  return new TextDecoder("utf-8").decode(buffer);
}

function parseXml(text) {
  return new DOMParser().parseFromString(text, "application/xml");
}

function getFirstSheetPath(workbookXml, relsXml) {
  const workbook = parseXml(workbookXml);
  const rels = parseXml(relsXml);
  const firstSheet = workbook.getElementsByTagName("sheet")[0];
  if (!firstSheet) throw new Error("missing worksheet");
  const relId = firstSheet.getAttribute("r:id") || firstSheet.getAttribute("id");
  const rel = Array.from(rels.getElementsByTagName("Relationship")).find((item) => item.getAttribute("Id") === relId);
  const target = rel?.getAttribute("Target") || "worksheets/sheet1.xml";
  return target.startsWith("/") ? target.slice(1) : normalizeZipPath("xl/" + target);
}

function normalizeZipPath(path) {
  const parts = [];
  path.split("/").forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") parts.pop();
    else parts.push(part);
  });
  return parts.join("/");
}

function parseSharedStrings(xmlText) {
  const doc = parseXml(xmlText);
  return Array.from(doc.getElementsByTagName("si")).map((si) => si.textContent || "");
}

function parseSheetRows(xmlText, sharedStrings) {
  const doc = parseXml(xmlText);
  return Array.from(doc.getElementsByTagName("row")).map((row) => {
    const values = [];
    Array.from(row.getElementsByTagName("c")).forEach((cell) => {
      const ref = cell.getAttribute("r") || "A1";
      const colIndex = columnNameToIndex(ref.replace(/\d+/g, ""));
      values[colIndex] = parseCellValue(cell, sharedStrings);
    });
    return values.map((value) => String(value ?? "").trim());
  }).filter((row) => row.some(Boolean));
}

function columnNameToIndex(name) {
  return name.split("").reduce((total, char) => total * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

function parseCellValue(cell, sharedStrings) {
  const type = cell.getAttribute("t");
  if (type === "inlineStr") return cell.getElementsByTagName("is")[0]?.textContent || "";
  const raw = cell.getElementsByTagName("v")[0]?.textContent || "";
  if (type === "s") return sharedStrings[Number(raw)] || "";
  if (type === "b") return raw === "1" ? "是" : "否";
  return raw;
}

function rowsToRecords(rows) {
  const headerIndex = rows.findIndex((row) => row.some(Boolean));
  if (headerIndex < 0) return [];

  const headers = rows[headerIndex].map(normalizeHeader);
  const keyByColumn = headers.map(resolveImportField);

  return rows.slice(headerIndex + 1).map((row) => {
    const record = {};
    keyByColumn.forEach((key, index) => {
      if (!key || key === "area") return;
      record[key] = normalizeImportedValue(key, row[index]);
    });
    return record;
  }).filter((record) => Object.values(record).some(Boolean));
}

function normalizeHeader(value) {
  return String(value || "").replace(/[\s/／:：()（）]+/g, "").trim();
}

function resolveImportField(header) {
  const aliases = {
    createdTime: ["创建时间", "登记时间", "维修日期"],
    trackingNumber: ["快递单号", "签收快递单号", "签收单号"],
    region: ["地区", "城市"],
    area: ["区域"],
    deviceNumber: ["编号", "打印机编号", "机器编号", "设备编号", "编号型号"],
    hasPower: ["有无电源", "电源"],
    companyName: ["公司名", "客户", "客户名称"],
    customerIssue: ["客户描述问题", "客户问题", "描述问题", "问题描述"],
    repairProcess: ["维修过程", "处理过程"],
    returnTime: ["寄回时间", "寄回日期"],
    finalStatus: ["最终状态", "状态", "维修状态"],
    returnTrackingNumber: ["寄回单号", "寄回快递单号"],
    faultOwnership: ["故障归属"],
    faultCategory: ["故障分类"],
    customerAddress: ["客户地址", "维修地址", "地址"],
    model: ["型号"]
  };
  return Object.entries(aliases).find(([, names]) => names.map(normalizeHeader).includes(header))?.[0] || "";
}

function normalizeImportedValue(key, value) {
  const text = String(value ?? "").trim();
  if (key === "createdTime") return convertExcelDateText(text, true);
  if (key === "returnTime") return convertExcelDateText(text, false);
  return text;
}

function convertExcelDateText(text, includeTime) {
  if (!text) return "";
  if (/^\d+(\.\d+)?$/.test(text)) {
    const serial = Number(text);
    if (serial > 20000 && serial < 80000) {
      const date = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
      const yyyy = date.getUTCFullYear();
      const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(date.getUTCDate()).padStart(2, "0");
      const hh = String(date.getUTCHours()).padStart(2, "0");
      const mi = String(date.getUTCMinutes()).padStart(2, "0");
      return includeTime ? yyyy + "-" + mm + "-" + dd + "T" + hh + ":" + mi : yyyy + "-" + mm + "-" + dd;
    }
  }
  return includeTime ? normalizeDateTime(text) : normalizeDate(text);
}


function decodePayload(payload) {
  const base64 = payload.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  try {
    return JSON.parse(decodeBase64Utf8(padded));
  } catch {
    return JSON.parse(decodeURIComponent(atob(padded)));
  }
}

function encodePayload(value) {
  return encodeBase64Utf8(JSON.stringify(value))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function createReadonlyShareUrl() {
  const url = new URL(PUBLIC_SHARE_BASE_URL);
  if (cloudMode) {
    url.hash = "readonly";
    return url.toString();
  }

  url.hash = "view=" + encodePayload(packSharedData());
  return url.toString();
}

function packSharedData() {
  return {
    version: "r2",
    records: packSharedRecords(records),
    submissions: packSharedSubmissions(customerSubmissions)
  };
}

function packSharedRecords(items) {
  return [
    "r1",
    items.map((record) => exportFields.map(([key]) => record[key] || ""))
  ];
}

function packSharedSubmissions(items) {
  const fields = ["id", "createdTime", "deviceNumber", "model", "companyName", "contactName", "phone", "trackingNumber", "customerIssue", "customerAddress", "updatedAt"];
  return [
    "s1",
    fields,
    items.map((item) => fields.map((key) => item[key] || ""))
  ];
}

function unpackSharedData(payload) {
  if (payload?.version === "r2") {
    return {
      records: unpackSharedRecords(payload.records).map(normalizeRecord),
      submissions: unpackSharedSubmissions(payload.submissions).map(normalizeCustomerSubmission)
    };
  }

  return {
    records: unpackSharedRecords(payload).map(normalizeRecord),
    submissions: []
  };
}

function unpackSharedRecords(payload) {
  if (!Array.isArray(payload)) return [];
  if (payload[0] !== "r1") return payload;
  return payload[1].map((row) => {
    const record = {};
    exportFields.forEach(([key], index) => {
      record[key] = row[index] || "";
    });
    return record;
  });
}

function unpackSharedSubmissions(payload) {
  if (!Array.isArray(payload) || payload[0] !== "s1") return [];
  const fields = payload[1] || [];
  return (payload[2] || []).map((row) => {
    const submission = {};
    fields.forEach((key, index) => {
      submission[key] = row[index] || "";
    });
    return submission;
  });
}

function encodeBase64Utf8(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

function decodeBase64Utf8(base64) {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

async function copyReadonlyShareLink() {
  if (readonlyMode) return;
  if (records.length === 0 && customerSubmissions.length === 0) {
    showToast("暂无记录可分享");
    return;
  }

  const url = createReadonlyShareUrl();
  showShareDialog(url);
  copyShareUrlToClipboard();
}

async function copyShareUrlToClipboard() {
  const url = els.shareUrlOutput.value;
  try {
    await navigator.clipboard.writeText(url);
    showToast("只读链接已复制");
  } catch {
    showToast("请在弹窗里手动复制链接");
  }
}

function showShareDialog(url) {
  els.shareUrlOutput.value = url;
  els.shareDialog.showModal();
  els.shareUrlOutput.focus();
  els.shareUrlOutput.select();
}

function openAuthDialog() {
  if (!cloudMode) return;
  if (adminMode) {
    signOutAdmin();
    return;
  }
  els.authDialog.showModal();
  els.authForm.elements.username.focus();
}

async function signInAdmin() {
  if (!cloudMode || !supabaseClient) return;
  const formData = new FormData(els.authForm);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  if (username !== ADMIN_USERNAME) {
    showToast("登录失败，请检查账号和密码");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
  if (error) {
    console.error(error);
    showToast("登录失败，请检查账号和密码");
    return;
  }

  els.authDialog.close();
  els.authForm.reset();
  els.authForm.elements.username.value = ADMIN_USERNAME;
  showToast("管理员已登录");
}

async function signOutAdmin() {
  if (!cloudMode || !supabaseClient) return;
  await supabaseClient.auth.signOut();
  adminMode = false;
  refreshAccessMode();
  showToast("已退出管理员");
}

function showAddressPopover(record, anchor) {
  els.addressPopover.textContent = record.customerAddress;
  els.addressPopover.hidden = false;

  const rect = anchor.getBoundingClientRect();
  const popoverRect = els.addressPopover.getBoundingClientRect();
  const margin = 12;
  const left = Math.min(rect.left, window.innerWidth - popoverRect.width - margin);
  const top = rect.bottom + margin > window.innerHeight - popoverRect.height
    ? rect.top - popoverRect.height - margin
    : rect.bottom + margin;

  els.addressPopover.style.left = `${Math.max(margin, left)}px`;
  els.addressPopover.style.top = `${Math.max(margin, top)}px`;
}

function hideAddressPopover() {
  els.addressPopover.hidden = true;
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    els.toast.hidden = true;
  }, 2600);
}

function bindEvents() {
  ["input", "change"].forEach((eventName) => {
    [
      els.searchInput,
      els.statusFilter,
      els.ownershipFilter,
      els.categoryFilter,
      els.modelFilter,
      els.regionFilter,
      els.areaFilter,
      els.dateFrom,
      els.dateTo
    ].forEach((input) => {
      input.addEventListener(eventName, render);
    });
  });

  els.repairViewBtn.addEventListener("click", () => {
    location.hash = "";
    setView("repair");
  });
  els.submissionsViewBtn.addEventListener("click", () => {
    location.hash = "submissions";
    setView("submissions");
  });
  els.customerViewBtn.addEventListener("click", () => {
    location.hash = "customer-admin";
    setView("customerAdmin");
  });
  els.copyCustomerLinkBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(getCustomerRegisterUrl());
      showToast("客户登记链接已复制");
    } catch {
      showToast("复制失败，请手动复制浏览器地址");
    }
  });
  els.newCustomerSubmissionBtn.addEventListener("click", startNewCustomerSubmission);
  els.authToggleBtn.addEventListener("click", openAuthDialog);
  els.closeAuthDialogBtn.addEventListener("click", () => els.authDialog.close());
  els.cancelAuthDialogBtn.addEventListener("click", () => els.authDialog.close());
  els.closeAreaPickerBtn.addEventListener("click", () => els.areaPickerDialog.close());
  els.closeSubmissionDialogBtn.addEventListener("click", () => els.submissionDialog.close());
  els.cancelSubmissionDialogBtn.addEventListener("click", () => els.submissionDialog.close());
  els.newRecordBtn.addEventListener("click", openNewDialog);
  els.importExcelBtn.addEventListener("click", () => els.importExcelInput.click());
  els.importExcelInput.addEventListener("change", () => importExcelFile(els.importExcelInput.files[0]));
  els.resetFiltersBtn.addEventListener("click", resetFilters);
  els.exportCsvBtn.addEventListener("click", exportCsv);
  els.closeDialogBtn.addEventListener("click", () => els.recordDialog.close());
  els.cancelDialogBtn.addEventListener("click", () => els.recordDialog.close());
  els.categoryFilterToggle.addEventListener("click", toggleCategoryFilterPicker);
  els.categoryFilterMenu.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[type='checkbox']");
    if (!checkbox) return;
    const option = Array.from(els.categoryFilter.options).find((item) => item.value === checkbox.value);
    if (option) option.selected = checkbox.checked;
    updateCategoryFilterPicker();
    render();
  });
  els.faultCategoryToggle.addEventListener("click", toggleFaultCategoryPicker);
  els.faultCategoryMenu.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[type='checkbox']");
    if (!checkbox) return;
    const option = Array.from(els.recordForm.elements.faultCategory.options)
      .find((item) => item.value === checkbox.value);
    if (option) option.selected = checkbox.checked;
    updateFaultCategoryPicker();
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("#categoryFilterPicker")) closeCategoryFilterPicker();
    if (!event.target.closest("#faultCategoryPicker")) closeFaultCategoryPicker();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCategoryFilterPicker();
      closeFaultCategoryPicker();
    }
  });
  els.copyShareUrlBtn.addEventListener("click", copyShareUrlToClipboard);
  els.closeShareDialogBtn.addEventListener("click", () => els.shareDialog.close());
  els.doneShareDialogBtn.addEventListener("click", () => els.shareDialog.close());

  els.authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await signInAdmin();
  });

  els.recordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const record = getFormRecord();
    if (!record) return;
    await upsertRecord(record);
    els.recordDialog.close();
  });

  els.saveRecordBtn.addEventListener("click", (event) => {
    if (getMultiSelectValues(els.recordForm.elements.faultCategory).length > 0) return;
    event.preventDefault();
    showFaultCategoryRequired();
  });

  els.recordForm.elements.deviceNumber.addEventListener("input", checkDeviceNumberMatch);
  els.recordForm.elements.deviceNumber.addEventListener("change", checkDeviceNumberMatch);
  els.recordForm.elements.companyName.addEventListener("dblclick", () => {
    unlockAutoField(els.recordForm.elements.companyName);
  });
  els.recordForm.elements.companyName.addEventListener("blur", () => {
    lockAutoField(els.recordForm.elements.companyName);
  });
  els.recordForm.elements.customerIssue.addEventListener("dblclick", () => {
    unlockAutoField(els.recordForm.elements.customerIssue);
  });
  els.recordForm.elements.customerIssue.addEventListener("blur", () => {
    lockAutoField(els.recordForm.elements.customerIssue);
  });

  els.customerForm.elements.deviceNumber.addEventListener("input", () => {
    const input = els.customerForm.elements.deviceNumber;
    input.value = input.value.replace(/\D/g, "").slice(0, 10);
    autoFillSubmissionModel(els.customerForm.elements);
  });
  els.customerForm.elements.phone.addEventListener("input", () => {
    const input = els.customerForm.elements.phone;
    input.value = input.value.replace(/\D/g, "").slice(0, 11);
  });
  els.customerForm.elements.addressProvince.addEventListener("change", updateAddressCities);
  els.customerForm.elements.addressCity.addEventListener("change", updateAddressDistricts);
  els.customerForm.elements.powerAdapterReturned.addEventListener("change", () => {
    syncSimpleSelectButton("powerAdapterReturned");
  });
  syncSimpleSelectButton("powerAdapterReturned");
  els.customerForm.querySelectorAll("[data-area-level]").forEach((button) => {
    button.addEventListener("click", () => openAreaPicker(button.dataset.areaLevel));
  });
  els.customerForm.querySelectorAll("[data-simple-select]").forEach((button) => {
    button.addEventListener("click", () => {
      openSimpleSelectPicker(button.dataset.simpleSelect, "电源适配器是否寄回");
    });
  });
  els.areaPickerOptions.addEventListener("click", (event) => {
    const button = event.target.closest(".area-option");
    if (!button) return;
    if (button.dataset.simpleSelect) {
      chooseSimpleSelectOption(button.dataset.simpleSelect, button.dataset.optionValue);
      return;
    }
    chooseAreaOption(button.dataset.areaLevel, button.dataset.areaCode);
  });

  els.customerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitCustomerForm();
  });

  els.submissionForm.elements.deviceNumber.addEventListener("input", () => {
    const input = els.submissionForm.elements.deviceNumber;
    input.value = input.value.replace(/\D/g, "").slice(0, 10);
    autoFillSubmissionModel(els.submissionForm.elements);
  });
  els.submissionForm.elements.phone.addEventListener("input", () => {
    const input = els.submissionForm.elements.phone;
    input.value = input.value.replace(/\D/g, "").slice(0, 11);
  });
  els.submissionForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const saved = await updateSubmissionFromEditForm();
    if (saved) els.submissionDialog.close();
  });

  els.deleteRecordBtn.addEventListener("click", async () => {
    await deleteRecord(els.recordId.value);
    els.recordDialog.close();
  });

  els.recordsBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    if (button.dataset.action === "address") {
      const record = records.find((item) => item.id === button.dataset.id);
      if (record?.customerAddress) showAddressPopover(record, button);
      return;
    }
    if (button.dataset.action === "edit") openEditDialog(button.dataset.id);
    if (button.dataset.action === "delete") deleteRecord(button.dataset.id);
  });

  els.recordsBody.addEventListener("dblclick", (event) => {
    if (readonlyMode) return;
    if (event.target.closest("button, a, input, select, textarea, label")) return;

    const row = event.target.closest("tr[data-id]");
    if (!row) return;
    if (isDoubleClickOnRowContent(event, row)) return;
    openEditDialog(row.dataset.id);
  });

  els.submissionsBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    if (button.dataset.action === "use-submission") openNewDialogFromSubmission(button.dataset.id);
    if (button.dataset.action === "edit-submission") openSubmissionEditDialog(button.dataset.id);
    if (button.dataset.action === "delete-submission") deleteSubmission(button.dataset.id);
  });

  document.addEventListener("click", (event) => {
    const clickedAddress = event.target.closest(".address-preview");
    const clickedPopover = event.target.closest("#addressPopover");
    if (!clickedAddress && !clickedPopover) hideAddressPopover();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideAddressPopover();
  });

  window.addEventListener("scroll", hideAddressPopover, true);
  window.addEventListener("hashchange", applyHashRoute);
}

fillStaticOptions();
bindEvents();
applyHashRoute();
loadAreaData();
initializeCloud();
