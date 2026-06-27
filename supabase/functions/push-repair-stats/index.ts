import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAIL = "1041852311@qq.com";
const REPAIR_PAGE_URL = "https://hihu-hu.github.io/repair-register/";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

type RepairStats = {
  total?: number;
  repairing?: number;
  sendToday?: number;
  pendingShipment?: number;
  returningFactory?: number;
  testing?: number;
  unrepaired?: number;
  unrepairedTrackingNumbers?: string[];
};

type RepairRecordRow = {
  created_time?: string;
  device_number?: string;
  final_status?: string;
  updated_at?: string;
};

type CustomerSubmissionRow = {
  id?: string;
  created_time?: string;
  device_number?: string;
  tracking_number?: string;
  updated_at?: string;
};

function numberText(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : "0";
}

function parseRecordTime(value: unknown) {
  const timestamp = Date.parse(String(value || ""));
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function compareOldestFirst(a: { created_time?: string; updated_at?: string }, b: { created_time?: string; updated_at?: string }) {
  const timeDiff = parseRecordTime(a.created_time) - parseRecordTime(b.created_time);
  if (timeDiff !== 0) return timeDiff;
  return String(a.updated_at || "").localeCompare(String(b.updated_at || ""));
}

function getUnrepairedSubmissions(records: RepairRecordRow[], submissions: CustomerSubmissionRow[]) {
  const submissionsByDevice = new Map<string, CustomerSubmissionRow[]>();
  submissions.forEach((submission) => {
    const deviceNumber = String(submission.device_number || "").trim().toLowerCase();
    if (!deviceNumber) return;
    if (!submissionsByDevice.has(deviceNumber)) submissionsByDevice.set(deviceNumber, []);
    submissionsByDevice.get(deviceNumber)?.push(submission);
  });

  submissionsByDevice.forEach((items) => items.sort(compareOldestFirst));

  const recordCountsByDevice = new Map<string, number>();
  const reviewedSubmissionIds = new Set<string>();
  records
    .filter((record) => String(record.device_number || "").trim())
    .sort(compareOldestFirst)
    .forEach((record) => {
      const deviceNumber = String(record.device_number || "").trim().toLowerCase();
      const recordCount = recordCountsByDevice.get(deviceNumber) || 0;
      const matchedSubmission = submissionsByDevice.get(deviceNumber)?.[recordCount];
      recordCountsByDevice.set(deviceNumber, recordCount + 1);
      if (matchedSubmission?.id) reviewedSubmissionIds.add(matchedSubmission.id);
    });

  return submissions.filter((submission) => !reviewedSubmissionIds.has(String(submission.id || "")));
}

function buildStats(records: RepairRecordRow[], submissions: CustomerSubmissionRow[]): RepairStats {
  const unrepairedSubmissions = getUnrepairedSubmissions(records, submissions);
  return {
    total: records.length,
    repairing: records.filter((record) => record.final_status === "维修中").length,
    sendToday: records.filter((record) => record.final_status === "今天需要寄").length,
    pendingShipment: records.filter((record) => record.final_status === "待寄出").length,
    returningFactory: records.filter((record) => record.final_status === "返厂中").length,
    testing: records.filter((record) => record.final_status === "测试中").length,
    unrepaired: unrepairedSubmissions.length,
    unrepairedTrackingNumbers: unrepairedSubmissions.map((item) => item.tracking_number || "未填写快递单号")
  };
}

function trackingListText(values: unknown) {
  if (!Array.isArray(values) || values.length === 0) return "";
  const lines = values
    .map((value) => String(value || "未填写快递单号").trim() || "未填写快递单号")
    .slice(0, 30)
    .map((value, index) => `${index + 1}. ${value}`);
  const moreCount = values.length - lines.length;
  if (moreCount > 0) lines.push(`还有 ${moreCount} 条未显示`);
  return ["", "**未维修快递单号清单：**", ...lines].join("\n");
}

function buildMarkdown(stats: RepairStats) {
  const pushedAt = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", hour12: false });
  return [
    "## 打印机维修数据提醒",
    "",
    `> 推送时间：${pushedAt}`,
    "",
    `维修中：<font color=\"warning\">${numberText(stats.repairing)}</font>`,
    `今天需要寄：<font color=\"warning\">${numberText(stats.sendToday)}</font>`,
    `待寄出：<font color=\"warning\">${numberText(stats.pendingShipment)}</font>`,
    `返厂中：<font color=\"warning\">${numberText(stats.returningFactory)}</font>`,
    `测试中：<font color=\"warning\">${numberText(stats.testing)}</font>`,
    `未维修：<font color=\"warning\">${numberText(stats.unrepaired)}</font>`,
    trackingListText(stats.unrepairedTrackingNumbers),
    "",
    `[${REPAIR_PAGE_URL}](${REPAIR_PAGE_URL})`
  ].join("\n");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return Response.json({ ok: false, error: "只支持 POST 请求" }, { status: 405, headers: corsHeaders });
  }

  const webhookUrl = Deno.env.get("WECOM_WEBHOOK_URL");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const cronSecret = Deno.env.get("WECOM_PUSH_CRON_SECRET");
  if (!webhookUrl) {
    return Response.json({ ok: false, error: "还没有配置企业微信机器人地址" }, { status: 500, headers: corsHeaders });
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    return Response.json({ ok: false, error: "Supabase 环境变量缺失" }, { status: 500, headers: corsHeaders });
  }

  try {
    const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
    const requestCronSecret = request.headers.get("x-cron-secret") || "";
    const isCronRequest = Boolean(cronSecret && requestCronSecret && requestCronSecret === cronSecret);
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    if (!isCronRequest) {
      const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
      if (userError || userData.user?.email !== ADMIN_EMAIL) {
        return Response.json({ ok: false, error: "请先管理员登录" }, { status: 401, headers: corsHeaders });
      }
    }

    if (!isCronRequest && !accessToken) {
      return Response.json({ ok: false, error: "请先管理员登录" }, { status: 401, headers: corsHeaders });
    }

    await request.json().catch(() => ({}));
    const [recordsResult, submissionsResult] = await Promise.all([
      supabase
        .from("repair_records")
        .select("created_time,device_number,final_status,updated_at"),
      supabase
        .from("customer_repair_submissions")
        .select("id,created_time,device_number,tracking_number,updated_at")
    ]);
    if (recordsResult.error) throw recordsResult.error;
    if (submissionsResult.error) throw submissionsResult.error;

    const stats = buildStats(recordsResult.data || [], submissionsResult.data || []);
    const content = buildMarkdown(stats);
    const wecomResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        msgtype: "markdown",
        markdown: { content }
      })
    });
    const result = await wecomResponse.json().catch(() => ({}));
    if (!wecomResponse.ok || result.errcode !== 0) {
      return Response.json(
        { ok: false, error: result.errmsg || "企业微信没有接收成功" },
        { status: 502, headers: corsHeaders }
      );
    }

    return Response.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "推送失败" },
      { status: 500, headers: corsHeaders }
    );
  }
});
