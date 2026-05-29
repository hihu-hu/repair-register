const STORAGE_KEY = "printer_repair_records_v3";

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
  sampleBtn: document.querySelector("#sampleBtn"),
  shareReadonlyBtn: document.querySelector("#shareReadonlyBtn"),
  newRecordBtn: document.querySelector("#newRecordBtn"),
  recordDialog: document.querySelector("#recordDialog"),
  recordForm: document.querySelector("#recordForm"),
  recordId: document.querySelector("#recordId"),
  dialogTitle: document.querySelector("#dialogTitle"),
  closeDialogBtn: document.querySelector("#closeDialogBtn"),
  cancelDialogBtn: document.querySelector("#cancelDialogBtn"),
  deleteRecordBtn: document.querySelector("#deleteRecordBtn"),
  shareDialog: document.querySelector("#shareDialog"),
  shareUrlOutput: document.querySelector("#shareUrlOutput"),
  closeShareDialogBtn: document.querySelector("#closeShareDialogBtn"),
  doneShareDialogBtn: document.querySelector("#doneShareDialogBtn"),
  modeNote: document.querySelector("#modeNote"),
  toast: document.querySelector("#toast"),
  addressPopover: document.querySelector("#addressPopover")
};

let toastTimer = null;
let readonlyMode = false;
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
  const payload = params.get("view");
  if (!payload) return null;

  try {
    readonlyMode = true;
    document.body.classList.add("readonly");
    els.modeNote.hidden = false;
    return decodePayload(payload).map(normalizeRecord);
  } catch {
    readonlyMode = false;
    document.body.classList.remove("readonly");
    els.modeNote.hidden = true;
    showToast("分享链接无法读取");
    return null;
  }
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
    faultCategory: normalizeOption(record.faultCategory, optionSets.faultCategory, "其他"),
    customerAddress: String(record.customerAddress || record.address || ""),
    model: normalizeOption(record.model, optionSets.model, "GMX"),
    updatedAt: String(record.updatedAt || new Date().toISOString())
  };
}

function normalizeOption(value, options, fallback) {
  const text = String(value || "").trim();
  return options.includes(text) ? text : fallback;
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

function fillStaticOptions() {
  fillSelect(els.statusFilter, optionSets.finalStatus, true);
  fillSelect(els.ownershipFilter, optionSets.faultOwnership, true);
  fillSelect(els.categoryFilter, optionSets.faultCategory, true);
  fillSelect(els.modelFilter, optionSets.model, true);
  fillSelect(els.areaFilter, optionSets.area, true);
  fillRequiredSelect(els.recordForm.elements.model, optionSets.model);
  fillRequiredSelect(els.recordForm.elements.hasPower, optionSets.hasPower);
  fillSelect(els.recordForm.elements.finalStatus, optionSets.finalStatus);
  fillRequiredSelect(els.recordForm.elements.faultOwnership, optionSets.faultOwnership);
  fillRequiredSelect(els.recordForm.elements.faultCategory, optionSets.faultCategory);
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
    category: els.categoryFilter.value,
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
    const date = record.createdTime.slice(0, 10);

    return (
      (!filters.search || text.includes(filters.search)) &&
      (!filters.status || record.finalStatus === filters.status) &&
      (!filters.ownership || record.faultOwnership === filters.ownership) &&
      (!filters.category || record.faultCategory === filters.category) &&
      (!filters.model || record.model === filters.model) &&
      (!filters.region || record.region === filters.region) &&
      (!filters.area || record.area === filters.area) &&
      (!filters.dateFrom || date >= filters.dateFrom) &&
      (!filters.dateTo || date <= filters.dateTo)
    );
  });

  filteredRecords.sort((a, b) => (b.createdTime || "").localeCompare(a.createdTime || ""));
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
          <td><span class="tag">${compact(record.faultCategory)}</span></td>
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
  els.recordForm.elements.faultCategory.value = "";
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
    record[key] = String(formData.get(key) || "").trim();
  });
  record.updatedAt = new Date().toISOString();
  return normalizeRecord(record);
}

function upsertRecord(record) {
  if (readonlyMode) return;
  const index = records.findIndex((item) => item.id === record.id);
  if (index >= 0) {
    records[index] = { ...records[index], ...record };
  } else {
    records.unshift(record);
  }
  saveRecords();
  render();
  showToast("已保存");
}

function deleteRecord(id) {
  if (readonlyMode) return;
  const record = records.find((item) => item.id === id);
  if (!record) return;
  const label = record.deviceNumber || record.trackingNumber || "这条记录";
  if (!confirm(`确认删除 ${label}？`)) return;
  records = records.filter((item) => item.id !== id);
  saveRecords();
  render();
  showToast("已删除");
}

function resetFilters() {
  els.searchInput.value = "";
  els.statusFilter.value = "";
  els.ownershipFilter.value = "";
  els.categoryFilter.value = "";
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

function loadSampleRecords() {
  if (readonlyMode) return;
  if (records.length > 0 && !confirm("当前已有记录，是否追加示例数据？")) return;
  records = sampleRecords().concat(records);
  saveRecords();
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

    records = incoming.map(normalizeRecord).concat(records);
    saveRecords();
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
  const url = new URL(location.href);
  url.search = "";
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
  try {
    await navigator.clipboard.writeText(url);
    showToast("只读链接已复制");
  } catch {
    showShareDialog(url);
  }
}

function showShareDialog(url) {
  els.shareUrlOutput.value = url;
  els.shareDialog.showModal();
  els.shareUrlOutput.focus();
  els.shareUrlOutput.select();
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

  els.newRecordBtn.addEventListener("click", openNewDialog);
  els.sampleBtn.addEventListener("click", loadSampleRecords);
  els.shareReadonlyBtn.addEventListener("click", copyReadonlyShareLink);
  els.importExcelBtn.addEventListener("click", () => els.importExcelInput.click());
  els.importExcelInput.addEventListener("change", () => importExcelFile(els.importExcelInput.files[0]));
  els.resetFiltersBtn.addEventListener("click", resetFilters);
  els.exportCsvBtn.addEventListener("click", exportCsv);
  els.exportJsonBtn.addEventListener("click", exportJson);
  els.closeDialogBtn.addEventListener("click", () => els.recordDialog.close());
  els.cancelDialogBtn.addEventListener("click", () => els.recordDialog.close());
  els.closeShareDialogBtn.addEventListener("click", () => els.shareDialog.close());
  els.doneShareDialogBtn.addEventListener("click", () => els.shareDialog.close());

  els.recordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    upsertRecord(getFormRecord());
    els.recordDialog.close();
  });

  els.deleteRecordBtn.addEventListener("click", () => {
    deleteRecord(els.recordId.value);
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
}

fillStaticOptions();
bindEvents();
render();
