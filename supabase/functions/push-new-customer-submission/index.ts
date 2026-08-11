import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const REPAIR_PAGE_URL = "https://hihu-hu.github.io/repair-register/#submissions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

type CustomerSubmissionRow = {
  id: string;
  submission_number?: number;
  created_time?: string;
  device_number?: string;
  model?: string;
  company_name?: string;
  contact_name?: string;
  phone?: string;
  tracking_number?: string;
  customer_issue?: string;
  customer_address?: string;
  wecom_notified_at?: string;
};

function getSecretKey() {
  const legacyKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (legacyKey) return legacyKey;

  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    return String(keys.default || "");
  } catch {
    return "";
  }
}

function messageText(value: unknown, maxLength = 300) {
  return String(value || "")
    .replace(/[<>]/g, "")
    .replace(/\s*\n+\s*/g, "；")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength) || "未填写";
}

function formatTime(value: unknown) {
  const date = new Date(String(value || ""));
  if (Number.isNaN(date.getTime())) return messageText(value);
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).format(date);
}

function buildMarkdown(submission: CustomerSubmissionRow) {
  const number = submission.submission_number ? `B${submission.submission_number}` : "待分配";
  return [
    "## 有新的客户维修登记",
    "",
    `> 登记编号：<font color=\"warning\">${number}</font>`,
    `> 提交时间：${formatTime(submission.created_time)}`,
    "",
    `快递单号：${messageText(submission.tracking_number, 120)}`,
    `打印机编号：${messageText(submission.device_number, 40)}`,
    `型号：${messageText(submission.model, 40)}`,
    `公司名：${messageText(submission.company_name, 120)}`,
    `联系人：${messageText(submission.contact_name, 60)}`,
    `电话：${messageText(submission.phone, 30)}`,
    `客户描述：${messageText(submission.customer_issue, 500)}`,
    `收件地址：${messageText(submission.customer_address, 300)}`,
    "",
    `[打开客户提交列表](${REPAIR_PAGE_URL})`
  ].join("\n");
}

async function sendToWecom(webhookUrl: string, content: string) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      msgtype: "markdown",
      markdown: { content }
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.errcode !== 0) {
    throw new Error(result.errmsg || "企业微信没有接收成功");
  }
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
  const secretKey = getSecretKey();
  if (!webhookUrl) {
    return Response.json({ ok: false, error: "还没有配置企业微信机器人地址" }, { status: 500, headers: corsHeaders });
  }
  if (!supabaseUrl || !secretKey) {
    return Response.json({ ok: false, error: "Supabase 云端密钥缺失" }, { status: 500, headers: corsHeaders });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const submissionId = String(body.submissionId || "").trim();
    if (!/^customer-\d{10,}-[a-f0-9]+$/i.test(submissionId)) {
      return Response.json({ ok: false, error: "登记编号格式不正确" }, { status: 400, headers: corsHeaders });
    }

    const supabaseAdmin = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const notifiedAt = new Date().toISOString();
    const { data: claimedRows, error: claimError } = await supabaseAdmin
      .from("customer_repair_submissions")
      .update({ wecom_notified_at: notifiedAt })
      .eq("id", submissionId)
      .is("wecom_notified_at", null)
      .select("id,submission_number,created_time,device_number,model,company_name,contact_name,phone,tracking_number,customer_issue,customer_address,wecom_notified_at");
    if (claimError) throw claimError;

    const submission = claimedRows?.[0] as CustomerSubmissionRow | undefined;
    if (!submission) {
      return Response.json({ ok: true, alreadyNotified: true }, { headers: corsHeaders });
    }

    try {
      await sendToWecom(webhookUrl, buildMarkdown(submission));
    } catch (error) {
      await supabaseAdmin
        .from("customer_repair_submissions")
        .update({ wecom_notified_at: null })
        .eq("id", submissionId)
        .eq("wecom_notified_at", notifiedAt);
      throw error;
    }

    return Response.json({ ok: true }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "推送失败" },
      { status: 500, headers: corsHeaders }
    );
  }
});
