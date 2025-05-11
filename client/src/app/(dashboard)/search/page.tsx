"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { v4 as uuidv4 } from "uuid";
import { message } from "antd";

// Components
import CourseCardSearch from "@/components/CourseCardSearch";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import SelectedCourse from "./SelectedCourse";
import Toolbar from "@/components/Toolbar";
import { useFilteredCourses } from "@/hooks/userFilteredCourses";
// API Hooks
import { useGetCoursesQuery, useCreateTransactionMutation } from "@/state/api";

/**
 * Search page component that allows users to browse and enroll in courses
 */
const Search = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const id = searchParams.get("id");

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // API Queries
  const {
    data: courses,
    isLoading,
    isError,
  } = useGetCoursesQuery({ category: "all" });

  const [
    createTransaction,
    { isLoading: isTransactionLoading, isError: isTransactionError },
  ] = useCreateTransactionMutation();

  /**
   * Filter courses based on search term and selected category
   */
  const filteredCourses = useFilteredCourses(
    courses?.filter((course) => !course.enrollments?.find((enrollment) => enrollment.userId == user?.id)),
    searchTerm,
    selectedCategory
  );

  /**
   * Handle course selection and update URL
   */
  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    router.push(`/search?id=${course.courseId}`, {
      scroll: false,
    });
  };

  /**
   * Handle course enrollment
   */
  const handleEnrollNow = async (courseId: string) => {
    if (!user) {
      message.error("You must be logged in to enroll");
      return;
    }

    try {
      const transactionData: Partial<Transaction> = {
        transactionId: uuidv4(),
        userId: user.id,
        courseId,
        paymentProvider: "stripe",
        amount: 0,
        dateTime: new Date().toISOString(),
      };

      await createTransaction(transactionData).unwrap();
      message.success("Successfully enrolled in course");
      router.push("/user/courses");
    } catch (error) {
      console.error("Transaction failed:", error);
      message.error("Failed to enroll in course");
    }
  };

  // Set initial selected course
  useEffect(() => {
    if (courses) {
      if (id) {
        const course = courses.find((c) => c.courseId === id);
        setSelectedCourse(course || courses[0]);
      } else {
        setSelectedCourse(courses[0]);
      }
    }
  }, [courses, id]);

  // Loading states
  if (isLoading || isTransactionLoading) return <Loading />;
  if (isError || isTransactionError || !courses) {
    return (
      <div className="search_page">
        <Header title="Courses" subtitle="Browse courses" />
        <div className="search__error">
          Error loading courses. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="search_page">
      <Header title="Courses" subtitle="Browse courses" />
      <Toolbar
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
      />
      <div className="search__content">
        <div className="search__courses-grid">
          {filteredCourses.map((course) => (
            <CourseCardSearch
              key={course.courseId}
              course={course}
              isSelected={selectedCourse?.courseId === course.courseId}
              onClick={() => handleCourseSelect(course)}
            />
          ))}
        </div>
        {selectedCourse && (
          <div className="search__selected-course">
            <SelectedCourse
              course={selectedCourse}
              handleEnrollNow={handleEnrollNow}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
