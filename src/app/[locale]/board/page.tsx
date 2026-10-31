import { redirect } from "@/i18n/navigation";

// This screen was merged into Today; old links and saved tabs land there.
export default async function BoardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/", locale });
}
