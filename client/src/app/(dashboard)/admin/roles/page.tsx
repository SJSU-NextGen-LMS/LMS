'use client'

import { Button, Form, Select, Table, message } from 'antd';
import { useUser, useClerk } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetUsersQuery, useUpdateUserMutation } from '@/state/api';

const AdminPage = () => {
  const { user } = useUser();
  const clerk = useClerk();
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [updateUser] = useUpdateUserMutation();
  const { data: users, isLoading, error, refetch } = useGetUsersQuery();

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  if (loading) return <Loading />;
  if (error) return <div>Error loading users: {error.message}</div>;
  if (!users) return <div>No users found.</div>;

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: (record: User) => `${record.firstName} ${record.lastName}`
    },
    {
      title: 'Email',
      key: 'email',
      render: (record: User) => record.email || 'N/A'
    },
    {
      title: 'Current Role',
      key: 'userType',
      render: (record: User) => record.publicMetadata?.userType || 'Not Set'
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: User) => (
        <Button 
          type="primary"
          onClick={() => setSelectedUser(record.userId)}
        >
          Change Role
        </Button>
      )
    }
  ];

  const handleRoleChange = async (values: { role: string }) => {
    if (!selectedUser) return;

    try {
      await updateUser({
        userId: selectedUser,
        publicMetadata: {
          userType: values.role
        }
      }).unwrap();
      
      // Refetch the users list to get updated data
      await refetch();
      
      message.success('Role updated successfully');
      setSelectedUser(null);
      form.resetFields();
    } catch (error) {
      console.error('Error updating role:', error);
      message.error('Failed to update role');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Header
        title="User Role Management"
        subtitle="Manage user roles and permissions"
      />
      <Table 
        dataSource={users}
        columns={columns}
        rowKey="id"
        className="mt-6"
      />

      {selectedUser && (
        <Form
          form={form}
          onFinish={handleRoleChange}
          layout="vertical"
          className="mt-6 max-w-md"
        >
          <Form.Item
            name="role"
            label="New Role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select>
              <Select.Option value="student">Student</Select.Option>
              <Select.Option value="teacher">Teacher</Select.Option>
              <Select.Option value="manager">Manager</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Role
            </Button>
            <Button 
              className="ml-2" 
              onClick={() => {
                setSelectedUser(null);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default AdminPage;

