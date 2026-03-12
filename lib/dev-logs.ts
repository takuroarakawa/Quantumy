import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Locale } from "./i18n";

export type DevLogEntry = {
  id: string;
  date: string;
  createdAt: string;
  title: string;
  summary: string;
  idea: string;
  locale: Locale;
  author: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "dev-logs.json");
const DOCS_LOG_DIR = path.join(process.cwd(), "docs", "logs");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(DOCS_LOG_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]\n", "utf8");
  }
}

function normalizeIdea(idea: string): string {
  return idea.replace(/\r\n/g, "\n").trim();
}

function createTitle(idea: string, locale: Locale): string {
  const plain = idea.replace(/\n/g, " ").trim();
  const excerpt = plain.length > 28 ? `${plain.slice(0, 28)}...` : plain;
  return locale === "ja" ? `日次アイデア: ${excerpt}` : `Daily idea: ${excerpt}`;
}

function createSummary(idea: string, locale: Locale): string {
  const plain = idea.replace(/\n/g, " ").trim();
  const excerpt = plain.length > 88 ? `${plain.slice(0, 88)}...` : plain;
  return locale === "ja"
    ? `アイデア入力から自動生成されたログ: ${excerpt}`
    : `Auto-generated from daily idea input: ${excerpt}`;
}

function toDateText(iso: string): string {
  return iso.slice(0, 10);
}

function toFileTimestamp(iso: string): string {
  return iso.replace(/[:.]/g, "-");
}

export async function readDevLogs(): Promise<DevLogEntry[]> {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw) as DevLogEntry[];
  return parsed.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function appendIdeaLog(input: {
  idea: string;
  locale: Locale;
  author?: string;
}): Promise<DevLogEntry> {
  await ensureStore();

  const idea = normalizeIdea(input.idea);
  const createdAt = new Date().toISOString();
  const entry: DevLogEntry = {
    id: randomUUID(),
    date: toDateText(createdAt),
    createdAt,
    title: createTitle(idea, input.locale),
    summary: createSummary(idea, input.locale),
    idea,
    locale: input.locale,
    author: input.author?.trim() || "Takuro Arakawa",
  };

  const logs = await readDevLogs();
  logs.unshift(entry);
  await fs.writeFile(DATA_FILE, `${JSON.stringify(logs, null, 2)}\n`, "utf8");

  const markdown = [
    `# ${entry.title}`,
    "",
    `- id: ${entry.id}`,
    `- date: ${entry.date}`,
    `- createdAt: ${entry.createdAt}`,
    `- locale: ${entry.locale}`,
    `- author: ${entry.author}`,
    "",
    "## Idea input",
    "",
    entry.idea,
    "",
    "## Auto summary",
    "",
    entry.summary,
    "",
    "## Next actions",
    "",
    "- Break this idea into UI flow, data model, and delivery milestones.",
    "- Validate legal/ops constraints before production release.",
    "- Add this item to the weekly product review.",
    "",
  ].join("\n");

  const filename = `${toFileTimestamp(entry.createdAt)}_${entry.id.slice(0, 8)}_idea.md`;
  await fs.writeFile(path.join(DOCS_LOG_DIR, filename), markdown, "utf8");

  return entry;
}
