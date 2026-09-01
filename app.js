const STORAGE_KEY = "printer_repair_records_v3";
const CUSTOMER_SUBMISSIONS_STORAGE_KEY = "printer_customer_submissions_v1";
const REPAIR_PROGRESS_STORAGE_KEY = "printer_repair_progress_events_v1";
const PROGRESS_RESULT_PRESETS_STORAGE_KEY = "printer_progress_result_presets_v1";
const LAST_CUSTOMER_SUBMISSION_KEY = "printer_last_customer_submission_v1";
const PUBLIC_SHARE_BASE_URL = "https://hihu-hu.github.io/repair-register/";
const CUSTOMER_REGISTER_URL = `${PUBLIC_SHARE_BASE_URL}customer.html`;
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
const INVENTORY_SUPABASE_ANON_KEY = "sb_publishable_pfInYtKS9NW9SQ-nJ0eNew_IA_HGskm";
const WECOM_PUSH_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/push-repair-stats`;
const MULTI_VALUE_SEPARATOR = "、";
const CUSTOM_PRICE_ACCESSORY_PART = "塑料件/其他件";
const ZERO_FEE_MARK = "{0元}";
const WARRANTY_FEE_MARK = "{保修}";
const WARRANTY_STATUS_STORAGE_PREFIX = "__warranty_status__:";
const PROGRESS_ACCESSORY_STORAGE_PREFIX = "__progress_accessories__:";
const PROGRESS_CUSTOM_ACCESSORY_PART = "自定义";
const PROGRESS_HIDDEN_ACCESSORY_PARTS = new Set([CUSTOM_PRICE_ACCESSORY_PART, "快递费", "无费用"]);
const PROGRESS_WARRANTY_OPTIONS = ["在保", "已过保"];
const DEFAULT_PROGRESS_RESULT_PRESETS = [
  "设备泡水导致配件腐蚀损坏",
  "检测到打印头损坏，需要更换后测试",
  "检测到主板损坏，需要更换后测试",
  "检测到传感器损坏，需要更换后测试",
  "检测未发现硬件故障，已清洁维护并测试正常"
];
const LOCKED_CUSTOMER_EDIT_STATUSES = ["已寄出", "邮寄并结束"];
const RETURN_TIME_REQUIRED_STATUSES = ["今天需要寄", "邮寄并结束"];
const CUSTOMER_PROGRESS_STEPS = [
  "用户提交工单",
  "等待收货",
  "已收货",
  "检测中",
  "检测结果",
  "报价付款",
  "维修中",
  "等待发货",
  "已发货"
];
const AUTO_DETECTION_ENABLED = true;
const AUTO_START_DETECTION_AFTER_MS = 14 * 60 * 60 * 1000;
const AUTO_DETECTION_CHECK_INTERVAL_MS = 60 * 1000;
const RECEIVED_UNDO_HOLD_MS = 3 * 1000;
const WAITING_RECEIPT_RESET_MARK = "__waiting_receipt_reset__";
const NO_REPAIR_PROGRESS_MARK = "__no_repair__";
const NO_REPAIR_CUSTOMER_PROGRESS_MARK = "__no_repair_customer__";
const NO_REPAIR_ADMIN_PROGRESS_MARK = "__no_repair_admin__";
const PAYMENT_CUSTOMER_PROGRESS_MARK = "__payment_customer__";
const PAYMENT_ADMIN_PROGRESS_MARK = "__payment_admin__";
const NO_REPAIR_REQUEST_MARK = "客户选择：无需维修";
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

function displayFinalStatus(value = "") {
  return value === "已寄出" ? "待寄出" : value;
}

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
  analysisTotalRepairs: document.querySelector("#analysisTotalRepairs"),
  analysisThisMonth: document.querySelector("#analysisThisMonth"),
  analysisMonthBars: document.querySelector("#analysisMonthBars"),
  analysisCategoryBars: document.querySelector("#analysisCategoryBars"),
  analysisRegionBars: document.querySelector("#analysisRegionBars"),
  analysisModelBars: document.querySelector("#analysisModelBars"),
  analysisAccessoryPanel: document.querySelector("#analysisAccessoryPanel"),
  analysisAccessoryFeeModeBtn: document.querySelector("#analysisAccessoryFeeModeBtn"),
  analysisAccessoryModelFilter: document.querySelector("#analysisAccessoryModelFilter"),
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
  viewCustomerProgressBtn: document.querySelector("#viewCustomerProgressBtn"),
  customerProgressPage: document.querySelector("#customerProgressPage"),
  customerProgressSummary: document.querySelector("#customerProgressSummary"),
  customerProgressLoading: document.querySelector("#customerProgressLoading"),
  customerProgressTimeline: document.querySelector("#customerProgressTimeline"),
  closeCustomerProgressBtn: document.querySelector("#closeCustomerProgressBtn"),
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
  refreshSubmissionsBtn: document.querySelector("#refreshSubmissionsBtn"),
  submissionSearchInput: document.querySelector("#submissionSearchInput"),
  submissionsEmptyState: document.querySelector("#submissionsEmptyState"),
  metricCards: document.querySelectorAll("[data-metric-target]"),
  testingCount: document.querySelector("#testingCount"),
  readyCount: document.querySelector("#readyCount"),
  pendingShipmentCount: document.querySelector("#pendingShipmentCount"),
  pendingSendCount: document.querySelector("#pendingSendCount"),
  finishedCount: document.querySelector("#finishedCount"),
  testStatusCount: document.querySelector("#testStatusCount"),
  incompleteProgressCount: document.querySelector("#incompleteProgressCount"),
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
  recordProgressBtn: document.querySelector("#recordProgressBtn"),
  previewCustomerProgressBtn: document.querySelector("#previewCustomerProgressBtn"),
  customerProgressPreviewDialog: document.querySelector("#customerProgressPreviewDialog"),
  customerProgressPreviewSummary: document.querySelector("#customerProgressPreviewSummary"),
  customerProgressPreviewTimeline: document.querySelector("#customerProgressPreviewTimeline"),
  closeCustomerProgressPreviewBtn: document.querySelector("#closeCustomerProgressPreviewBtn"),
  doneCustomerProgressPreviewBtn: document.querySelector("#doneCustomerProgressPreviewBtn"),
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
  progressCustomPartPriceDialog: document.querySelector("#progressCustomPartPriceDialog"),
  progressCustomPartPriceForm: document.querySelector("#progressCustomPartPriceForm"),
  progressCustomPartPriceInput: document.querySelector("#progressCustomPartPriceInput"),
  closeProgressCustomPartPriceDialogBtn: document.querySelector("#closeProgressCustomPartPriceDialogBtn"),
  cancelProgressCustomPartPriceBtn: document.querySelector("#cancelProgressCustomPartPriceBtn"),
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
  progressManageDialog: document.querySelector("#progressManageDialog"),
  progressManageSummary: document.querySelector("#progressManageSummary"),
  progressManageList: document.querySelector("#progressManageList"),
  closeProgressManageDialogBtn: document.querySelector("#closeProgressManageDialogBtn"),
  doneProgressManageBtn: document.querySelector("#doneProgressManageBtn"),
  receivedUndoConfirmDialog: document.querySelector("#receivedUndoConfirmDialog"),
  receivedUndoConfirmMessage: document.querySelector("#receivedUndoConfirmMessage"),
  closeReceivedUndoConfirmBtn: document.querySelector("#closeReceivedUndoConfirmBtn"),
  cancelReceivedUndoConfirmBtn: document.querySelector("#cancelReceivedUndoConfirmBtn"),
  confirmReceivedUndoBtn: document.querySelector("#confirmReceivedUndoBtn"),
  detectionReminderDialog: document.querySelector("#detectionReminderDialog"),
  confirmDetectionReminderBtn: document.querySelector("#confirmDetectionReminderBtn"),
  shippingReminderDialog: document.querySelector("#shippingReminderDialog"),
  confirmShippingReminderBtn: document.querySelector("#confirmShippingReminderBtn"),
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
const linkingPreviewMode = ["localhost", "127.0.0.1"].includes(location.hostname)
  && new URLSearchParams(location.search).get("preview") === "linking";
const shouldUseLocalStartupData = !SUPABASE_URL || location.protocol === "file:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
let records = sharedData ? sharedData.records : shouldUseLocalStartupData ? loadRecords() : [];
let filteredRecords = [];
let customerSubmissions = sharedData ? sharedData.submissions : shouldUseLocalStartupData ? loadCustomerSubmissions() : [];
let repairProgressEvents = shouldUseLocalStartupData ? loadRepairProgressEvents() : [];
if (linkingPreviewMode) {
  customerSubmissions = [
    normalizeCustomerSubmission({ id: "preview-b1", submissionNumber: 1, createdTime: "2026-08-01T09:00", deviceNumber: "1007555555", companyName: "第一条已关联登记", contactName: "张先生", phone: "13800000001", trackingNumber: "SF100000001", customerIssue: "故障描述：打印不清楚", customerAddress: "浙江省杭州市预览地址 1 号" }),
    normalizeCustomerSubmission({ id: "preview-b2", submissionNumber: 2, createdTime: "2026-08-03T10:30", deviceNumber: "1007555555", companyName: "第二条待选择登记", contactName: "李女士", phone: "13800000002", trackingNumber: "YT100000002", customerIssue: "故障描述：无法连接网络", customerAddress: "上海市预览地址 2 号" }),
    normalizeCustomerSubmission({ id: "preview-b3", submissionNumber: 3, createdTime: "2026-08-04T14:20", deviceNumber: "1007555555", companyName: "第三条待选择登记", contactName: "王先生", phone: "13800000003", trackingNumber: "JD100000003", customerIssue: "故障描述：机器无法开机", customerAddress: "江苏省苏州市预览地址 3 号" })
  ];
  records = [normalizeRecord({ id: "preview-a1", recordNumber: 1, submissionId: "preview-b1", createdTime: "2026-08-02T11:00", trackingNumber: "SF100000001", region: "浙江", deviceNumber: "1007555555", hasPower: "有", companyName: "第一条已关联登记", customerIssue: "打印不清楚", repairProcess: "清洁打印头后测试正常", finalStatus: "已寄出", returnTrackingNumber: "SF200000001", faultOwnership: "非硬件", faultCategory: "未复现", accessoryParts: "无费用", warrantyStatus: "保修", customerAddress: "浙江省杭州市预览地址 1 号", model: "DK110B" })];
  repairProgressEvents = [
    { submissionId: "preview-b1", stepIndex: 0, occurredAt: "2026-08-01T09:00:12+08:00", updatedAt: "2026-08-01T09:00:12+08:00" },
    { submissionId: "preview-b1", stepIndex: 1, occurredAt: "2026-08-01T09:00:12+08:00", updatedAt: "2026-08-01T09:00:12+08:00" },
    { submissionId: "preview-b1", stepIndex: 2, occurredAt: "2026-08-02T11:03:26+08:00", updatedAt: "2026-08-02T11:03:26+08:00" },
    { submissionId: "preview-b1", stepIndex: 3, occurredAt: "2026-08-02T11:20:08+08:00", updatedAt: "2026-08-02T11:20:08+08:00" },
    { submissionId: "preview-b1", stepIndex: 4, occurredAt: "2026-08-02T12:06:41+08:00", detailText: "检测发现打印头积碳，清洁后打印测试正常，本次无需更换配件。", updatedAt: "2026-08-02T12:06:41+08:00" },
    { submissionId: "preview-b2", stepIndex: 0, occurredAt: "2026-08-03T10:30:18+08:00", updatedAt: "2026-08-03T10:30:18+08:00" },
    { submissionId: "preview-b2", stepIndex: 1, occurredAt: "2026-08-03T10:30:18+08:00", updatedAt: "2026-08-03T10:30:18+08:00" },
    { submissionId: "preview-b3", stepIndex: 0, occurredAt: "2026-08-04T14:20:33+08:00", updatedAt: "2026-08-04T14:20:33+08:00" },
    { submissionId: "preview-b3", stepIndex: 1, occurredAt: "2026-08-04T14:20:33+08:00", updatedAt: "2026-08-04T14:20:33+08:00" }
  ].map(normalizeProgressEvent);
}
let currentView = "repair";
let submissionStatusFilter = "";
let progressIncompleteFilter = false;
let areaData = null;
let appliedSubmissionSnapshot = null;
let appliedSubmissionId = "";
let matchingSubmissionChoices = [];
let isCustomerSubmitting = false;
let editingCustomerSubmissionId = "";
let lastCustomerSubmitFingerprint = "";
let lastCustomerSubmitTime = 0;
let analysisPopoverState = null;
let dialogScrollLockY = 0;
let dialogScrollLockObserver = null;
let recordDialogInitialSnapshot = "";
let recordDialogProgressSnapshots = new Map();
let managingProgressSubmissionId = "";
let progressManageRefreshTimer = null;
let progressManageRefreshRunning = false;
let confirmingProgressUndoStep = -1;
let editingProgressCustomPartStep = -1;
let autoDetectionCheckTimer = null;
let autoDetectionCheckRunning = false;
let receivedUndoHoldTimer = null;
let receivedUndoHoldButton = null;
let receivedUndoHoldPointerId = null;
let pendingReceivedUndoSubmissionId = "";
let pendingReceivedUndoButton = null;
let progressResultPresets = loadProgressResultPresets();

const initialIdentityChanged = prepareRecordIdentities({
  migrateLegacyLinks: shouldUseLocalStartupData || Boolean(sharedData)
});
if (shouldUseLocalStartupData && initialIdentityChanged) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  localStorage.setItem(CUSTOMER_SUBMISSIONS_STORAGE_KEY, JSON.stringify(customerSubmissions));
}

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

function normalizeProgressResultPreset(value = "") {
  return String(value || "").trim().replace(/\r\n/g, "\n").slice(0, 500);
}

function loadProgressResultPresets() {
  try {
    const raw = localStorage.getItem(PROGRESS_RESULT_PRESETS_STORAGE_KEY);
    if (raw === null) return [...DEFAULT_PROGRESS_RESULT_PRESETS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_PROGRESS_RESULT_PRESETS];
    return [...new Set(parsed.map(normalizeProgressResultPreset).filter(Boolean))];
  } catch {
    return [...DEFAULT_PROGRESS_RESULT_PRESETS];
  }
}

function saveProgressResultPresets() {
  localStorage.setItem(PROGRESS_RESULT_PRESETS_STORAGE_KEY, JSON.stringify(progressResultPresets));
}

function normalizeProgressEvent(item = {}) {
  const stepIndex = Number(item.stepIndex ?? item.step_index);
  return {
    submissionId: String(item.submissionId || item.submission_id || "").trim(),
    stepIndex: Number.isInteger(stepIndex) ? stepIndex : -1,
    occurredAt: String(item.occurredAt || item.occurred_at || "").trim(),
    detailText: String(item.detailText || item.detail_text || "").trim(),
    updatedAt: String(item.updatedAt || item.updated_at || new Date().toISOString()).trim()
  };
}

function isNoRepairProgressEvent(event) {
  return String(event?.detailText || "").startsWith("__no_repair");
}

function getAdminProgressOperationText(stepIndex, event) {
  if (stepIndex !== 5 || !event) return "";
  const operationLabels = {
    [PAYMENT_CUSTOMER_PROGRESS_MARK]: "客户确认付款",
    [PAYMENT_ADMIN_PROGRESS_MARK]: "管理员确认已付款",
    [NO_REPAIR_CUSTOMER_PROGRESS_MARK]: "客户放弃维修",
    [NO_REPAIR_ADMIN_PROGRESS_MARK]: "管理员设为无需维修"
  };
  if (operationLabels[event.detailText]) return operationLabels[event.detailText];
  return isNoRepairProgressEvent(event)
    ? "已设为无需维修（旧记录未保存操作人）"
    : "已确认付款（旧记录未保存操作人）";
}

function getAdminPaymentProgressStatus(event) {
  if (!event) return "";
  return isNoRepairProgressEvent(event) ? "已放弃维修" : "已付款";
}

function removeNoRepairRequestMark(value = "") {
  return String(value || "")
    .split("\n")
    .filter((line) => line.trim() !== NO_REPAIR_REQUEST_MARK)
    .join("\n")
    .trim();
}

function addNoRepairRequestMark(value = "") {
  return [
    ...removeNoRepairRequestMark(value).split("\n"),
    NO_REPAIR_REQUEST_MARK
  ].filter(Boolean).join("\n");
}

function hasNoRepairRequestMark(submission) {
  return String(submission?.customerIssue || "")
    .split("\n")
    .some((line) => line.trim() === NO_REPAIR_REQUEST_MARK);
}

function normalizeProgressWarrantyType(value = "") {
  const text = String(value || "").trim();
  if (text === "保内" || text === "未过保") return "在保";
  if (text === "过保") return "已过保";
  return PROGRESS_WARRANTY_OPTIONS.includes(text) ? text : "";
}

function normalizeProgressRepairSuggestion(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 200);
}

function parseProgressDetectionDetail(value = "") {
  const lines = String(value || "").trim().split(/\r?\n/);
  let accessoryParts = [];
  let customPartPrice = "";
  let customPartName = "";
  let repairSuggestion = "";
  const visibleLines = lines.filter((line) => {
    if (!line.startsWith(PROGRESS_ACCESSORY_STORAGE_PREFIX)) return true;
    try {
      const stored = JSON.parse(line.slice(PROGRESS_ACCESSORY_STORAGE_PREFIX.length));
      accessoryParts = normalizeProgressAccessoryParts(stored?.parts);
      customPartPrice = normalizeMoneyValue(stored?.customPartPrice);
      customPartName = normalizeProgressCustomPartName(stored?.customPartName);
      repairSuggestion = normalizeProgressRepairSuggestion(stored?.repairSuggestion);
    } catch {
      accessoryParts = [];
      customPartPrice = "";
      customPartName = "";
      repairSuggestion = "";
    }
    return false;
  });
  const text = visibleLines.join("\n").trim();
  const match = text.match(/^【(在保|未过保|已过保|保内|过保)】(?:\r?\n)?/);
  return {
    warrantyType: normalizeProgressWarrantyType(match?.[1]),
    detailText: match ? text.slice(match[0].length).trimStart() : text,
    accessoryParts,
    customPartPrice,
    customPartName,
    repairSuggestion
  };
}

function serializeProgressDetectionDetail(warrantyType, detailText, accessoryParts = [], customPartPrice = "", customPartName = "", repairSuggestion = "") {
  const normalizedWarrantyType = normalizeProgressWarrantyType(warrantyType);
  const normalizedDetailText = String(detailText || "").trim();
  const visibleText = normalizedWarrantyType
    ? `【${normalizedWarrantyType}】\n${normalizedDetailText}`
    : normalizedDetailText;
  const accessoryData = JSON.stringify({
    parts: normalizeProgressAccessoryParts(accessoryParts),
    customPartPrice: normalizeMoneyValue(customPartPrice),
    customPartName: normalizeProgressCustomPartName(customPartName),
    repairSuggestion: normalizeProgressRepairSuggestion(repairSuggestion)
  });
  return `${visibleText}\n${PROGRESS_ACCESSORY_STORAGE_PREFIX}${accessoryData}`;
}

function loadRepairProgressEvents() {
  try {
    const raw = JSON.parse(localStorage.getItem(REPAIR_PROGRESS_STORAGE_KEY) || "[]");
    return Array.isArray(raw)
      ? raw.map(normalizeProgressEvent).filter((item) => item.submissionId && item.stepIndex >= 0 && item.stepIndex < CUSTOMER_PROGRESS_STEPS.length)
      : [];
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

  if (linkingPreviewMode) {
    setReadonlyMode(false);
    setView(location.hash === "#analytics" ? "analytics" : "repair");
    render();
    return;
  }

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
  [els.shareDialog, els.deviceHistoryDialog, els.progressManageDialog, els.customerProgressPreviewDialog].forEach((dialog) => {
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

function progressEventsMatch(first, second) {
  return first.stepIndex === second.stepIndex
    && new Date(first.occurredAt).getTime() === new Date(second.occurredAt).getTime()
    && String(first.detailText || "") === String(second.detailText || "");
}

function captureNewRecordProgressSnapshot(submissionId) {
  const id = String(submissionId || "").trim();
  if (els.recordId.value || !id || recordDialogProgressSnapshots.has(id)) return;
  recordDialogProgressSnapshots.set(id, getStoredProgressEvents(id).map((item) => ({ ...item })));
}

function hasNewRecordProgressChanges() {
  return Array.from(recordDialogProgressSnapshots.entries()).some(([submissionId, initialEvents]) => {
    const currentEvents = getStoredProgressEvents(submissionId);
    if (initialEvents.length !== currentEvents.length) return true;
    return initialEvents.some((item) => !currentEvents.some((current) => progressEventsMatch(item, current)));
  });
}

async function restoreUnsavedRecordProgress({ keepSubmissionId = "" } = {}) {
  const snapshots = Array.from(recordDialogProgressSnapshots.entries());
  recordDialogProgressSnapshots = new Map();
  let restored = false;

  for (const [submissionId, initialEvents] of snapshots) {
    if (submissionId === keepSubmissionId) continue;
    const currentEvents = getStoredProgressEvents(submissionId);
    const initialManaged = initialEvents.filter((item) => item.stepIndex >= 2);
    const currentManaged = currentEvents.filter((item) => item.stepIndex >= 2);
    const initialByStep = new Map(initialManaged.map((item) => [item.stepIndex, item]));
    const currentByStep = new Map(currentManaged.map((item) => [item.stepIndex, item]));
    const changed = initialManaged.length !== currentManaged.length
      || initialManaged.some((item) => !progressEventsMatch(item, currentByStep.get(item.stepIndex) || {}));
    if (!changed) continue;

    try {
      if (cloudMode) {
        for (const item of currentManaged) {
          if (!initialByStep.has(item.stepIndex)) await deleteCloudProgressEvent(submissionId, item.stepIndex);
        }
        for (const item of initialManaged) {
          const current = currentByStep.get(item.stepIndex);
          if (!current || !progressEventsMatch(item, current)) await saveCloudProgressEvent(item);
        }
      }
      repairProgressEvents = repairProgressEvents.filter((item) => !(
        item.submissionId === submissionId && item.stepIndex >= 2
      ));
      repairProgressEvents.push(...initialManaged.map((item) => ({ ...item })));
      if (!cloudMode) saveRepairProgressEvents();
      restored = true;
    } catch (error) {
      console.error("恢复未保存工单的进度失败", error);
      showToast("工单没有保存，但客户进度恢复失败，请手动撤销", "error");
    }
  }

  if (restored) {
    renderTable();
    renderSubmissions();
    showToast("工单未保存，客户进度已恢复");
  }
}

function isRecordDialogDirty() {
  return Boolean(
    els.recordDialog.open &&
    ((recordDialogInitialSnapshot && getRecordFormSnapshot() !== recordDialogInitialSnapshot)
      || hasNewRecordProgressChanges())
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
  recordDialogProgressSnapshots = new Map();
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
  const progressEnabled = item.progressEnabled ?? item.progress_enabled;
  return {
    id: String(item.id || createCustomerSubmissionId()),
    submissionNumber: normalizeDisplayNumber(item.submissionNumber ?? item.submission_number),
    createdTime: normalizePreciseDateTime(item.createdTime || item.created_at || new Date()),
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
    progressEnabled: typeof progressEnabled === "boolean" ? progressEnabled : null,
    updatedAt: String(item.updatedAt || item.updated_at || new Date().toISOString())
  };
}

function normalizePreciseDateTime(value) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString();
  const text = String(value).trim();
  if (!text) return "";
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return text;
  return /(?:Z|[+-]\d{2}:?\d{2})$/i.test(text) ? text : text.slice(0, 19);
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
    recordNumber: normalizeDisplayNumber(record.recordNumber ?? record.record_number),
    submissionId: String(record.submissionId || record.submission_id || "").trim(),
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

function normalizeProgressAccessoryParts(value) {
  const rawItems = Array.isArray(value)
    ? value
    : String(value || "")
      .replaceAll(CUSTOM_PRICE_ACCESSORY_PART, "__CUSTOM_PRICE_ACCESSORY_PART__")
      .split(/[、,，;；/|]/)
      .map((item) => item.replaceAll("__CUSTOM_PRICE_ACCESSORY_PART__", CUSTOM_PRICE_ACCESSORY_PART));
  const standardParts = normalizeAccessoryParts(rawItems);
  const hasCustomPart = rawItems.some((item) => stripAccessoryPartPrice(item) === PROGRESS_CUSTOM_ACCESSORY_PART);
  return hasCustomPart ? [...standardParts, PROGRESS_CUSTOM_ACCESSORY_PART] : standardParts;
}

function normalizeProgressCustomPartName(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 30);
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

function getProgressAccessoryPartsForModel(model = "") {
  return [
    ...getAccessoryPartsForModel(model)
      .filter((part) => !PROGRESS_HIDDEN_ACCESSORY_PARTS.has(part)),
    PROGRESS_CUSTOM_ACCESSORY_PART
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

function getProgressAccessoryPricingRecord(submission, record, customPartPrice = null) {
  const resolvedCustomPartPrice = customPartPrice === null
    ? ""
    : customPartPrice;
  return {
    model: submission?.model || "",
    region: "",
    customerAddress: submission?.customerAddress || "",
    customPartPrice: normalizeMoneyValue(resolvedCustomPartPrice),
    zeroFeeParts: ""
  };
}

function getProgressCustomPartPrice(stepIndex) {
  const input = els.progressManageList.querySelector(`[data-progress-custom-part-price="${stepIndex}"]`);
  return normalizeMoneyValue(input?.value);
}

function getAccessorySelectionPrice(record, selectedParts = []) {
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
  return {
    total,
    hasPendingAmount,
    text: hasPendingAmount ? "待定" : formatRepairFee(total)
  };
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

function normalizeDisplayNumber(value) {
  const number = Number.parseInt(String(value ?? ""), 10);
  return Number.isSafeInteger(number) && number > 0 ? number : 0;
}

function assignMissingDisplayNumbers(items, key) {
  let nextNumber = items.reduce((highest, item) => Math.max(highest, normalizeDisplayNumber(item[key])), 0) + 1;
  let changed = false;
  [...items].sort(compareItemsOldestFirst).forEach((item) => {
    if (normalizeDisplayNumber(item[key])) return;
    item[key] = nextNumber;
    nextNumber += 1;
    changed = true;
  });
  return changed;
}

function migrateLegacySubmissionLinks() {
  const linkedSubmissionIds = new Set(records.map((record) => record.submissionId).filter(Boolean));
  const submissionsByDevice = new Map();
  customerSubmissions.forEach((submission) => {
    const deviceKey = String(submission.deviceNumber || "").trim().toLowerCase();
    if (!deviceKey) return;
    if (!submissionsByDevice.has(deviceKey)) submissionsByDevice.set(deviceKey, []);
    submissionsByDevice.get(deviceKey).push(submission);
  });
  submissionsByDevice.forEach((items) => items.sort(compareItemsOldestFirst));

  const recordCountsByDevice = new Map();
  let changed = false;
  [...records].sort(compareItemsOldestFirst).forEach((record) => {
    const deviceKey = String(record.deviceNumber || "").trim().toLowerCase();
    if (!deviceKey) return;
    const recordCount = recordCountsByDevice.get(deviceKey) || 0;
    recordCountsByDevice.set(deviceKey, recordCount + 1);
    if (record.submissionId) return;
    const submission = submissionsByDevice.get(deviceKey)?.[recordCount];
    if (!submission || linkedSubmissionIds.has(submission.id)) return;
    record.submissionId = submission.id;
    linkedSubmissionIds.add(submission.id);
    changed = true;
  });
  return changed;
}

function prepareRecordIdentities({ migrateLegacyLinks = false } = {}) {
  const recordNumbersChanged = assignMissingDisplayNumbers(records, "recordNumber");
  const submissionNumbersChanged = assignMissingDisplayNumbers(customerSubmissions, "submissionNumber");
  const linksChanged = migrateLegacyLinks ? migrateLegacySubmissionLinks() : false;
  return recordNumbersChanged || submissionNumbersChanged || linksChanged;
}

function formatRepairRecordId(record) {
  const number = normalizeDisplayNumber(record?.recordNumber);
  return number ? `A${number}` : "A-";
}

function formatSubmissionId(submission) {
  const number = normalizeDisplayNumber(submission?.submissionNumber);
  return number ? `B${number}` : "B-";
}

function getReviewedSubmissionIds() {
  return new Set(getSubmissionRepairMatches().keys());
}

function getSubmissionRepairMatches() {
  const matches = new Map();
  records.forEach((record) => {
    if (record.submissionId) matches.set(record.submissionId, record);
  });

  return matches;
}

function toInputDateTime(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function toInputDateTimeSeconds(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "").slice(0, 19);
  const beijing = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return beijing.toISOString().slice(0, 19);
}

function fromBeijingInputDateTime(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return new Date(value);
  const [, year, month, day, hour, minute, second = "0"] = match;
  return new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour) - 8,
    Number(minute),
    Number(second)
  ));
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

function saveRepairProgressEvents() {
  if (readonlyMode) return;
  repairProgressEvents.sort((a, b) => a.submissionId.localeCompare(b.submissionId) || a.stepIndex - b.stepIndex);
  localStorage.setItem(REPAIR_PROGRESS_STORAGE_KEY, JSON.stringify(repairProgressEvents));
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

async function existingInventoryMaterialRows(client, rows) {
  if (!rows.length) return [];

  const models = [...new Set(rows.map((row) => row.model).filter(Boolean))];
  const items = [...new Set(rows.map((row) => row.item).filter(Boolean))];
  if (!models.length || !items.length) return [];

  const { data, error } = await client
    .from("inventory_material_stock")
    .select("warehouse,model,item")
    .eq("warehouse", "总仓")
    .in("model", models)
    .in("item", items);
  if (error) throw error;

  const inventoryKeys = new Set(
    (data || []).map((row) => `${row.warehouse}\u001f${row.model}\u001f${row.item}`)
  );
  return rows.filter((row) => inventoryKeys.has(`${row.warehouse}\u001f${row.model}\u001f${row.item}`));
}

async function syncRepairMaterialsToInventory(record) {
  const client = getInventorySupabaseClient();
  if (!client) throw new Error("库存管理云端连接未加载");
  const { data: oldRows, error: oldError } = await client
    .from("repair_material_logs")
    .select("id")
    .eq("source_record_id", record.id);
  if (oldError) throw oldError;

  const rows = await existingInventoryMaterialRows(client, repairMaterialRows(record));
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
    submission_id: record.submissionId || null,
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
    recordNumber: record.record_number,
    submissionId: record.submission_id,
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
    submissionNumber: item.submission_number,
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
    progressEnabled: item.progress_enabled,
    updatedAt: item.updated_at
  });
}

function toDatabaseProgressEvent(item) {
  return {
    submission_id: item.submissionId,
    step_index: item.stepIndex,
    occurred_at: item.occurredAt,
    detail_text: item.detailText || "",
    updated_at: item.updatedAt || new Date().toISOString()
  };
}

function fromDatabaseProgressEvent(item) {
  return normalizeProgressEvent(item);
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
  await loadCloudProgressEvents();

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    const sessionEmail = session?.user?.email || "";
    setCurrentAdminByEmail(sessionEmail);
    refreshAccessMode();
    loadCloudRecords();
    loadCloudSubmissions();
    loadCloudProgressEvents();
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
  prepareRecordIdentities();
  render();
  updateCustomerEditButton();
  updateCustomerProgressButton();
}

async function saveCloudRecord(record) {
  const { data, error } = await supabaseClient
    .from("repair_records")
    .upsert(toDatabaseRecord(record), { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  return fromDatabaseRecord(data);
}

async function saveCloudRecords(items) {
  const { data, error } = await supabaseClient
    .from("repair_records")
    .upsert(items.map(toDatabaseRecord), { onConflict: "id" })
    .select("*");
  if (error) throw error;
  return data.map(fromDatabaseRecord);
}

async function deleteCloudRecord(id) {
  const { error } = await supabaseClient.from("repair_records").delete().eq("id", id);
  if (error) throw error;
}

async function loadCloudSubmissions() {
  if (!cloudMode || !supabaseClient) return false;

  const { data, error } = await supabaseClient
    .from("customer_repair_submissions")
    .select("*")
    .order("created_time", { ascending: false });

  if (error) {
    console.error(error);
    showToast("客户提交读取失败，请确认数据库已更新");
    renderSubmissions();
    return false;
  }

  customerSubmissions = sortCustomerSubmissionsNewestFirst(data.map(fromDatabaseSubmission));
  prepareRecordIdentities();
  renderTable();
  renderSubmissions();
  updateCustomerProgressButton();
  return true;
}

async function refreshCustomerSubmissions() {
  if (!cloudMode || !supabaseClient) {
    showToast("云端连接尚未完成，请稍后再试");
    return;
  }

  els.refreshSubmissionsBtn.disabled = true;
  els.refreshSubmissionsBtn.classList.add("is-loading");
  els.refreshSubmissionsBtn.setAttribute("aria-busy", "true");

  try {
    const refreshed = await loadCloudSubmissions();
    if (refreshed) showToast("客户提交已刷新");
  } catch (error) {
    console.error(error);
    showToast("客户提交刷新失败");
  } finally {
    els.refreshSubmissionsBtn.disabled = false;
    els.refreshSubmissionsBtn.classList.remove("is-loading");
    els.refreshSubmissionsBtn.removeAttribute("aria-busy");
  }
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
  return fromDatabaseSubmission(result[0]);
}

async function deleteCloudSubmission(id) {
  const { error } = await supabaseClient.from("customer_repair_submissions").delete().eq("id", id);
  if (error) throw error;
}

async function loadCloudProgressEvents(skipAutoDetection = false) {
  if (!cloudMode || !supabaseClient) return;

  const { data, error } = await supabaseClient
    .from("repair_progress_events")
    .select("*")
    .order("occurred_at", { ascending: true });

  if (error) {
    console.error(error);
    showToast("进度读取失败，请确认数据库已更新");
    return;
  }

  repairProgressEvents = data.map(fromDatabaseProgressEvent);
  if (!skipAutoDetection) await autoStartOverdueDetections();
  renderTable();
  if (managingProgressSubmissionId) renderProgressManageDialog();
  const lastSubmission = getLastCustomerSubmission();
  if (lastSubmission && !els.customerProgressPage.hidden) {
    renderCustomerProgress(lastSubmission, getCustomerSubmissionRepairRecord(lastSubmission));
  }
}

async function saveCloudProgressEvent(item) {
  const { data, error } = await supabaseClient
    .from("repair_progress_events")
    .upsert(toDatabaseProgressEvent(item), { onConflict: "submission_id,step_index" })
    .select("*")
    .single();
  if (error) throw error;
  return fromDatabaseProgressEvent(data);
}

async function deleteCloudProgressEvent(submissionId, stepIndex) {
  const { error } = await supabaseClient
    .from("repair_progress_events")
    .delete()
    .eq("submission_id", submissionId)
    .eq("step_index", stepIndex);
  if (error) throw error;
}

async function deleteCloudProgressEventsFromStep(submissionId, stepIndex) {
  const { error } = await supabaseClient
    .from("repair_progress_events")
    .delete()
    .eq("submission_id", submissionId)
    .gte("step_index", stepIndex);
  if (error) throw error;
}

async function createCloudProgressEventIfMissing(item) {
  const { data, error } = await supabaseClient
    .from("repair_progress_events")
    .upsert(toDatabaseProgressEvent(item), {
      onConflict: "submission_id,step_index",
      ignoreDuplicates: true
    })
    .select("*");
  if (error) throw error;
  return data?.[0] ? fromDatabaseProgressEvent(data[0]) : null;
}

function getOverdueDetectionEvents(now = Date.now()) {
  const linkedSubmissionIds = new Set(records.map((record) => record.submissionId).filter(Boolean));
  const eventsBySubmission = new Map();
  repairProgressEvents.forEach((item) => {
    if (!item.submissionId || item.stepIndex < 0) return;
    if (!eventsBySubmission.has(item.submissionId)) eventsBySubmission.set(item.submissionId, []);
    eventsBySubmission.get(item.submissionId).push(item);
  });

  const dueEvents = [];
  eventsBySubmission.forEach((events, submissionId) => {
    if (!linkedSubmissionIds.has(submissionId)) return;
    const latestIndex = Math.max(...events.map((item) => item.stepIndex));
    if (latestIndex !== 2) return;
    const receivedEvent = events.find((item) => item.stepIndex === 2);
    const receivedAt = new Date(receivedEvent?.occurredAt).getTime();
    if (!Number.isFinite(receivedAt)) return;
    const detectionAt = receivedAt + AUTO_START_DETECTION_AFTER_MS;
    if (detectionAt > now) return;
    dueEvents.push(normalizeProgressEvent({
      submissionId,
      stepIndex: 3,
      occurredAt: new Date(detectionAt).toISOString(),
      updatedAt: new Date(now).toISOString()
    }));
  });
  return dueEvents;
}

async function autoStartOverdueDetections() {
  if (!AUTO_DETECTION_ENABLED || autoDetectionCheckRunning || linkingPreviewMode) return 0;
  if ((cloudMode && !adminMode) || (!cloudMode && readonlyMode)) return 0;
  const dueEvents = getOverdueDetectionEvents();
  if (!dueEvents.length) return 0;

  autoDetectionCheckRunning = true;
  let startedCount = 0;
  let shouldRefreshCloudEvents = false;
  try {
    for (const dueEvent of dueEvents) {
      try {
        const saved = cloudMode
          ? await createCloudProgressEventIfMissing(dueEvent)
          : dueEvent;
        if (!saved) {
          shouldRefreshCloudEvents = true;
          continue;
        }
        repairProgressEvents = repairProgressEvents.filter((item) => !(
          item.submissionId === saved.submissionId && item.stepIndex === saved.stepIndex
        ));
        repairProgressEvents.push(saved);
        startedCount += 1;
      } catch (error) {
        console.error("自动开始检测失败", error);
      }
    }

    if (cloudMode && shouldRefreshCloudEvents) {
      await loadCloudProgressEvents(true);
    } else if (!cloudMode && startedCount) {
      saveRepairProgressEvents();
    }

    if (startedCount) {
      renderTable();
      if (managingProgressSubmissionId) renderProgressManageDialog();
      const lastSubmission = getLastCustomerSubmission();
      if (lastSubmission && !els.customerProgressPage.hidden) {
        renderCustomerProgress(lastSubmission, getCustomerSubmissionRepairRecord(lastSubmission));
      }
      showToast(startedCount === 1 ? "已自动进入检测中" : `${startedCount} 条工单已自动进入检测中`);
    }
    return startedCount;
  } finally {
    autoDetectionCheckRunning = false;
  }
}

async function startDetectionForNewRecord(record) {
  const submissionId = String(record?.submissionId || "").trim();
  if (!submissionId) return false;

  const storedEvents = getStoredProgressEvents(submissionId);
  const latestStep = storedEvents.length ? Math.max(...storedEvents.map((item) => item.stepIndex)) : -1;
  if (latestStep >= 3) return false;

  const existingSteps = new Set(storedEvents.map((item) => item.stepIndex));
  const now = new Date();
  const progressEvents = [
    normalizeProgressEvent({ submissionId, stepIndex: 3, occurredAt: now.toISOString(), updatedAt: now.toISOString() })
  ].filter((item) => !existingSteps.has(item.stepIndex));

  try {
    for (const progressEvent of progressEvents) {
      const saved = cloudMode
        ? await createCloudProgressEventIfMissing(progressEvent)
        : progressEvent;
      if (!saved) continue;
      repairProgressEvents = repairProgressEvents.filter((item) => !(
        item.submissionId === saved.submissionId && item.stepIndex === saved.stepIndex
      ));
      repairProgressEvents.push(saved);
    }

    if (cloudMode) {
      await loadCloudProgressEvents(true);
    } else {
      saveRepairProgressEvents();
    }
    renderTable();
    showToast("工单已保存，已自动进入检测中");
    return true;
  } catch (error) {
    console.error("新工单自动进入检测中失败", error);
    showToast("工单已保存，但自动进入检测中失败，请在进度中手动更新", "error");
    return false;
  }
}

function startAutoDetectionChecks() {
  if (!AUTO_DETECTION_ENABLED || linkingPreviewMode) return;
  if (autoDetectionCheckTimer) window.clearInterval(autoDetectionCheckTimer);
  autoStartOverdueDetections().catch((error) => console.error("自动检测检查失败", error));
  autoDetectionCheckTimer = window.setInterval(() => {
    autoStartOverdueDetections().catch((error) => console.error("自动检测检查失败", error));
  }, AUTO_DETECTION_CHECK_INTERVAL_MS);
}

async function requestPaymentConfirmation(submissionId, occurredAt = "") {
  const body = { p_submission_id: submissionId };
  if (occurredAt) body.p_occurred_at = occurredAt;
  let accessToken = SUPABASE_ANON_KEY;
  if (occurredAt && adminMode && supabaseClient) {
    const { data } = await supabaseClient.auth.getSession();
    accessToken = data.session?.access_token || SUPABASE_ANON_KEY;
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/confirm_repair_payment`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.message || "付款确认失败");
  return result || {};
}

