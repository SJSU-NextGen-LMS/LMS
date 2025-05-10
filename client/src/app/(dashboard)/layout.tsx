"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// Components
import AppSidebar from "@/components/AppSidebar";
import Loading from "@/components/Loading";
import ChaptersSidebar from "./user/courses/[courseId]/ChaptersSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

// Utils
import { cn } from "@/lib/utils";

/**
 * DashboardLayout component that provides the main layout structure for authenticated users
 * Includes sidebar navigation, course chapters sidebar (when applicable), and main content area
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [courseId, setCourseId] = useState<string | null>(null);

  // Check if current page is a course page
  const isCoursePage = /^\/user\/courses\/[^\/]+(?:\/chapters\/[^\/]+)?$/.test(pathname);

  // Extract courseId from URL when on a course page
  useEffect(() => {
    if (isCoursePage) {
      const match = pathname.match(/\/user\/courses\/([^\/]+)/);
      setCourseId(match ? match[1] : null);
    } else {
      setCourseId(null);
    }
  }, [isCoursePage, pathname]);

  // Show loading state while user data is being fetched
  if (!isLoaded) return <Loading />;
  
  // Redirect if user is not authenticated
  if (!user) return <div>Please sign in to access this page.</div>;

  return (
    <SidebarProvider>
      <div className="dashboard">
        <AppSidebar />
        <div className="dashboard__content">
          {courseId && <ChaptersSidebar />}
          <div
            className={cn(
              "dashboard__main",
              isCoursePage && "dashboard__main--not-course"
            )}
            style={{ height: "100vh" }}
          >
            <main className="dashboard__body">{children}</main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
