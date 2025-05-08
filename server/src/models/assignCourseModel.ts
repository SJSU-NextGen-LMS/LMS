import { Schema, model } from "dynamoose";

const assignCourseSchema = new Schema(
  {
    courseId: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    note: {
      type: String
    },
    dueDate:{
      type: Date
    },
    status:{
      type: String,
        required: true,
        enum: ["Assigned", "Enrolled", "Canceled", "Finished"],

    }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt"
    }
  }
);

const AssignCourse = model(
  "AssignCourse",
  assignCourseSchema
);
export default AssignCourse;