async function requestNoRepair(submissionId, occurredAt = "") {
  const body = { p_submission_id: submissionId };
  if (occurredAt) body.p_occurred_at = occurredAt;
  let accessToken = SUPABASE_ANON_KEY;
  if (occurredAt && adminMode && supabaseClient) {
    const { data } = await supabaseClient.auth.getSession();
    accessToken = data.session?.access_token || SUPABASE_ANON_KEY;
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/skip_repair`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.message || "无需维修保存失败");
  return result || {};
}

function applyNoRepairLocally(submissionId, result = {}, fallbackTime = new Date().toISOString(), source = "customer") {
  const skippedAt = result.skipped_at || fallbackTime;
  const skippedEvents = [5, 6, 7].map((stepIndex) => normalizeProgressEvent({
    submissionId,
    stepIndex,
    occurredAt: skippedAt,
    detailText: stepIndex === 5
      ? (source === "admin" ? NO_REPAIR_ADMIN_PROGRESS_MARK : NO_REPAIR_CUSTOMER_PROGRESS_MARK)
      : NO_REPAIR_PROGRESS_MARK,
    updatedAt: new Date().toISOString()
  }));
  repairProgressEvents = repairProgressEvents.filter((item) => !(
    item.submissionId === submissionId && item.stepIndex >= 5
  ));
  repairProgressEvents.push(...skippedEvents);
}

function applyPaymentConfirmationLocally(submissionId, result = {}, fallbackTime = new Date().toISOString(), source = "customer") {
  const existingPaid = repairProgressEvents.find((item) => item.submissionId === submissionId && item.stepIndex === 5);
  const paidAt = result.paid_at || existingPaid?.occurredAt || fallbackTime;
  const nextAt = result.next_at || fallbackTime;
  [
    normalizeProgressEvent({
      submissionId,
      stepIndex: 5,
      occurredAt: paidAt,
      detailText: source === "admin" ? PAYMENT_ADMIN_PROGRESS_MARK : PAYMENT_CUSTOMER_PROGRESS_MARK,
      updatedAt: new Date().toISOString()
    }),
    normalizeProgressEvent({ submissionId, stepIndex: 6, occurredAt: nextAt, updatedAt: new Date().toISOString() })
  ].forEach((progressEvent) => {
    repairProgressEvents = repairProgressEvents.filter((item) => !(
      item.submissionId === progressEvent.submissionId && item.stepIndex === progressEvent.stepIndex
    ));
    repairProgressEvents.push(progressEvent);
  });
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

function fillFinalStatusSelect(select, includeAll = false) {
  select.replaceChildren();
  if (includeAll) select.append(new Option("全部", ""));
  optionSets.finalStatus.forEach((value) => select.append(new Option(displayFinalStatus(value), value)));
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
  fillFinalStatusSelect(els.statusFilter, true);
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
  fillFinalStatusSelect(els.recordForm.elements.finalStatus);
  fillRequiredSelect(els.recordForm.elements.faultOwnership, optionSets.faultOwnership);
  fillFaultCategoryPicker();
  fillAccessoryPartsPicker();
  fillAddressSelects();
}

function fillAddressSelects() {
  const form = els.customerForm.elements;
  if (!form.addressProvince || !form.addressCity || !form.addressDistrict || !form.addressStreet) return;
  fillRequiredSelect(form.addressProvince, []);
  fillRequiredSelect(form.addressCity, []);
  fillRequiredSelect(form.addressDistrict, []);
  fillRequiredSelect(form.addressStreet, []);
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
  const province = form.addressProvince.value ? selectedOptionText(form.addressProvince) : "";
  const city = form.addressCity.value ? selectedOptionText(form.addressCity) : "";
  const district = form.addressDistrict.value ? selectedOptionText(form.addressDistrict) : "";
  const street = form.addressStreet.value ? selectedOptionText(form.addressStreet) : "";
  setAreaButton("province", province || "请选择省", !province);
  setAreaButton("city", city || (form.addressProvince.value ? "请选择市" : "请先选择省"), !city);
  setAreaButton("district", district || (form.addressCity.value ? "请选择区 / 县" : "请先选择市"), !district);
  setAreaButton("street", street || (form.addressDistrict.value ? "请选择街道" : "请先选择区 / 县"), !street);
}

function getStreetItems(districtCode) {
  const items = window.CHINA_STREET_DATA?.[districtCode] || {};
  if (Object.keys(items).length || !districtCode) return items;
  return { __other__: "其他 / 未列出" };
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
  if (level === "district") {
    return {
      title: "选择区 / 县",
      select: form.addressDistrict,
      items: areaData?.[form.addressCity.value] || {},
      emptyText: form.addressCity.value ? "暂无区县数据" : "请先选择市"
    };
  }
  return {
    title: "选择街道",
    select: form.addressStreet,
    items: getStreetItems(form.addressDistrict.value),
    emptyText: form.addressDistrict.value ? "暂无街道数据" : "请先选择区 / 县"
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
  if (level === "district") updateAddressStreets();
  if (level === "street") syncAreaButtons();
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
    fillAreaSelect(form.addressStreet, {}, "请先选择区 / 县");
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
  fillAreaSelect(form.addressStreet, {}, "请先选择区 / 县");
  syncAreaButtons();
}

function updateAddressDistricts() {
  const form = els.customerForm.elements;
  const cityCode = form.addressCity.value;
  fillAreaSelect(form.addressDistrict, areaData?.[cityCode], cityCode ? "请选择区 / 县" : "请先选择市");
  fillAreaSelect(form.addressStreet, {}, "请先选择区 / 县");
  syncAreaButtons();
}

function updateAddressStreets() {
  const form = els.customerForm.elements;
  const districtCode = form.addressDistrict.value;
  fillAreaSelect(form.addressStreet, getStreetItems(districtCode), districtCode ? "请选择街道" : "请先选择区 / 县");
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
  const street = selectedOptionText(form.addressStreet);
  const detail = String(form.addressDetail.value || "").trim();
  return [province, city, district, street, detail].filter(Boolean).join("");
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
  form.addressStreet.value = "";
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
    updateAddressStreets();
  }
  const streetItems = getStreetItems(districtCode);
  const streetCode = findAreaCodeByName(streetItems, rest);
  if (streetCode) {
    const streetName = streetItems[streetCode] || "";
    form.addressStreet.value = streetCode;
    rest = rest.slice(streetName.length);
  }
  form.addressDetail.value = rest;
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
  return CUSTOMER_REGISTER_URL;
}

function updateCustomerQrCode() {
  const url = getCustomerRegisterUrl();
  els.customerQrImage.src = "https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=" + encodeURIComponent(url);
}

function getLastCustomerSubmission() {
  try {
    const raw = localStorage.getItem(LAST_CUSTOMER_SUBMISSION_KEY);
    if (!raw) return null;
    const cachedSubmission = normalizeCustomerSubmission(JSON.parse(raw));
    const cloudSubmission = customerSubmissions.find((item) => item.id === cachedSubmission.id);
    return cloudSubmission
      ? {
          ...cachedSubmission,
          submissionNumber: cloudSubmission.submissionNumber,
          progressEnabled: cloudSubmission.progressEnabled
        }
      : cachedSubmission;
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

function isCustomerProgressEnabled(submission) {
  if (!submission) return false;
  if (typeof submission.progressEnabled === "boolean") return submission.progressEnabled;
  if (cloudMode) return false;
  return !getCustomerSubmissionRepairRecord(submission);
}

function updateCustomerProgressButton() {
  if (!els.viewCustomerProgressBtn) return;
  const enabled = isCustomerProgressEnabled(getLastCustomerSubmission());
  els.viewCustomerProgressBtn.hidden = !enabled;
  if (!enabled && els.customerProgressPage && !els.customerProgressPage.hidden) {
    els.customerProgressPage.hidden = true;
    document.body.classList.remove("customer-progress-open");
  }
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
  updateCustomerProgressButton();
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
      <div><dt>登记编号</dt><dd>${compact(formatSubmissionId(lastSubmission))}</dd></div>
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

function formatCustomerProgressTime(value) {
  const timestamp = parseRecordTime(value);
  if (!timestamp) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(new Date(timestamp));
}

function getLegacyCustomerProgressPosition(record) {
  if (!record) return { completedThrough: 0, currentIndex: 1 };

  const positions = {
    测试中: { completedThrough: 2, currentIndex: 3 },
    返厂中: { completedThrough: 2, currentIndex: 3 },
    已修未付费: { completedThrough: 3, currentIndex: 4 },
    维修中: { completedThrough: 5, currentIndex: 6 },
    今天需要寄: { completedThrough: 6, currentIndex: 7 },
    已寄出: { completedThrough: 8, currentIndex: 8 },
    邮寄并结束: { completedThrough: 8, currentIndex: 8 }
  };

  return positions[record.finalStatus] || { completedThrough: 2, currentIndex: 3 };
}

function getStoredProgressEvents(submissionId) {
  return repairProgressEvents
    .filter((item) => item.submissionId === submissionId && item.stepIndex >= 0 && item.stepIndex < CUSTOMER_PROGRESS_STEPS.length)
    .sort((a, b) => a.stepIndex - b.stepIndex);
}

function getEffectiveProgressEvents(submission) {
  if (!submission) return [];
  const stored = getStoredProgressEvents(submission.id);
  const byStep = new Map(stored.map((item) => [item.stepIndex, item]));
  const submittedAt = submission.createdTime || new Date().toISOString();
  [0, 1].forEach((stepIndex) => {
    if (!byStep.has(stepIndex)) {
      byStep.set(stepIndex, normalizeProgressEvent({
        submissionId: submission.id,
        stepIndex,
        occurredAt: submittedAt,
        updatedAt: submittedAt
      }));
    }
  });
  const hasNoRepairEvent = Array.from(byStep.values()).some(isNoRepairProgressEvent);
  const repairHasStarted = Array.from(byStep.values()).some((item) => (
    [6, 7].includes(item.stepIndex) && !isNoRepairProgressEvent(item)
  ));
  if (hasNoRepairRequestMark(submission) && !hasNoRepairEvent && !repairHasStarted) {
    const occurredAt = submission.updatedAt || new Date().toISOString();
    [5, 6, 7].forEach((stepIndex) => {
      byStep.set(stepIndex, normalizeProgressEvent({
        submissionId: submission.id,
        stepIndex,
        occurredAt,
        detailText: stepIndex === 5 ? NO_REPAIR_CUSTOMER_PROGRESS_MARK : NO_REPAIR_PROGRESS_MARK,
        updatedAt: occurredAt
      }));
    });
  }
  return Array.from(byStep.values()).sort((a, b) => a.stepIndex - b.stepIndex);
}

function getCustomerProgressState(submission, record) {
  const events = getEffectiveProgressEvents(submission);
  const resetToWaiting = events.some((item) => (
    item.stepIndex === 1 && item.detailText === WAITING_RECEIPT_RESET_MARK
  ));
  const explicitProgress = resetToWaiting || events.some((item) => item.stepIndex >= 2);
  if (!explicitProgress) {
    return { ...getLegacyCustomerProgressPosition(record), events, explicitProgress: false };
  }

  const latestIndex = Math.max(...events.map((item) => item.stepIndex));
  return {
    completedThrough: latestIndex === CUSTOMER_PROGRESS_STEPS.length - 1 ? latestIndex : latestIndex - 1,
    currentIndex: latestIndex,
    events,
    explicitProgress: true
  };
}

function getCustomerProgressNote(index, submission, record, progressState) {
  const progressEvent = progressState?.events?.find((item) => item.stepIndex === index);
  if (isNoRepairProgressEvent(progressEvent)) {
    if (index === 5) return "无需付款";
    if (index === 6) return "无需维修";
    if (index === 7) return "设备正在打包发货";
  }
  if (index === 4 && progressEvent?.detailText) {
    return parseProgressDetectionDetail(progressEvent.detailText).detailText;
  }
  const notes = [
    "工单已提交成功",
    submission?.trackingNumber ? `用户寄出单号：${submission.trackingNumber}` : "等待机器送达维修中心",
    "服务中心已收到快递，等待拆包检测",
    "维修人员正在检测打印机",
    "检测结果已确认，维修人员会与您联系",
    "维修费用已确认",
    "机器正在维修处理中",
    "设备正在打包发货",
    record?.returnTrackingNumber ? `寄回单号：${record.returnTrackingNumber}` : "机器已寄回"
  ];
  return notes[index] || "";
}

function getCustomerProgressTime(index, submission, record, progressState) {
  const event = progressState?.events?.find((item) => item.stepIndex === index);
  if (event?.occurredAt) return event.occurredAt;
  if (progressState?.explicitProgress) return "";
  if (index <= 1) return submission?.createdTime || "";
  if (!record) return "";
  if (index <= 3) return record.createdTime || record.updatedAt || "";
  if (index >= 7) return record.returnTime || record.updatedAt || "";
  return record.updatedAt || record.createdTime || "";
}

function renderCustomerProgressAccessories(submission, detectionDetail) {
  const selectedParts = normalizeProgressAccessoryParts(detectionDetail?.accessoryParts)
    .filter((part) => !PROGRESS_HIDDEN_ACCESSORY_PARTS.has(part));
  if (selectedParts.length === 0) return "";
  const pricingRecord = getProgressAccessoryPricingRecord(
    submission,
    null,
    detectionDetail?.customPartPrice || ""
  );
  const priceSummary = getAccessorySelectionPrice(pricingRecord, selectedParts);
  return `
    <div class="customer-progress-accessories">
      <strong class="customer-progress-accessories-title">配件使用清单</strong>
      <ul>
        ${selectedParts.map((part) => {
          const amount = getRecordAccessoryPartAmount(pricingRecord, part);
          const partName = part === PROGRESS_CUSTOM_ACCESSORY_PART
            ? detectionDetail?.customPartName || PROGRESS_CUSTOM_ACCESSORY_PART
            : part;
          return `<li><span>${escapeHtml(partName)}</span><strong>${amount.hasAmount ? escapeHtml(formatRepairFee(amount.amount)) : "待定"}</strong></li>`;
        }).join("")}
      </ul>
      <p><span>合计</span><strong>${escapeHtml(priceSummary.text)}</strong></p>
    </div>
  `;
}

function renderCustomerProgress(submission, record, options = {}) {
  const summaryElement = options.summaryElement || els.customerProgressSummary;
  const timelineElement = options.timelineElement || els.customerProgressTimeline;
  const pageElement = options.pageElement || els.customerProgressPage;
  const readonly = Boolean(options.readonly);
  if (!submission || !summaryElement || !timelineElement) return;
  const position = getCustomerProgressState(submission, record);
  const currentStatus = CUSTOMER_PROGRESS_STEPS[position.currentIndex];
  summaryElement.innerHTML = `
    <div>
      <span>登记编号 ${escapeHtml(formatSubmissionId(submission))} · 打印机编号</span>
      <strong>${compact(submission.deviceNumber)}</strong>
    </div>
    <small>${escapeHtml(submission.model || "型号未知")}</small>
  `;
  timelineElement.innerHTML = CUSTOMER_PROGRESS_STEPS.map((label, index) => {
    const isComplete = index <= position.completedThrough;
    const isCurrent = index === position.currentIndex && position.completedThrough < index;
    const stateClass = isComplete ? "is-complete" : isCurrent ? "is-current" : "is-pending";
    const progressEvent = position.events.find((item) => item.stepIndex === index);
    const isSkippedForNoRepair = [5, 6].includes(index) && isNoRepairProgressEvent(progressEvent);
    const statusLabel = isSkippedForNoRepair
      ? `<span class="customer-progress-current-label is-skipped">已跳过</span>`
      : isCurrent
        ? `<span class="customer-progress-current-label">当前进度</span>`
        : "";
    const time = isComplete || isCurrent ? formatCustomerProgressTime(getCustomerProgressTime(index, submission, record, position)) : "";
    const note = isComplete || isCurrent ? getCustomerProgressNote(index, submission, record, position) : "";
    const detectionEvent = index === 4
      ? position.events.find((item) => item.stepIndex === index)
      : null;
    const warrantyType = isComplete || isCurrent
      ? parseProgressDetectionDetail(detectionEvent?.detailText || "").warrantyType
      : "";
    const detectionDetail = parseProgressDetectionDetail(detectionEvent?.detailText || "");
    const accessoryUsage = index === 4 && (isComplete || isCurrent)
      ? renderCustomerProgressAccessories(submission, detectionDetail)
      : "";
    const repairSuggestion = index === 4 && (isComplete || isCurrent) && detectionDetail.repairSuggestion
      ? `<p class="customer-progress-repair-suggestion"><strong>维修建议：</strong>${escapeHtml(detectionDetail.repairSuggestion)}</p>`
      : "";
    const canConfirmPayment = index === 5
      && position.explicitProgress
      && position.events.some((item) => item.stepIndex === 4)
      && !position.events.some((item) => item.stepIndex === 6);
    const paymentConfirm = canConfirmPayment && !readonly
      ? `<p class="customer-payment-guide">
          <span>若无异议，请在「管理端-更多-商城」里支付维修费用</span>
          <span>有异议可返回页面「扫码添加微信」咨询</span>
        </p>
        <div class="customer-payment-actions">
          <button class="customer-payment-confirm" type="button" data-customer-payment-confirm>确认已支付</button>
          <button class="customer-no-repair" type="button" data-customer-no-repair>无需维修</button>
        </div>`
      : "";
    return `
      <li class="customer-progress-step ${stateClass}">
        <span class="customer-progress-marker" aria-hidden="true"></span>
        <h3>${escapeHtml(label)}${statusLabel}</h3>
        ${time ? `<p class="customer-progress-time">${escapeHtml(time)}</p>` : ""}
        ${warrantyType ? `<p class="customer-progress-warranty">保修期状态：<strong>${escapeHtml(warrantyType)}</strong></p>` : ""}
        ${note ? `<p class="customer-progress-note">${escapeHtml(note)}</p>` : ""}
        ${accessoryUsage}
        ${repairSuggestion}
        ${paymentConfirm}
      </li>
    `;
  }).join("");
  pageElement?.setAttribute("data-current-status", currentStatus);
}

async function confirmCustomerPayment(button) {
  const submission = getLastCustomerSubmission();
  if (!submission) return;
  button.disabled = true;
  const confirmedAt = new Date().toISOString();
  try {
    const result = cloudMode
      ? await requestPaymentConfirmation(submission.id)
      : {};
    applyPaymentConfirmationLocally(submission.id, result, confirmedAt);
    if (cloudMode) {
      await loadCloudProgressEvents();
    } else {
      saveRepairProgressEvents();
    }
    renderTable();
    renderCustomerProgress(submission, getCustomerSubmissionRepairRecord(submission));
    showToast("付款已确认，已进入维修中");
  } catch (error) {
    console.error(error);
    button.disabled = false;
    showToast("付款确认失败，请检查网络后重试");
  }
}

async function skipRepairFromCustomerProgress(button) {
  let submission = getLastCustomerSubmission();
  if (!submission) return;
  button.disabled = true;
  const skippedAt = new Date().toISOString();
  const originalSubmission = submission;
  try {
    submission = normalizeCustomerSubmission({
      ...submission,
      customerIssue: addNoRepairRequestMark(submission.customerIssue),
      updatedAt: skippedAt
    });
    if (cloudMode) submission = await saveCustomerSubmissionReliably(submission);
    customerSubmissions = customerSubmissions.map((item) => item.id === submission.id ? submission : item);
    saveLastCustomerSubmission(submission);

    let result = {};
    let requestError = null;
    if (cloudMode) {
      try {
        result = await requestNoRepair(submission.id);
      } catch (error) {
        requestError = error;
      }
    }
    applyNoRepairLocally(submission.id, result, skippedAt);
    if (cloudMode) {
      await loadCloudProgressEvents(true);
      const repairHasStarted = getStoredProgressEvents(submission.id).some((item) => (
        [6, 7].includes(item.stepIndex) && !isNoRepairProgressEvent(item)
      ));
      if (requestError && repairHasStarted) {
        submission = await saveCustomerSubmissionReliably(normalizeCustomerSubmission({
          ...originalSubmission,
          updatedAt: new Date().toISOString()
        }));
        customerSubmissions = customerSubmissions.map((item) => item.id === submission.id ? submission : item);
        saveLastCustomerSubmission(submission);
        throw requestError;
      }
    } else {
      saveRepairProgressEvents();
    }
    renderTable();
    renderCustomerProgress(submission, getCustomerSubmissionRepairRecord(submission));
    showToast("已选择无需维修，等待安排发货");
  } catch (error) {
    console.error(error);
    button.disabled = false;
    showToast("无需维修保存失败，请检查网络后重试");
  }
}

function openCustomerProgress() {
  const submission = getLastCustomerSubmission();
  if (!submission) {
    showToast("请先提交维修登记");
    return;
  }
  if (!isCustomerProgressEnabled(submission)) return;
  const record = getCustomerSubmissionRepairRecord(submission);
  renderCustomerProgress(submission, record);
  els.customerProgressLoading.hidden = true;
  els.customerProgressPage.hidden = false;
  document.body.classList.add("customer-progress-open");
  els.closeCustomerProgressBtn.focus();
}

function closeCustomerProgress() {
  els.customerProgressPage.hidden = true;
  document.body.classList.remove("customer-progress-open");
  if (!els.viewCustomerProgressBtn.hidden) els.viewCustomerProgressBtn.focus();
}

function openCustomerProgressPreview() {
  const submissionId = String(els.recordForm.elements.submissionId?.value || appliedSubmissionId || "").trim();
  const submission = customerSubmissions.find((item) => item.id === submissionId);
  if (!submission) {
    showToast("请先关联客户登记 B 编号");
    return;
  }
  renderCustomerProgress(submission, getCustomerSubmissionRepairRecord(submission), {
    summaryElement: els.customerProgressPreviewSummary,
    timelineElement: els.customerProgressPreviewTimeline,
    pageElement: els.customerProgressPreviewDialog,
    readonly: true
  });
  if (!els.customerProgressPreviewDialog.open) els.customerProgressPreviewDialog.showModal();
  els.closeCustomerProgressPreviewBtn.focus();
}

function closeCustomerProgressPreview() {
  if (els.customerProgressPreviewDialog.open) els.customerProgressPreviewDialog.close();
}

function openProgressManageDialog(submissionId) {
  if (cloudMode && !adminMode) {
    showToast("请先管理员登录");
    return;
  }
  const submission = customerSubmissions.find((item) => item.id === submissionId);
  if (!submission) {
    showToast("没有找到这条客户登记");
    return;
  }
  confirmingProgressUndoStep = -1;
  managingProgressSubmissionId = submission.id;
  renderProgressManageDialog();
  els.progressManageDialog.showModal();
  startProgressManageAutoRefresh();
}

function openProgressManageDialogForRecord(recordId) {
  const record = records.find((item) => item.id === recordId);
  if (!record?.submissionId) {
    showToast("请先给这条维修记录关联 B 编号");
    return;
  }
  openProgressManageDialog(record.submissionId);
}

function closeProgressManageDialog() {
  stopProgressManageAutoRefresh();
  confirmingProgressUndoStep = -1;
  managingProgressSubmissionId = "";
  els.progressManageDialog.close();
}

async function refreshOpenProgressManageDialog() {
  if (
    progressManageRefreshRunning
    || !cloudMode
    || !supabaseClient
    || !managingProgressSubmissionId
    || !els.progressManageDialog.open
    || document.hidden
  ) return;
  progressManageRefreshRunning = true;
  try {
    const submissionId = managingProgressSubmissionId;
    const { data, error } = await supabaseClient
      .from("repair_progress_events")
      .select("*")
      .eq("submission_id", submissionId)
      .order("step_index", { ascending: true });
    if (error) throw error;
    const incomingEvents = data.map(fromDatabaseProgressEvent);
    const currentEvents = getStoredProgressEvents(submissionId);
    const eventsChanged = incomingEvents.length !== currentEvents.length
      || incomingEvents.some((item, index) => !progressEventsMatch(item, currentEvents[index] || {}));
    if (!eventsChanged || managingProgressSubmissionId !== submissionId || !els.progressManageDialog.open) return;

    repairProgressEvents = repairProgressEvents.filter((item) => item.submissionId !== submissionId);
    repairProgressEvents.push(...incomingEvents);
    renderTable();
    renderProgressManageDialog();
  } catch (error) {
    console.error("进度自动刷新失败", error);
  } finally {
    progressManageRefreshRunning = false;
  }
}

function startProgressManageAutoRefresh() {
  stopProgressManageAutoRefresh();
  if (!cloudMode || !supabaseClient) return;
  refreshOpenProgressManageDialog();
  progressManageRefreshTimer = window.setInterval(refreshOpenProgressManageDialog, 3000);
}

function stopProgressManageAutoRefresh() {
  if (progressManageRefreshTimer) window.clearInterval(progressManageRefreshTimer);
  progressManageRefreshTimer = null;
  progressManageRefreshRunning = false;
}

function renderProgressAccessoryEditor(submission, detectionDetail, stepIndex, canEdit) {
  const model = submission?.model || "";
  const allowedParts = getProgressAccessoryPartsForModel(model);
  const selectedParts = normalizeProgressAccessoryParts(detectionDetail?.accessoryParts)
    .filter((part) => allowedParts.includes(part));
  const selectedSet = new Set(selectedParts);
  const customPartName = detectionDetail?.customPartName || PROGRESS_CUSTOM_ACCESSORY_PART;
  const customPartPrice = normalizeMoneyValue(detectionDetail?.customPartPrice);
  const pricingRecord = getProgressAccessoryPricingRecord(submission, null, customPartPrice);
  const priceSummary = getAccessorySelectionPrice(pricingRecord, selectedParts);
  return `
    <div class="progress-accessory-field" data-progress-accessory-field="${stepIndex}">
      <div class="progress-accessory-heading">
        <strong>配件使用清单</strong>
        <span>${escapeHtml(model || "型号未知")}</span>
      </div>
      <fieldset ${canEdit ? "" : "disabled"} aria-label="配件使用清单">
        <input type="hidden" value="${escapeHtml(customPartPrice)}" data-progress-custom-part-price="${stepIndex}">
        <div class="progress-accessory-options">
          ${allowedParts.map((part) => {
            const amount = getRecordAccessoryPartAmount(pricingRecord, part);
            return `
              <label class="progress-accessory-option ${selectedSet.has(part) ? "is-selected" : ""}">
                <input type="checkbox" value="${escapeHtml(part)}" data-progress-accessory="${stepIndex}" ${selectedSet.has(part) ? "checked" : ""}>
                ${part === PROGRESS_CUSTOM_ACCESSORY_PART
                  ? `<span class="progress-custom-accessory-name" data-progress-custom-part-name="${stepIndex}" title="双击修改名称">${escapeHtml(customPartName)}</span>`
                  : `<span>${escapeHtml(part)}</span>`}
                <strong data-progress-accessory-price="${escapeHtml(part)}">${amount.hasAmount ? escapeHtml(formatRepairFee(amount.amount)) : "待定"}</strong>
              </label>
            `;
          }).join("")}
        </div>
      </fieldset>
      <div class="progress-accessory-total">
        <span>合计</span>
        <strong data-progress-accessory-total="${stepIndex}">${escapeHtml(priceSummary.text)}</strong>
      </div>
      <label class="progress-repair-suggestion-field">
        <span>维修建议：</span>
        <input type="text" maxlength="200" value="${escapeHtml(detectionDetail?.repairSuggestion || "")}" data-progress-repair-suggestion="${stepIndex}" placeholder="例如：建议更换主板后进行打印测试" ${canEdit ? "" : "disabled"}>
      </label>
    </div>
  `;
}

function updateProgressAccessoryEditor(stepIndex) {
  const submission = customerSubmissions.find((item) => item.id === managingProgressSubmissionId);
  const field = els.progressManageList.querySelector(`[data-progress-accessory-field="${stepIndex}"]`);
  if (!submission || !field) return;
  const accessoryInputs = [...field.querySelectorAll(`[data-progress-accessory="${stepIndex}"]`)];
  const selectedParts = accessoryInputs.filter((input) => input.checked).map((input) => input.value);
  accessoryInputs.forEach((input) => input.closest("label")?.classList.toggle("is-selected", input.checked));

  const pricingRecord = getProgressAccessoryPricingRecord(submission, null, getProgressCustomPartPrice(stepIndex));
  field.querySelectorAll("[data-progress-accessory-price]").forEach((priceNode) => {
    const part = priceNode.dataset.progressAccessoryPrice || "";
    const amount = getRecordAccessoryPartAmount(pricingRecord, part);
    priceNode.textContent = amount.hasAmount ? formatRepairFee(amount.amount) : "待定";
  });
  const totalNode = field.querySelector(`[data-progress-accessory-total="${stepIndex}"]`);
  if (totalNode) totalNode.textContent = getAccessorySelectionPrice(pricingRecord, selectedParts).text;
}

function startProgressCustomPartNameEdit(label) {
  if (!label || label.closest("fieldset")?.disabled) return;
  const checkbox = label.closest(".progress-accessory-option")?.querySelector("input[data-progress-accessory]");
  if (checkbox && !checkbox.checked) {
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event("change", { bubbles: true }));
  }
  label.dataset.originalValue = normalizeProgressCustomPartName(label.textContent) || PROGRESS_CUSTOM_ACCESSORY_PART;
  label.contentEditable = "true";
  label.classList.add("is-editing");
  label.focus();
  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(label);
  selection.removeAllRanges();
  selection.addRange(range);
}

function finishProgressCustomPartNameEdit(label, restoreOriginal = false) {
  if (!label) return;
  const originalValue = label.dataset.originalValue || PROGRESS_CUSTOM_ACCESSORY_PART;
  const nextValue = restoreOriginal
    ? originalValue
    : normalizeProgressCustomPartName(label.textContent) || PROGRESS_CUSTOM_ACCESSORY_PART;
  label.textContent = nextValue;
  label.contentEditable = "false";
  label.classList.remove("is-editing");
  delete label.dataset.originalValue;
  if (!restoreOriginal) openProgressCustomPartPriceDialog(Number(label.dataset.progressCustomPartName));
}

function openProgressCustomPartPriceDialog(stepIndex) {
  const field = els.progressManageList.querySelector(`[data-progress-accessory-field="${stepIndex}"]`);
  const checkbox = field?.querySelector(`input[data-progress-accessory="${stepIndex}"][value="${PROGRESS_CUSTOM_ACCESSORY_PART}"]`);
  if (!field || !checkbox || field.querySelector("fieldset")?.disabled) return;
  if (!checkbox.checked) {
    checkbox.checked = true;
    updateProgressAccessoryEditor(stepIndex);
  }
  editingProgressCustomPartStep = stepIndex;
  els.progressCustomPartPriceInput.value = getProgressCustomPartPrice(stepIndex);
  if (!els.progressCustomPartPriceDialog.open) els.progressCustomPartPriceDialog.showModal();
  setTimeout(() => {
    els.progressCustomPartPriceInput.focus();
    els.progressCustomPartPriceInput.select();
  }, 0);
}

function closeProgressCustomPartPriceDialog() {
  editingProgressCustomPartStep = -1;
  if (els.progressCustomPartPriceDialog.open) els.progressCustomPartPriceDialog.close();
}

function saveProgressCustomPartPriceFromDialog() {
  const price = normalizeMoneyValue(els.progressCustomPartPriceInput.value);
  if (!price && price !== "0") {
    showToast("请输入自定义配件金额");
    els.progressCustomPartPriceInput.focus();
    return false;
  }
  const stepIndex = editingProgressCustomPartStep;
  const input = els.progressManageList.querySelector(`[data-progress-custom-part-price="${stepIndex}"]`);
  if (input) input.value = price;
  updateProgressAccessoryEditor(stepIndex);
  closeProgressCustomPartPriceDialog();
  return true;
}

function renderProgressResultPresetOptions(stepIndex) {
  if (progressResultPresets.length === 0) {
    return `<p class="progress-result-preset-empty">还没有常用文案，可以在下方添加。</p>`;
  }
  return progressResultPresets.map((preset, index) => `
    <div class="progress-result-preset-item" role="listitem">
      <button type="button" class="progress-result-preset-option" data-progress-result-preset-index="${index}" data-step-index="${stepIndex}" title="填入这条文案">${escapeHtml(preset)}</button>
      <button type="button" class="progress-result-preset-delete" data-progress-result-preset-delete="${index}" data-step-index="${stepIndex}" aria-label="删除这条常用文案" title="删除这条常用文案">×</button>
    </div>
  `).join("");
}

function refreshProgressResultPresetOptions(stepIndex) {
  const list = els.progressManageList.querySelector(`[data-progress-result-preset-list="${stepIndex}"]`);
  if (list) list.innerHTML = renderProgressResultPresetOptions(stepIndex);
}

function hideProgressResultPresetMenus() {
  els.progressManageList.querySelectorAll("[data-progress-result-presets]").forEach((menu) => {
    menu.hidden = true;
  });
  els.progressManageList.querySelectorAll("[data-progress-result-presets-toggle]").forEach((button) => {
    button.setAttribute("aria-expanded", "false");
  });
}

function toggleProgressResultPresetMenu(stepIndex) {
  const menu = els.progressManageList.querySelector(`[data-progress-result-presets="${stepIndex}"]`);
  const button = els.progressManageList.querySelector(`[data-progress-result-presets-toggle="${stepIndex}"]`);
  if (!menu || !button || button.disabled) return;
  const shouldOpen = menu.hidden;
  hideProgressResultPresetMenus();
  menu.hidden = !shouldOpen;
  button.setAttribute("aria-expanded", String(shouldOpen));
  if (shouldOpen) {
    const firstControl = menu.querySelector(".progress-result-preset-option, [data-progress-result-preset-input]");
    setTimeout(() => firstControl?.focus(), 0);
  }
}

function fillProgressResultFromPreset(stepIndex, presetIndex) {
  const detailInput = els.progressManageList.querySelector(`[data-progress-detail="${stepIndex}"]`);
  const preset = progressResultPresets[presetIndex];
  if (!detailInput || detailInput.disabled || !preset) return;
  detailInput.value = preset;
  detailInput.dispatchEvent(new Event("input", { bubbles: true }));
  hideProgressResultPresetMenus();
  detailInput.focus();
  showToast("常用文案已填入");
}

function addProgressResultPreset(stepIndex) {
  const input = els.progressManageList.querySelector(`[data-progress-result-preset-input="${stepIndex}"]`);
  const preset = normalizeProgressResultPreset(input?.value);
  if (!input || !preset) {
    showToast("请先输入要添加的文案");
    input?.focus();
    return;
  }
  if (progressResultPresets.includes(preset)) {
    showToast("这条文案已经在列表里了");
    input.focus();
    return;
  }
  progressResultPresets.push(preset);
  saveProgressResultPresets();
  input.value = "";
  refreshProgressResultPresetOptions(stepIndex);
  showToast("常用文案已添加");
}

function deleteProgressResultPreset(stepIndex, presetIndex) {
  if (!progressResultPresets[presetIndex]) return;
  progressResultPresets.splice(presetIndex, 1);
  saveProgressResultPresets();
  refreshProgressResultPresetOptions(stepIndex);
  showToast("常用文案已删除");
}

function renderProgressManageDialog() {
  const submission = customerSubmissions.find((item) => item.id === managingProgressSubmissionId);
  if (!submission) return;
  const record = getCustomerSubmissionRepairRecord(submission);
  const events = getEffectiveProgressEvents(submission);
  const eventByStep = new Map(events.map((item) => [item.stepIndex, item]));
  const latestIndex = Math.max(...events.map((item) => item.stepIndex));
  const nextIndex = latestIndex < CUSTOMER_PROGRESS_STEPS.length - 1 ? latestIndex + 1 : -1;
  const currentLabel = CUSTOMER_PROGRESS_STEPS[latestIndex] || CUSTOMER_PROGRESS_STEPS[1];

  els.progressManageSummary.innerHTML = `
    <div>
      <span>${escapeHtml(formatSubmissionId(submission))}${record ? ` · 关联 ${escapeHtml(formatRepairRecordId(record))}` : " · 暂未生成维修记录"}</span>
      <strong>${compact(submission.deviceNumber)} · ${compact(submission.model)}</strong>
    </div>
    <div class="progress-manage-current">
      <span>当前进度</span>
      <strong>${escapeHtml(currentLabel)}</strong>
    </div>
  `;

  els.progressManageList.innerHTML = CUSTOMER_PROGRESS_STEPS.map((label, stepIndex) => {
    const event = eventByStep.get(stepIndex);
    const isSystemStep = stepIndex <= 1;
    const isNext = stepIndex === nextIndex;
    const isCurrent = Boolean(event) && stepIndex === latestIndex && latestIndex < CUSTOMER_PROGRESS_STEPS.length - 1;
    const isSkippedForNoRepair = [5, 6].includes(stepIndex) && isNoRepairProgressEvent(event);
    const stateClass = isCurrent ? "is-current" : event ? "is-recorded" : isNext ? "is-next" : "is-pending";
    const paymentStatusText = stepIndex === 5 ? getAdminPaymentProgressStatus(event) : "";
    const statusText = paymentStatusText || (isSkippedForNoRepair
      ? "已跳过"
      : isCurrent
        ? "当前进度"
        : event
          ? (isSystemStep ? "系统记录" : "已完成")
          : isNext
            ? "下一步"
            : "未开始");
    const inputValue = event?.occurredAt
      ? toInputDateTimeSeconds(event.occurredAt)
      : isNext
        ? toInputDateTimeSeconds(new Date())
        : "";
    const isPaymentConfirmation = stepIndex === 5 && (event || isNext) && latestIndex <= 5;
    const operationText = getAdminProgressOperationText(stepIndex, event);
    const operationRecordClass = isNoRepairProgressEvent(event) ? " is-no-repair" : "";
    const detectionDetail = parseProgressDetectionDetail(event?.detailText || "");
    const canEditDetectionResult = isCurrent || isNext;
    const detailField = stepIndex === 4
      ? `<div class="progress-result-fields">
          <fieldset class="progress-warranty-options" ${canEditDetectionResult ? "" : "disabled"}>
            <legend class="sr-only">保修期状态</legend>
            <div>
              <span class="progress-warranty-label" aria-hidden="true">保修期状态：</span>
              ${PROGRESS_WARRANTY_OPTIONS.map((option) => `
                <label class="${detectionDetail.warrantyType === option ? "is-selected" : ""} ${option === "已过保" ? "is-expired" : ""}">
                  <span>${option}</span>
                  <input type="checkbox" value="${option}" data-progress-warranty="${stepIndex}" ${detectionDetail.warrantyType === option ? "checked" : ""}>
                </label>
              `).join("")}
            </div>
          </fieldset>
          <div class="progress-result-field">
            <span id="progress-result-label-${stepIndex}">发送给客户的检测结果</span>
            <div class="progress-result-editor">
              <textarea rows="3" data-progress-detail="${stepIndex}" aria-labelledby="progress-result-label-${stepIndex}" placeholder="例如：检测到打印头损坏，需要更换后测试" ${canEditDetectionResult ? "" : "disabled"}>${escapeHtml(detectionDetail.detailText)}</textarea>
              <button class="progress-result-presets-toggle" type="button" data-progress-result-presets-toggle="${stepIndex}" aria-label="打开常用文案" title="打开常用文案" aria-expanded="false" aria-controls="progress-result-presets-${stepIndex}" ${canEditDetectionResult ? "" : "disabled"}>⌄</button>
            </div>
            <div class="progress-result-presets" id="progress-result-presets-${stepIndex}" data-progress-result-presets="${stepIndex}" hidden>
              <div class="progress-result-preset-list" data-progress-result-preset-list="${stepIndex}" role="list" aria-label="常用检测结果文案">
                ${renderProgressResultPresetOptions(stepIndex)}
              </div>
              <div class="progress-result-preset-add">
                <textarea rows="2" maxlength="500" data-progress-result-preset-input="${stepIndex}" placeholder="输入新的常用文案"></textarea>
                <button class="secondary" type="button" data-progress-result-preset-add="${stepIndex}">添加文案</button>
              </div>
            </div>
          </div>
          ${renderProgressAccessoryEditor(submission, detectionDetail, stepIndex, canEditDetectionResult)}
        </div>`
      : "";
    const returnTrackingField = stepIndex === 8 && (event || isNext)
      ? `<label class="progress-return-tracking-field">
          <span>寄回快递单号 <b>*</b></span>
          <input type="text" value="${escapeHtml(record?.returnTrackingNumber || "")}" data-progress-return-tracking="${stepIndex}" placeholder="请输入寄回快递单号" ${event ? "disabled" : ""}>
        </label>`
      : "";
    const undoControls = confirmingProgressUndoStep === stepIndex
      ? `<button class="danger" type="button" data-progress-action="confirm-undo" data-step-index="${stepIndex}">确认撤销</button>
         <button class="secondary" type="button" data-progress-action="cancel-undo" data-step-index="${stepIndex}">取消</button>`
      : `<button class="danger" type="button" data-progress-action="undo" data-step-index="${stepIndex}">${stepIndex === 7 && isNoRepairProgressEvent(event) ? "撤销无需维修" : stepIndex === 5 ? "撤销付款" : "撤销此步"}</button>`;
    const controls = isSystemStep
      ? `<span class="progress-manage-system">提交时自动保存</span>`
      : isPaymentConfirmation
        ? `<button class="primary" type="button" data-progress-action="confirm-payment" data-step-index="${stepIndex}">确认已付款并进入维修</button>
          ${!event && isNext ? `<button class="progress-no-repair-button" type="button" data-progress-action="no-repair" data-step-index="${stepIndex}">无需维修</button>` : ""}
          ${event && stepIndex === latestIndex ? undoControls : ""}`
      : isCurrent
        ? `${stepIndex === 4 ? `<button class="secondary" type="button" data-progress-action="save" data-step-index="${stepIndex}">保存并发送</button>` : ""}
           ${undoControls}`
        : event
          ? ""
        : isNext
          ? `<button class="primary" type="button" data-progress-action="save" data-step-index="${stepIndex}">${stepIndex === 2 ? "确认收货" : stepIndex === 3 ? "开始检测" : stepIndex === 4 ? "发送检测结果" : stepIndex === 7 ? "维修完毕" : "完成此步"}</button>`
          : `<span class="progress-manage-wait">等待上一步</span>`;

    return `
      <li class="progress-manage-step ${stateClass}">
        <span class="progress-manage-marker" aria-hidden="true">${stepIndex + 1}</span>
        <div class="progress-manage-step-main">
          <div class="progress-manage-step-head">
            <h3>${escapeHtml(label)}</h3>
            <span>${statusText}</span>
          </div>
          ${operationText ? `<p class="progress-operation-record${operationRecordClass}"><span>操作记录</span><strong>${escapeHtml(operationText)}</strong></p>` : ""}
          <div class="progress-time-control">
            <label>
              <span class="sr-only">${escapeHtml(label)}时间</span>
              <input type="datetime-local" step="1" value="${escapeHtml(inputValue)}" data-progress-time="${stepIndex}" ${event || !isNext ? "disabled" : ""}>
            </label>
            ${!event && isNext ? `<button class="secondary progress-now-button" type="button" data-progress-action="now" data-step-index="${stepIndex}">现在</button>` : ""}
          </div>
          ${detailField}
          ${returnTrackingField}
        </div>
        <div class="progress-manage-step-actions">${controls}</div>
      </li>
    `;
  }).join("");
}

async function saveProgressStepFromDialog(stepIndex) {
  let submission = customerSubmissions.find((item) => item.id === managingProgressSubmissionId);
  const input = els.progressManageList.querySelector(`[data-progress-time="${stepIndex}"]`);
  const detailInput = els.progressManageList.querySelector(`[data-progress-detail="${stepIndex}"]`);
  const warrantyInputs = els.progressManageList.querySelectorAll(`[data-progress-warranty="${stepIndex}"]`);
  const warrantyInput = els.progressManageList.querySelector(`[data-progress-warranty="${stepIndex}"]:checked`);
  const accessoryInputs = [...els.progressManageList.querySelectorAll(`[data-progress-accessory="${stepIndex}"]`)];
  const repairSuggestionInput = els.progressManageList.querySelector(`[data-progress-repair-suggestion="${stepIndex}"]`);
  const returnTrackingInput = els.progressManageList.querySelector(`[data-progress-return-tracking="${stepIndex}"]`);
  if (!submission || !input?.value) {
    showToast("请先选择时间");
    input?.focus();
    return;
  }

  const warrantyType = String(warrantyInput?.value || "").trim();
  if (stepIndex === 4 && !warrantyType) {
    showToast("请选择在保或已过保");
    warrantyInputs[0]?.focus();
    return;
  }

  const rawDetailText = String(detailInput?.value || "").trim();
  if (stepIndex === 4 && !rawDetailText) {
    showToast("请填写要发送给客户的检测结果");
    detailInput.focus();
    return;
  }
  const returnTrackingNumber = String(returnTrackingInput?.value || "").trim();
  const repairRecord = stepIndex === 8 ? getCustomerSubmissionRepairRecord(submission) : null;
  const selectedAccessoryParts = accessoryInputs
    .filter((accessoryInput) => accessoryInput.checked)
    .map((accessoryInput) => accessoryInput.value);
  const customPartNameInput = els.progressManageList.querySelector(`[data-progress-custom-part-name="${stepIndex}"]`);
  const customPartName = selectedAccessoryParts.includes(PROGRESS_CUSTOM_ACCESSORY_PART)
    ? normalizeProgressCustomPartName(customPartNameInput?.textContent) || PROGRESS_CUSTOM_ACCESSORY_PART
    : "";
  const progressCustomPartPrice = selectedAccessoryParts.includes(PROGRESS_CUSTOM_ACCESSORY_PART)
    ? getProgressCustomPartPrice(stepIndex)
    : "";
  const repairSuggestion = normalizeProgressRepairSuggestion(repairSuggestionInput?.value);
  if (selectedAccessoryParts.includes(PROGRESS_CUSTOM_ACCESSORY_PART) && !progressCustomPartPrice && progressCustomPartPrice !== "0") {
    showToast("请填写自定义配件金额");
    openProgressCustomPartPriceDialog(stepIndex);
    return;
  }

  const detailText = stepIndex === 4
    ? serializeProgressDetectionDetail(
        warrantyType,
        rawDetailText,
        selectedAccessoryParts,
        progressCustomPartPrice,
        customPartName,
        repairSuggestion
      )
    : rawDetailText;
  if (stepIndex === 8 && !repairRecord) {
    showToast("请先生成维修记录，再填写寄回快递单号");
    return;
  }
  if (stepIndex === 8 && !returnTrackingNumber) {
    showToast("请填写寄回快递单号");
    returnTrackingInput?.focus();
    return;
  }

  const occurredAt = fromBeijingInputDateTime(input.value).toISOString();
  const events = getEffectiveProgressEvents(submission);
  const previous = events.find((item) => item.stepIndex === stepIndex - 1);
  const next = events.find((item) => item.stepIndex === stepIndex + 1);
  const occurredTime = new Date(occurredAt).getTime();
  if (previous && occurredTime < new Date(previous.occurredAt).getTime()) {
    showToast(`时间不能早于“${CUSTOMER_PROGRESS_STEPS[stepIndex - 1]}”`);
    input.focus();
    return;
  }
  if (next && occurredTime > new Date(next.occurredAt).getTime()) {
    showToast(`时间不能晚于“${CUSTOMER_PROGRESS_STEPS[stepIndex + 1]}”`);
    input.focus();
    return;
  }

  const existed = repairProgressEvents.some((item) => item.submissionId === submission.id && item.stepIndex === stepIndex);
  const progressEvent = normalizeProgressEvent({
    submissionId: submission.id,
    stepIndex,
    occurredAt,
    detailText,
    updatedAt: new Date().toISOString()
  });

  const successMessage = stepIndex === 4
    ? "检测结果已发送给客户"
    : existed
      ? "进度时间已更新"
      : `已记录：${CUSTOMER_PROGRESS_STEPS[stepIndex]}`;
  try {
    if (repairRecord) {
      const updatedRecord = normalizeRecord({
        ...repairRecord,
        returnTrackingNumber,
        updatedAt: new Date().toISOString()
      });
      const savedRecord = cloudMode
        ? await saveCloudRecord(updatedRecord)
        : updatedRecord;
      const recordIndex = records.findIndex((item) => item.id === savedRecord.id);
      if (recordIndex >= 0) records[recordIndex] = { ...records[recordIndex], ...savedRecord };
      if (!cloudMode) saveRecords();
    }

    const saved = cloudMode ? await saveCloudProgressEvent(progressEvent) : progressEvent;
    repairProgressEvents = repairProgressEvents.filter((item) => !(
      item.submissionId === saved.submissionId && item.stepIndex === saved.stepIndex
    ));
    repairProgressEvents.push(saved);
    if (stepIndex === 4) {
      const customerIssue = removeNoRepairRequestMark(submission.customerIssue);
      if (customerIssue !== submission.customerIssue) {
        submission = normalizeCustomerSubmission({
          ...submission,
          customerIssue,
          updatedAt: new Date().toISOString()
        });
        if (cloudMode) await saveCloudSubmission(submission);
        customerSubmissions = customerSubmissions.map((item) => (
          item.id === submission.id ? submission : item
        ));
        if (!cloudMode) saveCustomerSubmissions();
      }
    }
    if (!cloudMode) saveRepairProgressEvents();
    renderTable();
    renderProgressManageDialog();
    renderCustomerProgress(submission, getCustomerSubmissionRepairRecord(submission));
    showToast(successMessage);
  } catch (error) {
    console.error(error);
    showToast("进度保存失败，请确认数据库已更新");
  }
}

async function confirmPaymentFromAdminDialog(button) {
  const submission = customerSubmissions.find((item) => item.id === managingProgressSubmissionId);
  const input = els.progressManageList.querySelector('[data-progress-time="5"]');
  if (!submission || !input?.value) return;

  const confirmedAt = new Date(input.value).toISOString();
  const detectionEvent = getEffectiveProgressEvents(submission).find((item) => item.stepIndex === 4);
  if (!detectionEvent) {
    showToast("请先发送检测结果");
    return;
  }
  if (new Date(confirmedAt).getTime() < new Date(detectionEvent.occurredAt).getTime()) {
    showToast("付款时间不能早于检测结果时间");
    input.focus();
    return;
  }

  button.disabled = true;
  try {
    if (cloudMode) {
      await requestPaymentConfirmation(submission.id, confirmedAt);
      await loadCloudProgressEvents();
    } else {
      applyPaymentConfirmationLocally(submission.id, {}, confirmedAt, "admin");
      saveRepairProgressEvents();
    }
    renderTable();
    renderProgressManageDialog();
    renderCustomerProgress(submission, getCustomerSubmissionRepairRecord(submission));
    showToast("付款已确认，已自动进入维修中");
  } catch (error) {
    console.error(error);
    showToast("付款确认失败，请确认数据库已更新");
  } finally {
    button.disabled = false;
  }
}

async function skipRepairFromAdminDialog(button) {
  const submission = customerSubmissions.find((item) => item.id === managingProgressSubmissionId);
  const input = els.progressManageList.querySelector('[data-progress-time="5"]');
  if (!submission || !input?.value) return;

  const skippedAt = new Date(input.value).toISOString();
  const detectionEvent = getEffectiveProgressEvents(submission).find((item) => item.stepIndex === 4);
  if (!detectionEvent) {
    showToast("请先发送检测结果");
    return;
  }
  if (new Date(skippedAt).getTime() < new Date(detectionEvent.occurredAt).getTime()) {
    showToast("无需维修的确认时间不能早于检测结果时间");
    input.focus();
    return;
  }

  button.disabled = true;
  try {
    const result = cloudMode
      ? await requestNoRepair(submission.id, skippedAt)
      : {};
    applyNoRepairLocally(submission.id, result, skippedAt, "admin");
    if (cloudMode) {
      await loadCloudProgressEvents(true);
    } else {
      saveRepairProgressEvents();
    }
    renderTable();
    renderProgressManageDialog();
    renderCustomerProgress(submission, getCustomerSubmissionRepairRecord(submission));
    showToast("已设为无需维修，当前进度已进入等待发货");
  } catch (error) {
    console.error(error);
    showToast("无需维修保存失败，请确认网络和登录状态");
  } finally {
    button.disabled = false;
  }
}

async function confirmSubmissionReceived(submissionId, button) {
  const submission = customerSubmissions.find((item) => item.id === submissionId);
  if (!submission) {
    showToast("没有找到这条客户登记");
    return;
  }

  const alreadyReceived = getEffectiveProgressEvents(submission).some((item) => item.stepIndex >= 2);
  if (alreadyReceived) {
    renderSubmissions();
    showToast("这条工单已经确认收货");
    return;
  }

  const occurredAt = new Date().toISOString();
  const progressEvent = normalizeProgressEvent({
    submissionId: submission.id,
    stepIndex: 2,
    occurredAt,
    updatedAt: occurredAt
  });

  button.disabled = true;
  try {
    const saved = cloudMode ? await saveCloudProgressEvent(progressEvent) : progressEvent;
    repairProgressEvents = repairProgressEvents.filter((item) => !(
      item.submissionId === saved.submissionId && item.stepIndex === saved.stepIndex
    ));
    repairProgressEvents.push(saved);
    if (!cloudMode) saveRepairProgressEvents();
    renderTable();
    renderSubmissions();
    renderCustomerProgress(submission, getCustomerSubmissionRepairRecord(submission));
    showToast("已确认收货，客户进度已更新");
  } catch (error) {
    console.error(error);
    showToast("确认收货失败，请检查网络后重试");
  } finally {
    button.disabled = false;
  }
}

function cancelReceivedUndoHold() {
  if (receivedUndoHoldTimer) window.clearTimeout(receivedUndoHoldTimer);
  receivedUndoHoldButton?.classList.remove("is-holding");
  receivedUndoHoldButton?.removeAttribute("aria-busy");
  receivedUndoHoldTimer = null;
  receivedUndoHoldButton = null;
  receivedUndoHoldPointerId = null;
}

function startReceivedUndoHold(button, pointerId = null) {
  cancelReceivedUndoHold();
  receivedUndoHoldButton = button;
  receivedUndoHoldPointerId = pointerId;
  button.classList.add("is-holding");
  button.setAttribute("aria-busy", "true");
  receivedUndoHoldTimer = window.setTimeout(() => {
    const heldButton = receivedUndoHoldButton;
    const submissionId = heldButton?.dataset.id || "";
    cancelReceivedUndoHold();
    if (heldButton && submissionId) requestUndoSubmissionReceived(submissionId, heldButton);
  }, RECEIVED_UNDO_HOLD_MS);
}

function resetReceivedUndoConfirm() {
  pendingReceivedUndoSubmissionId = "";
  pendingReceivedUndoButton = null;
}

function closeReceivedUndoConfirm() {
  if (els.receivedUndoConfirmDialog.open) els.receivedUndoConfirmDialog.close();
  resetReceivedUndoConfirm();
}

function requestUndoSubmissionReceived(submissionId, button) {
  const laterEvents = getStoredProgressEvents(submissionId).filter((item) => item.stepIndex >= 2);
  const latestIndex = laterEvents.length ? Math.max(...laterEvents.map((item) => item.stepIndex)) : -1;
  if (latestIndex === 2) {
    undoSubmissionReceived(submissionId, button);
    return;
  }
  if (latestIndex < 2) {
    renderSubmissions();
    showToast("这条工单还没有确认收货");
    return;
  }

  pendingReceivedUndoSubmissionId = submissionId;
  pendingReceivedUndoButton = button;
  els.receivedUndoConfirmMessage.textContent = `当前进度在“${CUSTOMER_PROGRESS_STEPS[latestIndex]}”，是否更改？`;
  els.receivedUndoConfirmDialog.showModal();
}

async function confirmReceivedUndoChange() {
  const submissionId = pendingReceivedUndoSubmissionId;
  const button = pendingReceivedUndoButton;
  closeReceivedUndoConfirm();
  if (submissionId && button) await undoSubmissionReceived(submissionId, button, true);
}

async function undoSubmissionReceived(submissionId, button, allowLaterProgress = false) {
  const submission = customerSubmissions.find((item) => item.id === submissionId);
  const laterEvents = getStoredProgressEvents(submissionId).filter((item) => item.stepIndex >= 2);
  const latestIndex = laterEvents.length ? Math.max(...laterEvents.map((item) => item.stepIndex)) : -1;
  if (!submission || latestIndex < 2) {
    showToast("这条工单还没有确认收货");
    renderSubmissions();
    return;
  }
  if (latestIndex > 2 && !allowLaterProgress) {
    requestUndoSubmissionReceived(submissionId, button);
    return;
  }

  const waitingEvent = getEffectiveProgressEvents(submission).find((item) => item.stepIndex === 1);
  const resetEvent = normalizeProgressEvent({
    submissionId: submission.id,
    stepIndex: 1,
    occurredAt: waitingEvent?.occurredAt || submission.createdTime || new Date().toISOString(),
    detailText: WAITING_RECEIPT_RESET_MARK,
    updatedAt: new Date().toISOString()
  });

  button.disabled = true;
  try {
    const savedResetEvent = cloudMode ? await saveCloudProgressEvent(resetEvent) : resetEvent;
    if (cloudMode) await deleteCloudProgressEventsFromStep(submission.id, 2);
    repairProgressEvents = repairProgressEvents.filter((item) => !(
      item.submissionId === submission.id && item.stepIndex >= 1
    ));
    repairProgressEvents.push(savedResetEvent);
    if (!cloudMode) saveRepairProgressEvents();
    renderTable();
    renderSubmissions();
    renderCustomerProgress(submission, getCustomerSubmissionRepairRecord(submission));
    showToast("已取消收货，客户进度已回到等待收货");
  } catch (error) {
    console.error(error);
    showToast("取消收货失败，请检查网络后重试");
  } finally {
    button.disabled = false;
  }
}

function requestProgressStepUndo(stepIndex) {
  const submission = customerSubmissions.find((item) => item.id === managingProgressSubmissionId);
  const stored = getEffectiveProgressEvents(submission).filter((item) => item.stepIndex >= 2);
  const latestIndex = stored.length ? Math.max(...stored.map((item) => item.stepIndex)) : -1;
  if (!submission || stepIndex !== latestIndex) {
    showToast("只能撤销当前这一步");
    return;
  }
  confirmingProgressUndoStep = stepIndex;
  renderProgressManageDialog();
}

function cancelProgressStepUndo() {
  confirmingProgressUndoStep = -1;
  renderProgressManageDialog();
}

async function undoLatestProgressStep(stepIndex, button) {
  const submission = customerSubmissions.find((item) => item.id === managingProgressSubmissionId);
  const stored = getEffectiveProgressEvents(submission).filter((item) => item.stepIndex >= 2);
  const latestIndex = stored.length ? Math.max(...stored.map((item) => item.stepIndex)) : -1;
  if (!submission || stepIndex !== latestIndex) {
    confirmingProgressUndoStep = -1;
    renderProgressManageDialog();
    showToast("只能撤销当前这一步");
    return;
  }
  const isUndoingNoRepair = stepIndex === 7 && stored.some((item) => (
    item.stepIndex === 7 && isNoRepairProgressEvent(item)
  ));
  const deleteFromStep = isUndoingNoRepair ? 5 : stepIndex;
  button.disabled = true;
  try {
    if (cloudMode) {
      if (isUndoingNoRepair) {
        await deleteCloudProgressEventsFromStep(submission.id, deleteFromStep);
      } else {
        await deleteCloudProgressEvent(submission.id, stepIndex);
      }
    }
    repairProgressEvents = repairProgressEvents.filter((item) => !(
      item.submissionId === submission.id && item.stepIndex >= deleteFromStep
    ));
    if (isUndoingNoRepair) {
      const updatedSubmission = normalizeCustomerSubmission({
        ...submission,
        customerIssue: removeNoRepairRequestMark(submission.customerIssue),
        updatedAt: new Date().toISOString()
      });
      if (cloudMode) await saveCloudSubmission(updatedSubmission);
      customerSubmissions = customerSubmissions.map((item) => (
        item.id === updatedSubmission.id ? updatedSubmission : item
      ));
      const lastSubmission = getLastCustomerSubmission();
      if (lastSubmission?.id === updatedSubmission.id) saveLastCustomerSubmission(updatedSubmission);
    }
    if (!cloudMode) saveRepairProgressEvents();
    confirmingProgressUndoStep = -1;
    renderTable();
    renderProgressManageDialog();
    renderCustomerProgress(submission, getCustomerSubmissionRepairRecord(submission));
    showToast(isUndoingNoRepair ? "已撤销：无需维修" : `已撤销：${CUSTOMER_PROGRESS_STEPS[stepIndex]}`);
  } catch (error) {
    console.error(error);
    showToast("撤销失败，请稍后再试");
  } finally {
    button.disabled = false;
  }
}

function canViewAnalytics() {
  return linkingPreviewMode || (cloudMode && adminMode && !forceReadonlyMode);
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

function isProgressIncompleteRecord(record) {
  const submission = customerSubmissions.find((item) => item.id === record.submissionId);
  if (!submission) return false;
  return getCustomerProgressState(submission, record).currentIndex < CUSTOMER_PROGRESS_STEPS.length - 1;
}

function applyFilters() {
  const filters = getFilters();
  filteredRecords = records.filter((record) => {
    const linkedSubmission = customerSubmissions.find((item) => item.id === record.submissionId);
    const text = exportFields
      .map(([key]) => record[key])
      .concat(formatRepairRecordId(record), linkedSubmission ? formatSubmissionId(linkedSubmission) : "")
      .join(" ")
      .toLowerCase();
    const date = recordDateKey(record.createdTime);

    return (
      (!filters.search || text.includes(filters.search)) &&
      (!progressIncompleteFilter || isProgressIncompleteRecord(record)) &&
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
  els.pendingSendCount.textContent = stats.pendingSend;
  els.finishedCount.textContent = stats.returningFactory;
  els.testStatusCount.textContent = stats.testing;
  els.incompleteProgressCount.textContent = stats.incompleteProgress;
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
    pendingSend: records.filter((record) => record.finalStatus === "已寄出").length,
    returningFactory: records.filter((record) => record.finalStatus === "返厂中").length,
    testing: records.filter((record) => record.finalStatus === "测试中").length,
    incompleteProgress: records.filter(isProgressIncompleteRecord).length,
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
      !progressIncompleteFilter &&
      !card.dataset.metricProgress &&
      (els.statusFilter.value || "") === (card.dataset.metricStatus || "");
    const isProgressActive =
      currentView === "repair" &&
      target === "repair" &&
      card.dataset.metricProgress === "incomplete" &&
      progressIncompleteFilter;
    const isSubmissionActive =
      currentView === "submissions" &&
      target === "submissions" &&
      submissionStatusFilter === (card.dataset.submissionStatus || "");
    const isActive = isRepairActive || isProgressActive || isSubmissionActive;
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
  if (part === PROGRESS_CUSTOM_ACCESSORY_PART) {
    const price = normalizeMoneyValue(record.customPartPrice);
    return {
      shouldUseActualAmount: true,
      hasAmount: Boolean(price),
      amount: Number(price) || 0
    };
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
      const detailLabel = item.detailLabel || item.label;
      const detailAttrs = detailType
        ? ` data-analysis-detail="${escapeHtml(detailType)}" data-analysis-label="${escapeHtml(detailLabel)}" tabindex="0" role="button"`
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

function formatAnalysisMonth(monthKey = "") {
  const [year, month] = String(monthKey).split("-");
  if (!year || !month) return monthKey;
  return `${year}年${Number(month)}月`;
}

function getAnalysisMonthlyItems(items = getAnalysisRecords()) {
  const recordMonthKeys = items
    .map((record) => recordDateKey(record.createdTime).slice(0, 7))
    .filter((key) => /^\d{4}-\d{2}$/.test(key));
  const sortedMonthKeys = [...recordMonthKeys].sort();
  const fromMonth = (els.analysisDateFrom?.value || sortedMonthKeys[0] || "").slice(0, 7);
  const toMonth = (els.analysisDateTo?.value || sortedMonthKeys.at(-1) || "").slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(fromMonth) || !/^\d{4}-\d{2}$/.test(toMonth)) return [];

  const toMonthIndex = (key) => {
    const [year, month] = key.split("-").map(Number);
    return year * 12 + month - 1;
  };
  const fromIndex = toMonthIndex(fromMonth);
  const toIndex = toMonthIndex(toMonth);
  if (fromIndex > toIndex) return [];

  const counts = new Map();
  recordMonthKeys.forEach((key) => counts.set(key, (counts.get(key) || 0) + 1));
  const total = items.length;
  const months = [];
  for (let index = fromIndex; index <= toIndex; index += 1) {
    const year = Math.floor(index / 12);
    const month = index % 12 + 1;
    const key = `${year}-${String(month).padStart(2, "0")}`;
    const count = counts.get(key) || 0;
    months.push({
      label: formatAnalysisMonth(key),
      detailLabel: key,
      count,
      valueText: `${count} 台 · ${formatPercent(count, total)}`
    });
  }
  return months;
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
  const monthItems = getAnalysisMonthlyItems(analysisRecords);
  const trendItems = getRecentTrend(analysisRecords);

  els.analyticsUpdatedAt.textContent = `更新时间：${formatDateTime(toInputDateTime(new Date()))}`;
  els.analysisTotalRepairs.textContent = stats.total;
  els.analysisThisMonth.textContent = getThisMonthCount();
  els.analysisOwnershipTotal.textContent = `${stats.total} 条`;
  els.analysisAreaTotal.textContent = `${stats.total} 条`;

  renderAnalysisBars(els.analysisMonthBars, monthItems, stats.total, {
    limit: monthItems.length,
    detailType: "month-models"
  });
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

function getMonthModelDistribution(monthKey) {
  const matchedRecords = getAnalysisRecords().filter((record) => recordDateKey(record.createdTime).startsWith(monthKey));
  return {
    total: matchedRecords.length,
    items: countBy(matchedRecords, (record) => record.model || "未填写")
  };
}

function getMonthRegionDistribution(monthKey) {
  const matchedRecords = getAnalysisRecords().filter((record) => recordDateKey(record.createdTime).startsWith(monthKey));
  return {
    total: matchedRecords.length,
    items: countBy(matchedRecords, (record) => record.region || "未填写")
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
  const inlineToggle = toggle?.label
    ? `<button class="analysis-popover-mode-toggle" type="button" data-action="toggle-analysis-popover" title="${escapeHtml(toggle.title)}" aria-label="${escapeHtml(toggle.title)}">${escapeHtml(toggle.label)}</button>`
    : "";
  const toggleButton = toggle && !toggle.label
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
      <div class="analysis-popover-title">${escapeHtml(title)}${inlineToggle}</div>
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

function showMonthDetail(row, mode = "models") {
  const label = row.dataset.analysisLabel || "";
  if (!label) return;

  const showingModels = mode !== "regions";
  const distribution = showingModels
    ? getMonthModelDistribution(label)
    : getMonthRegionDistribution(label);
  analysisPopoverState = {
    anchor: row,
    detailType: "month-models",
    label,
    mode: showingModels ? "models" : "regions"
  };
  showAnalysisPopover(
    row,
    `${formatAnalysisMonth(label)} - `,
    distribution.items,
    distribution.total,
    {
      emptyText: showingModels ? "本月暂无型号数据" : "本月暂无地区数据",
      toggle: {
        label: showingModels ? "型号分布" : "地区分布",
        title: showingModels ? "切换成地区分布" : "切换成型号分布"
      }
    }
  );
}

function toggleAnalysisPopoverMode() {
  if (!analysisPopoverState) return;

  if (analysisPopoverState.detailType === "month-models") {
    const nextMode = analysisPopoverState.mode === "models" ? "regions" : "models";
    showMonthDetail(analysisPopoverState.anchor, nextMode);
    return;
  }

  if (analysisPopoverState.detailType === "ownership-models") {
    const nextMode = analysisPopoverState.mode === "models" ? "categories" : "models";
    showOwnershipDetail(analysisPopoverState.anchor, nextMode);
  }
}

function openAnalysisDetail(row) {
  const detailType = row.dataset.analysisDetail;
  const label = row.dataset.analysisLabel || "";
  if (!label) return;

  selectAnalysisRow(row, els.analyticsPage);
  if (detailType === "month-models") {
    showMonthDetail(row);
  }

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
  const text = String(value);
  if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(text)) {
    const date = new Date(text);
    if (!Number.isNaN(date.getTime())) {
      const pad = (part) => String(part).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }
  }
  return text.replace("T", " ");
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
  if (!returnTime) return `<span class="plain-cell inline-return-tracking" data-inline-return-tracking data-id="${escapeHtml(record.id)}" title="双击填写寄回快递单号">${tracking}</span>`;
  return `
    <span class="plain-cell return-info-cell inline-return-tracking" data-inline-return-tracking data-id="${escapeHtml(record.id)}" title="双击填写寄回快递单号">
      <span>${tracking}</span>
      <span class="cell-sub">${escapeHtml(returnTime)}</span>
    </span>
  `;
}

function openInlineReturnTrackingEditor(cell, recordId) {
  if (readonlyMode || cell.querySelector("input")) return;
  const record = records.find((item) => item.id === recordId);
  if (!record) return;

  const originalValue = String(record.returnTrackingNumber || "");
  cell.classList.add("is-editing");
  cell.innerHTML = `<input class="inline-return-tracking-input" type="text" value="${escapeHtml(originalValue)}" placeholder="输入快递单号" aria-label="寄回快递单号">`;
  const input = cell.querySelector("input");
  let finished = false;

  const cancel = () => {
    if (finished) return;
    finished = true;
    renderTable();
  };

  const save = async () => {
    if (finished) return;
    const nextValue = input.value.trim();
    if (nextValue === originalValue) {
      cancel();
      return;
    }

    finished = true;
    input.disabled = true;
    const updatedRecord = normalizeRecord({
      ...record,
      returnTrackingNumber: nextValue,
      updatedAt: new Date().toISOString()
    });

    try {
      const savedRecord = cloudMode ? await saveCloudRecord(updatedRecord) : updatedRecord;
      const index = records.findIndex((item) => item.id === savedRecord.id);
      if (index >= 0) records[index] = { ...records[index], ...savedRecord };
      if (!cloudMode) saveRecords();
      render();
      showToast("寄回快递单号已保存");
    } catch (error) {
      console.error(error);
      finished = false;
      input.disabled = false;
      input.focus();
      input.select();
      showToast("保存失败，请重试", "error");
    }
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      save();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
    }
  });
  input.addEventListener("blur", save);
  input.focus();
  input.select();
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

function renderRepairRecordIdCell(record) {
  const submission = customerSubmissions.find((item) => item.id === record.submissionId);
  const progressState = submission ? getCustomerProgressState(submission, record) : null;
  const progressLabel = progressState ? CUSTOMER_PROGRESS_STEPS[progressState.currentIndex] : "";
  return `
    <span class="record-id-badge repair-id">${escapeHtml(formatRepairRecordId(record))}</span>
    ${submission ? `<span class="record-id-link">关联 ${escapeHtml(formatSubmissionId(submission))}</span>` : ""}
    ${progressLabel ? `<span class="record-progress-state" data-progress-record-id="${escapeHtml(record.id)}" title="双击打开进度页面，当前进度：${escapeHtml(progressLabel)}">${escapeHtml(progressLabel)}</span>` : ""}
  `;
}

function renderSubmissionIdCell(submission, linkedRecord) {
  return `
    <span class="record-id-badge submission-id">${escapeHtml(formatSubmissionId(submission))}</span>
    ${linkedRecord ? `<span class="record-id-link">关联 ${escapeHtml(formatRepairRecordId(linkedRecord))}</span>` : ""}
  `;
}

function renderTable() {
  els.recordsBody.innerHTML = filteredRecords
    .map(
      (record) => `
        <tr data-id="${escapeHtml(record.id)}">
          <td class="record-id-col">${renderRepairRecordIdCell(record)}</td>
          <td>${compact(formatDateTime(record.createdTime))}</td>
          <td class="tracking-col"><span class="plain-cell tracking-cell">${compact(record.trackingNumber)}</span></td>
          <td class="region-col">
            <span class="cell-main">${compact(record.region)}</span>
            <span class="cell-sub"><span class="tag ${areaClass(record.area)}">${compact(record.area)}</span></span>
          </td>
          <td>
            <span class="cell-main">${compact(record.deviceNumber)}</span>
            <span class="cell-sub">${compact(record.model)}</span>
          </td>
          <td class="power-col"><span class="tag ${powerClass(record.hasPower)}">${compact(record.hasPower)}</span></td>
          <td class="company-col"><span class="plain-cell company-cell">${compact(record.companyName)}</span></td>
          <td class="text-cell">${compact(record.customerIssue)}</td>
          <td class="text-cell repair-process-col">${compact(record.repairProcess)}</td>
          <td class="warranty-fee-col">${renderWarrantyFeeCell(record)}</td>
          <td>${renderReturnTrackingCell(record)}</td>
          <td><span class="tag ${statusClass(record.finalStatus)}">${compact(displayFinalStatus(record.finalStatus))}</span></td>
          <td class="fault-ownership-col"><span class="tag ${ownershipClass(record.faultOwnership)}">${compact(record.faultOwnership)}</span></td>
          <td class="fault-category-col"><div class="tag-list">${renderFaultCategoryTags(record)}</div></td>
          <td class="address-cell">${renderAddress(record)}</td>
          <td class="actions-col">
            <div class="row-actions">
              <button class="secondary" type="button" data-action="progress" data-id="${escapeHtml(record.id)}" ${record.submissionId ? "" : "disabled"} title="${record.submissionId ? "逐项更新维修进度" : "请先关联客户登记 B 编号"}">进度</button>
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
  const matchedRecordsBySubmission = getSubmissionRepairMatches();
  const reviewedSubmissionIds = new Set(matchedRecordsBySubmission.keys());
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
      const linkedRecord = matchedRecordsBySubmission.get(item.id);
      const hasReceived = getEffectiveProgressEvents(item).some((progressEvent) => progressEvent.stepIndex >= 2);
      const statusText = isReviewed ? "已检修" : "未检修";
      const statusClass = isReviewed ? "reviewed" : "unreviewed";
      return `
        <tr data-id="${escapeHtml(item.id)}">
          <td class="record-id-col">${renderSubmissionIdCell(item, linkedRecord)}</td>
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
            (adminMode || linkingPreviewMode) && !readonlyMode
              ? `<td class="actions-col">
                  <div class="row-actions">
                    <button class="secondary ${isReviewed ? "reviewed" : ""}" type="button" data-action="use-submission" data-id="${escapeHtml(item.id)}" ${isReviewed ? "disabled" : ""}>${isReviewed ? "已检修" : "生成维修"}</button>
                    ${hasReceived
                      ? `<button class="secondary received" type="button" data-action="undo-received" data-id="${escapeHtml(item.id)}" title="按住 3 秒取消已收货" aria-label="已收货，按住 3 秒可取消">已收货</button>`
                      : `<button class="secondary" type="button" data-action="confirm-received" data-id="${escapeHtml(item.id)}">确认收货</button>`}
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
    formatSubmissionId(item),
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
  updateReturnTimeRequirement();
  clearSubmissionMatchState();
  updateDeviceHistoryButton();
}

function openNewDialog() {
  if (readonlyMode) return;
  resetForm();
  openRecordDialogAndTrackChanges();
}

function findSubmissionsByDeviceNumber(deviceNumber) {
  const key = String(deviceNumber || "").trim().toLowerCase();
  if (!key) return [];
  const matches = customerSubmissions.filter((item) => item.deviceNumber.toLowerCase() === key);
  return sortCustomerSubmissionsNewestFirst([...matches]);
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
    .split("\n")
    .filter((line) => line.trim() !== NO_REPAIR_REQUEST_MARK)
    .join("\n")
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
  form.submissionId.value = submission.id;
  updateRecordProgressButton();
  showToast("已带入客户提交的信息");
}

function undoSubmissionToRecordForm() {
  if (!appliedSubmissionSnapshot) return;

  const form = els.recordForm.elements;
  form.trackingNumber.value = appliedSubmissionSnapshot.trackingNumber;
  form.companyName.value = appliedSubmissionSnapshot.companyName;
  form.customerPowerAdapter.value = appliedSubmissionSnapshot.customerPowerAdapter;
  form.customerIssue.value = appliedSubmissionSnapshot.customerIssue;
  form.customerAddress.value = appliedSubmissionSnapshot.customerAddress;
  appliedSubmissionSnapshot = null;
  appliedSubmissionId = "";
  form.submissionId.value = "";
  updateRepairFeeDetails();
  updateRecordProgressButton();
  showToast("已取消关联");
  renderSubmissionChoices(findAvailableSubmissionsByDeviceNumber(form.deviceNumber.value));
}

function findAvailableSubmissionsByDeviceNumber(deviceNumber) {
  const currentRecordId = els.recordId.value || "";
  const linkedRecords = getSubmissionRepairMatches();
  return findSubmissionsByDeviceNumber(deviceNumber).filter((submission) => {
    const linkedRecord = linkedRecords.get(submission.id);
    return !linkedRecord || linkedRecord.id === currentRecordId || submission.id === appliedSubmissionId;
  });
}

function hideMatchBox() {
  els.matchBox.hidden = true;
  els.matchBox.replaceChildren();
  matchingSubmissionChoices = [];
}

function clearSubmissionMatchState() {
  hideMatchBox();
  appliedSubmissionSnapshot = null;
  appliedSubmissionId = "";
  if (els.recordForm.elements.submissionId) els.recordForm.elements.submissionId.value = "";
  updateRecordProgressButton();
}

function renderSubmissionChoiceDetails(submission) {
  return `
    <span class="match-choice-id">${escapeHtml(formatSubmissionId(submission))}</span>
    <span class="match-choice-main">
      <strong>${compact(submission.companyName)}</strong>
      <small>${compact(formatDateTime(submission.createdTime))} · ${compact(submission.trackingNumber)}</small>
      <small>${compact(cleanCustomerIssueForRecord(submission))}</small>
    </span>
  `;
}

function renderSubmissionChoices(submissions) {
  matchingSubmissionChoices = submissions;
  const selectedSubmission = customerSubmissions.find((item) => item.id === appliedSubmissionId) || null;
  const otherChoices = submissions.filter((item) => item.id !== appliedSubmissionId);
  const deviceNumber = String(els.recordForm.elements.deviceNumber.value || "").trim();

  if (deviceNumber.length < 10 && !selectedSubmission) {
    hideMatchBox();
    return;
  }

  els.matchBox.hidden = false;
  els.matchBox.innerHTML = `
    ${
      selectedSubmission
        ? `<label class="match-choice match-selected">
            ${renderSubmissionChoiceDetails(selectedSubmission)}
            <input class="match-choice-checkbox" type="checkbox" data-match-action="unlink" data-submission-id="${escapeHtml(selectedSubmission.id)}" aria-label="取消关联 ${escapeHtml(formatSubmissionId(selectedSubmission))}" checked>
          </label>`
        : `<div class="match-choice-head">
            <strong>${otherChoices.length ? `找到 ${otherChoices.length} 条客户登记，请选择关联` : "没有找到可关联的客户登记"}</strong>
            ${otherChoices.length ? "" : "<span>可检查编号，或继续手工填写维修记录</span>"}
          </div>`
    }
    ${
      otherChoices.length
        ? `<div class="match-choice-list">
            ${otherChoices.map((submission) => `
              <label class="match-choice">
                ${renderSubmissionChoiceDetails(submission)}
                <input class="match-choice-checkbox" type="checkbox" data-match-action="choose" data-submission-id="${escapeHtml(submission.id)}" aria-label="关联 ${escapeHtml(formatSubmissionId(submission))}">
              </label>
            `).join("")}
          </div>`
        : ""
    }
  `;

  els.matchBox.querySelectorAll("input[data-match-action]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.dataset.matchAction === "unlink" && !checkbox.checked) {
        undoSubmissionToRecordForm();
        return;
      }
      if (!checkbox.checked) return;
      const submission = customerSubmissions.find((item) => item.id === checkbox.dataset.submissionId);
      if (!submission) return;
      applySubmissionToRecordForm(submission);
      renderSubmissionChoices(findAvailableSubmissionsByDeviceNumber(submission.deviceNumber));
    });
  });
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

