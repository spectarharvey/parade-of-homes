import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstallPrompt from "@/components/InstallPrompt";
import RegisterPrompt from "@/components/RegisterPrompt";
import { CmsProvider } from "@/lib/cms/context";
import { getSiteContentStore } from "@/lib/cms/server";

// Website Content overrides are read per request and applied while the page is
// server-rendered: an admin save is live on the very next load, the served HTML
// always contains the real copy (no flash, no SEO hit), and nothing is frozen
// into a build-time prerender.
export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteContent = await getSiteContentStore();

  return (
    <CmsProvider values={siteContent}>
      <Header />
      <main>{children}</main>
      <Footer />
      <RegisterPrompt />
      <InstallPrompt />
    </CmsProvider>
  );
}
