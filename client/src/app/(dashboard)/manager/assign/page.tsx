'use client'

import { useState } from "react";
import { Button, Form, Select, message } from 'antd';
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

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
}

/**
 * AssignCourseForm component for assigning courses to users
 */
const AssignCourseForm = () => {
  const router = useRouter();
  const { user } = useUser();
  const [form] = Form.useForm();

  // API Hooks
  const [createAssignCourse] = useCreateAssignCourseMutation();
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
      await createAssignCourse({
        userId: values.userId,
        courseId: values.courseId,
        note: "Assigned by manager",
        dueDate: "2025-05-08", // TODO: Make this configurable
      }).unwrap();
      
      message.success('Course assigned successfully');
      form.resetFields();
      router.push('/teacher/courses');
    } catch (error) {
      console.error('Failed to assign course:', error);
      message.error('Failed to assign course');
    }
  };

  // Loading states
  if (isCoursesLoading || isUsersLoading) return <Loading />;
  
  // Error states
  if (isCoursesError || isUsersError || !courses || !users) {
    return (
      <div className="teacher-courses">
        <Header
          title="Assign Course to user"
          subtitle="Error loading data"
        />
        <div className="error-message">
          Error loading courses or users. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-courses">
      <Header
        title="Assign Course to user"
        subtitle="Select a user and course to assign"
      />
      
      <Form
        form={form}
        name="assign_course"
        onFinish={handleCreateAssignCourse}
        layout="vertical"
        style={{ maxWidth: 600, margin: '0 auto', padding: '24px' }}
      >
        <Form.Item
          name="userId"
          label="Select User"
          rules={[{ required: true, message: 'Please select a user' }]}
        >
        <Select placeholder="Select a user">
          {users.map((user: any) => (
            <Select.Option key={user.id} value={user.id}>
              {user.firstName} {user.lastName}
            </Select.Option>
          ))}
        </Select>
        </Form.Item>

        <Form.Item
          name="courseId"
          label="Select Course"
          rules={[{ required: true, message: 'Please select a course' }]}
        >
          <Select placeholder="Select a course">
            {courses.map((course: Course) => (
              <Select.Option key={course.courseId} value={course.courseId}>
                {course.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Assign Course
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AssignCourseForm;
