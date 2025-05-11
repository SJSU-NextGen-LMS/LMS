"use client";

import { useState } from "react";
import { Button, Form, Select, Input, DatePicker, Card, message } from "antd";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";

// Components
import Header from "@/components/Header";
import Loading from "@/components/Loading";

// API Hooks
import {
  useCreateAssignCourseMutation,
  useGetCoursesQuery,
  useGetUsersQuery,
} from "@/state/api";

// Types
interface AssignCourseFormData {
  userId: string;
  courseId: string;
  note: string;
  dueDate: string;
}

/**
 * AssignCourseForm component for assigning courses to users
 */
const AssignCourseForm = () => {
  const router = useRouter();
  const { user } = useUser();
  const [form] = Form.useForm();

  // API Hooks
  const [createAssignCourse, { isLoading: isAssigning }] =
    useCreateAssignCourseMutation();
  const {
    data: courses,
    isLoading: isCoursesLoading,
    isError: isCoursesError,
  } = useGetCoursesQuery({ category: "all" });

  const {
    data: users,
    isLoading: isUsersLoading,
    isError: isUsersError,
  } = useGetUsersQuery();

  /**
   * Handle course assignment
   */
  const handleCreateAssignCourse = async (values: AssignCourseFormData) => {
    try {
      // Convert date to string format YYYY-MM-DD
      const formattedDate = values.dueDate
        ? dayjs(values.dueDate).format("YYYY-MM-DD")
        : "";

      await createAssignCourse({
        userId: values.userId,
        courseId: values.courseId,
        note: values.note || "Assigned by manager",
        dueDate: formattedDate,
      }).unwrap();

      message.success("Course assigned successfully");
      form.resetFields();
      router.push("/manager/assign");
    } catch (error) {
      console.error("Failed to assign course:", error);
      message.error("Failed to assign course");
    }
  };

  // Loading states
  if (isCoursesLoading || isUsersLoading) return <Loading />;

  // Error states
  if (isCoursesError || isUsersError || !courses || !users) {
    return (
      <div className="page-container">
        <Header title="Assign Course to User" subtitle="Error loading data" />
        <div className="error-message">
          Error loading courses or users. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Header
        title="Assign Course to User"
        subtitle="Assign courses to users with due dates and notes"
      />

      <Card
        className="form-card"
        style={{
          maxWidth: 600,
          margin: "20px auto",
          backgroundColor: "#1f1f1f",
          border: "1px solid #333",
          borderRadius: "8px",
        }}
      >
        <Form
          form={form}
          name="assign_course"
          onFinish={handleCreateAssignCourse}
          layout="vertical"
          style={{ padding: "8px" }}
          initialValues={{
            note: "Assigned by manager",
            dueDate: dayjs().add(30, "day"),
          }}
        >
          <Form.Item
            name="userId"
            label={<span style={{ color: "#e0e0e0" }}>Select User</span>}
            rules={[{ required: true, message: "Please select a user" }]}
          >
            <Select
              placeholder="Select a user"
              style={{ backgroundColor: "#2a2a2a", color: "#fff" }}
              className="dark-select"
            >
              {users.map((user: any) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="courseId"
            label={<span style={{ color: "#e0e0e0" }}>Select Course</span>}
            rules={[{ required: true, message: "Please select a course" }]}
          >
            <Select
              placeholder="Select a course"
              style={{ backgroundColor: "#2a2a2a", color: "#fff" }}
              className="dark-select"
            >
              {courses.map((course: Course) => (
                <Select.Option key={course.courseId} value={course.courseId}>
                  {course.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="note"
            label={<span style={{ color: "#e0e0e0" }}>Notes</span>}
          >
            <Input.TextArea
              placeholder="Add any notes about this assignment"
              style={{
                backgroundColor: "#2a2a2a",
                color: "#fff",
                borderColor: "#444",
              }}
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="dueDate"
            label={<span style={{ color: "#e0e0e0" }}>Due Date</span>}
            rules={[{ required: true, message: "Please select a due date" }]}
          >
            <DatePicker
              format="YYYY-MM-DD"
              style={{
                width: "100%",
                backgroundColor: "#2a2a2a",
                color: "#fff",
                borderColor: "#444",
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: "24px" }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={isAssigning}
              style={{
                height: "48px",
                fontSize: "16px",
                background: "#1677ff",
              }}
            >
              Assign Course
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AssignCourseForm;
