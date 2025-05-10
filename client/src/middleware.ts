import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isTeacherRoute = createRouteMatcher(["/teacher/(.*)"]);
const isManagerRoute = createRouteMatcher(["/manager/(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin/(.*)"]);
export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();
  const userRole =
    (sessionClaims?.metadata as { userType: "student" | "teacher" | "manager" | "admin"})
      ?.userType || "student";


  // restrict access to teacher routes
  if (isTeacherRoute(req)) {
    if (userRole == "student") {
      const url = new URL("/user/courses", req.url);
      return NextResponse.redirect(url);
    }
  }

  // restrict access to manager routes
  if (isManagerRoute(req)) {
    if (userRole == "student" || userRole == "teacher") {
      const url = new URL("/user/courses", req.url);
      return NextResponse.redirect(url);
    }
  }

  // restrict access to admin routes
  if (isAdminRoute(req)) {
    if (userRole !== "admin") {
      const url = new URL("/user/courses", req.url);
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
