import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, isLocale, locales } from "../../lib/i18n";

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const t = getDictionary(locale);

  return (
    <div className="container">
      <nav className="nav">
        <Link href={`/${locale}`}>{t.nav.home}</Link>
        <Link href={`/${locale}/meeting-pack`}>{t.nav.meetingPack}</Link>
        <Link href={`/${locale}/logs`}>{t.nav.logs}</Link>
        <Link href={`/${locale}/ideas`}>{t.nav.ideas}</Link>
        <div className="nav-right">
          {locales.map((nextLocale) => (
            <Link
              className="pill"
              key={nextLocale}
              href={`/${nextLocale}`}
              aria-current={nextLocale === locale ? "page" : undefined}
            >
              {nextLocale.toUpperCase()}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </div>
  );
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
