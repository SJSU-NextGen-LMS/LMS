import express from "express";
import { requireAuth } from "@clerk/express";
import {
  getUserAssignCourses,
  createAssignCourse,
  getUserAssignCourse,
} from "../controllers/assignCourseController";

const router = express.Router();

router.get("/:userId", getUserAssignCourses);
router.post("/", requireAuth(), createAssignCourse);
router.get("/:userId/:courseId", getUserAssignCourse);

export default router;
