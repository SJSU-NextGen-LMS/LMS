import React from "react";
import AccordionSections from "@/components/AccordionSections";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

// Types

interface SelectedCourseProps {
  course: Course;
  handleEnrollNow: (courseId: string) => void;
}

/**
 * SelectedCourse component that displays detailed information about a selected course
 */
const SelectedCourse: React.FC<SelectedCourseProps> = ({ 
  course, 
  handleEnrollNow 
}) => {
  return (
    <div className="selected-course">
      <div>
        <h3 className="selected-course__title">{course.title}</h3>
        <p className="selected-course__author">
          By {course.teacherName} |{" "}
          <span className="selected-course__enrollment-count">
            {course?.enrollments?.length || 0} students
          </span>
        </p>
      </div>

      <div className="selected-course__content">
        <p className="selected-course__description">{course.description}</p>

        <div className="selected-course__sections">
          <h4 className="selected-course__sections-title">Course Content</h4>
          <AccordionSections sections={course.sections} />
        </div>

        <div className="selected-course__footer">
          <Button
            onClick={() => handleEnrollNow(course.courseId)}
            className="bg-primary-700 hover:bg-primary-600"
          >
            Enroll Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectedCourse;