function updateRecordProgressButton() {
  const submissionId = String(els.recordForm.elements.submissionId?.value || appliedSubmissionId || "").trim();
  const canOpenProgress = customerSubmissions.some((item) => item.id === submissionId);
  els.recordProgressBtn.disabled = !canOpenProgress;
  els.recordProgressBtn.title = canOpenProgress ? "打开并修改维修进度" : "请先关联客户登记 B 编号";
  els.previewCustomerProgressBtn.disabled = !canOpenProgress;
  els.previewCustomerProgressBtn.title = canOpenProgress ? "查看客户手机上的维修进度" : "请先关联客户登记 B 编号";
}

function openRecordProgressDialog() {
  const submissionId = String(els.recordForm.elements.submissionId?.value || appliedSubmissionId || "").trim();
  if (!submissionId) {
    showToast("请先关联客户登记 B 编号");
    return;
  }
  captureNewRecordProgressSnapshot(submissionId);
  openProgressManageDialog(submissionId);
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
          <strong>${escapeHtml(formatRepairRecordId(record))} · ${compact(formatDateTime(record.createdTime))}</strong>
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
  const deviceNumber = String(els.recordForm.elements.deviceNumber.value || "").trim();
  const selectedSubmission = customerSubmissions.find((item) => item.id === appliedSubmissionId);
  if (selectedSubmission && selectedSubmission.deviceNumber !== deviceNumber) {
    undoSubmissionToRecordForm();
  } else {
    renderSubmissionChoices(findAvailableSubmissionsByDeviceNumber(deviceNumber));
  }
  updateDeviceHistoryButton();
}

