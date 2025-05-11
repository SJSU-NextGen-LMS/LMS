import { Schema, model } from "dynamoose";

const assignCourseSchema = new Schema(
  {
    userId: {
      type: String,
      hashKey: true,
      required: true
    },
    courseId: {
      type: String,
      rangeKey: true,
      required: true
    },
    managerId: {
      type: String,
      required: true
    },
    managerName: {
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
        default: "Assigned",
        enum: ["Assigned", "Enrolled", "Canceled", "Completed"],

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