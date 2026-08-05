import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstallPrompt from "@/components/InstallPrompt";
import RegisterPrompt from "@/components/RegisterPrompt";

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
      <RegisterPrompt />
      <InstallPrompt />
    </>
  );
}
