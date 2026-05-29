const STORAGE_KEY = "printer_repair_records_v3";
const PUBLIC_SHARE_BASE_URL = "https://hihu-hu.github.io/repair-register/";
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
  model: ["GMX", "GMI", "GMH", "GMT", "DK110A", "DK80", "DK110S", "DK110B"]
};

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
  exportJsonBtn: document.querySelector("#exportJsonBtn"),
  importExcelBtn: document.querySelector("#importExcelBtn"),
  importExcelInput: document.querySelector("#importExcelInput"),
  authToggleBtn: document.querySelector("#authToggleBtn"),
  authDialog: document.querySelector("#authDialog"),
  authForm: document.querySelector("#authForm"),
  closeAuthDialogBtn: document.querySelector("#closeAuthDialogBtn"),
  cancelAuthDialogBtn: document.querySelector("#cancelAuthDialogBtn"),
  shareReadonlyBtn: document.querySelector("#shareReadonlyBtn"),
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
let records = readSharedRecords() || loadRecords();
let filteredRecords = [];

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw).map(normalizeRecord) : [];
  } catch {
    return [];
  }
}

function readSharedRecords() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ""));
  const payload = params.get("view") || params.get("v");
  forceReadonlyMode = location.hash.replace(/^#/, "") === "readonly" || Boolean(payload);
  if (forceReadonlyMode) setReadonlyMode(true);
  if (!payload) return null;

  try {
    return decodePayload(payload).map(normalizeRecord);
  } catch {
    showToast("分享链接无法读取");
    return [];
  }
}

function applyHashRoute() {
  const sharedRecords = readSharedRecords();
  if (sharedRecords) {
    records = sharedRecords;
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
  records = loadRecords();
  render();
}

function closeOpenDialogs() {
  [els.recordDialog, els.shareDialog].forEach((dialog) => {
    if (dialog.open) dialog.close();
  });
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
  syncCheckboxMenu(els.faultCategoryMenu, selected);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function setReadonlyMode(value) {
  readonlyMode = value;
  document.body.classList.toggle("readonly", readonlyMode);
  els.modeNote.hidden = !readonlyMode;
}

function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase?.createClient);
}

function refreshAccessMode() {
  if (!cloudMode) return;
  setReadonlyMode(forceReadonlyMode || !adminMode);
  els.authToggleBtn.hidden = forceReadonlyMode;
  els.authToggleBtn.textContent = adminMode ? "退出登录" : "管理员登录";
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

async function initializeCloud() {
  if (!hasSupabaseConfig() || (forceReadonlyMode && location.hash.includes("view="))) return;

  cloudMode = true;
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { data } = await supabaseClient.auth.getSession();
  const email = data.session?.user?.email || "";
  adminMode = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
  refreshAccessMode();
  await loadCloudRecords();

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    const sessionEmail = session?.user?.email || "";
    adminMode = sessionEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    refreshAccessMode();
    loadCloudRecords();
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
        records = localRecords;
        render();
        showToast("本机记录已同步到云端");
        return;
      } catch (saveError) {
        console.error(saveError);
        showToast("本机记录同步失败");
      }
    }
  }

  records = data.map(fromDatabaseRecord);
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

function createId() {
  return `repair-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
  fillRequiredSelect(els.recordForm.elements.model, optionSets.model);
  fillRequiredSelect(els.recordForm.elements.hasPower, optionSets.hasPower);
  fillSelect(els.recordForm.elements.finalStatus, optionSets.finalStatus);
  fillRequiredSelect(els.recordForm.elements.faultOwnership, optionSets.faultOwnership);
  fillFaultCategoryPicker();
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

  filteredRecords.sort((a, b) => {
    const timeDiff = parseRecordTime(b.createdTime) - parseRecordTime(a.createdTime);
    if (timeDiff !== 0) return timeDiff;
    return (b.updatedAt || "").localeCompare(a.updatedAt || "");
  });
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

function renderFaultCategoryTags(record) {
  return normalizeFaultCategories(record.faultCategory)
    .map((category) => `<span class="tag">${escapeHtml(category)}</span>`)
    .join("");
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
        <tr>
          <td>${compact(formatDateTime(record.createdTime))}</td>
          <td><span class="cell-main">${compact(record.trackingNumber)}</span></td>
          <td>${compact(record.region)}</td>
          <td><span class="tag ${areaClass(record.area)}">${compact(record.area)}</span></td>
          <td>
            <span class="cell-main">${compact(record.deviceNumber)}</span>
            <span class="cell-sub">${compact(record.model)}</span>
          </td>
          <td><span class="tag">${compact(record.hasPower)}</span></td>
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
  closeFaultCategoryPicker();
  els.recordForm.elements.model.value = "";
}

function openNewDialog() {
  if (readonlyMode) return;
  resetForm();
  els.recordDialog.showModal();
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
        closeFaultCategoryPicker();
        return;
      }
      els.recordForm.elements[key].value = record[key] || "";
    }
  });
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
  if (record.faultCategory.length === 0) {
    showToast("请选择故障分类");
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
  if (!cloudMode) saveRecords();
  render();
  showToast("已保存");
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

function exportJson() {
  downloadFile(`打印机维修记录_${dateStamp()}.json`, JSON.stringify(filteredRecords, null, 2), "application/json;charset=utf-8");
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

  records = incoming.concat(records);
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

    const normalized = incoming.map(normalizeRecord);
    if (cloudMode) await saveCloudRecords(normalized);
    records = normalized.concat(records);
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
    return unpackSharedRecords(JSON.parse(decodeBase64Utf8(padded)));
  } catch {
    return unpackSharedRecords(JSON.parse(decodeURIComponent(atob(padded))));
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

  url.hash = "view=" + encodePayload(packSharedRecords(records));
  return url.toString();
}

function packSharedRecords(items) {
  return [
    "r1",
    items.map((record) => exportFields.map(([key]) => record[key] || ""))
  ];
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
  if (records.length === 0) {
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
  els.authForm.elements.email.focus();
}

async function signInAdmin() {
  if (!cloudMode || !supabaseClient) return;
  const formData = new FormData(els.authForm);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    console.error(error);
    showToast("登录失败，请检查邮箱和密码");
    return;
  }

  els.authDialog.close();
  els.authForm.reset();
  els.authForm.elements.email.value = ADMIN_EMAIL;
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

  els.authToggleBtn.addEventListener("click", openAuthDialog);
  els.closeAuthDialogBtn.addEventListener("click", () => els.authDialog.close());
  els.cancelAuthDialogBtn.addEventListener("click", () => els.authDialog.close());
  els.newRecordBtn.addEventListener("click", openNewDialog);
  els.shareReadonlyBtn.addEventListener("click", copyReadonlyShareLink);
  els.importExcelBtn.addEventListener("click", () => els.importExcelInput.click());
  els.importExcelInput.addEventListener("change", () => importExcelFile(els.importExcelInput.files[0]));
  els.resetFiltersBtn.addEventListener("click", resetFilters);
  els.exportCsvBtn.addEventListener("click", exportCsv);
  els.exportJsonBtn.addEventListener("click", exportJson);
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
render();
initializeCloud();
