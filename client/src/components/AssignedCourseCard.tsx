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
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { useCreateTransactionMutation } from "@/state/api";
import { useUser } from "@clerk/nextjs";
import { message } from "antd";
import { v4 as uuidv4 } from "uuid";

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
  const [createTransaction] = useCreateTransactionMutation();

  const handleEnroll = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering

    if (!user?.id) {
      message.error("You must be logged in to enroll");
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

      // Redirect to the course
      onGoToCourse(course);
    } catch (error) {
      console.error("Failed to enroll:", error);
      message.error("Failed to enroll in course");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <Card className="course-card group">
      <CardHeader
        className="course-card__header"
        onClick={() => onGoToCourse(course)}
      >
        <Image
          src={course.image || "/placeholder.png"}
          alt={course.title}
          width={400}
          height={350}
          className="course-card__image"
          priority
        />
      </CardHeader>
      <CardContent className="course-card__content">
        <CardTitle
          className="course-card__title"
          onClick={() => onGoToCourse(course)}
        >
          {course.title}
        </CardTitle>

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

        {course.description && (
          <p className="text-sm text-customgreys-dirtyGrey line-clamp-2 mb-3">
            {course.description}
          </p>
        )}

        <Button
          onClick={handleEnroll}
          className="w-full bg-primary-700 hover:bg-primary-600 text-white-50 font-medium py-2 mt-2"
          disabled={enrolling}
        >
          {enrolling ? "Enrolling..." : "Enroll Now"}
        </Button>

        <CardFooter className="course-card__footer mt-3 px-0">
          <div className="course-card__category">{course.category}</div>
          <div className="text-xs text-gray-400">Assigned Course</div>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default AssignedCourseCard;
