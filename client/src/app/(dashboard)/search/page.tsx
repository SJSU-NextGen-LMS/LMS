"use client";

import CourseCardSearch from "@/components/CourseCardSearch";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import SelectedCourse from "./SelectedCourse";
import Toolbar from "@/components/Toolbar";
import { Button } from "@/components/ui/button";
import {
  useGetCoursesQuery,
  useCreateTransactionMutation,
} from "@/state/api";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useMemo, useState, useEffect} from "react";



const Search = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const router = useRouter();
  const { user } = useUser();
  const {
    data: courses,
    isLoading,
    isError,
  } = useGetCoursesQuery({ category: "all" });


  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [createTransaction, { isLoading: isTransactionLoading, isError: isTransactionError }] = useCreateTransactionMutation();
  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);
  

    const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    router.push(`/search?id=${course.courseId}`, {
      scroll: false,
    });
  };

  const handleEnrollNow = async (courseId: string) => {
    try {
      const transactionData: Partial<Transaction> = {
        transactionId: "empty",
        userId: user?.id,
        courseId,
        paymentProvider: "stripe",
        amount: 0,
      };
  
      await createTransaction(transactionData).unwrap(); 
      router.push("/user/courses");
    } catch (error) {
      console.error("Transaction failed:", error);
    }
    

  if (isTransactionLoading) return <Loading />;
  if (isTransactionError || !courses) return <div>Failed to fetch courses</div>;

  };
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



  if (isLoading) return <Loading />;
  if (isError || !courses) return <div>Error loading courses.</div>;

  return (
    <div className ="search_page">
      <Header
        title="Courses"
        subtitle="Browse your courses"

      />
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
