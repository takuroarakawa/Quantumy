import { notFound } from "next/navigation";
import { devLogs } from "../../../lib/content";
import { getDictionary, isLocale } from "../../../lib/i18n";

type LogsProps = {
  params: Promise<{ locale: string }>;
};

export default async function LogsPage({ params }: LogsProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale);

  return (
    <main>
      <h1>{t.logs.heading}</h1>
      <p className="muted">{t.logs.body}</p>
      <div className="cards">
        {devLogs.map((log) => (
          <article className="card" key={`${log.date}-${log.title}`}>
            <h3>{log.title}</h3>
            <p className="muted">{log.date}</p>
            <p>{log.summary}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