function updateReturnTimeRequirement() {
  const form = els.recordForm.elements;
  const required = RETURN_TIME_REQUIRED_STATUSES.includes(form.finalStatus.value);
  form.returnTime.required = required;
  if (!required) return;
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
  renderSubmissionChoices(findAvailableSubmissionsByDeviceNumber(submission.deviceNumber));
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
  if (!record?.submissionId) return null;
  return customerSubmissions.find((item) => item.id === record.submissionId) || null;
}

function fillForm(record) {
  clearSubmissionMatchState();
  els.recordId.value = record.id;
  els.dialogTitle.textContent = `编辑记录 ${formatRepairRecordId(record)}`;
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
  if (matchedSubmission) {
    const form = els.recordForm.elements;
    appliedSubmissionSnapshot = {
      trackingNumber: form.trackingNumber.value,
      companyName: form.companyName.value,
      customerPowerAdapter: form.customerPowerAdapter.value,
      customerIssue: form.customerIssue.value,
      customerAddress: form.customerAddress.value
    };
    appliedSubmissionId = matchedSubmission.id;
    form.submissionId.value = matchedSubmission.id;
  }
  renderSubmissionChoices(findAvailableSubmissionsByDeviceNumber(record.deviceNumber));
  updateAccessoryPartsRequirement();
  updateReturnTimeRequirement();
  updateDeviceHistoryButton();
  updateRecordProgressButton();
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
  const existingRecord = records.find((item) => item.id === id);
  const record = { id };
  exportFields.forEach(([key]) => {
    record[key] = ["faultCategory", "accessoryParts"].includes(key)
      ? formData.getAll(key).map((value) => String(value).trim()).filter(Boolean)
      : String(formData.get(key) || "").trim();
  });
  record.deviceNumber = record.deviceNumber.replace(/\D/g, "").slice(0, 10);
  record.recordNumber = existingRecord?.recordNumber || records.reduce(
    (highest, item) => Math.max(highest, normalizeDisplayNumber(item.recordNumber)),
    0
  ) + 1;
  record.submissionId = String(formData.get("submissionId") || appliedSubmissionId || "").trim();
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
  if (RETURN_TIME_REQUIRED_STATUSES.includes(record.finalStatus) && !record.returnTime) {
    showToast("请选择寄回时间");
    els.recordForm.elements.returnTime.focus();
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

  let savedRecord = record;
  try {
    if (cloudMode) savedRecord = await saveCloudRecord(record);
    if (!linkingPreviewMode) await syncRepairMaterialsToInventory(savedRecord);
  } catch (error) {
    console.error(error);
    showToast(cloudMode ? "维修记录已保存，但同步到库存网页失败" : "同步到库存网页失败", "error");
    return false;
  }

  const index = records.findIndex((item) => item.id === savedRecord.id);
  if (index >= 0) {
    records[index] = { ...records[index], ...savedRecord };
  } else {
    records.unshift(savedRecord);
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
    createdTime: oldSubmission?.createdTime || new Date().toISOString(),
    deviceNumber,
    model: inferModelFromDeviceNumber(deviceNumber),
    companyName: String(formData.get("companyName") || ""),
    contactName: String(formData.get("contactName") || ""),
    phone,
    trackingNumber,
    customerIssue: `电源适配器是否寄回：${powerAdapterReturned}\n故障描述：${customerIssue}`,
    powerAdapterReturned,
    customerAddress: getCustomerAddressFromForm(),
    progressEnabled: oldSubmission?.progressEnabled ?? true,
    updatedAt: new Date().toISOString()
  });
}

