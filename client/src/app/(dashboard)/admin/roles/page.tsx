"use client";

import { Button, Form, Select, Table, message, Card, Input } from "antd";
import { useUser, useClerk } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetUsersQuery, useUpdateUserMutation } from "@/state/api";

const AdminPage = () => {
  const { user } = useUser();
  const clerk = useClerk();
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [updateUser] = useUpdateUserMutation();
  const { data: users, isLoading, error, refetch } = useGetUsersQuery();
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (!isLoading) {
      setLoading(false);
    }
  }, [isLoading]);

  if (loading) return <Loading />;
  if (error) return <div>Error loading users: {error.message}</div>;
  if (!users) return <div>No users found.</div>;

  const filteredUsers = users?.filter((user) => {
    const searchLower = searchText.toLowerCase();
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = (user.emailAddresses[0]?.emailAddress || "").toLowerCase();
    
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  const columns = [
    {
      title: "Name",
      key: "name",
      render: (record: User) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Email",
      key: "email",
      render: (record: User) => record.emailAddresses[0]?.emailAddress || "N/A",
    },
    {
      title: "Current Role",
      key: "userType",
      render: (record: User) => record.publicMetadata?.userType || "Not Set",
    },
    {
      title: "Action",
      key: "action",
      render: (record: User) => (
        <Button
          type="primary"
          onClick={() => {
            setSelectedUser(record.id);
          }}
          style={{
            background: "#1677ff",
            borderColor: "#1677ff",
          }}
        >
          Change Role
        </Button>
      ),
    },
  ];

  const handleRoleChange = async (values: { role: string }) => {
    if (!selectedUser) return;

    try {
      await updateUser({
        userId: selectedUser,
        publicMetadata: {
          userType: values.role,
        },
      }).unwrap();

      // Refetch the users list to get updated data
      await refetch();

      message.success("Role updated successfully");
      setSelectedUser(null);
      form.resetFields();
    } catch (error) {
      console.error("Error updating role:", error);
      message.error("Failed to update role");
    }
  };

  return (
    <div className="page-container">
      <Header
        title="User Role Management"
        subtitle="Manage user roles and permissions"
      />

      <Card
        className="mb-6"
        style={{
          backgroundColor: "#1f1f1f",
          border: "1px solid #333",
          borderRadius: "8px",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Search users by name or email"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              maxWidth: 300,
              backgroundColor: "#2a2a2a",
              color: "#fff",
              border: "1px solid #444",
            }}
          />
        </div>
        
        <Table
          dataSource={filteredUsers}
          columns={columns}
          rowKey="id"
          style={{
            backgroundColor: "transparent",
            color: "#e0e0e0",
          }}
        />
      </Card>

      {selectedUser && (
        <Card
          title={<span style={{ color: "#e0e0e0" }}>Update User Role</span>}
          style={{
            maxWidth: 600,
            margin: "20px auto",
            backgroundColor: "#1f1f1f",
            border: "1px solid #333",
            borderRadius: "8px",
          }}
        >
          <Form form={form} onFinish={handleRoleChange} layout="vertical">
            <Form.Item
              name="role"
              label={<span style={{ color: "#e0e0e0" }}>New Role</span>}
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <Select
                placeholder="Select a role"
                style={{ backgroundColor: "#2a2a2a", color: "#fff" }}
                className="dark-select"
              >
                <Select.Option value="student">Student</Select.Option>
                <Select.Option value="teacher">Teacher</Select.Option>
                <Select.Option value="manager">Manager</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ marginTop: "24px" }}>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  background: "#1677ff",
                  borderColor: "#1677ff",
                  marginRight: "8px",
                }}
              >
                Update Role
              </Button>
              <Button
                onClick={() => {
                  setSelectedUser(null);
                  form.resetFields();
                }}
                style={{
                  background: "#2a2a2a",
                  border: "1px solid #444",
                  color: "#e0e0e0",
                }}
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default AdminPage;
