const STORAGE_KEY = "printer_repair_records_v3";
const CUSTOMER_SUBMISSIONS_STORAGE_KEY = "printer_customer_submissions_v1";
const LAST_CUSTOMER_SUBMISSION_KEY = "printer_last_customer_submission_v1";
const PUBLIC_SHARE_BASE_URL = "https://hihu-hu.github.io/repair-register/";
const CUSTOMER_REGISTER_URL = `${PUBLIC_SHARE_BASE_URL}customer.html?v=20260803-light-form`;
const LOCAL_CUSTOMER_REGISTER_URL = "http://192.168.1.211:5173/customer.html";
const ADMIN_ACCOUNTS = [
  {
    username: "QQQQ",
    email: "1041852311@qq.com",
    level: "super",
    label: "超级管理员"
  },
  {
    username: "CCCC",
    email: "1041852311+cccc@qq.com",
    level: "admin",
    label: "普通管理员"
  },
  // 新增普通管理员时，按下面格式再加一行：
  // { username: "新账号", email: "新邮箱", level: "admin", label: "普通管理员" }
];
const SUPABASE_URL = "https://olvkyqmlbpqzffypabzj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vCjqGjgyz9E4XhtOcOS1Yg_SV-DBJGG";
const INVENTORY_SUPABASE_URL = "https://jvcbmfspsyijsaskvxdj.supabase.co";
const INVENTORY_SUPABASE_ANON_KEY = "sb_publishable__bMTZy2Ol1b5Lrx17YaLIA_3Gp3R9zu";
const WECOM_PUSH_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/push-repair-stats`;
const MULTI_VALUE_SEPARATOR = "、";
const CUSTOM_PRICE_ACCESSORY_PART = "塑料件/其他件";
const ZERO_FEE_MARK = "{0元}";
const WARRANTY_FEE_MARK = "{保修}";
const WARRANTY_STATUS_STORAGE_PREFIX = "__warranty_status__:";
const LOCKED_CUSTOMER_EDIT_STATUSES = ["已寄出", "邮寄并结束"];
const UNSAVED_RECORD_MESSAGE = "这条维修记录有改动，关闭后不会保存。确定关闭吗？";
const EXPRESS_EXPORT_SENDER = {
  name: "服务中心-维修",
  mobile: "",
  phone: "4000858853",
  address: "浙江省杭州市余杭区仓前街道乐富海邦园10幢601",
  company: ""
};
const EXPRESS_EXPORT_HEADERS = [
  "订单号",
  "代收金额",
  "发件人姓名",
  "发件人手机",
  "发件人电话",
  "发件人地址",
  "发件人单位",
  "收件人姓名",
  "收件人手机",
  "收件人电话",
  "收件人地址",
  "收件人单位",
  "品名",
  "数量",
  "买家备注",
  "卖家备注"
];
const EXPRESS_REQUIRED_HEADER_INDEXES = new Set([2, 4, 5, 7, 8, 10]);
const EXPRESS_MOBILE_RE = /1[3-9]\d{9}/;
const optionSets = {
  hasPower: ["有", "没有"],
  area: ["直营", "代理商"],
  finalStatus: ["维修中", "邮寄并结束", "已寄出", "返厂中", "今天需要寄", "已修未付费", "测试中"],
  faultOwnership: ["硬件损坏", "非硬件", "外接因素"],
  faultCategory: ["传感器", "主板", "打印头", "模块", "屏幕", "电源", "塑料件", "未复现", "其他"],
  accessoryParts: ["传感器", "打印头", "主板", "wifi模块", "wifi模块5g", "屏幕", "电源适配器", "电池", "卡勾", "电源接口", "塑料件/其他件", "快递费", "无费用"],
  warrantyStatus: ["保修", "不保修"],
  model: ["GMX", "GMI", "GMT", "GMH", "GMX-5G", "GMT-5G", "DK110A", "DK110B", "DK110S", "DK80", "新北洋110", "芯烨80"]
};

const faultCategoryAliases = {
  无损坏: "未复现"
};

const finalStatusAliases = {
  待寄出: "已修未付费"
};

const accessoryPartAliases = {
  "塑料件/小件": "塑料件/其他件"
};

const accessoryPartPricesByModel = {
  GMX: {
    传感器: 60,
    打印头: 190,
    主板: 260,
    wifi模块: 50,
    wifi模块5g: 60,
    屏幕: 60,
    电源适配器: 80,
    卡勾: 40,
    电源接口: 60,
    "塑料件/其他件": 1
  },
  GMI: {
    打印头: 130,
    主板: 110,
    wifi模块: 50,
    电源适配器: 60,
    "塑料件/其他件": 1
  },
  GMT: {
    传感器: 60,
    打印头: 150,
    主板: 180,
    wifi模块: 50,
    电源适配器: 60,
    "塑料件/其他件": 1
  },
  GMH: {
    打印头: 190,
    主板: 210,
    wifi模块: 110,
    屏幕: 60,
    电源适配器: 60,
    电池: 100,
    电源接口: 60,
    "塑料件/其他件": 1
  },
  "GMX-5G": {
    传感器: 60,
    打印头: 190,
    主板: 260,
    wifi模块5g: 60,
    屏幕: 60,
    电源适配器: 80,
    卡勾: 40,
    电源接口: 60,
    "塑料件/其他件": 1
  },
  "GMT-5G": {
    传感器: 60,
    打印头: 150,
    主板: 180,
    wifi模块5g: 60,
    电源适配器: 60,
    "塑料件/其他件": 1
  },
  DK110A: {
    打印头: 240,
    主板: 450,
    wifi模块: 50,
    电源适配器: 155,
    卡勾: 60,
    "塑料件/其他件": 1
  },
  DK110B: {
    打印头: 550,
    主板: 650,
    wifi模块: 50,
    电源适配器: 155,
    卡勾: 60,
    "塑料件/其他件": 1
  },
  DK110S: {
    打印头: 240,
    主板: 450,
    wifi模块: 50,
    电源适配器: 155,
    卡勾: 60,
    "塑料件/其他件": 1
  },
  DK80: {
    打印头: 240,
    主板: 220,
    wifi模块: 50,
    电源适配器: 80,
    电源接口: 60,
    "塑料件/其他件": 1
  }
};

const shippingFeesByProvince = {
  浙江: 8,
  江苏: 8,
  上海: 8,
  安徽: 8,
  北京: 13,
  福建: 13,
  河南: 13,
  湖南: 13,
  湖北: 13,
  江西: 13,
  山东: 13,
  河北: 16,
  天津: 16,
  广东: 16,
  广西: 16,
  山西: 16,
  陕西: 16,
  四川: 16,
  重庆: 16,
  贵州: 19,
  海南: 19,
  黑龙江: 19,
  吉林: 19,
  云南: 19,
  辽宁: 19,
  甘肃: 32,
  宁夏: 32,
  青海: 32,
  内蒙古: 32,
  新疆: 49
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
const ANALYSIS_TOP_LIMIT = 8;
const ANALYSIS_TREND_DAYS = 7;

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
  ["accessoryParts", "本单所用配件"],
  ["customerAddress", "客户地址"],
  ["model", "型号"],
  ["customPartPrice", "自定义配件金额"],
  ["zeroFeeParts", "保修配件"],
  ["warrantyStatus", "是否保修"]
];

const els = {
  totalCount: document.querySelector("#totalCount"),
  repairViewBtn: document.querySelector("#repairViewBtn"),
  submissionsViewBtn: document.querySelector("#submissionsViewBtn"),
  analyticsViewBtn: document.querySelector("#analyticsViewBtn"),
  customerViewBtn: document.querySelector("#customerViewBtn"),
  repairViews: document.querySelectorAll(".repair-view"),
  analyticsPage: document.querySelector("#analyticsPage"),
  analyticsUpdatedAt: document.querySelector("#analyticsUpdatedAt"),
  analysisAccessoryToggleBtn: document.querySelector("#analysisAccessoryToggleBtn"),
  analysisDateFrom: document.querySelector("#analysisDateFrom"),
  analysisDateTo: document.querySelector("#analysisDateTo"),
  resetAnalysisDateBtn: document.querySelector("#resetAnalysisDateBtn"),
  analysisHardwareRate: document.querySelector("#analysisHardwareRate"),
  analysisThisMonth: document.querySelector("#analysisThisMonth"),
  analysisCategoryBars: document.querySelector("#analysisCategoryBars"),
  analysisRegionBars: document.querySelector("#analysisRegionBars"),
  analysisModelBars: document.querySelector("#analysisModelBars"),
  analysisAccessoryPanel: document.querySelector("#analysisAccessoryPanel"),
  analysisAccessoryFeeModeBtn: document.querySelector("#analysisAccessoryFeeModeBtn"),
  analysisAccessoryModelFilter: document.querySelector("#analysisAccessoryModelFilter"),
  exportAccessoryExcelBtn: document.querySelector("#exportAccessoryExcelBtn"),
  analysisAccessoryBars: document.querySelector("#analysisAccessoryBars"),
  analysisTrendBars: document.querySelector("#analysisTrendBars"),
  analysisOwnershipTotal: document.querySelector("#analysisOwnershipTotal"),
  analysisOwnershipBars: document.querySelector("#analysisOwnershipBars"),
  analysisAreaTotal: document.querySelector("#analysisAreaTotal"),
  analysisAreaBars: document.querySelector("#analysisAreaBars"),
  customerPage: document.querySelector("#customerPage"),
  customerIntro: document.querySelector(".customer-intro"),
  customerRecent: document.querySelector("#customerRecent"),
  customerRecentDetail: document.querySelector("#customerRecentDetail"),
  newCustomerSubmissionBtn: document.querySelector("#newCustomerSubmissionBtn"),
  editCustomerSubmissionBtn: document.querySelector("#editCustomerSubmissionBtn"),
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
  submissionSearchInput: document.querySelector("#submissionSearchInput"),
  submissionsEmptyState: document.querySelector("#submissionsEmptyState"),
  metricCards: document.querySelectorAll("[data-metric-target]"),
  testingCount: document.querySelector("#testingCount"),
  readyCount: document.querySelector("#readyCount"),
  pendingShipmentCount: document.querySelector("#pendingShipmentCount"),
  finishedCount: document.querySelector("#finishedCount"),
  testStatusCount: document.querySelector("#testStatusCount"),
  unrepairedSubmissionCount: document.querySelector("#unrepairedSubmissionCount"),
  filteredCount: document.querySelector("#filteredCount"),
  filterSummaryCount: document.querySelector("#filterSummaryCount"),
  repairRecordsSection: document.querySelector("#repairRecordsSection"),
  recordsBody: document.querySelector("#recordsBody"),
  emptyState: document.querySelector("#emptyState"),
  searchInput: document.querySelector("#searchInput"),
  warrantyFilter: document.querySelector("#warrantyFilter"),
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
  exportExpressBtn: document.querySelector("#exportExpressBtn"),
  exportCsvBtn: document.querySelector("#exportCsvBtn"),
  pushWecomBtn: document.querySelector("#pushWecomBtn"),
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
  deviceHistoryBtn: document.querySelector("#deviceHistoryBtn"),
  faultCategoryToggle: document.querySelector("#faultCategoryToggle"),
  faultCategoryMenu: document.querySelector("#faultCategoryMenu"),
  accessoryPartsLabel: document.querySelector("#accessoryPartsLabel"),
  accessoryPartsToggle: document.querySelector("#accessoryPartsToggle"),
  accessoryPartsClearBtn: document.querySelector("#accessoryPartsClearBtn"),
  accessoryPartsMenu: document.querySelector("#accessoryPartsMenu"),
  repairFeeBox: document.querySelector("#repairFeeBox"),
  customPartPriceDialog: document.querySelector("#customPartPriceDialog"),
  customPartPriceForm: document.querySelector("#customPartPriceForm"),
  customPartPriceInput: document.querySelector("#customPartPriceInput"),
  closeCustomPartPriceDialogBtn: document.querySelector("#closeCustomPartPriceDialogBtn"),
  cancelCustomPartPriceBtn: document.querySelector("#cancelCustomPartPriceBtn"),
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
  expressExportDialog: document.querySelector("#expressExportDialog"),
  expressExportForm: document.querySelector("#expressExportForm"),
  expressExportSummary: document.querySelector("#expressExportSummary"),
  closeExpressExportDialogBtn: document.querySelector("#closeExpressExportDialogBtn"),
  cancelExpressExportBtn: document.querySelector("#cancelExpressExportBtn"),
  confirmExpressExportBtn: document.querySelector("#confirmExpressExportBtn"),
  deviceHistoryDialog: document.querySelector("#deviceHistoryDialog"),
  deviceHistoryList: document.querySelector("#deviceHistoryList"),
  closeDeviceHistoryDialogBtn: document.querySelector("#closeDeviceHistoryDialogBtn"),
  closeDeviceHistoryBtn: document.querySelector("#closeDeviceHistoryBtn"),
  modeNote: document.querySelector("#modeNote"),
  toast: document.querySelector("#toast"),
  addressPopover: document.querySelector("#addressPopover"),
  analysisPopover: document.querySelector("#analysisPopover"),
  analysisChildPopover: document.querySelector("#analysisChildPopover"),
  analysisGrandchildPopover: document.querySelector("#analysisGrandchildPopover")
};

let toastTimer = null;
let readonlyMode = false;
let cloudMode = false;
let adminMode = false;
let currentAdmin = null;
let showAccessoryAnalytics = true;
let accessoryFeeMode = "paid";
let forceReadonlyMode = false;
let supabaseClient = null;
let inventorySupabaseClient = null;
const sharedData = readSharedData();
const shouldUseLocalStartupData = !SUPABASE_URL || location.protocol === "file:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
let records = sharedData ? sharedData.records : shouldUseLocalStartupData ? loadRecords() : [];
let filteredRecords = [];
let customerSubmissions = sharedData ? sharedData.submissions : shouldUseLocalStartupData ? loadCustomerSubmissions() : [];
let currentView = "repair";
let submissionStatusFilter = "";
let areaData = null;
let appliedSubmissionSnapshot = null;
let appliedSubmissionId = "";
let ignoredSubmissionId = "";
let matchedSubmissionForRecord = null;
let isCustomerSubmitting = false;
let editingCustomerSubmissionId = "";
let lastCustomerSubmitFingerprint = "";
let lastCustomerSubmitTime = 0;
let analysisPopoverState = null;
let dialogScrollLockY = 0;
let dialogScrollLockObserver = null;
let recordDialogInitialSnapshot = "";

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
    if (!closeOpenDialogs()) return;
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
  if (els.recordDialog.open && !closeRecordDialogWithGuard()) return false;
  [els.shareDialog, els.deviceHistoryDialog].forEach((dialog) => {
    if (dialog.open) dialog.close();
  });
  return true;
}

function hasOpenDialog() {
  return Array.from(document.querySelectorAll("dialog")).some((dialog) => dialog.open);
}

function lockPageScrollForDialog() {
  if (document.body.classList.contains("dialog-scroll-locked")) return;
  dialogScrollLockY = window.scrollY || document.documentElement.scrollTop || 0;
  document.documentElement.classList.add("dialog-scroll-locked");
  document.body.classList.add("dialog-scroll-locked");
  document.body.style.top = `-${dialogScrollLockY}px`;
}

function unlockPageScrollForDialog() {
  if (hasOpenDialog() || !document.body.classList.contains("dialog-scroll-locked")) return;
  const scrollY = dialogScrollLockY;
  document.documentElement.classList.remove("dialog-scroll-locked");
  document.body.classList.remove("dialog-scroll-locked");
  document.body.style.top = "";
  window.scrollTo(0, scrollY);
}

function syncDialogScrollLock() {
  if (hasOpenDialog()) {
    lockPageScrollForDialog();
    return;
  }
  unlockPageScrollForDialog();
}

function bindDialogScrollLock() {
  const dialogs = Array.from(document.querySelectorAll("dialog"));
  dialogs.forEach((dialog) => {
    dialog.addEventListener("close", () => requestAnimationFrame(syncDialogScrollLock));
    dialog.addEventListener("cancel", () => requestAnimationFrame(syncDialogScrollLock));
  });

  if (typeof MutationObserver === "undefined") return;
  dialogScrollLockObserver = new MutationObserver(syncDialogScrollLock);
  dialogs.forEach((dialog) => {
    dialogScrollLockObserver.observe(dialog, { attributes: true, attributeFilter: ["open"] });
  });
}

function wheelDeltaToPixels(event, target) {
  if (event.deltaMode === 1) return event.deltaY * 16;
  if (event.deltaMode === 2) return event.deltaY * target.clientHeight;
  return event.deltaY;
}

function bindContainedMenuScroll(menu) {
  if (!menu) return;

  menu.addEventListener("wheel", (event) => {
    if (menu.hidden) return;
    const deltaY = wheelDeltaToPixels(event, menu);
    if (!deltaY) return;

    event.preventDefault();
    event.stopPropagation();
    menu.scrollTop += deltaY;
  }, { passive: false });

  let lastTouchY = 0;
  menu.addEventListener("touchstart", (event) => {
    if (menu.hidden || event.touches.length !== 1) return;
    lastTouchY = event.touches[0].clientY;
  }, { passive: true });

  menu.addEventListener("touchmove", (event) => {
    if (menu.hidden || event.touches.length !== 1) return;
    const nextTouchY = event.touches[0].clientY;
    const deltaY = lastTouchY - nextTouchY;
    lastTouchY = nextTouchY;
    if (!deltaY) return;

    event.preventDefault();
    event.stopPropagation();
    menu.scrollTop += deltaY;
  }, { passive: false });
}

function getRecordFormSnapshot() {
  const fields = [];
  Array.from(els.recordForm.elements).forEach((field) => {
    const name = field.name || (field === els.recordId ? "recordId" : "");
    if (!name) return;
    if (field.tagName === "SELECT" && field.multiple) {
      fields.push([
        name,
        Array.from(field.options)
          .filter((option) => option.selected)
          .map((option) => option.value)
      ]);
      return;
    }
    if (["checkbox", "radio"].includes(field.type)) {
      fields.push([name, field.value, field.checked]);
      return;
    }
    fields.push([name, field.value || ""]);
  });
  return JSON.stringify(fields);
}

function markRecordDialogClean() {
  recordDialogInitialSnapshot = getRecordFormSnapshot();
}

function clearRecordDialogSnapshot() {
  recordDialogInitialSnapshot = "";
}

function isRecordDialogDirty() {
  return Boolean(
    els.recordDialog.open &&
    recordDialogInitialSnapshot &&
    getRecordFormSnapshot() !== recordDialogInitialSnapshot
  );
}

function confirmDiscardRecordChanges() {
  return !isRecordDialogDirty() || confirm(UNSAVED_RECORD_MESSAGE);
}

function closeRecordDialogWithGuard() {
  if (!confirmDiscardRecordChanges()) return false;
  clearRecordDialogSnapshot();
  els.recordDialog.close();
  return true;
}

function openRecordDialogAndTrackChanges() {
  els.recordDialog.showModal();
  markRecordDialogClean();
}

function handleRecordDialogCancel(event) {
  if (!confirmDiscardRecordChanges()) {
    event.preventDefault();
    return;
  }
  clearRecordDialogSnapshot();
}

function handleRecordBeforeUnload(event) {
  if (!isRecordDialogDirty()) return;
  event.preventDefault();
  event.returnValue = "";
}

function normalizeCustomerSubmission(item = {}) {
  const deviceNumber = String(item.deviceNumber || item.device_number || "").trim();
  const inferredModel = inferModelFromDeviceNumber(deviceNumber);
  const customerIssue = String(item.customerIssue || item.customer_issue || "").trim();
  return {
    id: String(item.id || createCustomerSubmissionId()),
    createdTime: normalizeDateTime(item.createdTime || item.created_at || new Date()),
    deviceNumber,
    model: inferredModel || normalizeOption(item.model, optionSets.model, "GMX"),
    companyName: String(item.companyName || item.company_name || "").trim(),
    contactName: String(item.contactName || item.contact_name || "").trim(),
    phone: String(item.phone || "").trim(),
    trackingNumber: String(item.trackingNumber || item.tracking_number || "").trim(),
    customerIssue,
    powerAdapterReturned: normalizePowerAdapterAnswer(
      item.powerAdapterReturned || item.power_adapter_returned || extractPowerAdapterAnswerFromText(customerIssue)
    ),
    customerAddress: String(item.customerAddress || item.customer_address || "").trim(),
    updatedAt: String(item.updatedAt || item.updated_at || new Date().toISOString())
  };
}

function normalizeRecord(record = {}) {
  const region = String(record.region || "");
  const deviceNumber = String(record.deviceNumber || record.printerId || "");
  const inferredModel = inferModelFromDeviceNumber(deviceNumber);
  const rawAccessoryParts = record.accessoryParts || record.accessory_parts;
  const rawCustomPartPrice = record.customPartPrice ?? record.custom_part_price ?? extractCustomPartPriceFromAccessoryParts(rawAccessoryParts);
  const rawZeroFeeParts = record.zeroFeeParts ?? record.zero_fee_parts ?? extractZeroFeePartsFromAccessoryParts(rawAccessoryParts);
  const rawWarrantyStatus = record.warrantyStatus ?? record.warranty_status ?? extractWarrantyStatusFromAccessoryParts(rawAccessoryParts);
  return {
    id: String(record.id || createId()),
    createdTime: normalizeDateTime(record.createdTime || record.createdAt || record.repairDate),
    trackingNumber: String(record.trackingNumber || record.inboundTracking || ""),
    region,
    area: classifyArea(region),
    deviceNumber,
    hasPower: normalizeOption(record.hasPower, optionSets.hasPower, "有"),
    companyName: String(record.companyName || record.customer || ""),
    customerIssue: String(record.customerIssue || record.issue || ""),
    repairProcess: String(record.repairProcess || record.process || ""),
    returnTime: normalizeDate(record.returnTime || record.returnedDate || ""),
    finalStatus: normalizeOption(finalStatusAliases[record.finalStatus || record.status] || record.finalStatus || record.status, optionSets.finalStatus, "测试中"),
    returnTrackingNumber: String(record.returnTrackingNumber || record.outboundTracking || ""),
    faultOwnership: normalizeOption(record.faultOwnership, optionSets.faultOwnership, "硬件损坏"),
    faultCategory: normalizeFaultCategories(record.faultCategory).join(MULTI_VALUE_SEPARATOR),
    accessoryParts: normalizeAccessoryParts(rawAccessoryParts).join(MULTI_VALUE_SEPARATOR),
    warrantyStatus: normalizeWarrantyStatus(rawWarrantyStatus),
    customerAddress: String(record.customerAddress || record.address || ""),
    model: inferredModel || normalizeOption(record.model, optionSets.model, "GMX"),
    customPartPrice: normalizeMoneyValue(rawCustomPartPrice),
    zeroFeeParts: normalizeAccessoryParts(rawZeroFeeParts)
      .filter((part) => part !== "无费用")
      .join(MULTI_VALUE_SEPARATOR),
    updatedAt: String(record.updatedAt || new Date().toISOString())
  };
}

function normalizeOption(value, options, fallback) {
  const text = String(value || "").trim();
  return options.includes(text) ? text : fallback;
}

function normalizeWarrantyStatus(value = "") {
  const text = String(value ?? "").trim();
  if (optionSets.warrantyStatus.includes(text)) return text;
  if (["不保修", "付费", "自费", "收费", "否", "不", "false", "no", "0"].includes(text.toLowerCase())) {
    return "不保修";
  }
  return "不保修";
}

function normalizePowerAdapterAnswer(value) {
  const text = String(value || "").trim();
  if (["是", "否"].includes(text)) return text;
  if (["有", "已寄回", "寄回"].includes(text)) return "是";
  if (["没有", "没寄", "未寄", "未寄回"].includes(text)) return "否";
  return text;
}

function inferModelFromDeviceNumber(deviceNumber) {
  const number = String(deviceNumber || "").replace(/\D/g, "");
  const rule = modelPrefixRules.find(([prefix]) => number.startsWith(prefix));
  return rule?.[1] || "";
}

function normalizeFaultCategories(value) {
  return normalizeMultiOptions(value, optionSets.faultCategory, faultCategoryAliases, ["其他"]);
}

function normalizeAccessoryParts(value) {
  const rawItems = Array.isArray(value)
    ? value
    : String(value || "")
      .replaceAll(CUSTOM_PRICE_ACCESSORY_PART, "__CUSTOM_PRICE_ACCESSORY_PART__")
      .split(/[、,，;；/|]/)
      .map((item) => item.replaceAll("__CUSTOM_PRICE_ACCESSORY_PART__", CUSTOM_PRICE_ACCESSORY_PART));
  const selected = rawItems
    .map(stripAccessoryPartPrice)
    .map((item) => accessoryPartAliases[item] || item)
    .filter((item) => optionSets.accessoryParts.includes(item));
  const unique = [...new Set(selected)];
  return unique;
}

function getAccessoryPartsForModel(model = "") {
  const modelPrices = accessoryPartPricesByModel[model] || null;
  if (!modelPrices) return optionSets.accessoryParts;
  const pricedParts = Object.keys(modelPrices)
    .filter((part) => optionSets.accessoryParts.includes(part));
  return [
    ...pricedParts,
    ...["快递费", "无费用"].filter((part) => optionSets.accessoryParts.includes(part))
  ];
}

function normalizeMultiOptions(value, options, aliases = {}, fallback = []) {
  const rawItems = Array.isArray(value)
    ? value
    : String(value || "").split(/[、,，;；/|]/);
  const selected = rawItems
    .map((item) => String(item || "").trim())
    .map((item) => aliases[item] || item)
    .filter((item) => options.includes(item));
  const unique = [...new Set(selected)];
  return unique.length > 0 ? unique : fallback;
}

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripAccessoryPartPrice(value = "") {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text === CUSTOM_PRICE_ACCESSORY_PART) return CUSTOM_PRICE_ACCESSORY_PART;
  if (text.endsWith(WARRANTY_FEE_MARK)) return stripAccessoryPartPrice(text.slice(0, -WARRANTY_FEE_MARK.length));
  if (text.endsWith(ZERO_FEE_MARK)) return stripAccessoryPartPrice(text.slice(0, -ZERO_FEE_MARK.length));
  if (text.startsWith(CUSTOM_PRICE_ACCESSORY_PART)) {
    const rest = text.slice(CUSTOM_PRICE_ACCESSORY_PART.length).trim();
    if (!rest || /^[{[(（【:：=¥￥\s\d.元)}\]）】]+$/.test(rest)) return CUSTOM_PRICE_ACCESSORY_PART;
  }
  return text;
}

function isWarrantyAccessoryPart(part = "", zeroFeeParts = "") {
  const normalizedPart = String(part || "").trim();
  if (!normalizedPart || normalizedPart === "无费用") return false;
  const zeroFeeSet = zeroFeeParts instanceof Set
    ? zeroFeeParts
    : new Set(normalizeAccessoryParts(zeroFeeParts));
  return zeroFeeSet.has(normalizedPart);
}

function normalizeMoneyValue(value = "") {
  const text = String(value ?? "")
    .trim()
    .replace(/[￥¥元,\s]/g, "");
  if (!text) return "";
  const amount = Number(text);
  if (!Number.isFinite(amount) || amount < 0) return "";
  return amount.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

function extractCustomPartPriceFromAccessoryParts(value = "") {
  const text = Array.isArray(value) ? value.join(MULTI_VALUE_SEPARATOR) : String(value || "");
  const part = escapeRegExp(CUSTOM_PRICE_ACCESSORY_PART);
  const match = text.match(new RegExp(`${part}\\s*[{[(（【:：=]?\\s*[¥￥]?\\s*(\\d+(?:\\.\\d+)?)`, "i"));
  return match ? normalizeMoneyValue(match[1]) : "";
}

function extractZeroFeePartsFromAccessoryParts(value = "") {
  const rawItems = Array.isArray(value)
    ? value
    : String(value || "")
      .replaceAll(CUSTOM_PRICE_ACCESSORY_PART, "__CUSTOM_PRICE_ACCESSORY_PART__")
      .split(/[、,，;；/|]/)
      .map((item) => item.replaceAll("__CUSTOM_PRICE_ACCESSORY_PART__", CUSTOM_PRICE_ACCESSORY_PART));
  const selected = rawItems
    .map((item) => String(item || "").trim())
    .filter((item) => item.endsWith(WARRANTY_FEE_MARK) || item.endsWith(ZERO_FEE_MARK))
    .map(stripAccessoryPartPrice)
    .map((item) => accessoryPartAliases[item] || item)
    .filter((item) => item !== "无费用" && optionSets.accessoryParts.includes(item));
  return [...new Set(selected)].join(MULTI_VALUE_SEPARATOR);
}

function extractWarrantyStatusFromAccessoryParts(value = "") {
  const text = Array.isArray(value) ? value.join(MULTI_VALUE_SEPARATOR) : String(value || "");
  const marker = escapeRegExp(WARRANTY_STATUS_STORAGE_PREFIX);
  const match = text.match(new RegExp(`${marker}\\s*([^、,，;；/|]+)`));
  return match ? normalizeWarrantyStatus(match[1]) : "";
}

function serializeAccessoryPartsForStorage(accessoryParts, customPartPrice = "", zeroFeeParts = "", warrantyStatus = "不保修") {
  const price = normalizeMoneyValue(customPartPrice);
  const zeroFeeSet = new Set(normalizeAccessoryParts(zeroFeeParts));
  const items = normalizeAccessoryParts(accessoryParts)
    .map((part) => {
      const customPart = part === CUSTOM_PRICE_ACCESSORY_PART && price ? `${part}{${price}}` : part;
      return isWarrantyAccessoryPart(part, zeroFeeSet) ? `${customPart}${WARRANTY_FEE_MARK}` : customPart;
    });
  items.push(`${WARRANTY_STATUS_STORAGE_PREFIX}${normalizeWarrantyStatus(warrantyStatus)}`);
  return items.join(MULTI_VALUE_SEPARATOR);
}

function getMultiSelectValues(select) {
  return Array.from(select.selectedOptions)
    .map((option) => option.value)
    .filter(Boolean);
}

function setMultiSelectValues(select, values, options = []) {
  const selected = new Set(normalizeMultiOptions(values, options, {}, []));
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

function updateAccessoryPartsPicker() {
  const select = els.recordForm.elements.accessoryParts;
  const allowedParts = getAccessoryPartsForModel(els.recordForm.elements.model.value);
  const currentSelection = getMultiSelectValues(select).filter((part) => allowedParts.includes(part));
  fillMultiSelect(select, allowedParts);
  setMultiSelectValues(select, currentSelection, allowedParts);
  buildCheckboxMenu(els.accessoryPartsMenu, allowedParts);
  const selected = getMultiSelectValues(select);
  const selectedSet = new Set(selected);
  const zeroFeeParts = normalizeAccessoryParts(els.recordForm.elements.zeroFeeParts.value)
    .filter((part) => selectedSet.has(part));
  els.recordForm.elements.zeroFeeParts.value = zeroFeeParts.join(MULTI_VALUE_SEPARATOR);
  if (!selected.includes(CUSTOM_PRICE_ACCESSORY_PART)) clearCustomPartPriceValue();
  els.accessoryPartsToggle.textContent = selected.length > 0 ? selected.join(MULTI_VALUE_SEPARATOR) : "请选择";
  els.accessoryPartsToggle.classList.toggle("is-placeholder", selected.length === 0);
  els.accessoryPartsToggle.classList.toggle("is-invalid", selected.length === 0 && els.accessoryPartsToggle.classList.contains("is-invalid"));
  els.accessoryPartsClearBtn.disabled = selected.length === 0;
  syncCheckboxMenu(els.accessoryPartsMenu, selected);
  updateRepairFeeDetails(selected);
  if (!els.accessoryPartsMenu.hidden) requestAnimationFrame(positionAccessoryPartsMenu);
}

function clearAccessoryPartsPicker() {
  clearMultiSelect(els.recordForm.elements.accessoryParts);
  clearCustomPartPriceValue();
  els.recordForm.elements.zeroFeeParts.value = "";
  els.accessoryPartsToggle.classList.remove("is-invalid");
  updateAccessoryPartsPicker();
  closeAccessoryPartsPicker();
}

function clearCustomPartPriceValue() {
  els.recordForm.elements.customPartPrice.value = "";
}

function getCustomPartPriceValue() {
  return normalizeMoneyValue(els.recordForm.elements.customPartPrice.value);
}

function openCustomPartPriceDialog() {
  els.customPartPriceInput.value = getCustomPartPriceValue();
  if (!els.customPartPriceDialog.open) els.customPartPriceDialog.showModal();
  setTimeout(() => {
    els.customPartPriceInput.focus();
    els.customPartPriceInput.select();
  }, 0);
}

function closeCustomPartPriceDialog() {
  if (els.customPartPriceDialog.open) els.customPartPriceDialog.close();
}

function saveCustomPartPriceFromDialog() {
  const price = normalizeMoneyValue(els.customPartPriceInput.value);
  if (!price && price !== "0") {
    showToast("请输入塑料件/其他件金额");
    els.customPartPriceInput.focus();
    return false;
  }
  els.recordForm.elements.customPartPrice.value = price;
  updateRepairFeeDetails();
  closeCustomPartPriceDialog();
  return true;
}

function showCustomPartPriceRequired() {
  showToast("请输入塑料件/其他件金额");
  closeAccessoryPartsPicker();
  openCustomPartPriceDialog();
}

function toggleZeroFeePart(part) {
  const selectedParts = getMultiSelectValues(els.recordForm.elements.accessoryParts);
  if (!selectedParts.includes(part)) return;
  if (part === "无费用") {
    showToast("无费用不属于保修");
    return;
  }
  const zeroFeeSet = new Set(normalizeAccessoryParts(els.recordForm.elements.zeroFeeParts.value));
  if (zeroFeeSet.has(part)) {
    zeroFeeSet.delete(part);
  } else {
    zeroFeeSet.add(part);
  }
  els.recordForm.elements.zeroFeeParts.value = [...zeroFeeSet].join(MULTI_VALUE_SEPARATOR);
  updateRepairFeeDetails(selectedParts);
}

function formatRepairFee(value) {
  const amount = Number(value);
  return `¥${amount.toLocaleString("zh-CN", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2
  })}`;
}

function formatPlainAmount(value) {
  const amount = Number(value);
  return amount.toLocaleString("zh-CN", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2
  });
}

function compactAreaName(value = "") {
  return String(value)
    .replace(/\s/g, "")
    .replace(/特别行政区|维吾尔自治区|壮族自治区|回族自治区|自治区|自治州|地区|盟|省|市|县|区/g, "");
}

function provinceKeyFromAreaName(value = "") {
  const text = compactAreaName(value);
  if (!text) return "";
  const provinceKeys = Object.keys(shippingFeesByProvince).sort((a, b) => b.length - a.length);
  const directMatch = provinceKeys.find((province) => text.includes(compactAreaName(province)));
  if (directMatch) return directMatch;

  const chinaAreaData = window.CHINA_AREA_DATA;
  const provinces = chinaAreaData?.["86"] || {};
  for (const [provinceCode, provinceName] of Object.entries(provinces)) {
    const priceKey = provinceKeys.find((province) => compactAreaName(provinceName).includes(compactAreaName(province)));
    if (!priceKey) continue;
    const cities = chinaAreaData?.[provinceCode] || {};
    const cityMatch = Object.values(cities).some((cityName) => {
      const cityKey = compactAreaName(cityName);
      return cityKey && text.includes(cityKey);
    });
    if (cityMatch) return priceKey;
  }
  return "";
}

function getShippingFeeQuote() {
  const form = els.recordForm.elements;
  const province = provinceKeyFromAreaName([form.region.value, form.customerAddress.value].join(" "));
  if (!province) return { hasPrice: false, label: "快递费" };
  return {
    hasPrice: true,
    label: `快递费(${province})`,
    price: shippingFeesByProvince[province]
  };
}

function getAccessoryPartQuote(part) {
  if (part === "无费用") return { hasPrice: true, label: part, price: 0 };
  if (part === "快递费") return getShippingFeeQuote();
  if (part === CUSTOM_PRICE_ACCESSORY_PART) {
    const zeroFeeSet = new Set(normalizeAccessoryParts(els.recordForm.elements.zeroFeeParts.value));
    if (isWarrantyAccessoryPart(part, zeroFeeSet)) return { hasPrice: true, label: part, price: 0 };
    const price = getCustomPartPriceValue();
    return price
      ? { hasPrice: true, label: part, price }
      : { hasPrice: false, label: part, pendingText: "待填写" };
  }
  const model = els.recordForm.elements.model.value;
  const modelPrices = accessoryPartPricesByModel[model] || {};
  if (Object.prototype.hasOwnProperty.call(modelPrices, part)) {
    if (modelPrices[part] == null || modelPrices[part] === "") {
      return { hasPrice: false, label: part };
    }
    return { hasPrice: true, label: part, price: modelPrices[part] };
  }
  return { hasPrice: false, label: part };
}

function getRecordAccessoryPartAmount(record = {}, part = "") {
  const actualAmount = getRecordAccessoryActualAmount(record, part);
  if (actualAmount.shouldUseActualAmount) return actualAmount;

  const price = accessoryPartPricesByModel[record.model]?.[part];
  if (Number.isFinite(Number(price))) {
    return { shouldUseActualAmount: false, hasAmount: true, amount: Number(price) };
  }
  return { shouldUseActualAmount: false, hasAmount: false, amount: 0 };
}

function getRecordRepairFeeText(record = {}) {
  const selectedParts = normalizeAccessoryParts(record.accessoryParts);
  if (selectedParts.length === 0) return "-";

  let total = 0;
  let hasPendingAmount = false;
  selectedParts.forEach((part) => {
    const amount = getRecordAccessoryPartAmount(record, part);
    if (amount.hasAmount) {
      total += amount.amount;
    } else {
      hasPendingAmount = true;
    }
  });

  return hasPendingAmount ? "待定" : `${formatPlainAmount(total)}元`;
}

function updateRepairFeeDetails(selectedParts = getMultiSelectValues(els.recordForm.elements.accessoryParts)) {
  if (!els.repairFeeBox) return;
  if (selectedParts.length === 0) {
    els.repairFeeBox.innerHTML = `<div class="repair-fee-empty">选择配件后自动显示费用明细</div>`;
    return;
  }

  const zeroFeeSet = new Set(normalizeAccessoryParts(els.recordForm.elements.zeroFeeParts.value));
  let total = 0;
  let hasPendingPrice = false;
  const rows = selectedParts.map((part) => {
    const quote = getAccessoryPartQuote(part);
    const isZeroFee = isWarrantyAccessoryPart(part, zeroFeeSet);
    const displayPrice = quote.hasPrice && isZeroFee ? 0 : quote.price;
    if (quote.hasPrice) {
      total += Number(displayPrice) || 0;
    } else {
      hasPendingPrice = true;
    }
    return `
      <button class="repair-fee-row ${isZeroFee ? "is-zero-fee" : ""}" type="button" data-part="${escapeHtml(part)}" title="点击切换保修">
        <span>${escapeHtml(quote.label)}</span>
        <strong>${quote.hasPrice ? formatRepairFee(displayPrice) : quote.pendingText || "待定"}</strong>
      </button>
    `;
  }).join("");
  const totalText = hasPendingPrice ? "待定" : formatRepairFee(total);
  els.repairFeeBox.innerHTML = `
    <div class="repair-fee-lines">
      ${rows}
      <div class="repair-fee-total">
        <span>合计</span>
        <strong>${totalText}</strong>
      </div>
    </div>
  `;
}

function isAccessoryPartsRequired() {
  return true;
}

function updateAccessoryPartsRequirement() {
  const required = isAccessoryPartsRequired();
  els.accessoryPartsLabel.classList.toggle("is-required", required);
  if (!required) els.accessoryPartsToggle.classList.remove("is-invalid");
  updateAccessoryPartsPicker();
}

function showFaultCategoryRequired() {
  showToast("请选择故障分类");
  els.faultCategoryToggle.classList.add("is-invalid");
  els.faultCategoryToggle.scrollIntoView({ block: "center", behavior: "smooth" });
  els.faultCategoryToggle.focus();
  if (els.faultCategoryMenu.hidden) toggleFaultCategoryPicker();
}

function showAccessoryPartsRequired() {
  showToast("请选择本单所用配件");
  els.accessoryPartsToggle.classList.add("is-invalid");
  els.accessoryPartsToggle.scrollIntoView({ block: "center", behavior: "smooth" });
  els.accessoryPartsToggle.focus();
  if (els.accessoryPartsMenu.hidden) toggleAccessoryPartsPicker();
}

function closeCategoryFilterPicker() {
  els.categoryFilterMenu.hidden = true;
  els.categoryFilterToggle.setAttribute("aria-expanded", "false");
}

function closeFaultCategoryPicker() {
  els.faultCategoryMenu.hidden = true;
  els.faultCategoryToggle.setAttribute("aria-expanded", "false");
}

function closeAccessoryPartsPicker() {
  els.accessoryPartsMenu.hidden = true;
  els.accessoryPartsToggle.setAttribute("aria-expanded", "false");
  resetFloatingMenu(els.accessoryPartsMenu);
}

function resetFloatingMenu(menu) {
  menu.classList.remove("is-floating-menu");
  ["top", "left", "width", "maxHeight"].forEach((property) => {
    menu.style[property] = "";
  });
}

function positionAccessoryPartsMenu() {
  if (els.accessoryPartsMenu.hidden) return;
  const anchor = document.querySelector("#accessoryPartsPicker .checkbox-select-actions") || els.accessoryPartsToggle;
  const rect = anchor.getBoundingClientRect();
  const margin = 12;
  const gap = 6;
  const maxMenuHeight = 260;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const width = Math.min(rect.width, viewportWidth - margin * 2);
  const left = Math.min(Math.max(margin, rect.left), viewportWidth - width - margin);
  const spaceBelow = viewportHeight - rect.bottom - gap - margin;
  const spaceAbove = rect.top - gap - margin;
  const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;
  const availableHeight = Math.max(120, Math.min(maxMenuHeight, openUp ? spaceAbove : spaceBelow));
  let top = openUp ? rect.top - availableHeight - gap : rect.bottom + gap;

  if (top + availableHeight > viewportHeight - margin) {
    top = viewportHeight - margin - availableHeight;
  }
  top = Math.max(margin, top);

  els.accessoryPartsMenu.classList.add("is-floating-menu");
  els.accessoryPartsMenu.style.left = `${left}px`;
  els.accessoryPartsMenu.style.top = `${top}px`;
  els.accessoryPartsMenu.style.width = `${width}px`;
  els.accessoryPartsMenu.style.maxHeight = `${availableHeight}px`;
}

function toggleCategoryFilterPicker() {
  const willOpen = els.categoryFilterMenu.hidden;
  els.categoryFilterMenu.hidden = !willOpen;
  els.categoryFilterToggle.setAttribute("aria-expanded", String(willOpen));
  closeFaultCategoryPicker();
  closeAccessoryPartsPicker();
}

function toggleFaultCategoryPicker() {
  const willOpen = els.faultCategoryMenu.hidden;
  els.faultCategoryMenu.hidden = !willOpen;
  els.faultCategoryToggle.setAttribute("aria-expanded", String(willOpen));
  closeCategoryFilterPicker();
  closeAccessoryPartsPicker();
}

function toggleAccessoryPartsPicker() {
  const willOpen = els.accessoryPartsMenu.hidden;
  closeCategoryFilterPicker();
  closeFaultCategoryPicker();
  if (!willOpen) {
    closeAccessoryPartsPicker();
    return;
  }
  els.accessoryPartsMenu.hidden = false;
  els.accessoryPartsToggle.setAttribute("aria-expanded", "true");
  requestAnimationFrame(positionAccessoryPartsMenu);
}

function classifyArea(region) {
  const text = String(region || "").trim();
  return directCities.some((city) => text.includes(city)) ? "直营" : "代理商";
}

function normalizeDateTime(value) {
  if (!value) return "";
  const parsedTime = parseRecordTime(value);
  const date = parsedTime ? new Date(parsedTime) : value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);
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
  return new Set(getSubmissionRepairMatches().keys());
}

function getSubmissionRepairMatches() {
  const submissionsByDevice = new Map();
  customerSubmissions.forEach((submission) => {
    const deviceNumber = String(submission.deviceNumber || "").trim().toLowerCase();
    if (!deviceNumber) return;
    if (!submissionsByDevice.has(deviceNumber)) submissionsByDevice.set(deviceNumber, []);
    submissionsByDevice.get(deviceNumber).push(submission);
  });

  submissionsByDevice.forEach((items) => items.sort(compareItemsOldestFirst));

  const recordCountsByDevice = new Map();
  const matches = new Map();
  records
    .filter((record) => String(record.deviceNumber || "").trim())
    .sort(compareItemsOldestFirst)
    .forEach((record) => {
      const deviceNumber = String(record.deviceNumber || "").trim().toLowerCase();
      const recordCount = recordCountsByDevice.get(deviceNumber) || 0;
      const matchedSubmission = submissionsByDevice.get(deviceNumber)?.[recordCount];
      recordCountsByDevice.set(deviceNumber, recordCount + 1);
      if (matchedSubmission) matches.set(matchedSubmission.id, record);
    });

  return matches;
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

function getInventorySupabaseClient() {
  if (inventorySupabaseClient) return inventorySupabaseClient;
  if (!INVENTORY_SUPABASE_URL || !INVENTORY_SUPABASE_ANON_KEY || !window.supabase?.createClient) return null;
  inventorySupabaseClient = window.supabase.createClient(INVENTORY_SUPABASE_URL, INVENTORY_SUPABASE_ANON_KEY);
  return inventorySupabaseClient;
}

function repairMaterialItems(record) {
  return [...new Set(String(record.accessoryParts || "")
    .split(MULTI_VALUE_SEPARATOR)
    .map((item) => item.trim())
    .filter((item) => item && !["无费用", "快递费"].includes(item)))];
}

function repairMaterialRows(record) {
  if (record.finalStatus !== "邮寄并结束") return [];

  return repairMaterialItems(record).map((item) => ({
    id: `repair-${record.id}-${encodeURIComponent(item)}`,
    action: "维修用料",
    warehouse: "总仓",
    target: "总仓",
    model: record.model || "",
    item,
    quantity: 1,
    company: record.companyName || "",
    printer_number: record.deviceNumber || "",
    merchant_no: normalizeWarrantyStatus(record.warrantyStatus) === "保修" ? "保修" : "",
    receiver: "维修中心",
    message: `维修记录 ${record.id}`,
    time: record.returnTime || "",
    source_record_id: record.id,
    updated_at: record.updatedAt || new Date().toISOString()
  }));
}

async function syncRepairMaterialsToInventory(record) {
  const client = getInventorySupabaseClient();
  if (!client) throw new Error("库存管理云端连接未加载");
  const { data: oldRows, error: oldError } = await client
    .from("repair_material_logs")
    .select("id")
    .eq("source_record_id", record.id);
  if (oldError) throw oldError;

  const rows = repairMaterialRows(record);
  const newIds = new Set(rows.map((row) => row.id));
  const staleIds = (oldRows || []).map((row) => row.id).filter((id) => !newIds.has(id));
  if (staleIds.length) {
    const { error } = await client.from("repair_material_logs").delete().in("id", staleIds);
    if (error) throw error;
  }
  if (!rows.length) return;
  const { error } = await client.from("repair_material_logs").upsert(rows, { onConflict: "id" });
  if (error) throw error;
}

async function deleteRepairMaterialsFromInventory(recordId) {
  const client = getInventorySupabaseClient();
  if (!client) return;
  const { error } = await client.from("repair_material_logs").delete().eq("source_record_id", recordId);
  if (error) throw error;
}

function findAdminByUsername(username) {
  const value = String(username || "").trim().toLowerCase();
  return ADMIN_ACCOUNTS.find((account) => account.username.toLowerCase() === value) || null;
}

function findAdminByEmail(email) {
  const value = String(email || "").trim().toLowerCase();
  return ADMIN_ACCOUNTS.find((account) => account.email.toLowerCase() === value) || null;
}

function setCurrentAdminByEmail(email) {
  currentAdmin = findAdminByEmail(email);
  adminMode = Boolean(currentAdmin);
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
  els.authToggleBtn.title = currentAdmin ? currentAdmin.label : "";
  els.analyticsViewBtn.hidden = !canViewAnalytics();
  refreshAccessoryAnalyticsVisibility();
  if (currentView === "analytics" && !canViewAnalytics()) {
    location.hash = "";
    setView("repair");
  }
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
    accessory_parts: serializeAccessoryPartsForStorage(record.accessoryParts, record.customPartPrice, record.zeroFeeParts, record.warrantyStatus),
    customer_address: record.customerAddress || "",
    model: record.model || "",
    updated_at: record.updatedAt || new Date().toISOString()
  };
}

function fromDatabaseRecord(record) {
  const rawAccessoryParts = record.accessory_parts;
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
    accessoryParts: rawAccessoryParts,
    customerAddress: record.customer_address,
    model: record.model,
    warrantyStatus: record.warranty_status,
    customPartPrice: record.custom_part_price ?? extractCustomPartPriceFromAccessoryParts(rawAccessoryParts),
    zeroFeeParts: record.zero_fee_parts ?? extractZeroFeePartsFromAccessoryParts(rawAccessoryParts),
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
    powerAdapterReturned: item.power_adapter_returned,
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
  setCurrentAdminByEmail(email);
  refreshAccessMode();
  await loadCloudRecords();
  await loadCloudSubmissions();

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    const sessionEmail = session?.user?.email || "";
    setCurrentAdminByEmail(sessionEmail);
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

  records = sortRecordsNewestFirst(data.map(fromDatabaseRecord));
  render();
  updateCustomerEditButton();
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

async function saveCustomerSubmissionReliably(item) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/customer_repair_submissions?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify(toDatabaseSubmission(item))
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(result) || result[0]?.id !== item.id) {
    const error = new Error(result?.message || "客户提交没有得到云端确认");
    error.code = result?.code || String(response.status);
    throw error;
  }
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

function fillAccessoryPartsPicker() {
  const select = els.recordForm.elements.accessoryParts;
  fillMultiSelect(select, optionSets.accessoryParts);
  buildCheckboxMenu(els.accessoryPartsMenu, optionSets.accessoryParts);
  updateAccessoryPartsPicker();
}

function fillStaticOptions() {
  fillSelect(els.statusFilter, optionSets.finalStatus, true);
  fillSelect(els.warrantyFilter, optionSets.warrantyStatus, true);
  fillSelect(els.ownershipFilter, optionSets.faultOwnership, true);
  fillCategoryFilterPicker();
  fillSelect(els.modelFilter, optionSets.model, true);
  fillSelect(els.analysisAccessoryModelFilter, optionSets.model, true);
  els.analysisAccessoryModelFilter.options[0].textContent = "全部型号";
  fillSelect(els.areaFilter, optionSets.area, true);
  fillRequiredSelect(els.submissionForm.elements.model, optionSets.model);
  fillRequiredSelect(els.recordForm.elements.hasPower, optionSets.hasPower);
  fillRequiredSelect(els.recordForm.elements.warrantyStatus, optionSets.warrantyStatus);
  fillSelect(els.recordForm.elements.finalStatus, optionSets.finalStatus);
  fillRequiredSelect(els.recordForm.elements.faultOwnership, optionSets.faultOwnership);
  fillFaultCategoryPicker();
  fillAccessoryPartsPicker();
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

function findAreaCodeByName(items, text) {
  const normalizedText = String(text || "").trim();
  if (!normalizedText) return "";
  const match = Object.entries(items || {}).find(([, name]) => normalizedText.startsWith(name));
  return match?.[0] || "";
}

function fillCustomerAddressFields(address) {
  const form = els.customerForm.elements;
  const text = String(address || "").trim();
  form.addressDetail.value = text;
  if (!areaData || !text) {
    syncAreaButtons();
    return;
  }

  const provinceCode = findAreaCodeByName(areaData["86"], text);
  if (!provinceCode) {
    syncAreaButtons();
    return;
  }
  const provinceName = areaData["86"][provinceCode] || "";
  form.addressProvince.value = provinceCode;
  updateAddressCities();

  let rest = text.slice(provinceName.length);
  const cityCode = findAreaCodeByName(areaData[provinceCode], rest);
  if (!cityCode) {
    form.addressDetail.value = rest || text;
    syncAreaButtons();
    return;
  }
  const cityName = areaData[provinceCode][cityCode] || "";
  form.addressCity.value = cityCode;
  updateAddressDistricts();

  rest = rest.slice(cityName.length);
  const districtCode = findAreaCodeByName(areaData[cityCode], rest);
  if (districtCode) {
    const districtName = areaData[cityCode][districtCode] || "";
    form.addressDistrict.value = districtCode;
    rest = rest.slice(districtName.length);
  }
  form.addressDetail.value = rest || "";
  syncAreaButtons();
}

function setCustomerSubmitting(isSubmitting) {
  isCustomerSubmitting = isSubmitting;
  if (!els.customerSubmitBtn) return;
  els.customerSubmitBtn.disabled = isSubmitting;
  if (isSubmitting) {
    els.customerSubmitBtn.textContent = editingCustomerSubmissionId ? "正在保存" : "正在提交";
    return;
  }
  els.customerSubmitBtn.textContent = editingCustomerSubmissionId ? "保存修改" : "提交登记";
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
  els.customerQrImage.src = "https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=" + encodeURIComponent(url);
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
  setCustomerSubmitting(false);
}

function startNewCustomerSubmission() {
  editingCustomerSubmissionId = "";
  els.customerForm.reset();
  updateAddressCities();
  syncAreaButtons();
  syncSimpleSelectButton("powerAdapterReturned");
  if (currentView === "customer") {
    history.replaceState(null, "", `${location.pathname}?page=customer&entry=form`);
  }
  showCustomerForm();
}

function getCustomerSubmissionRepairRecord(submission) {
  if (!submission) return null;
  return getSubmissionRepairMatches().get(submission.id) || null;
}

function canEditCustomerSubmission(submission) {
  const repairRecord = getCustomerSubmissionRepairRecord(submission);
  return !repairRecord || !LOCKED_CUSTOMER_EDIT_STATUSES.includes(repairRecord.finalStatus);
}

function updateCustomerEditButton() {
  if (!els.editCustomerSubmissionBtn || els.customerRecent.hidden) return;
  els.editCustomerSubmissionBtn.hidden = !canEditCustomerSubmission(getLastCustomerSubmission());
}

async function startEditCustomerSubmission() {
  const lastSubmission = getLastCustomerSubmission();
  if (!lastSubmission) return;
  if (!canEditCustomerSubmission(lastSubmission)) {
    showToast("这条记录已寄出，不能再修改");
    showCustomerPortal();
    return;
  }

  if (!areaData) await loadAreaData();
  const form = els.customerForm.elements;
  editingCustomerSubmissionId = lastSubmission.id;
  form.trackingNumber.value = lastSubmission.trackingNumber || "";
  form.deviceNumber.value = lastSubmission.deviceNumber || "";
  form.companyName.value = lastSubmission.companyName || "";
  form.contactName.value = lastSubmission.contactName || "";
  form.phone.value = lastSubmission.phone || "";
  form.customerIssue.value = cleanCustomerIssueForRecord(lastSubmission);
  form.powerAdapterReturned.value = extractPowerAdapterAnswer(lastSubmission);
  syncSimpleSelectButton("powerAdapterReturned");
  fillCustomerAddressFields(lastSubmission.customerAddress);
  if (currentView === "customer") {
    history.replaceState(null, "", `${location.pathname}?page=customer&entry=edit`);
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

  editingCustomerSubmissionId = "";
  els.customerForm.hidden = true;
  els.customerRecent.hidden = false;
  updateCustomerEditButton();
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

function canViewAnalytics() {
  return cloudMode && adminMode && !forceReadonlyMode;
}

function canViewAccessoryAnalytics() {
  return canViewAnalytics();
}

function refreshAccessoryAnalyticsVisibility() {
  const canView = canViewAccessoryAnalytics();
  showAccessoryAnalytics = canView;
  els.analysisAccessoryToggleBtn.hidden = true;
  els.analysisAccessoryToggleBtn.classList.toggle("is-active", canView);
  els.analysisAccessoryToggleBtn.setAttribute("aria-pressed", canView ? "true" : "false");
  els.analysisAccessoryPanel.hidden = !canView;
  els.analysisAccessoryFeeModeBtn.textContent = accessoryFeeMode === "warranty" ? "保修" : "付费";
  els.analysisAccessoryFeeModeBtn.classList.toggle("is-active", accessoryFeeMode === "warranty");
  els.analysisAccessoryFeeModeBtn.setAttribute("aria-pressed", accessoryFeeMode === "warranty" ? "true" : "false");
}

function setView(view) {
  if (view === "analytics" && !canViewAnalytics()) {
    showToast("请先管理员登录");
    view = "repair";
  }

  document.documentElement.classList.remove("boot-customer");
  currentView = view;
  const isCustomerPortal = view === "customer";
  const isCustomerAdmin = view === "customerAdmin";
  const isAnalytics = view === "analytics";
  document.body.classList.toggle("submissions-view", view === "submissions");
  document.body.classList.toggle("customer-portal", isCustomerPortal);
  els.repairViews.forEach((section) => {
    section.hidden = view !== "repair";
  });
  els.analyticsPage.hidden = !isAnalytics;
  els.customerPage.hidden = !isCustomerPortal && !isCustomerAdmin;
  els.submissionsPage.hidden = view !== "submissions";
  els.customerIntro.hidden = !isCustomerAdmin;

  els.repairViewBtn.classList.toggle("is-active", view === "repair");
  els.analyticsViewBtn.classList.toggle("is-active", isAnalytics);
  els.customerViewBtn.classList.toggle("is-active", isCustomerAdmin);
  els.submissionsViewBtn.classList.toggle("is-active", view === "submissions");
  refreshAccessoryAnalyticsVisibility();

  const adminActionsHidden = view !== "repair";
  els.importExcelBtn.hidden = adminActionsHidden || readonlyMode;
  els.newRecordBtn.hidden = adminActionsHidden || readonlyMode;

  if (view === "submissions") renderSubmissions();
  if (isAnalytics) renderAnalytics();
  if (isCustomerAdmin) {
    updateCustomerQrCode();
    showCustomerForm();
  }
  if (isCustomerPortal) showCustomerPortal();
  updateMetricCards();
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
  if (hash === "analytics") {
    if (canViewAnalytics()) {
      setView("analytics");
      return true;
    }
    if (cloudMode) {
      location.hash = "";
      setView("repair");
      showToast("请先管理员登录");
      return true;
    }
    return false;
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
    warranty: els.warrantyFilter.value,
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
      (!filters.warranty || normalizeWarrantyStatus(record.warrantyStatus) === filters.warranty) &&
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
  const stats = getRepairStats();
  els.totalCount.textContent = stats.total;
  els.testingCount.textContent = stats.repairing;
  els.readyCount.textContent = stats.sendToday;
  els.pendingShipmentCount.textContent = stats.pendingShipment;
  els.finishedCount.textContent = stats.returningFactory;
  els.testStatusCount.textContent = stats.testing;
  els.unrepairedSubmissionCount.textContent = stats.unrepaired;
  els.filteredCount.textContent = `${filteredRecords.length} 条`;
  els.filterSummaryCount.textContent = filteredRecords.length;
}

function getRepairStats() {
  const reviewedSubmissionIds = getReviewedSubmissionIds();
  const unrepairedSubmissions = getUnrepairedSubmissions(reviewedSubmissionIds);
  return {
    total: records.length,
    repairing: records.filter((record) => record.finalStatus === "维修中").length,
    sendToday: records.filter((record) => record.finalStatus === "今天需要寄").length,
    pendingShipment: records.filter((record) => record.finalStatus === "已修未付费").length,
    returningFactory: records.filter((record) => record.finalStatus === "返厂中").length,
    testing: records.filter((record) => record.finalStatus === "测试中").length,
    unrepaired: unrepairedSubmissions.length,
    unrepairedTrackingNumbers: unrepairedSubmissions.map((item) => item.trackingNumber || "未填写快递单号")
  };
}

function getUnrepairedSubmissions(reviewedSubmissionIds = getReviewedSubmissionIds()) {
  return customerSubmissions.filter((item) => !reviewedSubmissionIds.has(item.id));
}

function updateMetricCards() {
  els.metricCards.forEach((card) => {
    const target = card.dataset.metricTarget;
    const isRepairActive =
      currentView === "repair" &&
      target === "repair" &&
      (els.statusFilter.value || "") === (card.dataset.metricStatus || "");
    const isSubmissionActive =
      currentView === "submissions" &&
      target === "submissions" &&
      submissionStatusFilter === (card.dataset.submissionStatus || "");
    const isActive = isRepairActive || isSubmissionActive;
    card.classList.toggle("is-active", isActive);
    card.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function statusClass(status) {
  if (status === "测试中") return "testing";
  if (status === "返厂中") return "factory";
  if (["已修未付费", "今天需要寄"].includes(status)) return "ready";
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

function clampPercent(value) {
  return Math.max(0, Math.min(100, value));
}

function formatPercent(count, total) {
  if (!total) return "0%";
  return `${Math.round((count / total) * 100)}%`;
}

function countBy(items, getter) {
  const counts = new Map();
  items.forEach((item) => {
    const values = getter(item);
    const list = Array.isArray(values) ? values : [values];
    list.forEach((value) => {
      const key = String(value || "未填写").trim() || "未填写";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "zh-CN"));
}

function getAccessoryUsageItems(items = [], model = "", feeMode = "paid") {
  const matchedItems = model ? items.filter((record) => record.model === model) : items;
  const usageMap = new Map();
  matchedItems.forEach((record) => {
    const zeroFeeSet = new Set(normalizeAccessoryParts(record.zeroFeeParts));
    normalizeAccessoryParts(record.accessoryParts).forEach((part) => {
      if (model && part === "无费用") return;
      const isWarrantyPart = isWarrantyAccessoryPart(part, zeroFeeSet);
      if (feeMode === "warranty" && !isWarrantyPart) return;
      if (feeMode !== "warranty" && isWarrantyPart) return;
      const item = usageMap.get(part) || {
        label: part,
        count: 0,
        actualAmountTotal: 0,
        hasActualAmount: false,
        hasPendingAmount: false,
        warrantyAmountTotal: 0,
        hasWarrantyAmount: false,
        hasPendingWarrantyAmount: false
      };
      item.count += 1;

      const actualAmount = getRecordAccessoryActualAmount(record, part);
      if (actualAmount.shouldUseActualAmount) {
        item.hasActualAmount = true;
        if (actualAmount.hasAmount) {
          item.actualAmountTotal += actualAmount.amount;
        } else {
          item.hasPendingAmount = true;
        }
      }

      if (isWarrantyPart) {
        const warrantyAmount = getRecordAccessoryWarrantyAmount(record, part);
        item.hasWarrantyAmount = true;
        if (warrantyAmount.hasAmount) {
          item.warrantyAmountTotal += warrantyAmount.amount;
        } else {
          item.hasPendingWarrantyAmount = true;
        }
      }

      usageMap.set(part, item);
    });
  });
  return [...usageMap.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "zh-CN"));
}

function getRecordShippingFeeAmount(record = {}) {
  const province = provinceKeyFromAreaName([record.region, record.customerAddress].join(" "));
  if (!province) return { hasAmount: false, amount: 0 };
  return { hasAmount: true, amount: Number(shippingFeesByProvince[province]) || 0 };
}

function getRecordAccessoryActualAmount(record = {}, part = "") {
  const zeroFeeSet = new Set(normalizeAccessoryParts(record.zeroFeeParts));
  if (isWarrantyAccessoryPart(part, zeroFeeSet) || part === "无费用") {
    return { shouldUseActualAmount: true, hasAmount: true, amount: 0 };
  }
  if (part === CUSTOM_PRICE_ACCESSORY_PART) {
    const price = normalizeMoneyValue(record.customPartPrice || extractCustomPartPriceFromAccessoryParts(record.accessoryParts));
    return {
      shouldUseActualAmount: true,
      hasAmount: Boolean(price),
      amount: Number(price) || 0
    };
  }
  if (part === "快递费") {
    return {
      shouldUseActualAmount: true,
      ...getRecordShippingFeeAmount(record)
    };
  }
  return { shouldUseActualAmount: false, hasAmount: false, amount: 0 };
}

function getRecordAccessoryWarrantyAmount(record = {}, part = "") {
  if (part === "无费用") return { hasAmount: true, amount: 0 };
  if (part === CUSTOM_PRICE_ACCESSORY_PART) {
    const price = normalizeMoneyValue(record.customPartPrice || extractCustomPartPriceFromAccessoryParts(record.accessoryParts));
    return {
      hasAmount: Boolean(price),
      amount: Number(price) || 0
    };
  }
  if (part === "快递费") return getRecordShippingFeeAmount(record);

  const unitPrice = getAccessoryUnitPrice(part, record.model);
  return {
    hasAmount: unitPrice != null,
    amount: unitPrice || 0
  };
}

function getAccessoryUnitPrice(part, model) {
  const modelPrices = accessoryPartPricesByModel[model] || {};
  const price = modelPrices[part];
  return Number.isFinite(Number(price)) ? Number(price) : null;
}

function shouldShowAggregateAccessoryAmount(label = "") {
  return [CUSTOM_PRICE_ACCESSORY_PART, "快递费"].includes(label);
}

function formatAggregateAccessoryAmount(item, amountKey, pendingKey, total) {
  return `${item.count} 条 共 ${item[pendingKey] ? "待定" : `${formatPlainAmount(item[amountKey])}元`} · ${formatPercent(item.count, total)}`;
}

function withAccessoryPriceText(items = [], model = "", total = 0, feeMode = "paid") {
  if (feeMode === "warranty") {
    return items.map((item) => {
      if (!model) {
        return {
          ...item,
          valueText: shouldShowAggregateAccessoryAmount(item.label)
            ? formatAggregateAccessoryAmount(item, "warrantyAmountTotal", "hasPendingWarrantyAmount", total)
            : `${item.count} 条 · ${formatPercent(item.count, total)}`
        };
      }
      const unitPrice = model ? getAccessoryUnitPrice(item.label, model) : null;
      if (unitPrice != null) {
        return {
          ...item,
          valueText: `${item.count} 条 * ${formatPlainAmount(unitPrice)} = ${formatPlainAmount(item.count * unitPrice)}元 · ${formatPercent(item.count, total)}`
        };
      }
      return {
        ...item,
        valueText: formatAggregateAccessoryAmount(item, "warrantyAmountTotal", "hasPendingWarrantyAmount", total)
      };
    });
  }
  if (!model) {
    return items.map((item) => ({
      ...item,
      valueText: shouldShowAggregateAccessoryAmount(item.label)
        ? formatAggregateAccessoryAmount(item, "actualAmountTotal", "hasPendingAmount", total)
        : `${item.count} 条 · ${formatPercent(item.count, total)}`
    }));
  }
  return items.map((item) => {
    if (item.hasActualAmount) {
      return {
        ...item,
        valueText: formatAggregateAccessoryAmount(item, "actualAmountTotal", "hasPendingAmount", total)
      };
    }
    const unitPrice = getAccessoryUnitPrice(item.label, model);
    if (unitPrice == null) {
      return {
        ...item,
        valueText: `${item.count} 条 · 待定 · ${formatPercent(item.count, total)}`
      };
    }
    return {
      ...item,
      valueText: `${item.count} 条 * ${formatPlainAmount(unitPrice)} = ${formatPlainAmount(item.count * unitPrice)}元 · ${formatPercent(item.count, total)}`
    };
  });
}

function getAccessoryExportItems(items = [], model = "", feeMode = "paid") {
  const matchedItems = model ? items.filter((record) => record.model === model) : items;
  const shouldExportAllFeeTypes = feeMode === "all";
  const exportItems = [];
  matchedItems.forEach((record) => {
    const zeroFeeSet = new Set(normalizeAccessoryParts(record.zeroFeeParts));
    normalizeAccessoryParts(record.accessoryParts).forEach((part) => {
      if (model && part === "无费用") return;
      const isWarrantyPart = isWarrantyAccessoryPart(part, zeroFeeSet);
      if (!shouldExportAllFeeTypes && feeMode === "warranty" && !isWarrantyPart) return;
      if (!shouldExportAllFeeTypes && feeMode !== "warranty" && isWarrantyPart) return;
      const amount = isWarrantyPart
        ? getRecordAccessoryWarrantyAmount(record, part)
        : getRecordAccessoryPartAmount(record, part);
      exportItems.push({ record, part, amount, warrantyType: normalizeWarrantyStatus(record.warrantyStatus) });
    });
  });
  return exportItems;
}

function formatAccessoryExportAmount(amount = {}) {
  return amount.hasAmount ? Number(amount.amount) || 0 : "待定";
}

function buildAccessoryExportRows(items = []) {
  return items.map(({ record, part, amount, warrantyType }) => [
    recordDateKey(record.createdTime),
    record.model || "",
    record.deviceNumber || "",
    part,
    warrantyType || "",
    formatAccessoryExportAmount(amount)
  ]);
}

function renderAnalysisBars(container, items, total, { limit = ANALYSIS_TOP_LIMIT, detailType = "" } = {}) {
  const visibleItems = items.slice(0, limit);
  if (visibleItems.length === 0) {
    container.innerHTML = `<div class="analysis-empty">暂无数据</div>`;
    return;
  }

  const maxCount = Math.max(...visibleItems.map((item) => item.count), 1);
  container.innerHTML = visibleItems
    .map((item) => {
      const width = clampPercent((item.count / maxCount) * 100);
      const minWidth = item.count > 0 ? "4px" : "0";
      const valueText = item.valueText || `${item.count} 条 · ${formatPercent(item.count, total)}`;
      const detailAttrs = detailType
        ? ` data-analysis-detail="${escapeHtml(detailType)}" data-analysis-label="${escapeHtml(item.label)}" tabindex="0" role="button"`
        : "";
      return `
        <div class="analysis-bar-row"${detailAttrs}>
          <div class="analysis-bar-head">
            <span title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</span>
            <strong>${escapeHtml(valueText)}</strong>
          </div>
          <div class="analysis-bar-track">
            <span class="analysis-bar-fill" style="width: ${width}%; min-width: ${minWidth}"></span>
          </div>
        </div>
      `;
    })
    .join("");
}

function getRecentTrend(items = records, days = ANALYSIS_TREND_DAYS) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const trend = [];

  for (let index = 0; index < days; index += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const key = toInputDate(date);
    trend.push({ label: key.slice(5), key, count: 0 });
  }

  const trendByKey = new Map(trend.map((item) => [item.key, item]));
  items.forEach((record) => {
    const key = recordDateKey(record.createdTime);
    if (trendByKey.has(key)) trendByKey.get(key).count += 1;
  });

  return trend.map((item) => ({
    ...item,
    valueText: `${item.count} 条`
  }));
}

function getThisMonthCount() {
  const monthKey = toInputDate(new Date()).slice(0, 7);
  return getAnalysisRecords().filter((record) => recordDateKey(record.createdTime).startsWith(monthKey)).length;
}

function getAnalysisRecords() {
  const from = els.analysisDateFrom?.value || "";
  const to = els.analysisDateTo?.value || "";
  return records.filter((record) => {
    const key = recordDateKey(record.createdTime);
    return (!from || key >= from) && (!to || key <= to);
  });
}

function getThisYearRange() {
  const year = new Date().getFullYear();
  return {
    from: `${year}-01-01`,
    to: `${year}-12-31`
  };
}

function setAnalysisDateToThisYear() {
  const range = getThisYearRange();
  els.analysisDateFrom.value = range.from;
  els.analysisDateTo.value = range.to;
}

function renderAnalytics() {
  if (!canViewAnalytics()) return;
  refreshAccessoryAnalyticsVisibility();

  const analysisRecords = getAnalysisRecords();
  const stats = { total: analysisRecords.length };
  const hardwareCount = analysisRecords.filter((record) => record.faultOwnership === "硬件损坏").length;
  const categoryItems = countBy(analysisRecords, (record) => normalizeFaultCategories(record.faultCategory));
  const regionItems = countBy(analysisRecords, (record) => record.region || "未填写");
  const modelItems = countBy(analysisRecords, (record) => record.model || "未填写");
  const accessoryModelFilter = els.analysisAccessoryModelFilter.value;
  const accessoryItems = showAccessoryAnalytics
    ? getAccessoryUsageItems(analysisRecords, accessoryModelFilter, accessoryFeeMode)
    : [];
  const accessoryTotal = accessoryItems.reduce((sum, item) => sum + item.count, 0);
  const accessoryDisplayItems = withAccessoryPriceText(accessoryItems, accessoryModelFilter, accessoryTotal, accessoryFeeMode);
  const ownershipItems = countBy(analysisRecords, (record) => record.faultOwnership || "未填写");
  const areaItems = countBy(analysisRecords, (record) => record.area || "未填写");
  const trendItems = getRecentTrend(analysisRecords);

  els.analyticsUpdatedAt.textContent = `更新时间：${formatDateTime(toInputDateTime(new Date()))}`;
  els.analysisHardwareRate.textContent = formatPercent(hardwareCount, stats.total);
  els.analysisThisMonth.textContent = getThisMonthCount();
  els.analysisOwnershipTotal.textContent = `${stats.total} 条`;
  els.analysisAreaTotal.textContent = `${stats.total} 条`;

  renderAnalysisBars(els.analysisCategoryBars, categoryItems, stats.total, { detailType: "category-models" });
  renderAnalysisBars(els.analysisRegionBars, regionItems, stats.total, { detailType: "region-models" });
  renderAnalysisBars(els.analysisModelBars, modelItems, stats.total, { detailType: "model-categories" });
  if (showAccessoryAnalytics) {
    renderAnalysisBars(els.analysisAccessoryBars, accessoryDisplayItems, accessoryTotal, { limit: optionSets.accessoryParts.length });
  }
  renderAnalysisBars(els.analysisTrendBars, trendItems, Math.max(...trendItems.map((item) => item.count), 0), {
    limit: ANALYSIS_TREND_DAYS
  });
  renderAnalysisBars(els.analysisOwnershipBars, ownershipItems, stats.total, {
    limit: optionSets.faultOwnership.length,
    detailType: "ownership-models"
  });
  renderAnalysisBars(els.analysisAreaBars, areaItems, stats.total, {
    limit: optionSets.area.length,
    detailType: "area-models"
  });
}

function getCategoryModelDistribution(category) {
  const matchedRecords = getAnalysisRecords().filter((record) => normalizeFaultCategories(record.faultCategory).includes(category));
  return {
    total: matchedRecords.length,
    items: countBy(matchedRecords, (record) => record.model || "未填写")
  };
}

function getRegionModelDistribution(region) {
  const matchedRecords = getAnalysisRecords().filter((record) => (record.region || "未填写") === region);
  return {
    total: matchedRecords.length,
    items: countBy(matchedRecords, (record) => record.model || "未填写")
  };
}

function getModelCategoryDistribution(model) {
  const matchedRecords = getAnalysisRecords().filter((record) => (record.model || "未填写") === model);
  return {
    total: matchedRecords.length,
    items: countBy(matchedRecords, (record) => normalizeFaultCategories(record.faultCategory))
  };
}

function getOwnershipRecords(ownership) {
  return getAnalysisRecords().filter((record) => (record.faultOwnership || "未填写") === ownership);
}

function getOwnershipModelDistribution(ownership) {
  const matchedRecords = getOwnershipRecords(ownership);
  return {
    total: matchedRecords.length,
    items: countBy(matchedRecords, (record) => record.model || "未填写")
  };
}

function getOwnershipCategoryDistribution(ownership) {
  const matchedRecords = getOwnershipRecords(ownership);
  return {
    total: matchedRecords.length,
    items: countBy(matchedRecords, (record) => normalizeFaultCategories(record.faultCategory))
  };
}

function getAreaRegionDistribution(area) {
  const matchedRecords = getAnalysisRecords().filter((record) => (record.area || "未填写") === area);
  return {
    total: matchedRecords.length,
    items: countBy(matchedRecords, (record) => record.region || "未填写")
  };
}

function showAnalysisPopover(anchor, title, items, total, { emptyText = "暂无数据", toggle = null, rowDetail = null } = {}) {
  const rows = items.length > 0
    ? items
        .slice(0, ANALYSIS_TOP_LIMIT)
        .map((item) => {
          const childAttrs = rowDetail
            ? ` data-analysis-child-detail="regions" data-analysis-parent-detail="${escapeHtml(rowDetail.parentDetail)}" data-analysis-parent-label="${escapeHtml(rowDetail.parentLabel)}" data-analysis-parent-mode="${escapeHtml(rowDetail.parentMode || "")}" data-analysis-row-label="${escapeHtml(item.label)}" tabindex="0" role="button"`
            : "";
          return `
            <div class="analysis-popover-row"${childAttrs}>
              <span>${escapeHtml(item.label)}</span>
              <strong>${item.count} 条 · ${formatPercent(item.count, total)}</strong>
            </div>
          `;
        })
        .join("")
    : `<div class="analysis-popover-empty">${escapeHtml(emptyText)}</div>`;
  const toggleButton = toggle
    ? `<button class="analysis-popover-toggle" type="button" data-action="toggle-analysis-popover" title="${escapeHtml(toggle.title)}" aria-label="${escapeHtml(toggle.title)}">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h14" />
          <path d="M14 3l4 4-4 4" />
          <path d="M20 17H6" />
          <path d="M10 13l-4 4 4 4" />
        </svg>
      </button>`
    : "";

  els.analysisPopover.innerHTML = `
    <div class="analysis-popover-head">
      <div class="analysis-popover-title">${escapeHtml(title)}</div>
      ${toggleButton}
    </div>
    ${rows}
  `;
  els.analysisPopover.hidden = false;
  hideAnalysisChildPopover();

  const rect = anchor.getBoundingClientRect();
  const popoverRect = els.analysisPopover.getBoundingClientRect();
  const margin = 12;
  const left = Math.min(rect.left, window.innerWidth - popoverRect.width - margin);
  const top = rect.bottom + margin > window.innerHeight - popoverRect.height
    ? rect.top - popoverRect.height - margin
    : rect.bottom + margin;

  els.analysisPopover.style.left = `${Math.max(margin, left)}px`;
  els.analysisPopover.style.top = `${Math.max(margin, top)}px`;
}

function hideAnalysisPopover() {
  els.analysisPopover.hidden = true;
  hideAnalysisChildPopover();
  clearAnalysisSelection(els.analyticsPage);
  analysisPopoverState = null;
}

function hideAnalysisChildPopover() {
  els.analysisChildPopover.hidden = true;
  hideAnalysisGrandchildPopover();
  clearAnalysisSelection(els.analysisPopover);
}

function hideAnalysisGrandchildPopover() {
  els.analysisGrandchildPopover.hidden = true;
  clearAnalysisSelection(els.analysisChildPopover);
}

function clearAnalysisSelection(scope) {
  scope.querySelectorAll(".is-analysis-selected").forEach((item) => {
    item.classList.remove("is-analysis-selected");
  });
}

function selectAnalysisRow(row, scope) {
  clearAnalysisSelection(scope);
  row.classList.add("is-analysis-selected");
}

function getAnalysisParentRecords(parentDetail, parentLabel) {
  if (parentDetail === "category-models") {
    return getAnalysisRecords().filter((record) => normalizeFaultCategories(record.faultCategory).includes(parentLabel));
  }
  if (parentDetail === "region-models") {
    return getAnalysisRecords().filter((record) => (record.region || "未填写") === parentLabel);
  }
  if (parentDetail === "model-categories") {
    return getAnalysisRecords().filter((record) => (record.model || "未填写") === parentLabel);
  }
  if (parentDetail === "ownership-models") {
    return getOwnershipRecords(parentLabel);
  }
  if (parentDetail === "area-models") {
    return getAnalysisRecords().filter((record) => (record.area || "未填写") === parentLabel);
  }
  return [];
}

function getAnalysisChildRecords(row) {
  const parentDetail = row.dataset.analysisParentDetail || "";
  const parentLabel = row.dataset.analysisParentLabel || "";
  const parentMode = row.dataset.analysisParentMode || "";
  const rowLabel = row.dataset.analysisRowLabel || "";
  const parentRecords = getAnalysisParentRecords(parentDetail, parentLabel);

  if (parentDetail === "area-models") {
    return parentRecords.filter((record) => (record.region || "未填写") === rowLabel);
  }
  if (parentDetail === "model-categories" || parentMode === "categories") {
    return parentRecords.filter((record) => normalizeFaultCategories(record.faultCategory).includes(rowLabel));
  }
  return parentRecords.filter((record) => (record.model || "未填写") === rowLabel);
}

function placeAnalysisSidePopover(popover, anchor, { preferLeft = false } = {}) {
  const rect = anchor.getBoundingClientRect();
  const popoverRect = popover.getBoundingClientRect();
  const margin = 10;
  const leftSide = rect.left - popoverRect.width - margin;
  const rightSide = rect.right + margin;
  let left = preferLeft ? leftSide : rightSide;

  if (left < margin) left = rightSide;
  if (left + popoverRect.width > window.innerWidth - margin) left = leftSide;

  const top = Math.min(rect.top, window.innerHeight - popoverRect.height - margin);
  popover.style.left = `${Math.max(margin, left)}px`;
  popover.style.top = `${Math.max(margin, top)}px`;
}

function showAnalysisChildPopover(anchor, title, items, total, { emptyText = "暂无数据", rowDetail = null } = {}) {
  const rows = items.length > 0
    ? items
        .slice(0, ANALYSIS_TOP_LIMIT)
        .map((item) => {
          const grandchildAttrs = rowDetail
            ? ` data-analysis-grandchild-detail="regions" data-analysis-parent-detail="${escapeHtml(rowDetail.parentDetail)}" data-analysis-parent-label="${escapeHtml(rowDetail.parentLabel)}" data-analysis-parent-mode="${escapeHtml(rowDetail.parentMode || "")}" data-analysis-child-label="${escapeHtml(rowDetail.childLabel)}" data-analysis-row-label="${escapeHtml(item.label)}" tabindex="0" role="button"`
            : "";
          return `
            <div class="analysis-popover-row"${grandchildAttrs}>
              <span>${escapeHtml(item.label)}</span>
              <strong>${item.count} 条 · ${formatPercent(item.count, total)}</strong>
            </div>
          `;
        })
        .join("")
    : `<div class="analysis-popover-empty">${escapeHtml(emptyText)}</div>`;

  els.analysisChildPopover.innerHTML = `
    <div class="analysis-popover-head">
      <div class="analysis-popover-title">${escapeHtml(title)}</div>
    </div>
    ${rows}
  `;
  els.analysisChildPopover.hidden = false;
  hideAnalysisGrandchildPopover();
  placeAnalysisSidePopover(els.analysisChildPopover, anchor, { preferLeft: true });
}

function getAnalysisGrandchildRecords(row) {
  const parentDetail = row.dataset.analysisParentDetail || "";
  const parentLabel = row.dataset.analysisParentLabel || "";
  const parentMode = row.dataset.analysisParentMode || "";
  const childLabel = row.dataset.analysisChildLabel || "";
  const rowLabel = row.dataset.analysisRowLabel || "";
  const parentRecords = getAnalysisParentRecords(parentDetail, parentLabel);

  if (parentDetail === "ownership-models" && parentMode === "categories") {
    return parentRecords
      .filter((record) => normalizeFaultCategories(record.faultCategory).includes(childLabel))
      .filter((record) => (record.model || "未填写") === rowLabel);
  }
  if (parentDetail === "ownership-models" && parentMode === "models") {
    return parentRecords
      .filter((record) => (record.model || "未填写") === childLabel)
      .filter((record) => normalizeFaultCategories(record.faultCategory).includes(rowLabel));
  }
  if (parentDetail === "area-models") {
    return parentRecords
      .filter((record) => (record.region || "未填写") === childLabel)
      .filter((record) => (record.model || "未填写") === rowLabel);
  }
  return [];
}

function showAnalysisGrandchildPopover(
  anchor,
  title,
  items,
  total,
  { emptyText = "暂无地区数据", preferLeft = true } = {}
) {
  const rows = items.length > 0
    ? items
        .slice(0, ANALYSIS_TOP_LIMIT)
        .map(
          (item) => `
            <div class="analysis-popover-row">
              <span>${escapeHtml(item.label)}</span>
              <strong>${item.count} 条 · ${formatPercent(item.count, total)}</strong>
            </div>
          `
        )
        .join("")
    : `<div class="analysis-popover-empty">${escapeHtml(emptyText)}</div>`;

  els.analysisGrandchildPopover.innerHTML = `
    <div class="analysis-popover-head">
      <div class="analysis-popover-title">${escapeHtml(title)}</div>
    </div>
    ${rows}
  `;
  els.analysisGrandchildPopover.hidden = false;
  placeAnalysisSidePopover(els.analysisGrandchildPopover, anchor, { preferLeft });
}

function openAnalysisGrandchildDetail(row) {
  const rowLabel = row.dataset.analysisRowLabel || "";
  if (!rowLabel) return;

  selectAnalysisRow(row, els.analysisChildPopover);
  const matchedRecords = getAnalysisGrandchildRecords(row);
  if ((row.dataset.analysisParentDetail || "") === "area-models") {
    const categoryItems = countBy(matchedRecords, (record) => normalizeFaultCategories(record.faultCategory));
    showAnalysisGrandchildPopover(row, `${rowLabel} - 故障类型分布`, categoryItems, matchedRecords.length, {
      emptyText: "暂无故障类型数据",
      preferLeft: false
    });
    return;
  }

  const regionItems = countBy(matchedRecords, (record) => record.region || "未填写");
  showAnalysisGrandchildPopover(row, `${rowLabel} - 地区分布`, regionItems, matchedRecords.length);
}

function openAnalysisChildDetail(row) {
  const parentDetail = row.dataset.analysisParentDetail || "";
  const parentMode = row.dataset.analysisParentMode || "";
  const rowLabel = row.dataset.analysisRowLabel || "";
  if (!rowLabel) return;

  selectAnalysisRow(row, els.analysisPopover);
  const matchedRecords = getAnalysisChildRecords(row);
  if (parentDetail === "region-models") {
    const categoryItems = countBy(matchedRecords, (record) => normalizeFaultCategories(record.faultCategory));
    showAnalysisChildPopover(row, `${rowLabel} - 故障分类`, categoryItems, matchedRecords.length);
    return;
  }

  if (parentDetail === "ownership-models" && parentMode === "categories") {
    const modelItems = countBy(matchedRecords, (record) => record.model || "未填写");
    showAnalysisChildPopover(row, `${rowLabel} - 型号分布`, modelItems, matchedRecords.length, {
      emptyText: "暂无型号数据",
      rowDetail: {
        parentDetail,
        parentLabel: row.dataset.analysisParentLabel || "",
        parentMode,
        childLabel: rowLabel
      }
    });
    return;
  }

  if (parentDetail === "ownership-models") {
    const categoryItems = countBy(matchedRecords, (record) => normalizeFaultCategories(record.faultCategory));
    showAnalysisChildPopover(row, `${rowLabel} - 故障分布`, categoryItems, matchedRecords.length, {
      emptyText: "暂无故障数据",
      rowDetail: {
        parentDetail,
        parentLabel: row.dataset.analysisParentLabel || "",
        parentMode,
        childLabel: rowLabel
      }
    });
    return;
  }

  if (parentDetail === "area-models") {
    const modelItems = countBy(matchedRecords, (record) => record.model || "未填写");
    showAnalysisChildPopover(row, `${rowLabel} - 型号分布`, modelItems, matchedRecords.length, {
      emptyText: "暂无型号数据",
      rowDetail: {
        parentDetail,
        parentLabel: row.dataset.analysisParentLabel || "",
        parentMode,
        childLabel: rowLabel
      }
    });
    return;
  }

  const regionItems = countBy(matchedRecords, (record) => record.region || "未填写");
  showAnalysisChildPopover(row, `${rowLabel} - 地区分布`, regionItems, matchedRecords.length);
}

function showOwnershipDetail(row, mode = "models") {
  const label = row.dataset.analysisLabel || "";
  if (!label) return;

  const showingModels = mode !== "categories";
  const distribution = showingModels
    ? getOwnershipModelDistribution(label)
    : getOwnershipCategoryDistribution(label);
  analysisPopoverState = {
    anchor: row,
    detailType: "ownership-models",
    label,
    mode: showingModels ? "models" : "categories"
  };
  showAnalysisPopover(
    row,
    `${label} - ${showingModels ? "型号分布" : "故障分类"}`,
    distribution.items,
    distribution.total,
    {
      emptyText: showingModels ? "暂无型号数据" : "暂无故障分类数据",
      rowDetail: {
        parentDetail: "ownership-models",
        parentLabel: label,
        parentMode: showingModels ? "models" : "categories"
      },
      toggle: {
        title: showingModels ? "切换成故障分布" : "切换成型号分布"
      }
    }
  );
}

function toggleAnalysisPopoverMode() {
  if (!analysisPopoverState || analysisPopoverState.detailType !== "ownership-models") return;
  const nextMode = analysisPopoverState.mode === "models" ? "categories" : "models";
  showOwnershipDetail(analysisPopoverState.anchor, nextMode);
}

function openAnalysisDetail(row) {
  const detailType = row.dataset.analysisDetail;
  const label = row.dataset.analysisLabel || "";
  if (!label) return;

  selectAnalysisRow(row, els.analyticsPage);
  if (detailType === "category-models") {
    const distribution = getCategoryModelDistribution(label);
    analysisPopoverState = null;
    showAnalysisPopover(row, `${label} - 型号分布`, distribution.items, distribution.total, {
      emptyText: "暂无型号数据",
      rowDetail: {
        parentDetail: detailType,
        parentLabel: label
      }
    });
  }

  if (detailType === "region-models") {
    const distribution = getRegionModelDistribution(label);
    analysisPopoverState = null;
    showAnalysisPopover(row, `${label} - 打印机分布`, distribution.items, distribution.total, {
      emptyText: "暂无型号数据",
      rowDetail: {
        parentDetail: detailType,
        parentLabel: label
      }
    });
  }

  if (detailType === "model-categories") {
    const distribution = getModelCategoryDistribution(label);
    analysisPopoverState = null;
    showAnalysisPopover(row, `${label} - 故障分类`, distribution.items, distribution.total, {
      emptyText: "暂无故障分类数据",
      rowDetail: {
        parentDetail: detailType,
        parentLabel: label
      }
    });
  }

  if (detailType === "ownership-models") {
    showOwnershipDetail(row);
  }

  if (detailType === "area-models") {
    const distribution = getAreaRegionDistribution(label);
    analysisPopoverState = null;
    showAnalysisPopover(row, `${label} - 区域分布`, distribution.items, distribution.total, {
      emptyText: "暂无区域数据",
      rowDetail: {
        parentDetail: detailType,
        parentLabel: label
      }
    });
  }
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

function warrantyClass(warrantyStatus) {
  return normalizeWarrantyStatus(warrantyStatus) === "保修" ? "done" : "hardware";
}

function formatDateTime(value) {
  if (!value) return "";
  return String(value).replace("T", " ");
}

function formatMonthDay(value) {
  if (!value) return "";
  const parsedTime = parseRecordTime(value);
  if (parsedTime) {
    const date = new Date(parsedTime);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
  const text = String(value).trim();
  const match = text.match(/(?:^|\D)(\d{1,2})[月/-](\d{1,2})日?/);
  if (match) return `${Number(match[1])}月${Number(match[2])}日`;
  return "";
}

function renderReturnTrackingCell(record) {
  const tracking = compact(record.returnTrackingNumber);
  const returnTime = formatMonthDay(record.returnTime);
  if (!returnTime) return `<span class="plain-cell">${tracking}</span>`;
  return `
    <span class="plain-cell return-info-cell">
      <span>${tracking}</span>
      <span class="cell-sub">${escapeHtml(returnTime)}</span>
    </span>
  `;
}

function renderWarrantyFeeCell(record) {
  const warrantyStatus = normalizeWarrantyStatus(record.warrantyStatus);
  return `
    <span class="tag ${warrantyClass(warrantyStatus)}">${compact(warrantyStatus)}</span>
    <span class="warranty-fee-amount">${compact(getRecordRepairFeeText(record))}</span>
  `;
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
          <td class="tracking-col"><span class="plain-cell tracking-cell">${compact(record.trackingNumber)}</span></td>
          <td>
            <span class="cell-main">${compact(record.region)}</span>
            <span class="cell-sub"><span class="tag ${areaClass(record.area)}">${compact(record.area)}</span></span>
          </td>
          <td>
            <span class="cell-main">${compact(record.deviceNumber)}</span>
            <span class="cell-sub">${compact(record.model)}</span>
          </td>
          <td><span class="tag ${powerClass(record.hasPower)}">${compact(record.hasPower)}</span></td>
          <td class="company-col"><span class="plain-cell company-cell">${compact(record.companyName)}</span></td>
          <td class="text-cell">${compact(record.customerIssue)}</td>
          <td class="text-cell">${compact(record.repairProcess)}</td>
          <td class="warranty-fee-col">${renderWarrantyFeeCell(record)}</td>
          <td>${renderReturnTrackingCell(record)}</td>
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
  if (currentView === "analytics") renderAnalytics();
  updateMetricCards();
  if (currentView === "customer") updateCustomerQrCode();
}

async function pushRepairStatsToWecom() {
  if (!cloudMode || !supabaseClient) {
    showToast("请先使用云端模式");
    return;
  }

  if (!adminMode) {
    showToast("请先管理员登录");
    return;
  }

  els.pushWecomBtn.disabled = true;
  els.pushWecomBtn.textContent = "推送中";

  try {
    const { data } = await supabaseClient.auth.getSession();
    const accessToken = data.session?.access_token || "";
    const response = await fetch(WECOM_PUSH_FUNCTION_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({})
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok === false) {
      throw new Error(result.error || "企业微信推送失败");
    }
    showToast("已推送到企业微信");
  } catch (error) {
    console.error(error);
    showToast("企微推送失败，请检查配置");
  } finally {
    els.pushWecomBtn.disabled = false;
    els.pushWecomBtn.textContent = "推送企微";
  }
}

function renderSubmissions() {
  const reviewedSubmissionIds = getReviewedSubmissionIds();
  const statusFilteredSubmissions =
    submissionStatusFilter === "unreviewed"
      ? customerSubmissions.filter((item) => !reviewedSubmissionIds.has(item.id))
      : customerSubmissions;
  const query = String(els.submissionSearchInput.value || "").trim().toLowerCase();
  const visibleSubmissions = query
    ? statusFilteredSubmissions.filter((item) => getSubmissionSearchText(item).includes(query))
    : statusFilteredSubmissions;
  const emptyTitle = els.submissionsEmptyState.querySelector("strong");
  const emptyText = els.submissionsEmptyState.querySelector("span");
  els.submissionCount.textContent = `${visibleSubmissions.length} 条`;
  if (query) {
    emptyTitle.textContent = "没有搜到客户提交";
    emptyText.textContent = "换个关键词再试试，比如编号、快递单号、电话或地址。";
  } else if (submissionStatusFilter === "unreviewed") {
    emptyTitle.textContent = "暂无未维修客户提交";
    emptyText.textContent = "当前客户提交都已经生成维修记录。";
  } else {
    emptyTitle.textContent = "暂无客户提交";
    emptyText.textContent = "把“扫码登记”里的二维码发给客户，客户填完就会出现在这里。";
  }
  els.submissionsBody.innerHTML = visibleSubmissions
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
          <td class="text-cell">${compact(cleanCustomerIssueForRecord(item))}</td>
          <td class="contact-detail-cell">
            <span class="contact-line">
              <span>${compact(item.contactName)}</span>
              <span>${compact(item.phone)}</span>
            </span>
            <span class="cell-sub">${compact(item.customerAddress)}</span>
          </td>
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
  els.submissionsEmptyState.hidden = visibleSubmissions.length > 0;
}

function getSubmissionSearchText(item = {}) {
  return [
    formatDateTime(item.createdTime),
    item.trackingNumber,
    item.deviceNumber,
    item.model,
    extractPowerAdapterAnswer(item),
    item.companyName,
    cleanCustomerIssueForRecord(item),
    item.contactName,
    item.phone,
    item.customerAddress
  ]
    .join(" ")
    .toLowerCase();
}

function resetForm() {
  els.recordForm.reset();
  els.recordId.value = "";
  els.dialogTitle.textContent = "新增记录";
  els.deleteRecordBtn.hidden = true;
  els.recordForm.elements.createdTime.value = toInputDateTime(new Date());
  els.recordForm.elements.hasPower.value = "";
  els.recordForm.elements.warrantyStatus.value = "不保修";
  els.recordForm.elements.finalStatus.value = "维修中";
  els.recordForm.elements.faultOwnership.value = "";
  clearMultiSelect(els.recordForm.elements.faultCategory);
  clearMultiSelect(els.recordForm.elements.accessoryParts);
  clearCustomPartPriceValue();
  els.recordForm.elements.zeroFeeParts.value = "";
  updateFaultCategoryPicker();
  updateAccessoryPartsPicker();
  els.faultCategoryToggle.classList.remove("is-invalid");
  els.accessoryPartsToggle.classList.remove("is-invalid");
  closeFaultCategoryPicker();
  closeAccessoryPartsPicker();
  els.recordForm.elements.model.value = "";
  lockAutoField(els.recordForm.elements.companyName);
  lockAutoField(els.recordForm.elements.customerIssue);
  els.recordForm.elements.customerPowerAdapter.value = "";
  updateAccessoryPartsRequirement();
  hideMatchBox();
  updateDeviceHistoryButton();
}

function openNewDialog() {
  if (readonlyMode) return;
  resetForm();
  openRecordDialogAndTrackChanges();
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

function cleanExpressText(value = "") {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/[，,；;]+/g, " ")
    .trim();
}

function getExpressRecipientInfo(record = {}) {
  const parsedFromAddress = parseRecipientFromAddress(record.customerAddress);
  return parsedFromAddress;
}

function normalizeMobileNumber(value = "") {
  const match = String(value || "").match(EXPRESS_MOBILE_RE);
  return match?.[0] || "";
}

function parseRecipientFromAddress(value = "") {
  const original = cleanExpressText(value);
  if (!original) return { name: "", mobile: "", address: "" };

  const mobileMatch = original.match(EXPRESS_MOBILE_RE);
  const mobile = mobileMatch?.[0] || "";
  if (!mobileMatch) return parseAddressAndNameBeforePhone(original, "");

  const beforePhone = cleanExpressText(original.slice(0, mobileMatch.index));
  return parseAddressAndNameBeforePhone(beforePhone, mobile);
}

function parseAddressAndNameBeforePhone(text = "", mobile = "") {
  const parts = cleanExpressText(text).split(/\s+/).filter(Boolean);
  const name = parts.length >= 2 ? parts[parts.length - 1] : "";
  const address = parts.length >= 2 ? parts.slice(0, -1).join(" ") : cleanExpressText(text);
  return {
    name: isExpressRecipientName(name) ? name : "",
    mobile,
    address: isLikelyExpressAddress(address) ? address : ""
  };
}

function isLikelyExpressAddress(value = "") {
  const text = cleanExpressText(value);
  if (!text) return false;
  const chineseLength = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  if (chineseLength < 6) return false;
  return /省|市|区|县|镇|乡|街|道|路|巷|村|号|栋|幢|单元|室|楼|层|档|口|座|店|城|市场|园|广场|中心|大厦/.test(text);
}

function isExpressRecipientName(value = "") {
  const text = String(value || "");
  if (text.length < 1 || text.length > 20) return false;
  return /^[\u4e00-\u9fa5A-Za-z][\u4e00-\u9fa5A-Za-z·.\-]*$/.test(text);
}

function extractPowerAdapterAnswerFromText(text) {
  const match = String(text || "").match(/电源适配器是否寄回[:：]\s*([^\n\r]+)/);
  return normalizePowerAdapterAnswer(match?.[1] || "");
}

function extractPowerAdapterAnswer(submission) {
  return normalizePowerAdapterAnswer(submission?.powerAdapterReturned || extractPowerAdapterAnswerFromText(submission?.customerIssue));
}

function cleanCustomerIssueForRecord(submission) {
  return String(submission?.customerIssue || "")
    .replace(/^\s*电源适配器是否寄回[:：]\s*[^\n\r]*\s*\n?/m, "")
    .replace(/^\s*故障描述[:：]\s*/m, "")
    .trim();
}

function applySubmissionToRecordForm(submission, { keepDeviceNumber = true } = {}) {
  if (!submission) return;
  if (appliedSubmissionId === submission.id) return;
  const form = els.recordForm.elements;
  if (appliedSubmissionSnapshot && appliedSubmissionId && appliedSubmissionId !== submission.id) {
    form.trackingNumber.value = appliedSubmissionSnapshot.trackingNumber;
    form.companyName.value = appliedSubmissionSnapshot.companyName;
    form.customerPowerAdapter.value = appliedSubmissionSnapshot.customerPowerAdapter;
    form.customerIssue.value = appliedSubmissionSnapshot.customerIssue;
    form.customerAddress.value = appliedSubmissionSnapshot.customerAddress;
    appliedSubmissionSnapshot = null;
    appliedSubmissionId = "";
  }
  if (!appliedSubmissionSnapshot) {
    appliedSubmissionSnapshot = {
      trackingNumber: form.trackingNumber.value,
      companyName: form.companyName.value,
      customerPowerAdapter: form.customerPowerAdapter.value,
      customerIssue: form.customerIssue.value,
      customerAddress: form.customerAddress.value
    };
  }
  if (!keepDeviceNumber) form.deviceNumber.value = submission.deviceNumber;
  autoFillRecordModel();
  form.trackingNumber.value = submission.trackingNumber || form.trackingNumber.value;
  form.customerPowerAdapter.value = extractPowerAdapterAnswer(submission);
  form.companyName.value = submission.companyName || form.companyName.value;
  form.customerIssue.value = cleanCustomerIssueForRecord(submission) || form.customerIssue.value;
  form.customerAddress.value = buildAddressWithContact(submission) || form.customerAddress.value;
  updateRepairFeeDetails();
  appliedSubmissionId = submission.id;
  showToast("已带入客户提交的信息");
}

function undoSubmissionToRecordForm() {
  if (!appliedSubmissionSnapshot) {
    hideMatchBox();
    return;
  }

  const form = els.recordForm.elements;
  form.trackingNumber.value = appliedSubmissionSnapshot.trackingNumber;
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

function getDeviceHistoryRecords(deviceNumber = "") {
  const key = String(deviceNumber || "").trim();
  if (!key) return [];
  const editingId = els.recordId.value || "";
  return sortRecordsNewestFirst(
    records.filter((record) => String(record.deviceNumber || "").trim() === key && record.id !== editingId)
  );
}

function updateDeviceHistoryButton() {
  const matches = getDeviceHistoryRecords(els.recordForm.elements.deviceNumber.value);
  els.deviceHistoryBtn.hidden = matches.length === 0;
  els.deviceHistoryBtn.textContent = matches.length > 0 ? `历史(${matches.length})` : "历史";
}

function openDeviceHistoryDialog() {
  const deviceNumber = els.recordForm.elements.deviceNumber.value;
  const matches = getDeviceHistoryRecords(deviceNumber);
  if (matches.length === 0) {
    updateDeviceHistoryButton();
    showToast("没有找到之前的维修记录");
    return;
  }

  els.deviceHistoryList.innerHTML = matches
    .map((record) => `
      <article class="device-history-card">
        <div class="device-history-card-head">
          <strong>${compact(formatDateTime(record.createdTime))}</strong>
          <span>${compact(record.deviceNumber)}</span>
        </div>
        <dl>
          <div>
            <dt>公司名</dt>
            <dd>${compact(record.companyName)}</dd>
          </div>
          <div>
            <dt>客户描述问题</dt>
            <dd>${compact(record.customerIssue)}</dd>
          </div>
          <div>
            <dt>维修过程</dt>
            <dd>${compact(record.repairProcess)}</dd>
          </div>
        </dl>
      </article>
    `)
    .join("");
  els.deviceHistoryDialog.showModal();
}

function checkDeviceNumberMatch() {
  autoFillRecordModel();
  const submission = findSubmissionByDeviceNumber(els.recordForm.elements.deviceNumber.value);
  if (submission?.id !== ignoredSubmissionId) ignoredSubmissionId = "";
  showMatchedSubmission(submission);
  updateDeviceHistoryButton();
}

function updateReturnTimeFromStatus() {
  const form = els.recordForm.elements;
  if (!["今天需要寄", "邮寄并结束"].includes(form.finalStatus.value)) return;
  if (form.returnTime.value) return;
  form.returnTime.value = toInputDate(new Date());
}

function autoFillRecordModel() {
  const form = els.recordForm.elements;
  const model = inferModelFromDeviceNumber(form.deviceNumber.value);
  if (model) form.model.value = model;
  updateAccessoryPartsPicker();
  updateRepairFeeDetails();
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
  openRecordDialogAndTrackChanges();
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

function findSubmissionForRecord(record) {
  if (!record?.deviceNumber) return null;
  const matchedEntries = [...getSubmissionRepairMatches().entries()];
  const matchedEntry = matchedEntries.find(([, matchedRecord]) => matchedRecord.id === record.id);
  if (matchedEntry) {
    return customerSubmissions.find((item) => item.id === matchedEntry[0]) || null;
  }
  return findSubmissionByDeviceNumber(record.deviceNumber);
}

function fillForm(record) {
  els.recordId.value = record.id;
  els.dialogTitle.textContent = "编辑记录";
  els.deleteRecordBtn.hidden = false;
  els.recordForm.elements.model.value = record.model || "";

  exportFields.forEach(([key]) => {
    if (els.recordForm.elements[key]) {
      if (key === "model") return;
      if (key === "faultCategory") {
        setMultiSelectValues(els.recordForm.elements.faultCategory, record[key], optionSets.faultCategory);
        updateFaultCategoryPicker();
        els.faultCategoryToggle.classList.remove("is-invalid");
        closeFaultCategoryPicker();
        return;
      }
      if (key === "accessoryParts") {
        setMultiSelectValues(els.recordForm.elements.accessoryParts, record[key], optionSets.accessoryParts);
        updateAccessoryPartsPicker();
        els.accessoryPartsToggle.classList.remove("is-invalid");
        closeAccessoryPartsPicker();
        return;
      }
      els.recordForm.elements[key].value = record[key] || "";
    }
  });
  updateAccessoryPartsPicker();
  lockAutoField(els.recordForm.elements.companyName);
  lockAutoField(els.recordForm.elements.customerIssue);
  const matchedSubmission = findSubmissionForRecord(record);
  els.recordForm.elements.customerPowerAdapter.value = extractPowerAdapterAnswer(matchedSubmission);
  updateAccessoryPartsRequirement();
  hideMatchBox();
  updateDeviceHistoryButton();
}

function openEditDialog(id) {
  if (readonlyMode) return;
  const record = records.find((item) => item.id === id);
  if (!record) return;
  fillForm(record);
  openRecordDialogAndTrackChanges();
}

function getFormRecord() {
  const formData = new FormData(els.recordForm);
  const id = els.recordId.value || createId();
  const record = { id };
  exportFields.forEach(([key]) => {
    record[key] = ["faultCategory", "accessoryParts"].includes(key)
      ? formData.getAll(key).map((value) => String(value).trim()).filter(Boolean)
      : String(formData.get(key) || "").trim();
  });
  record.deviceNumber = record.deviceNumber.replace(/\D/g, "").slice(0, 10);
  if (!/^\d{10}$/.test(record.deviceNumber)) {
    showToast("编号必须填写 10 位数字");
    els.recordForm.elements.deviceNumber.focus();
    return null;
  }
  record.model = inferModelFromDeviceNumber(record.deviceNumber) || record.model;
  if (!record.accessoryParts.includes(CUSTOM_PRICE_ACCESSORY_PART)) {
    record.customPartPrice = "";
  } else {
    record.customPartPrice = normalizeMoneyValue(record.customPartPrice);
  }
  const selectedPartSet = new Set(record.accessoryParts);
  record.zeroFeeParts = normalizeAccessoryParts(record.zeroFeeParts)
    .filter((part) => part !== "无费用" && selectedPartSet.has(part))
    .join(MULTI_VALUE_SEPARATOR);
  if (record.faultCategory.length === 0) {
    showFaultCategoryRequired();
    return null;
  }
  if (
    record.accessoryParts.includes(CUSTOM_PRICE_ACCESSORY_PART) &&
    !normalizeAccessoryParts(record.zeroFeeParts).includes(CUSTOM_PRICE_ACCESSORY_PART) &&
    !record.customPartPrice
  ) {
    showCustomPartPriceRequired();
    return null;
  }
  if (isAccessoryPartsRequired() && record.accessoryParts.length === 0) {
    showAccessoryPartsRequired();
    return null;
  }
  record.updatedAt = new Date().toISOString();
  return normalizeRecord(record);
}

async function upsertRecord(record) {
  if (readonlyMode) return false;
  if (cloudMode && !adminMode) {
    showToast("请先管理员登录");
    return false;
  }

  try {
    if (cloudMode) await saveCloudRecord(record);
    await syncRepairMaterialsToInventory(record);
  } catch (error) {
    console.error(error);
    showToast(cloudMode ? "维修记录已保存，但同步到库存网页失败" : "同步到库存网页失败", "error");
    return false;
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
  return true;
}

function getCustomerSubmissionFromForm() {
  const trackingNumber = String(els.customerForm.elements.trackingNumber.value || "").trim();
  if (!trackingNumber) {
    showToast("请填写寄出快递单号");
    els.customerForm.elements.trackingNumber.focus();
    return null;
  }

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
  const oldSubmission = editingCustomerSubmissionId
    ? customerSubmissions.find((item) => item.id === editingCustomerSubmissionId) || getLastCustomerSubmission()
    : null;
  return normalizeCustomerSubmission({
    id: oldSubmission?.id || createCustomerSubmissionId(),
    createdTime: oldSubmission?.createdTime || toInputDateTime(new Date()),
    deviceNumber,
    model: inferModelFromDeviceNumber(deviceNumber),
    companyName: String(formData.get("companyName") || ""),
    contactName: String(formData.get("contactName") || ""),
    phone,
    trackingNumber,
    customerIssue: `电源适配器是否寄回：${powerAdapterReturned}\n故障描述：${customerIssue}`,
    powerAdapterReturned,
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
  if (!editingCustomerSubmissionId && fingerprint === lastCustomerSubmitFingerprint && now - lastCustomerSubmitTime < 30000) {
    showToast("已经提交过了，请不要重复点击");
    return;
  }

  setCustomerSubmitting(true);
  try {
    await saveCustomerSubmissionReliably(submission);
  } catch (error) {
    console.error(error);
    if (error?.code === "PGRST205" || String(error?.message || "").includes("customer_repair_submissions")) {
      showToast("云端还没升级客户登记表，请先执行数据库 SQL");
    } else if (error?.code === "42501") {
      showToast("云端权限没打开，请检查客户登记表权限");
    } else {
      showToast("提交失败，信息还没有保存，请检查网络后重试");
    }
    setCustomerSubmitting(false);
    return;
  }

  lastCustomerSubmitFingerprint = fingerprint;
  lastCustomerSubmitTime = now;
  const existingIndex = customerSubmissions.findIndex((item) => item.id === submission.id);
  if (existingIndex >= 0) {
    customerSubmissions[existingIndex] = submission;
  } else {
    customerSubmissions.unshift(submission);
  }
  sortCustomerSubmissionsNewestFirst(customerSubmissions);
  if (!cloudMode) saveCustomerSubmissions();
  saveLastCustomerSubmission(submission);
  const wasEditing = Boolean(editingCustomerSubmissionId);
  editingCustomerSubmissionId = "";
  els.customerForm.reset();
  updateAddressCities();
  syncAreaButtons();
  syncSimpleSelectButton("powerAdapterReturned");
  if (currentView === "customer") {
    history.replaceState(null, "", `${location.pathname}?page=customer`);
    showCustomerPortal();
  }
  renderSubmissions();
  showToast(wasEditing ? "修改成功" : "登记成功，工作人员会尽快处理");
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
  if (readonlyMode) return false;
  if (cloudMode && !adminMode) {
    showToast("请先管理员登录");
    return false;
  }

  const record = records.find((item) => item.id === id);
  if (!record) return false;
  const label = record.deviceNumber || record.trackingNumber || "这条记录";
  if (!confirm(`确认删除 ${label}？`)) return false;

  try {
    if (cloudMode) await deleteCloudRecord(id);
    await deleteRepairMaterialsFromInventory(id);
  } catch (error) {
    console.error(error);
    showToast("记录删除或同步删除失败");
    return false;
  }

  records = records.filter((item) => item.id !== id);
  if (!cloudMode) saveRecords();
  render();
  showToast("已删除");
  return true;
}

function clearRepairFilters(status = "") {
  els.searchInput.value = "";
  els.warrantyFilter.value = "";
  els.statusFilter.value = status;
  els.ownershipFilter.value = "";
  clearMultiSelect(els.categoryFilter);
  updateCategoryFilterPicker();
  closeCategoryFilterPicker();
  els.modelFilter.value = "";
  els.regionFilter.value = "";
  els.areaFilter.value = "";
  els.dateFrom.value = "";
  els.dateTo.value = "";
}

function resetFilters() {
  clearRepairFilters();
  render();
}

function scrollToSection(section) {
  if (!section) return;
  requestAnimationFrame(() => {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function applyMetricShortcut(card) {
  const target = card.dataset.metricTarget;

  if (target === "submissions") {
    location.hash = "submissions";
    setView("submissions");
    submissionStatusFilter = card.dataset.submissionStatus || "";
    render();
    scrollToSection(els.submissionsPage);
    showToast("已跳到未维修数据");
    return;
  }

  submissionStatusFilter = "";
  location.hash = "";
  setView("repair");
  clearRepairFilters(card.dataset.metricStatus || "");
  render();
  scrollToSection(els.repairRecordsSection);
  showToast(card.dataset.metricStatus ? `已跳到${card.dataset.metricStatus}数据` : "已跳到全部维修记录");
}

function toCsvValue(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function formatExportAccessoryParts(record = {}) {
  const selectedParts = normalizeAccessoryParts(record.accessoryParts);
  if (selectedParts.length === 0) return "";

  const zeroFeeSet = new Set(normalizeAccessoryParts(record.zeroFeeParts));
  return selectedParts
    .map((part) => {
      const amount = isWarrantyAccessoryPart(part, zeroFeeSet)
        ? { hasAmount: true, amount: 0 }
        : getRecordAccessoryPartAmount(record, part);
      const amountText = amount.hasAmount ? `${formatPlainAmount(amount.amount)}元` : "待定";
      return `${part}(${amountText})`;
    })
    .join(MULTI_VALUE_SEPARATOR);
}

function getExportFieldValue(record = {}, key = "") {
  if (key === "accessoryParts") return formatExportAccessoryParts(record);
  return record[key];
}

function openExpressExportDialog() {
  if (readonlyMode) return;
  if (filteredRecords.length === 0) {
    showToast("当前筛选没有可导出的记录");
    return;
  }
  const exportItems = getExpressExportItems(filteredRecords);
  renderExpressExportSummary(exportItems);
  els.confirmExpressExportBtn.disabled = exportItems.some((item) => item.issues.length > 0);
  els.expressExportDialog.showModal();
}

function renderExpressExportSummary(items) {
  const badItems = items.filter((item) => item.issues.length > 0);
  const goodItems = items.length - badItems.length;
  const previewItems = items.slice(0, 5);
  const badList = badItems.slice(0, 8)
    .map((item) => `<li>${escapeHtml(item.label)}：${escapeHtml(item.issues.join("、"))}</li>`)
    .join("");
  const previewList = previewItems
    .map((item) => `<li>${escapeHtml(item.recipient.name || "未识别收件人")} ${escapeHtml(item.recipient.mobile || "未识别手机")} ${escapeHtml(item.recipient.address || "未识别地址")}</li>`)
    .join("");

  els.expressExportSummary.innerHTML = `
    <div class="express-export-stat">
      <span>当前筛选</span>
      <strong>${items.length} 条</strong>
    </div>
    <p>会按当前页面筛选出来的维修记录导出中通导入表格，文件名为 ${escapeHtml(chineseDateFileName())}。</p>
    <p>可导出 ${goodItems} 条${badItems.length ? `，还有 ${badItems.length} 条缺必填项` : "，必填项都已识别"}。</p>
    ${
      badItems.length
        ? `<div class="express-export-warning">
            <strong>这些记录需要先补好：</strong>
            <ul>${badList}</ul>
          </div>`
        : `<div class="express-export-preview">
            <strong>前几条预览：</strong>
            <ul>${previewList}</ul>
          </div>`
    }
  `;
}

function getExpressExportItems(items) {
  return items.map((record, index) => {
    const recipient = getExpressRecipientInfo(record);
    const issues = getExpressExportIssues(recipient);
    return {
      record,
      recipient,
      issues,
      label: getExpressExportRecordLabel(record, index)
    };
  });
}

function getExpressExportIssues(recipient) {
  const issues = [];
  if (!recipient.name) issues.push("客户地址里缺收件人");
  if (!recipient.mobile) issues.push("客户地址里缺手机号");
  if (!recipient.address) issues.push("客户地址里缺详细地址");
  return issues;
}

function getExpressExportRecordLabel(record, index) {
  const label = record.deviceNumber || record.trackingNumber || record.customerAddress || `第 ${index + 1} 条`;
  return `${index + 1}. ${label}`;
}

function exportExpressFromDialog(event) {
  event.preventDefault();
  const exportItems = getExpressExportItems(filteredRecords);
  const badItems = exportItems.filter((item) => item.issues.length > 0);
  if (badItems.length > 0) {
    renderExpressExportSummary(exportItems);
    els.confirmExpressExportBtn.disabled = true;
    showToast("还有必填项没补好");
    return;
  }

  const rows = exportItems.map(({ record, recipient }) => buildExpressExportRow(record, recipient));
  const workbook = createExpressWorkbook(rows);
  downloadFile(
    chineseDateFileName(),
    workbook,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  els.expressExportDialog.close();
  showToast(`已导出 ${rows.length} 条快递`);
}

function exportAccessoryExcel() {
  if (!canViewAccessoryAnalytics()) {
    showToast("请先管理员登录");
    return;
  }

  const analysisRecords = getAnalysisRecords();
  const model = els.analysisAccessoryModelFilter.value;
  const exportItems = getAccessoryExportItems(analysisRecords, model, "all");
  if (exportItems.length === 0) {
    showToast("当前配件排行没有可导出的明细");
    return;
  }

  const rows = buildAccessoryExportRows(exportItems);
  const workbook = createAccessoryWorkbook(rows);
  downloadFile(
    `配件使用明细_${toInputDate(new Date())}.xlsx`,
    workbook,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  showToast(`已导出 ${rows.length} 条配件明细`);
}

function buildExpressExportRow(record, recipient) {
  return [
    "",
    "",
    EXPRESS_EXPORT_SENDER.name,
    EXPRESS_EXPORT_SENDER.mobile,
    EXPRESS_EXPORT_SENDER.phone,
    EXPRESS_EXPORT_SENDER.address,
    EXPRESS_EXPORT_SENDER.company,
    recipient.name,
    recipient.mobile,
    "",
    recipient.address,
    record.companyName || "",
    "",
    "",
    "",
    `维修=${record.deviceNumber || ""}`
  ];
}

function createExpressWorkbook(rows) {
  const files = {
    "[Content_Types].xml": createXlsxContentTypesXml(),
    "_rels/.rels": createXlsxRootRelsXml(),
    "xl/workbook.xml": createXlsxWorkbookXml(),
    "xl/_rels/workbook.xml.rels": createXlsxWorkbookRelsXml(),
    "xl/styles.xml": createXlsxStylesXml(),
    "xl/worksheets/sheet1.xml": createExpressSheetXml(rows)
  };
  return createZipArchive(files);
}

function createAccessoryWorkbook(rows) {
  const files = {
    "[Content_Types].xml": createXlsxContentTypesXml(),
    "_rels/.rels": createXlsxRootRelsXml(),
    "xl/workbook.xml": createXlsxWorkbookXml(),
    "xl/_rels/workbook.xml.rels": createXlsxWorkbookRelsXml(),
    "xl/styles.xml": createXlsxStylesXml(),
    "xl/worksheets/sheet1.xml": createAccessorySheetXml(rows)
  };
  return createZipArchive(files);
}

function createAccessorySheetXml(rows) {
  const headers = ["日期", "型号", "编号", "所用配件", "是否保修", "产生费用"];
  const sheetRows = [
    createXlsxRow(1, headers, () => 2),
    ...rows.map((row, index) => createXlsxRow(index + 2, row, () => 0))
  ].join("");
  const validationRange = `E2:E${Math.max(rows.length + 1, 2)}`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:F${Math.max(rows.length + 1, 1)}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="1" width="14" customWidth="1"/>
    <col min="2" max="2" width="14" customWidth="1"/>
    <col min="3" max="3" width="16" customWidth="1"/>
    <col min="4" max="4" width="24" customWidth="1"/>
    <col min="5" max="6" width="14" customWidth="1"/>
  </cols>
  <sheetData>${sheetRows}</sheetData>
  <dataValidations count="1">
    <dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="${validationRange}">
      <formula1>"保修,付费"</formula1>
    </dataValidation>
  </dataValidations>
</worksheet>`;
}

function createExpressSheetXml(rows) {
  const sheetRows = [
    createXlsxRow(1, EXPRESS_EXPORT_HEADERS, (index) => (
      EXPRESS_REQUIRED_HEADER_INDEXES.has(index) ? 1 : 2
    )),
    ...rows.map((row, index) => createXlsxRow(index + 2, row, () => 0))
  ].join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="A1:P${Math.max(rows.length + 1, 1)}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="18"/>
  <cols>
    <col min="1" max="2" width="12" customWidth="1"/>
    <col min="3" max="3" width="18" customWidth="1"/>
    <col min="4" max="5" width="16" customWidth="1"/>
    <col min="6" max="6" width="42" customWidth="1"/>
    <col min="7" max="7" width="18" customWidth="1"/>
    <col min="8" max="10" width="16" customWidth="1"/>
    <col min="11" max="11" width="58" customWidth="1"/>
    <col min="12" max="16" width="16" customWidth="1"/>
  </cols>
  <sheetData>${sheetRows}</sheetData>
</worksheet>`;
}

function createXlsxRow(rowIndex, values, styleGetter) {
  const cells = values
    .map((value, columnIndex) => createXlsxCell(rowIndex, columnIndex, value, styleGetter(columnIndex)))
    .join("");
  return `<row r="${rowIndex}">${cells}</row>`;
}

function createXlsxCell(rowIndex, columnIndex, value, styleId = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return createXlsxNumberCell(rowIndex, columnIndex, value, styleId);
  }
  return createXlsxInlineCell(rowIndex, columnIndex, value, styleId);
}

function createXlsxNumberCell(rowIndex, columnIndex, value, styleId = 0) {
  const ref = `${columnIndexToName(columnIndex)}${rowIndex}`;
  const style = styleId ? ` s="${styleId}"` : "";
  return `<c r="${ref}"${style}><v>${value}</v></c>`;
}

function createXlsxInlineCell(rowIndex, columnIndex, value, styleId = 0) {
  const ref = `${columnIndexToName(columnIndex)}${rowIndex}`;
  const style = styleId ? ` s="${styleId}"` : "";
  return `<c r="${ref}" t="inlineStr"${style}><is><t>${escapeXml(value)}</t></is></c>`;
}

function columnIndexToName(index) {
  let number = index + 1;
  let name = "";
  while (number > 0) {
    const remainder = (number - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    number = Math.floor((number - 1) / 26);
  }
  return name;
}

function escapeXml(value = "") {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function createXlsxContentTypesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;
}

function createXlsxRootRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;
}

function createXlsxWorkbookXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`;
}

function createXlsxWorkbookRelsXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
}

function createXlsxStylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="3">
    <font><sz val="11"/><name val="宋体"/></font>
    <font><b/><sz val="11"/><color rgb="FFFF0000"/><name val="宋体"/></font>
    <font><b/><sz val="11"/><color rgb="FF000000"/><name val="宋体"/></font>
  </fonts>
  <fills count="2">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
  </fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

function createZipArchive(files) {
  const encoder = new TextEncoder();
  const fileEntries = Object.entries(files).map(([name, content]) => ({
    nameBytes: encoder.encode(name),
    data: typeof content === "string" ? encoder.encode(content) : new Uint8Array(content)
  }));
  const fileParts = [];
  const centralParts = [];
  let offset = 0;
  const { dosTime, dosDate } = getZipDosDateTime();

  fileEntries.forEach((entry) => {
    const crc = crc32(entry.data);
    const localHeader = new Uint8Array(30 + entry.nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, entry.data.length, true);
    localView.setUint32(22, entry.data.length, true);
    localView.setUint16(26, entry.nameBytes.length, true);
    localHeader.set(entry.nameBytes, 30);
    fileParts.push(localHeader, entry.data);

    const centralHeader = new Uint8Array(46 + entry.nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, dosTime, true);
    centralView.setUint16(14, dosDate, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, entry.data.length, true);
    centralView.setUint32(24, entry.data.length, true);
    centralView.setUint16(28, entry.nameBytes.length, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(entry.nameBytes, 46);
    centralParts.push(centralHeader);

    offset += localHeader.length + entry.data.length;
  });

  const centralOffset = offset;
  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, fileEntries.length, true);
  endView.setUint16(10, fileEntries.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, centralOffset, true);

  return concatUint8Arrays([...fileParts, ...centralParts, end]);
}

