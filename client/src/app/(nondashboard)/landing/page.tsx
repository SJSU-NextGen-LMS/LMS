"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";


/**
 * Landing page component that serves as the entry point for non-authenticated users
 * Includes authentication state handling and redirects
 */
const Landing = () => {
  const router = useRouter();
  const { user } = useUser();

  // Redirect authenticated users to their courses
  useEffect(() => {
    if (user) {
      router.push("/user/courses");
    }
  }, [user, router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="landing"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="landing__hero"
      >
        <div className="landing__hero-content">
          <h1 className="landing__title">Welcome to YOLO LMS</h1>
          
          <div className="landing__cta">
            <SignedIn>
              <div className="landing__welcome">
                <p className="landing__description">
                  Hello, {user?.firstName}!
                </p>
              </div>
            </SignedIn>

            <SignedOut>
              <p className="landing__description">
                Please sign in to continue
              </p>
              <div className="flex gap-4">
                <Link
                  href="/signin"
                  className="nondashboard-navbar__auth-button--login"
                  scroll={false}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="nondashboard-navbar__auth-button--signup"
                  scroll={false}
                >
                  Sign up
                </Link>
              </div>
            </SignedOut>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Landing;
