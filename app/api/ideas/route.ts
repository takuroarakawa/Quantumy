import { NextResponse } from "next/server";
import { appendIdeaLog, readDevLogs } from "../../../lib/dev-logs";
import { isLocale, type Locale } from "../../../lib/i18n";

type CreateIdeaPayload = {
  idea?: unknown;
  locale?: unknown;
  author?: unknown;
};

export async function GET() {
  const logs = await readDevLogs();
  return NextResponse.json({ logs });
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as CreateIdeaPayload;
    const idea = typeof payload.idea === "string" ? payload.idea.trim() : "";
    const localeValue = typeof payload.locale === "string" ? payload.locale : "ja";
    const author = typeof payload.author === "string" ? payload.author : undefined;

    if (idea.length < 10) {
      return NextResponse.json(
        { error: "Idea must be at least 10 characters." },
        { status: 400 },
      );
    }

    const locale: Locale = isLocale(localeValue) ? localeValue : "ja";
    const entry = await appendIdeaLog({ idea, locale, author });
    return NextResponse.json({ entry }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create idea log." },
      { status: 500 },
    );
  }
}
