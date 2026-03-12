import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "../../lib/i18n";

type LocaleHomeProps = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHome({ params }: LocaleHomeProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale);

  return (
    <>
      <section className="hero">
        <h1>{t.home.heading}</h1>
        <p className="muted">{t.home.subheading}</p>
      </section>
      <section className="cards">
        <article className="card">
          <h3>{t.home.cards.meetingPackTitle}</h3>
          <p className="muted">{t.home.cards.meetingPackBody}</p>
          <Link href={`/${locale}/meeting-pack`}>→</Link>
        </article>
        <article className="card">
          <h3>{t.home.cards.logsTitle}</h3>
          <p className="muted">{t.home.cards.logsBody}</p>
          <Link href={`/${locale}/logs`}>→</Link>
        </article>
        <article className="card">
          <h3>{t.home.cards.ideasTitle}</h3>
          <p className="muted">{t.home.cards.ideasBody}</p>
          <Link href={`/${locale}/ideas`}>→</Link>
        </article>
        <article className="card">
          <h3>{t.home.cards.roadmapTitle}</h3>
          <p className="muted">{t.home.cards.roadmapBody}</p>
        </article>
      </section>
    </>
  );
}
