import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import {
  useCreateTransactionMutation,
  useGetUserEnrolledCoursesQuery,
  useGetAssignCoursesQuery,
  useGetUserAssignCourseQuery,
} from "@/state/api";
import { useUser } from "@clerk/nextjs";
import { message } from "antd";
import { v4 as uuidv4 } from "uuid";
import { CheckCircle, BookOpen, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AssignedCourseCardProps {
  course: Course;
  onGoToCourse: (course: Course) => void;
}

const AssignedCourseCard = ({
  course,
  onGoToCourse,
}: AssignedCourseCardProps) => {
  const { user } = useUser();
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createTransaction] = useCreateTransactionMutation();

  // Fetch user's enrolled courses to check enrollment status
  const { data: enrolledCourses } = useGetUserEnrolledCoursesQuery(
    user?.id ?? "",
    {
      skip: !user?.id,
    }
  );
  const { data: assignCourse } = useGetUserAssignCourseQuery({
    userId: user?.id ?? "",
    courseId: course.courseId,
  });

  // Check if the user is already enrolled in this course
  useEffect(() => {
    if (enrolledCourses && course) {
      const enrolled = enrolledCourses.some(
        (enrolledCourse) => enrolledCourse.courseId === course.courseId
      );
      setIsEnrolled(enrolled);
    }
  }, [enrolledCourses, course]);

  useEffect(() => {
    if (assignCourse?.status === "Completed") {
      const completed = assignCourse.status === "Completed";
      setIsCompleted(completed);
    }
  }, [assignCourse]);

  const handleEnroll = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering

    if (!user?.id) {
      message.error("You must be logged in to enroll");
      return;
    }

    if (isEnrolled) {
      // If already enrolled, just navigate to the course
      onGoToCourse(course);
      return;
    }

    setEnrolling(true);

    try {
      // Generate a unique transaction ID
      const transactionId = uuidv4();

      // Create a transaction to enroll in the course
      await createTransaction({
        userId: user.id,
        courseId: course.courseId,
        transactionId,
        amount: 0, // Free for assigned courses
        paymentProvider: "stripe",
        dateTime: new Date().toISOString(),
      }).unwrap();

      message.success("Successfully enrolled in course");
      setIsEnrolled(true);

      // Redirect to the course
      onGoToCourse(course);
    } catch (error) {
      console.error("Failed to enroll:", error);
      message.error("Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
  };

  const getButtonContent = () => {
    if (enrolling) {
      return "Enrolling...";
    }

    if (isEnrolled) {
      return (
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>Continue Learning</span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2">
        <BookOpen className="h-4 w-4" />
        <span>Enroll Now</span>
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Enrolled":
        return "bg-green-500/20 text-green-400";
      case "Assigned":
        return "bg-blue-500/20 text-blue-400";
      case "Canceled":
        return "bg-red-500/20 text-red-400";
      case "Completed":
        return "bg-purple-500/20 text-purple-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  // Format the due date if it exists
  const formattedDueDate = course.assignment?.dueDate
    ? format(new Date(course.assignment.dueDate), "MMM dd, yyyy")
    : "No due date";

  return (
    <Card className="course-card group">
      <CardHeader
        className="course-card__header"
        onClick={() => onGoToCourse(course)}
      >
      </CardHeader>
      <CardContent className="course-card__content">
        <div className="flex justify-between items-start mb-2">
          <CardTitle
            className="course-card__title"
            onClick={() => onGoToCourse(course)}
          >
            {course.title}
          </CardTitle>
          <span
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full",
              getStatusColor(
                isEnrolled
                  ? isCompleted
                    ? "Completed"
                    : "Enrolled"
                  : "Assigned"
              )
            )}
          >
            {isCompleted ? "Completed" : isEnrolled ? "Enrolled" : "Assigned"}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3 mb-2">
          <Avatar className="w-6 h-6">
            <AvatarImage alt={course.teacherName} />
            <AvatarFallback className="bg-secondary-700 text-black">
              {course.teacherName[0]}
            </AvatarFallback>
          </Avatar>

          <p className="text-sm text-customgreys-dirtyGrey">
            {course.teacherName}
          </p>
        </div>

        {/* Assignment information */}
        <div className="border border-customgreys-dirtyGrey rounded-md p-2 my-3 bg-customgreys-secondarybg">
          <div className="flex items-center gap-2 mb-1">
            <User size={16} className="text-primary-700" />
            <p className="text-sm text-white-100">
              Assigned by:{" "}
              <span className="font-semibold">
                {assignCourse?.managerName || "Manager"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-primary-700" />
            <p className="text-sm text-white-100">
              Due: <span className="font-semibold">{formattedDueDate}</span>
            </p>
          </div>
        </div>

        {course.description && (
          <p className="text-sm text-customgreys-dirtyGrey line-clamp-2 mb-3">
            {course.description}
          </p>
        )}

        <Button
          onClick={handleEnroll}
          className={`w-full font-medium py-2 mt-2 ${
            isEnrolled
              ? "bg-green-700 hover:bg-green-600 text-white-50"
              : "bg-primary-700 hover:bg-primary-600 text-white-50"
          }`}
          disabled={enrolling}
        >
          {getButtonContent()}
        </Button>

        <CardFooter className="course-card__footer mt-3 px-0">
          <div className="course-card__category">{course.category}</div>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default AssignedCourseCard;
