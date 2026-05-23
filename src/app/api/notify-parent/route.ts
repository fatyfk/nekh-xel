import { NextRequest, NextResponse } from "next/server";

// POST /api/notify-parent
// Sends an SMS to the parent via Twilio when their child completes a quiz.

interface NotifyBody {
  parentPhone: string;   // E.164, e.g. +221771234567
  studentName: string;
  subject: string;
  score: number;         // 0–100
  xpGained: number;
  streak: number;
}

function buildSMS(body: NotifyBody): string {
  const { studentName, subject, score, xpGained, streak } = body;

  const emoji = score === 100 ? "🥇" : score >= 75 ? "🥈" : score >= 50 ? "🥉" : "📚";
  const mention = score === 100 ? "Score PARFAIT !" : score >= 75 ? "Excellent résultat !" : score >= 50 ? "Bon résultat." : "Continuons les efforts !";

  const streakLine = streak >= 2 ? `\n🔥 Série : ${streak} jours d'affilée !` : "";

  return [
    `${emoji} NEKH XËL — Résultat de ${studentName}`,
    ``,
    `Matière : ${subject}`,
    `Score : ${score}/100 — ${mention}`,
    `XP gagnés : +${xpGained} XP`,
    streakLine,
    ``,
    `Connectez-vous sur nekh-xel.sn pour suivre sa progression.`,
    ``,
    `Jëf ak jàmm ! (Merci et en paix !)`,
  ].filter((l) => l !== undefined).join("\n");
}

export async function POST(req: NextRequest) {
  let body: NotifyBody;
  try {
    body = (await req.json()) as NotifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { parentPhone, studentName, subject, score, xpGained } = body;
  if (!parentPhone || !studentName || !subject) {
    return NextResponse.json({ error: "Missing required fields: parentPhone, studentName, subject" }, { status: 400 });
  }

  // Validate E.164 format
  if (!/^\+\d{8,15}$/.test(parentPhone)) {
    return NextResponse.json({ error: "parentPhone must be E.164 format, e.g. +221771234567" }, { status: 400 });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    // Twilio not configured — log and return graceful no-op
    console.warn("[notify-parent] Twilio env vars missing — SMS not sent. Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER.");
    return NextResponse.json({ sent: false, reason: "Twilio not configured" });
  }

  const message = buildSMS(body);

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const params = new URLSearchParams({
    To:   parentPhone,
    From: fromNumber,
    Body: message,
  });

  try {
    const res = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${basicAuth}`,
        "Content-Type":  "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await res.json() as { sid?: string; status?: string; message?: string };

    if (!res.ok) {
      console.error("[notify-parent] Twilio error:", data);
      return NextResponse.json({ sent: false, error: data.message ?? "Twilio error" }, { status: 502 });
    }

    return NextResponse.json({ sent: true, sid: data.sid, status: data.status });
  } catch (err) {
    console.error("[notify-parent] Network error:", err);
    return NextResponse.json({ sent: false, error: "Network error" }, { status: 502 });
  }
}
