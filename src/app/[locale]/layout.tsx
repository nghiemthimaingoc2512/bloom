import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { BloomProvider } from "@/components/bloom-provider";
import { Nav } from "@/components/bloom/nav";
import { Toaster } from "@/components/bloom/toaster";
import "../globals.css";

// Applies the persisted theme class before hydration so there's no flash of
// the wrong theme. Runs via next/script (strategy="beforeInteractive"),
// which Next.js injects outside normal React child reconciliation - a plain
// <script> element rendered as JSX would not execute on client re-renders.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    metadataBase: new URL("https://bloomdaily.com"),
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: "https://bloomdaily.com",
      siteName: "Bloom",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- this layout is the App Router document root */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,400..600&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <NextIntlClientProvider>
          <ThemeProvider>
            <Nav />
            <main className="max-w-5xl mx-auto px-5 pb-20 pt-2">
              <BloomProvider>{children}</BloomProvider>
            </main>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
