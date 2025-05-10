"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// Components
import Toolbar from "@/components/Toolbar";
import CourseCard from "@/components/CourseCard";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useFilteredCourses } from "@/hooks/userFilteredCourses";
// API Hooks
import { useGetUserEnrolledCoursesQuery } from "@/state/api";

/**
 * Courses page component that displays all enrolled courses for the current user
 * Includes search and category filtering functionality
 */
const Courses = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch enrolled courses
  const {
    data: courses,
    isLoading,
    isError,
  } = useGetUserEnrolledCoursesQuery(user?.id ?? "", {
    skip: !isLoaded || !user,
  });

  /**
   * Filter courses based on search term and selected category
   */
  const filteredCourses = useFilteredCourses(courses, searchTerm, selectedCategory);

  /**
   * Navigate to the first chapter of a course or the course overview
   */
  const handleGoToCourse = (course: Course) => {
    const hasChapters = course.sections?.[0]?.chapters?.length > 0;
    
    if (hasChapters) {
      const firstChapter = course.sections[0].chapters[0];
      router.push(
        `/user/courses/${course.courseId}/chapters/${firstChapter.chapterId}`,
        { scroll: false }
      );
    } else {
      router.push(`/user/courses/${course.courseId}`, { scroll: false });
    }
  };

  // Loading state
  if (!isLoaded || isLoading) return <Loading />;
  
  // Authentication check
  if (!user) return <div>Please sign in to view your courses.</div>;
  
  // Error or empty state
  if (isError || !courses || courses.length === 0) {
    return (
      <div className="user-courses">
        <Header 
          title="My Courses" 
          subtitle="View your enrolled courses" 
        />
        <Toolbar
          onSearch={setSearchTerm}
          onCategoryChange={setSelectedCategory}
        />
        <div className="user-courses__empty">
          You have no enrolled courses
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="user-courses">
      <Header 
        title="My Courses" 
        subtitle="View your enrolled courses" 
      />
      <Toolbar
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
      />
      <div className="user-courses__grid">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.courseId}
            course={course}
            onGoToCourse={handleGoToCourse}
          />
        ))}
      </div>
    </div>
  );
};

export default Courses;
