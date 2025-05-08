'use client'

import { Button, Form, Input, Select, message } from 'antd';

// from courses page
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import TeacherCourseCard from "@/components/TeacherCourseCard";
import Toolbar from "@/components/Toolbar";
//import { Button } from "@/components/ui/button";
import {
  useCreateAssignCourseMutation,
  useGetAssignCoursesQuery,
  useGetCoursesQuery,
  useGetUsersQuery,
} from "@/state/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useMemo, useState , useEffect} from "react";


interface AssignCourseFormData {
  userId: string;
  courseId: string;
}


const AssignCourseForm = () => {
  const router = useRouter();
  const { user } = useUser();
  const [createAssignCourse] = useCreateAssignCourseMutation();
  const {
    data: courses,
    isLoading,
    isError,
  } = useGetCoursesQuery({ category: "all" });
  const { data: users } = useGetUsersQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [form] = Form.useForm();

  const filteredCourses = useMemo(() => {
    if (!courses) return [];

    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  if (isLoading) return <Loading />;
  if (isError || !courses) return <div>Error loading courses.</div>;


// ai generated code
  


  const handleCreateAssignCourse = async (values: AssignCourseFormData) => {
    try {
      await createAssignCourse({
        userId: values.userId,
        courseId: values.courseId,
        note: "test",
        dueDate: "2025-05-08",
      }).unwrap();
      message.success('Course assigned successfully');
      form.resetFields();
      router.push('/teacher/courses');
    } catch (error) {
      message.error('Failed to assign course');
    }
  };

  // visual
  return (
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
          {users?.map((user: any) => (
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
          {courses.map((course: any) => (
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
  );
};

export default AssignCourseForm;