async function submitCustomerForm() {
  if (isCustomerSubmitting) return;

  let submission = getCustomerSubmissionFromForm();
  if (!submission) return;

  const fingerprint = getCustomerSubmissionFingerprint(submission);
  const now = Date.now();
  if (!editingCustomerSubmissionId && fingerprint === lastCustomerSubmitFingerprint && now - lastCustomerSubmitTime < 30000) {
    showToast("已经提交过了，请不要重复点击");
    return;
  }

  setCustomerSubmitting(true);
  try {
    submission = await saveCustomerSubmissionReliably(submission);
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
  repairProgressEvents = repairProgressEvents.filter((item) => item.submissionId !== id);
  if (!cloudMode) {
    saveCustomerSubmissions();
    saveRepairProgressEvents();
  }
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
  progressIncompleteFilter = false;
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
  progressIncompleteFilter = card.dataset.metricProgress === "incomplete";
  render();
  scrollToSection(els.repairRecordsSection);
  if (progressIncompleteFilter) {
    showToast("已跳到进度未完成数据");
    return;
  }
  showToast(card.dataset.metricStatus ? `已跳到${displayFinalStatus(card.dataset.metricStatus)}数据` : "已跳到全部维修记录");
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
  return `维修${date.getMonth() + 1}月${date.getDate()}号.xlsx`;
}

async function loadSampleRecords() {
  if (readonlyMode) return;
  if (records.length > 0 && !confirm("当前已有记录，是否追加示例数据？")) return;
  let incoming = sampleRecords();

  try {
    if (cloudMode) incoming = await saveCloudRecords(incoming);
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

    let normalized = sortRecordsNewestFirst(incoming.map(normalizeRecord));
    if (cloudMode) normalized = await saveCloudRecords(normalized);
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
  const fields = ["id", "recordNumber", "submissionId", ...exportFields.map(([key]) => key)];
  return [
    "r2",
    fields,
    items.map((record) => fields.map((key) => record[key] || ""))
  ];
}

function packSharedSubmissions(items) {
  const fields = ["id", "submissionNumber", "createdTime", "deviceNumber", "model", "companyName", "contactName", "phone", "trackingNumber", "customerIssue", "customerAddress", "updatedAt"];
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
  if (payload[0] === "r2") {
    const fields = payload[1] || [];
    return (payload[2] || []).map((row) => {
      const record = {};
      fields.forEach((key, index) => {
        record[key] = row[index] || "";
      });
      return record;
    });
  }
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
  els.refreshSubmissionsBtn.addEventListener("click", refreshCustomerSubmissions);
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
  els.viewCustomerProgressBtn.addEventListener("click", openCustomerProgress);
  els.closeCustomerProgressBtn.addEventListener("click", closeCustomerProgress);
  els.customerProgressTimeline.addEventListener("click", (event) => {
    const paymentButton = event.target.closest("button[data-customer-payment-confirm]");
    if (paymentButton) confirmCustomerPayment(paymentButton);
    const noRepairButton = event.target.closest("button[data-customer-no-repair]");
    if (noRepairButton) skipRepairFromCustomerProgress(noRepairButton);
  });
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
  els.recordProgressBtn.addEventListener("click", openRecordProgressDialog);
  els.previewCustomerProgressBtn.addEventListener("click", openCustomerProgressPreview);
  els.closeCustomerProgressPreviewBtn.addEventListener("click", closeCustomerProgressPreview);
  els.doneCustomerProgressPreviewBtn.addEventListener("click", closeCustomerProgressPreview);
  els.closeDeviceHistoryDialogBtn.addEventListener("click", () => els.deviceHistoryDialog.close());
  els.closeDeviceHistoryBtn.addEventListener("click", () => els.deviceHistoryDialog.close());
  els.closeProgressManageDialogBtn.addEventListener("click", closeProgressManageDialog);
  els.doneProgressManageBtn.addEventListener("click", closeProgressManageDialog);
  els.closeReceivedUndoConfirmBtn.addEventListener("click", closeReceivedUndoConfirm);
  els.cancelReceivedUndoConfirmBtn.addEventListener("click", closeReceivedUndoConfirm);
  els.confirmReceivedUndoBtn.addEventListener("click", confirmReceivedUndoChange);
  els.receivedUndoConfirmDialog.addEventListener("close", resetReceivedUndoConfirm);
  els.confirmDetectionReminderBtn.addEventListener("click", () => els.detectionReminderDialog.close());
  els.detectionReminderDialog.addEventListener("cancel", (event) => event.preventDefault());
  els.confirmShippingReminderBtn.addEventListener("click", () => els.shippingReminderDialog.close());
  els.shippingReminderDialog.addEventListener("cancel", (event) => event.preventDefault());
  els.recordForm.elements.repairProcess.addEventListener("blur", () => {
    if (!els.detectionReminderDialog.open) els.detectionReminderDialog.showModal();
  });
  els.progressManageDialog.addEventListener("close", () => {
    stopProgressManageAutoRefresh();
    confirmingProgressUndoStep = -1;
    managingProgressSubmissionId = "";
  });
  els.progressManageList.addEventListener("click", (event) => {
    const presetToggle = event.target.closest("button[data-progress-result-presets-toggle]");
    if (presetToggle) {
      toggleProgressResultPresetMenu(Number(presetToggle.dataset.progressResultPresetsToggle));
      return;
    }
    const presetOption = event.target.closest("button[data-progress-result-preset-index]");
    if (presetOption) {
      fillProgressResultFromPreset(Number(presetOption.dataset.stepIndex), Number(presetOption.dataset.progressResultPresetIndex));
      return;
    }
    const presetDelete = event.target.closest("button[data-progress-result-preset-delete]");
    if (presetDelete) {
      deleteProgressResultPreset(Number(presetDelete.dataset.stepIndex), Number(presetDelete.dataset.progressResultPresetDelete));
      return;
    }
    const presetAdd = event.target.closest("button[data-progress-result-preset-add]");
    if (presetAdd) {
      addProgressResultPreset(Number(presetAdd.dataset.progressResultPresetAdd));
      return;
    }
    const button = event.target.closest("button[data-progress-action]");
    if (!button) return;
    const stepIndex = Number(button.dataset.stepIndex);
    if (button.dataset.progressAction === "now") {
      const input = els.progressManageList.querySelector(`[data-progress-time="${stepIndex}"]`);
      if (input && !input.disabled) input.value = toInputDateTimeSeconds(new Date());
      return;
    }
    if (button.dataset.progressAction === "save") saveProgressStepFromDialog(stepIndex);
    if (button.dataset.progressAction === "confirm-payment") confirmPaymentFromAdminDialog(button);
    if (button.dataset.progressAction === "no-repair") skipRepairFromAdminDialog(button);
    if (button.dataset.progressAction === "undo") requestProgressStepUndo(stepIndex);
    if (button.dataset.progressAction === "cancel-undo") cancelProgressStepUndo();
    if (button.dataset.progressAction === "confirm-undo") undoLatestProgressStep(stepIndex, button);
  });
  els.progressManageList.addEventListener("change", (event) => {
    const warrantyCheckbox = event.target.closest("input[data-progress-warranty]");
    if (warrantyCheckbox) {
      const checkboxes = els.progressManageList.querySelectorAll(`[data-progress-warranty="${warrantyCheckbox.dataset.progressWarranty}"]`);
      checkboxes.forEach((item) => {
        if (warrantyCheckbox.checked && item !== warrantyCheckbox) item.checked = false;
        item.closest("label")?.classList.toggle("is-selected", item.checked);
      });
      return;
    }
    const accessoryCheckbox = event.target.closest("input[data-progress-accessory]");
    if (accessoryCheckbox) updateProgressAccessoryEditor(Number(accessoryCheckbox.dataset.progressAccessory));
  });
  els.progressManageList.addEventListener("click", (event) => {
    if (event.target.closest("[data-progress-custom-part-name]")) event.preventDefault();
  });
  els.progressManageList.addEventListener("dblclick", (event) => {
    const label = event.target.closest("[data-progress-custom-part-name]");
    if (!label) return;
    event.preventDefault();
    startProgressCustomPartNameEdit(label);
  });
  els.progressManageList.addEventListener("focusout", (event) => {
    const label = event.target.closest("[data-progress-custom-part-name]");
    if (label?.isContentEditable) finishProgressCustomPartNameEdit(label);
  });
  els.progressManageList.addEventListener("keydown", (event) => {
    const label = event.target.closest("[data-progress-custom-part-name]");
    if (!label?.isContentEditable) return;
    if (event.key === "Enter") {
      event.preventDefault();
      label.blur();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      finishProgressCustomPartNameEdit(label, true);
    }
  });
  els.progressManageList.addEventListener("input", (event) => {
    const customPartPriceInput = event.target.closest("input[data-progress-custom-part-price]");
    if (customPartPriceInput) updateProgressAccessoryEditor(Number(customPartPriceInput.dataset.progressCustomPartPrice));
  });
  els.metricCards.forEach((card) => {
    card.addEventListener("click", () => applyMetricShortcut(card));
  });
  [
    els.analysisMonthBars,
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
  els.recordDialog.addEventListener("close", () => {
    clearRecordDialogSnapshot();
    restoreUnsavedRecordProgress().catch((error) => console.error("恢复未保存工单的进度失败", error));
  });
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
  els.progressCustomPartPriceForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveProgressCustomPartPriceFromDialog();
  });
  els.closeProgressCustomPartPriceDialogBtn.addEventListener("click", closeProgressCustomPartPriceDialog);
  els.cancelProgressCustomPartPriceBtn.addEventListener("click", closeProgressCustomPartPriceDialog);
  els.progressCustomPartPriceDialog.addEventListener("cancel", closeProgressCustomPartPriceDialog);
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
    const isNewRecord = !els.recordId.value;
    const record = getFormRecord();
    if (!record) return;
    const saved = await upsertRecord(record);
    if (!saved) return;
    if (isNewRecord) await startDetectionForNewRecord(record);
    await restoreUnsavedRecordProgress({ keepSubmissionId: record.submissionId });
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
    updateReturnTimeRequirement();
    if (els.recordForm.elements.finalStatus.value === "今天需要寄" && !els.shippingReminderDialog.open) {
      els.shippingReminderDialog.showModal();
    }
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
  els.customerForm.elements.addressDistrict.addEventListener("change", updateAddressStreets);
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
    if (button.dataset.action === "progress") openProgressManageDialogForRecord(button.dataset.id);
    if (button.dataset.action === "edit") openEditDialog(button.dataset.id);
    if (button.dataset.action === "delete") deleteRecord(button.dataset.id);
  });

  els.recordsBody.addEventListener("dblclick", (event) => {
    if (readonlyMode) return;
    if (event.target.closest("button, a, input, select, textarea, label")) return;

    const progressState = event.target.closest("[data-progress-record-id]");
    if (progressState) {
      openProgressManageDialogForRecord(progressState.dataset.progressRecordId);
      return;
    }

    const returnTrackingCell = event.target.closest("[data-inline-return-tracking]");
    if (returnTrackingCell) {
      openInlineReturnTrackingEditor(returnTrackingCell, returnTrackingCell.dataset.id);
      return;
    }

    const row = event.target.closest("tr[data-id]");
    if (!row) return;
    if (isDoubleClickOnRowContent(event, row)) return;
    openEditDialog(row.dataset.id);
  });

  els.submissionsBody.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    if (button.dataset.action === "use-submission") openNewDialogFromSubmission(button.dataset.id);
    if (button.dataset.action === "confirm-received") confirmSubmissionReceived(button.dataset.id, button);
    if (button.dataset.action === "edit-submission") openSubmissionEditDialog(button.dataset.id);
    if (button.dataset.action === "delete-submission") deleteSubmission(button.dataset.id);
  });

  els.submissionsBody.addEventListener("pointerdown", (event) => {
    const button = event.target.closest('button[data-action="undo-received"]');
    if (!button || event.button !== 0) return;
    event.preventDefault();
    button.focus();
    startReceivedUndoHold(button, event.pointerId);
  });
  document.addEventListener("pointermove", (event) => {
    if (!receivedUndoHoldButton || event.pointerId !== receivedUndoHoldPointerId) return;
    const rect = receivedUndoHoldButton.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      cancelReceivedUndoHold();
    }
  });
  document.addEventListener("pointerup", (event) => {
    if (event.pointerId === receivedUndoHoldPointerId) cancelReceivedUndoHold();
  });
  document.addEventListener("pointercancel", (event) => {
    if (event.pointerId === receivedUndoHoldPointerId) cancelReceivedUndoHold();
  });
  els.submissionsBody.addEventListener("keydown", (event) => {
    const button = event.target.closest('button[data-action="undo-received"]');
    if (!button || event.repeat || !["Enter", " "].includes(event.key)) return;
    event.preventDefault();
    startReceivedUndoHold(button);
  });
  els.submissionsBody.addEventListener("keyup", (event) => {
    if (["Enter", " "].includes(event.key)) cancelReceivedUndoHold();
  });
  els.submissionsBody.addEventListener("focusout", (event) => {
    if (event.target === receivedUndoHoldButton) cancelReceivedUndoHold();
  });
  els.submissionsBody.addEventListener("contextmenu", (event) => {
    if (event.target.closest('button[data-action="undo-received"]')) event.preventDefault();
  });

  document.addEventListener("click", (event) => {
    const clickedAddress = event.target.closest(".address-preview");
    const clickedPopover = event.target.closest("#addressPopover");
    if (!clickedAddress && !clickedPopover) hideAddressPopover();
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".progress-result-field")) hideProgressResultPresetMenus();
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
      hideProgressResultPresetMenus();
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
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      autoStartOverdueDetections().catch((error) => console.error("自动检测检查失败", error));
      refreshOpenProgressManageDialog();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !els.customerProgressPage.hidden) closeCustomerProgress();
  });
}

fillStaticOptions();
bindEvents();
setAnalysisDateToThisYear();
applyHashRoute();
loadAreaData();
if (linkingPreviewMode) {
  render();
} else {
  initializeCloud().finally(startAutoDetectionChecks);
}
