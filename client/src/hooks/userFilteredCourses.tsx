// hooks/useFilteredCourses.ts
import { useMemo } from "react";

export function useFilteredCourses(
  courses: Course[] | undefined,
  searchTerm: string,
  selectedCategory: string
): Course[] {
  return useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        course.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory.toLowerCase().replace(/\s+/g, '');

      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);
}