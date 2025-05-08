import express from "express";
import { requireAuth } from "@clerk/express";
import {
  getUserAssignCourses,
  createAssignCourse
} from "../controllers/assignCourseController";

const router = express.Router();

router.get("/:userId", getUserAssignCourses);
router.post("/", requireAuth(), createAssignCourse);

export default router;
