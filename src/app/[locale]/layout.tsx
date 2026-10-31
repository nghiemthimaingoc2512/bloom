import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { BloomProvider } from "@/components/bloom-provider";
import { Toaster } from "@/components/bloom/toaster";
import { Analytics } from "@vercel/analytics/react";
import "../globals.css";

// Applies the persisted light/dark mode and color palette before hydration
// so there's no flash of the wrong theme. Rendered below as a plain inline
// <script> straight from this Server Component (not next/script's <Script>,
// which is itself a client component - React hydrates it and warns that an
// inline, src-less script "rendered on the client" won't re-execute). A
// literal <script> emitted by a Server Component instead becomes static SSR
// HTML with no client-side counterpart to hydrate, so the browser just
// parses and runs it inline while streaming the page, before React's client
// bundle even loads - earlier than "beforeInteractive" would have run it.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var mode = localStorage.getItem("theme");
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    }
    var legacy = { rose: "pink", cherryCola: "pink", lime: "sage", mango: "clay", island: "slate", indigo: "lavender" };
    var palette = localStorage.getItem("bloom-palette");
    if (palette && legacy[palette]) {
      palette = legacy[palette];
      localStorage.setItem("bloom-palette", palette);
    }
    if (palette && palette !== "pink") {
      document.documentElement.setAttribute("data-theme", palette);
    }
  } catch (e) {}
})();
`;

// Registers the offline cache so the installed app opens without a network.
const SW_REGISTER_SCRIPT = `
(function () {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function () {});
    });
  }
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
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,400..600&family=Lora:ital,wght@0,400..600;1,400..600&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bloom" />
        <meta name="theme-color" content="#fff5f8" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1b1218" media="(prefers-color-scheme: dark)" />
        <script id="sw-register" dangerouslySetInnerHTML={{ __html: SW_REGISTER_SCRIPT }} />
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
  <NextIntlClientProvider>
    <ThemeProvider>
      <BloomProvider>{children}</BloomProvider>
      <Toaster />
      <Analytics />
    </ThemeProvider>
  </NextIntlClientProvider>
</body>
    </html>
  );
}
