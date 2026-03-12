import { notFound } from "next/navigation";
import IdeaInputForm from "../../../components/idea-input-form";
import { getDictionary, isLocale } from "../../../lib/i18n";

type IdeasPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export default async function IdeasPage({ params }: IdeasPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale);

  return (
    <main>
      <h1>{t.ideas.heading}</h1>
      <p className="muted">{t.ideas.body}</p>
      <IdeaInputForm locale={locale} />
    </main>
  );
}
