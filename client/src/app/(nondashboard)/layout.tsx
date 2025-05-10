import NonDashboardNavbar from "@/components/NonDashboardNavbar";
import Footer from "@/components/Footer";

/**
 * Layout component for non-authenticated pages
 * Provides a consistent layout with navigation and footer
 */
export default function NonDashboardLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <div className="nondashboard-layout">
      <NonDashboardNavbar />
      <main className="nondashboard-layout__main">
        {children}
      </main>
      <Footer />
    </div>
  );
}
