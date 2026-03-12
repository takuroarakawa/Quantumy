import { notFound } from "next/navigation";
import { readDevLogs } from "../../../lib/dev-logs";
import { getDictionary, isLocale } from "../../../lib/i18n";

type LogsProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export default async function LogsPage({ params }: LogsProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale);
  const logs = await readDevLogs();

  return (
    <main>
      <h1>{t.logs.heading}</h1>
      <p className="muted">{t.logs.body}</p>
      {logs.length === 0 ? <p className="muted">{t.logs.empty}</p> : null}
      <div className="cards">
        {logs.map((log) => (
          <article className="card" key={log.id}>
            <h3>{log.title}</h3>
            <p className="muted">{log.date}</p>
            <p>{log.summary}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