function getZipDosDateTime() {
  const now = new Date();
  const year = Math.max(1980, now.getFullYear());
  return {
    dosTime: (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2),
    dosDate: ((year - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()
  };
}

function concatUint8Arrays(parts) {
  const totalLength = parts.reduce((total, part) => total + part.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });
  return result;
}

function crc32(bytes) {
  const table = crc32.table || (crc32.table = createCrc32Table());
  let crc = -1;
  bytes.forEach((byte) => {
    crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
  });
  return (crc ^ -1) >>> 0;
}

function createCrc32Table() {
  return Array.from({ length: 256 }, (_, index) => {
    let crc = index;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    return crc >>> 0;
  });
}

function exportCsv() {
  const header = exportFields.map(([, label]) => toCsvValue(label)).join(",");
  const rows = filteredRecords.map((record) => exportFields.map(([key]) => toCsvValue(getExportFieldValue(record, key))).join(","));
  downloadFile(`打印机维修记录_${dateStamp()}.csv`, "\ufeff" + [header, ...rows].join("\n"), "text/csv;charset=utf-8");
}

function downloadFile(filename, content, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
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

function chineseDateFileName(date = new Date()) {
  return `${date.getMonth() + 1}月${date.getDate()}号.xlsx`;
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
    accessoryParts: ["本单所用配件", "所用配件", "配件"],
    customPartPrice: ["自定义配件金额", "塑料件金额", "其他件金额"],
    zeroFeeParts: ["保修配件", "0元配件", "免费配件", "不收费配件"],
    warrantyStatus: ["是否保修", "保修状态"],
    customerAddress: ["客户地址", "维修地址", "地址"],
    model: ["型号"]
  };
  return Object.entries(aliases).find(([, names]) => names.map(normalizeHeader).includes(header))?.[0] || "";
}

function normalizeImportedValue(key, value) {
  const text = String(value ?? "").trim();
  if (key === "createdTime") return convertExcelDateText(text, true);
  if (key === "returnTime") return convertExcelDateText(text, false);
  if (key === "warrantyStatus") return normalizeWarrantyStatus(text);
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
  const adminAccount = findAdminByUsername(username);
  if (!adminAccount) {
    showToast("登录失败，请检查账号和密码");
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({ email: adminAccount.email, password });
  if (error) {
    console.error(error);
    showToast("登录失败，请检查账号和密码");
    return;
  }

  els.authDialog.close();
  els.authForm.reset();
  showToast(`${adminAccount.label}已登录`);
}

async function signOutAdmin() {
  if (!cloudMode || !supabaseClient) return;
  await supabaseClient.auth.signOut();
  adminMode = false;
  currentAdmin = null;
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
  bindDialogScrollLock();
  [els.categoryFilterMenu, els.faultCategoryMenu, els.accessoryPartsMenu].forEach(bindContainedMenuScroll);

  ["input", "change"].forEach((eventName) => {
    [
      els.searchInput,
      els.warrantyFilter,
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
    submissionStatusFilter = "";
    location.hash = "submissions";
    setView("submissions");
  });
  els.analyticsViewBtn.addEventListener("click", () => {
    location.hash = "analytics";
    setView("analytics");
  });
  [els.analysisDateFrom, els.analysisDateTo].forEach((input) => {
    input.addEventListener("change", () => {
      hideAnalysisPopover();
      renderAnalytics();
    });
  });
  els.analysisAccessoryToggleBtn.addEventListener("click", () => {
    if (!canViewAccessoryAnalytics()) return;
    showAccessoryAnalytics = true;
    renderAnalytics();
  });
  els.analysisAccessoryFeeModeBtn.addEventListener("click", () => {
    accessoryFeeMode = accessoryFeeMode === "warranty" ? "paid" : "warranty";
    renderAnalytics();
  });
  els.analysisAccessoryModelFilter.addEventListener("change", renderAnalytics);
  els.exportAccessoryExcelBtn.addEventListener("click", exportAccessoryExcel);
  els.resetAnalysisDateBtn.addEventListener("click", () => {
    setAnalysisDateToThisYear();
    hideAnalysisPopover();
    renderAnalytics();
  });
  els.customerViewBtn.addEventListener("click", () => {
    location.hash = "customer-admin";
    setView("customerAdmin");
  });
  ["input", "change"].forEach((eventName) => {
    els.submissionSearchInput.addEventListener(eventName, renderSubmissions);
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
  els.editCustomerSubmissionBtn.addEventListener("click", startEditCustomerSubmission);
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
  els.exportExpressBtn.addEventListener("click", openExpressExportDialog);
  els.exportCsvBtn.addEventListener("click", exportCsv);
  els.pushWecomBtn.addEventListener("click", pushRepairStatsToWecom);
  els.expressExportForm.addEventListener("submit", exportExpressFromDialog);
  els.closeExpressExportDialogBtn.addEventListener("click", () => els.expressExportDialog.close());
  els.cancelExpressExportBtn.addEventListener("click", () => els.expressExportDialog.close());
  els.deviceHistoryBtn.addEventListener("click", openDeviceHistoryDialog);
  els.closeDeviceHistoryDialogBtn.addEventListener("click", () => els.deviceHistoryDialog.close());
  els.closeDeviceHistoryBtn.addEventListener("click", () => els.deviceHistoryDialog.close());
  els.metricCards.forEach((card) => {
    card.addEventListener("click", () => applyMetricShortcut(card));
  });
  [
    els.analysisCategoryBars,
    els.analysisRegionBars,
    els.analysisModelBars,
    els.analysisAccessoryBars,
    els.analysisOwnershipBars,
    els.analysisAreaBars
  ].forEach((container) => {
    container.addEventListener("click", (event) => {
      const row = event.target.closest("[data-analysis-detail]");
      if (row) openAnalysisDetail(row);
    });
    container.addEventListener("keydown", (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      const row = event.target.closest("[data-analysis-detail]");
      if (!row) return;
      event.preventDefault();
      openAnalysisDetail(row);
    });
  });
  els.analysisPopover.addEventListener("click", (event) => {
    const button = event.target.closest('[data-action="toggle-analysis-popover"]');
    if (button) {
      event.stopPropagation();
      toggleAnalysisPopoverMode();
      return;
    }

    const row = event.target.closest("[data-analysis-child-detail]");
    if (!row) return;
    event.stopPropagation();
    openAnalysisChildDetail(row);
  });
  els.analysisPopover.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    const row = event.target.closest("[data-analysis-child-detail]");
    if (!row) return;
    event.preventDefault();
    openAnalysisChildDetail(row);
  });
  els.analysisChildPopover.addEventListener("click", (event) => {
    const row = event.target.closest("[data-analysis-grandchild-detail]");
    if (!row) return;
    event.stopPropagation();
    openAnalysisGrandchildDetail(row);
  });
  els.analysisChildPopover.addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    const row = event.target.closest("[data-analysis-grandchild-detail]");
    if (!row) return;
    event.preventDefault();
    openAnalysisGrandchildDetail(row);
  });
  els.closeDialogBtn.addEventListener("click", closeRecordDialogWithGuard);
  els.cancelDialogBtn.addEventListener("click", closeRecordDialogWithGuard);
  els.recordDialog.addEventListener("cancel", handleRecordDialogCancel);
  els.recordDialog.addEventListener("close", clearRecordDialogSnapshot);
  window.addEventListener("beforeunload", handleRecordBeforeUnload);
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
  els.accessoryPartsToggle.addEventListener("click", toggleAccessoryPartsPicker);
  els.accessoryPartsClearBtn.addEventListener("click", clearAccessoryPartsPicker);
  els.accessoryPartsMenu.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[type='checkbox']");
    if (!checkbox) return;
    const option = Array.from(els.recordForm.elements.accessoryParts.options)
      .find((item) => item.value === checkbox.value);
    if (option) option.selected = checkbox.checked;
    updateAccessoryPartsPicker();
    if (checkbox.checked && checkbox.value === CUSTOM_PRICE_ACCESSORY_PART) {
      closeAccessoryPartsPicker();
      openCustomPartPriceDialog();
    }
  });
  els.recordForm.elements.accessoryParts.addEventListener("change", updateAccessoryPartsPicker);
  els.customPartPriceForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveCustomPartPriceFromDialog();
  });
  els.closeCustomPartPriceDialogBtn.addEventListener("click", closeCustomPartPriceDialog);
  els.cancelCustomPartPriceBtn.addEventListener("click", closeCustomPartPriceDialog);
  els.customPartPriceDialog.addEventListener("close", () => updateRepairFeeDetails());
  els.repairFeeBox.addEventListener("click", (event) => {
    const button = event.target.closest(".repair-fee-row");
    if (!button || !els.repairFeeBox.contains(button)) return;
    toggleZeroFeePart(button.dataset.part || "");
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest("#categoryFilterPicker")) closeCategoryFilterPicker();
    if (!event.target.closest("#faultCategoryPicker")) closeFaultCategoryPicker();
    if (!event.target.closest("#accessoryPartsPicker") && !event.target.closest("#accessoryPartsMenu")) {
      closeAccessoryPartsPicker();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCategoryFilterPicker();
      closeFaultCategoryPicker();
      closeAccessoryPartsPicker();
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
    const saved = await upsertRecord(record);
    if (!saved) return;
    clearRecordDialogSnapshot();
    els.recordDialog.close();
  });

  els.saveRecordBtn.addEventListener("click", (event) => {
    if (getMultiSelectValues(els.recordForm.elements.faultCategory).length === 0) {
      event.preventDefault();
      showFaultCategoryRequired();
      return;
    }
    if (isAccessoryPartsRequired() && getMultiSelectValues(els.recordForm.elements.accessoryParts).length === 0) {
      event.preventDefault();
      showAccessoryPartsRequired();
    }
  });

  els.recordForm.elements.finalStatus.addEventListener("change", () => {
    updateAccessoryPartsRequirement();
    updateReturnTimeFromStatus();
  });
  els.recordForm.elements.deviceNumber.addEventListener("input", () => {
    const input = els.recordForm.elements.deviceNumber;
    input.value = input.value.replace(/\D/g, "").slice(0, 10);
    checkDeviceNumberMatch();
  });
  els.recordForm.elements.deviceNumber.addEventListener("change", checkDeviceNumberMatch);
  els.recordForm.elements.region.addEventListener("input", () => updateRepairFeeDetails());
  els.recordForm.elements.region.addEventListener("change", () => updateRepairFeeDetails());
  els.recordForm.elements.customerAddress.addEventListener("input", () => updateRepairFeeDetails());
  els.recordForm.elements.customerAddress.addEventListener("change", () => updateRepairFeeDetails());
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
    const deleted = await deleteRecord(els.recordId.value);
    if (!deleted) return;
    clearRecordDialogSnapshot();
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

  document.addEventListener("click", (event) => {
    const clickedAnalysisRow = event.target.closest("[data-analysis-detail]");
    const clickedAnalysisPopover = event.target.closest("#analysisPopover");
    const clickedAnalysisChildPopover = event.target.closest("#analysisChildPopover");
    const clickedAnalysisGrandchildPopover = event.target.closest("#analysisGrandchildPopover");
    if (!clickedAnalysisRow && !clickedAnalysisPopover && !clickedAnalysisChildPopover && !clickedAnalysisGrandchildPopover) {
      hideAnalysisPopover();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideAddressPopover();
      hideAnalysisPopover();
    }
  });

  window.addEventListener("scroll", () => {
    hideAddressPopover();
    hideAnalysisPopover();
    if (!els.accessoryPartsMenu.hidden) positionAccessoryPartsMenu();
  }, true);
  window.addEventListener("resize", () => {
    if (!els.accessoryPartsMenu.hidden) positionAccessoryPartsMenu();
  });
  els.recordDialog.addEventListener("scroll", () => {
    if (!els.accessoryPartsMenu.hidden) positionAccessoryPartsMenu();
  });
  window.addEventListener("hashchange", applyHashRoute);
}

fillStaticOptions();
bindEvents();
setAnalysisDateToThisYear();
applyHashRoute();
loadAreaData();
initializeCloud();
