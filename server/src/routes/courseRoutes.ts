import express from "express";
import multer from "multer";
import {
  createCourse,
  deleteCourse,
  getCourse,
  listCourses,
  updateCourse,
  getUploadVideoUrl,
  getTeacherCourses,
} from "../controllers/courseController";
import { requireAuth } from "@clerk/express";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", requireAuth(), listCourses);
router.post("/", requireAuth(), createCourse);
router.get("/teacher-courses/:userId", requireAuth(), getTeacherCourses);

router.get("/:courseId", requireAuth(), getCourse);
router.put("/:courseId", requireAuth(), upload.single("image"), updateCourse);
router.delete("/:courseId", requireAuth(), deleteCourse);

router.post(
  "/:courseId/sections/:sectionId/chapters/:chapterId/get-upload-url",
  requireAuth(),
  getUploadVideoUrl
);

export default router;
