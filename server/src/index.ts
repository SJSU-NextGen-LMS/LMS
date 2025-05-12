import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as dynamoose from "dynamoose";
import serverless from "serverless-http";
import seed from "./seed/seedDynamodb";
import path from "path";
import {
  clerkMiddleware,
  createClerkClient,
  requireAuth,
  getAuth,
} from "@clerk/express";
/* ROUTE IMPORTS */
import courseRoutes from "./routes/courseRoutes";
import userClerkRoutes from "./routes/userClerkRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import userCourseProgressRoutes from "./routes/userCourseProgressRoutes";
import assignCourseRoutes from "./routes/assignCourseRoutes";
import { getAllStudentsProgress } from "./controllers/userCourseProgressController";

/* CONFIGURATIONS */
dotenv.config({
  path: path.resolve(__dirname, "../.env.local"),
});
const isProduction = process.env.NODE_ENV === "production";
if (!isProduction) {
  const localDBURL = process.env.DYNAMODB_LOCAL_URL || "empty";
  dynamoose.aws.ddb.local(localDBURL);
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(clerkMiddleware());

/* ROUTES */
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Direct endpoint for progress tracking with custom authentication
app.get(
  "/api/student-progress",
  clerkMiddleware(),
  (req, res, next) => {
    console.log("Student progress API endpoint accessed");

    // Log all headers for debugging (except sensitive values)
    const headers = { ...req.headers };
    if (headers.authorization) {
      headers.authorization = headers.authorization.substring(0, 15) + "...";
    }
    console.log("Request headers:", headers);

    // Check for authentication header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("No authorization header found");
      res.status(401).json({ message: "No authentication token provided" });
      return;
    }

    if (!authHeader.startsWith("Bearer ")) {
      console.log("Authorization header is not a Bearer token");
      res.status(401).json({ message: "Invalid authentication token format" });
      return;
    }

    // Get the auth object from Clerk
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      console.log("No valid Clerk auth found:", auth);
      res.status(401).json({ message: "Invalid authentication token" });
      return;
    }

    console.log("Authentication successful for user:", auth.userId);

    // Check user type if provided
    const userType = req.headers["x-user-type"];
    console.log("User type from header:", userType);

    // Allow the request to proceed to the controller
    next();
  },
  getAllStudentsProgress
);

app.use("/courses", requireAuth(), courseRoutes);
app.use("/users/clerk", requireAuth(), userClerkRoutes);
app.use("/transactions", requireAuth(), transactionRoutes);
app.use("/users/course-progress", requireAuth(), userCourseProgressRoutes);
app.use("/assignCourse", requireAuth(), assignCourseRoutes);

/* SERVER */
const port = process.env.PORT || 3000;
if (!isProduction) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// aws production environment
const serverlessApp = serverless(app);
export const handler = async (event: any, context: any) => {
  if (event.action === "seed") {
    await seed();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data seeded successfully" }),
    };
  } else {
    return serverlessApp(event, context);
  }
};

export default app;
