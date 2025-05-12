import express from "express";
import { requireAuth } from "@clerk/express";
import {
  getUserAssignCourses,
  createAssignCourse,
  getUserAssignCourse,
  getManagerAssignedCourses,
} from "../controllers/assignCourseController";

const router = express.Router();

router.post("/", requireAuth(), createAssignCourse);
router.get("/:userId", getUserAssignCourses);
router.get("/manager/:userId", getManagerAssignedCourses);
router.get("/:userId/:courseId", getUserAssignCourse);

export default router;
