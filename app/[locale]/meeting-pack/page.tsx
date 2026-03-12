import { notFound } from "next/navigation";
import { meetingPackFiles } from "../../../lib/content";
import { getDictionary, isLocale } from "../../../lib/i18n";

type MeetingPackProps = {
  params: Promise<{ locale: string }>;
};

export default async function MeetingPackPage({ params }: MeetingPackProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale);

  return (
    <main>
      <h1>{t.meetingPack.heading}</h1>
      <p className="muted">{t.meetingPack.body}</p>
      <ul>
        {meetingPackFiles.map((file) => (
          <li key={file}>{file}</li>
        ))}
      </ul>
    </main>
  );
}
