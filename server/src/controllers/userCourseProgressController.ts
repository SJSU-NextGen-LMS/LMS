import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import UserCourseProgress from "../models/userCourseProgressModel";
import AssignCourse from "../models/assignCourseModel";
import Course from "../models/courseModel";
import { calculateOverallProgress } from "../utils/utils";
import { mergeSections } from "../utils/utils";

export const getUserEnrolledCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const auth = getAuth(req);

  if (!auth || auth.userId !== userId) {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  try {
    const enrolledCourses = await UserCourseProgress.query("userId")
      .eq(userId)
      .exec();
    const courseIds = enrolledCourses.map((item: any) => item.courseId);
    let courses: any[] = [];
    if (courseIds.length > 0) {
      courses = await Course.batchGet(courseIds);
    }
    res.json({
      message: "Enrolled courses retrieved successfully",
      data: courses,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving enrolled courses", error });
  }
};

export const getUserCourseProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId } = req.params;

  try {
    const progress = await UserCourseProgress.get({ userId, courseId });
    if (!progress) {
      res
        .status(404)
        .json({ message: "Course progress not found for this user" });
      return;
    }
    res.json({
      message: "Course progress retrieved successfully",
      data: progress,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving user course progress", error });
  }
};

export const updateUserCourseProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId } = req.params;
  const progressData = req.body;

  try {
    let progress = await UserCourseProgress.get({ userId, courseId });
    if (!progress) {
      // If no progress exists, create initial progress
      progress = new UserCourseProgress({
        userId,
        courseId,
        enrollmentDate: new Date().toISOString(),
        overallProgress: 0,
        status: "in_progress",
        sections: progressData.sections || [],
        lastAccessedTimestamp: new Date().toISOString(),
      });
    } else {
      // Merge existing progress with new progress data
      progress.sections = mergeSections(
        progress.sections,
        progressData.sections || []
      );
      progress.lastAccessedTimestamp = new Date().toISOString();
      progress.overallProgress = calculateOverallProgress(progress.sections);

      // Update status if progress is 100%
      if (progress.overallProgress === 100) {
        progress.status = "completed";
        let assignCourse = await AssignCourse.get({ userId, courseId });
        if (assignCourse) {
          assignCourse.status = "Completed";
          await assignCourse.save();
        }
      } else {
        progress.status = "in_progress";
      }
    }

    await progress.save();

    res.json({
      message: "",
      data: progress,
    });
  } catch (error) {
    console.error("Error updating progress:", error);
    res.status(500).json({
      message: "Error updating user course progress",
      error,
    });
  }
};

export const getAllStudentsProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const auth = getAuth(req);

  if (!auth) {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  const { userId } = auth;
  const userType = req.headers["x-user-type"] as string;

  // Debug info to help troubleshoot
  console.log("getAllStudentsProgress called");
  console.log("User type:", userType);
  console.log("Auth user ID:", userId);

  // Check if user is a manager or admin
  if (userType !== "manager" && userType !== "admin") {
    console.log(
      "User does not have manager or admin role. Received role:",
      userType
    );

    // In production, add additional fallback checks
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction && auth.userId) {
      // In production, if we have a valid auth user, we'll allow access
      // This is a temporary solution - in a real application, you'd want
      // to verify the role with a more robust system
      console.log("Production environment: allowing authenticated user access");
    } else {
      res
        .status(403)
        .json({ message: "Access denied. Manager or admin role required." });
      return;
    }
  }

  try {
    // Get all progress records
    const allProgressRecords = await UserCourseProgress.scan().exec();
    console.log(`Found ${allProgressRecords.length} progress records`);

    // Get unique course IDs from progress records
    const courseIds = [
      ...new Set(allProgressRecords.map((record: any) => record.courseId)),
    ];
    console.log(`Found ${courseIds.length} unique courses`);

    // Get course details for all courses
    const courses =
      courseIds.length > 0 ? await Course.batchGet(courseIds) : [];
    const coursesMap = courses.reduce((map: any, course: any) => {
      map[course.courseId] = course;
      return map;
    }, {});

    // Format the response data
    const formattedData = allProgressRecords.map((record: any) => ({
      userId: record.userId,
      courseId: record.courseId,
      courseName: coursesMap[record.courseId]?.title || "Unknown Course",
      enrollmentDate: record.enrollmentDate,
      overallProgress: record.overallProgress,
      status: record.status,
      lastAccessed: record.lastAccessedTimestamp,
    }));

    // Ensure we're sending a proper JSON response
    res.setHeader("Content-Type", "application/json");
    res.json({
      message: "Student progress data retrieved successfully",
      data: formattedData,
    });
  } catch (error) {
    console.error("Error retrieving student progress:", error);
    res.status(500).json({
      message: "Error retrieving student progress data",
      error,
    });
  }
};
