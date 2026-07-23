import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstallPrompt from "@/components/InstallPrompt";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <InstallPrompt />
    </>
  );
}
