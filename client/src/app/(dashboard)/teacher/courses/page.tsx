"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

// Components
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import TeacherCourseCard from "@/components/TeacherCourseCard";
import Toolbar from "@/components/Toolbar";
import { Button } from "@/components/ui/button";
import { useFilteredCourses } from "@/hooks/userFilteredCourses";
// API Hooks
import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetTeacherCoursesQuery,
} from "@/state/api";

// Types

/**
 * TeacherCourses component that displays all courses created by the teacher
 * Includes course management functionality (create, edit, delete)
 */
const TeacherCourses = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // API Queries and Mutations

  const [createCourse] = useCreateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();
  const {
    data: courses,
    isLoading,
    isError,
  } = useGetTeacherCoursesQuery(user?.id ?? "", {
    skip: !isLoaded || !user,
  });

  /**
   * Filter courses based on search term and selected category
   */
  const filteredCourses = useFilteredCourses(courses, searchTerm, selectedCategory);

  /**
   * Navigate to course edit page
   */
  const handleEdit = (course: Course) => {
    router.push(`/teacher/courses/${course.courseId}`, {
      scroll: false,
    });
  };

  /**
   * Delete a course after confirmation
   */
  const handleDelete = async (course: Course) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteCourse(course.courseId).unwrap();
      } catch (error) {
        console.error("Failed to delete course:", error);
        // You might want to show a toast notification here
      }
    }
  };

  /**
   * Create a new course and navigate to its edit page
   */
  const handleCreateCourse = async () => {
    if (!user) return;

    try {
      const result = await createCourse({
        teacherId: user.id,
        teacherName: user.fullName || "Unknown Teacher",
      }).unwrap();
      
      router.push(`/teacher/courses/${result.courseId}`, {
        scroll: false,
      });
    } catch (error) {
      console.error("Failed to create course:", error);
      // You might want to show a toast notification here
    }
  };

  // Loading state
 // Prevent rendering until Clerk has loaded
 if (!isLoaded) return <Loading />;

 if (isLoading) return <Loading />;
 if (!user) {
   router.push("/sign-in");
   return null;
 }
  
  // Error state
  if (isError || !courses) {
    return (
      <div className="teacher-courses">
        <Header title="Courses" subtitle="Browse your courses" />
        <div className="teacher-courses__error">
          Error loading courses. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-courses">
      <Header
        title="Courses"
        subtitle="Browse your courses"
        rightElement={
          <Button
            onClick={handleCreateCourse}
            className="teacher-courses__header"
          >
            Create Course
          </Button>
        }
      />
      <Toolbar
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
        rightElement={
          <Button
            onClick={handleCreateCourse}
            className="teacher-courses__header"
          >
            Create Course
          </Button>
        }
      />
      <div className="teacher-courses__grid">
        {filteredCourses.map((course) => (
          <TeacherCourseCard
            key={course.courseId}
            course={course}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isOwner={course.teacherId === user?.id}
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherCourses;
