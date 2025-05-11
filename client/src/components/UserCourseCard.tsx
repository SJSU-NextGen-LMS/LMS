import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useGetUserCourseProgressQuery } from "@/state/api";

interface UserCourseCardProps {
  course: Course;
  onGoToCourse: (course: Course) => void;
}

const UserCourseCard = ({ course, onGoToCourse }: UserCourseCardProps) => {
  const { user } = useUser();

  // Fetch the user's progress for this specific course
  const { data: progress } = useGetUserCourseProgressQuery(
    {
      userId: user?.id || "",
      courseId: course.courseId,
    },
    { skip: !user?.id }
  );

  // Calculate percentage based on completed chapters
  const calculateProgress = (): number => {
    if (!progress) return 0;

    // Calculate total chapters and completed chapters
    let totalChapters = 0;
    let completedChapters = 0;

    progress.sections.forEach((section) => {
      totalChapters += section.chapters.length;
      completedChapters += section.chapters.filter(
        (chapter) => chapter.completed
      ).length;
    });

    // Avoid division by zero
    if (totalChapters === 0) return 0;

    return Math.round((completedChapters / totalChapters) * 100);
  };

  const progressPercentage = calculateProgress();

  return (
    <Card className="course-card group" onClick={() => onGoToCourse(course)}>
      <CardHeader className="course-card__header">
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
        <CardTitle className="course-card__title mb-2">
          {course.title}
        </CardTitle>

        {course.description && (
          <p className="text-sm text-customgreys-dirtyGrey line-clamp-2 mb-3">
            {course.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-3">
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

        <div className="mt-3 mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-customgreys-dirtyGrey">Progress</span>
            <span className="text-xs text-customgreys-dirtyGrey font-medium">
              {progressPercentage}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-1.5" />
        </div>

        <CardFooter className="course-card__footer pt-3 px-0">
          <div className="course-card__category">{course.category}</div>
          <div className="text-xs bg-primary-700/20 text-primary-500 px-2 py-1 rounded-full">
            {course.level}
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default UserCourseCard;
