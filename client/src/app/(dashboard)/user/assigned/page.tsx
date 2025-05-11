"use client";

import Toolbar from "@/components/Toolbar";
import AssignedCourseCard from "@/components/AssignedCourseCard";
import { useGetAssignCoursesQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useUser } from "@clerk/nextjs";
import { useState, useMemo } from "react";
import Loading from "@/components/Loading";
import { useFilteredCourses } from "@/hooks/userFilteredCourses";

const AssignedCourses = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    data: courses,
    isLoading,
    isError,
  } = useGetAssignCoursesQuery(user?.id ?? "", {
    skip: !isLoaded || !user,
  });

  const filteredCourses = useFilteredCourses(
    courses?.filter((course) => course.assignment?.status !== "Completed"),
    searchTerm,
    selectedCategory,
  );

  const handleGoToCourse = (course: Course) => {
    if (
      course.sections &&
      course.sections.length > 0 &&
      course.sections[0].chapters.length > 0
    ) {
      const firstChapter = course.sections[0].chapters[0];
      router.push(
        `/user/courses/${course.courseId}/chapters/${firstChapter.chapterId}`,
        {
          scroll: false,
        }
      );
    } else {
      router.push(`/user/courses/${course.courseId}`, {
        scroll: false,
      });
    }
  };

  if (!isLoaded || isLoading) return <Loading />;
  if (!user) return <div>Please sign in to view your courses.</div>;
  if (isError || !courses || courses.length === 0)
    return (
      <div className="user-courses">
        <Header
          title="Assigned Courses"
          subtitle="View your assigned courses and enroll"
        />
        <Toolbar
          onSearch={setSearchTerm}
          onCategoryChange={setSelectedCategory}
        />
        <div className="p-4 text-center">You have no assigned courses</div>
      </div>
    );

  return (
    <div className="user-courses">
      <Header
        title="Assigned Courses"
        subtitle="View your assigned courses and enroll"
      />
      <Toolbar
        onSearch={setSearchTerm}
        onCategoryChange={setSelectedCategory}
      />
      <div className="user-courses__grid">
        {filteredCourses.map((course) => (
          <AssignedCourseCard
            key={course.courseId}
            course={course}
            onGoToCourse={handleGoToCourse}
          />
        ))}
      </div>
    </div>
  );
};

export default AssignedCourses;
