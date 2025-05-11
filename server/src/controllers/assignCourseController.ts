import dotenv from "dotenv";
import { Request, Response } from "express";
import Course from "../models/courseModel";
import AssignCourse from "../models/assignCourseModel";
import UserCourseProgress from "../models/userCourseProgressModel";
import { getAuth } from "@clerk/express";

dotenv.config();


export const listAssignCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.query;

  try {
    const assignCourse = userId && userId !== "all"
      ? await AssignCourse.query("userId").eq(userId).exec()
      : await AssignCourse.scan().exec();

    res.json({
      message: "Assignment retrieved successfully",
      data: assignCourse,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving assignment", error });
  }
};

export const getUserAssignCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId } = req.params;
  const auth = getAuth(req);

  if (!auth || auth.userId !== userId) {
    res.status(403).json({ message: "Access denied" });
    return;
  }

  try {
    const assignCourse = await AssignCourse.get({ userId, courseId });
    res.json({
      message: "Assignment retrieved successfully",
      data: assignCourse,
    });
  } catch (error) {
    res
    .status(500)
    .json({ message: "Error retrieving assigned courses", error });
  }
  
}
export const getUserAssignCourses = async (
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
    const assignedCourses = await AssignCourse.scan("userId")
      .eq(userId)
      .exec();
    const courseIds = assignedCourses.map((item: any) => item.courseId);
    let courses: any[] = [];
    if (courseIds.length > 0) {
      courses = await Course.batchGet(courseIds);
    }
    res.json({
      message: "Assigned courses retrieved successfully",
      data: courses,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving assigned courses", error });
  }
};

export const createAssignCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId, note, dueDate } = req.body;
  
  try {
    //console.log(userId, courseId, note, dueDate);

    const parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      res.status(400).json({ message: "Invalid dueDate format" });
      return;
    }
    // 2. create transaction record
    const newAssignCourse = new AssignCourse({
      userId,
      courseId,
      note,
      dueDate: parsedDueDate,
      status: "Assigned",
    });
    await newAssignCourse.save();

    

    res.json({
      message: "Assign Course successfully",
      data: {
        assignCourse: newAssignCourse,
      },
    });
  } catch (error) {
    console.error("createAssignCourse error:", error);
    res
      .status(500)
      .json({ message: "Error assigning", error });
  }
};
