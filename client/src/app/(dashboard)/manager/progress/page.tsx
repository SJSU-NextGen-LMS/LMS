"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  UserCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loading from "@/components/Loading";
import { Progress } from "@/components/ui/progress";
import { useGetAllStudentsProgressQuery, useGetUsersQuery, useGetManagerAssignedCoursesQuery} from "@/state/api";
import { StudentProgress } from "@/state/api";

const StudentProgressPage = () => {
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Use RTK Query hook
  
  const { 
    data: managerAssignedCourses = [],
    isLoading,
    error,
    } = useGetManagerAssignedCoursesQuery(user?.id ?? "");

  // Add the users query
  const { data: users = [] } = useGetUsersQuery();

  // Create a mapping of user IDs to their full names
  const userMap = useMemo(() => {
    return users.reduce((acc: { [key: string]: string }, user) => {
      acc[user.id] = `${user.firstName} ${user.lastName}`.trim();
      return acc;
    }, {});
  }, [users]);

  // Calculate filtered data directly without separate state
  const filteredProgress = useMemo(() => {
    console.log(managerAssignedCourses);
    if (!managerAssignedCourses || managerAssignedCourses.length === 0) {
      return [];
    }

    let filtered = [...managerAssignedCourses];

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          userMap[item.userId]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.managerName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    return filtered;
  }, [searchTerm, statusFilter, userMap, managerAssignedCourses]);

  // Calculate statistics
  const completedCount = useMemo(() => 
    managerAssignedCourses?.filter((item) => item.progress?.status === "completed").length || 0,
    [managerAssignedCourses]
  );

  const inProgressCount = useMemo(() => 
    managerAssignedCourses?.filter((item) => item.progress?.status === "in_progress").length || 0,
    [managerAssignedCourses]
  );

  const totalCourses = managerAssignedCourses
    ? new Set(managerAssignedCourses.map((item) => item)).size
    : 0;

  const totalStudents = managerAssignedCourses
    ? new Set(managerAssignedCourses.map((item) => item.userId)).size
    : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (!isLoaded || isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {(error as any)?.error || "Failed to load student progress data"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Student Progress Tracking</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalStudents}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{totalCourses}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Courses Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">{completedCount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Courses In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{inProgressCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Student Progress Data</CardTitle>
          <CardDescription>
            Track the progress of all students across different courses
          </CardDescription>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by course, student name, manager name or ID..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Enrollment Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Accessed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProgress.length > 0 ? (
                filteredProgress.map((progress, index) => (
                  <TableRow
                    key={`${progress.userId}-${progress.courseId}-${index}`}
                  >
                    <TableCell className="font-medium">
                      {userMap[progress?.userId] || progress?.userId}
                    </TableCell>
                    <TableCell>{progress?.courseName}</TableCell>
                    <TableCell>{progress?.managerName || "Not Assigned"}</TableCell>
                    <TableCell>{formatDate(progress?.dueDate)}</TableCell>
                    <TableCell>
                      {progress?.progress
                        ? formatDate(progress.progress.enrollmentDate)
                        : "Not Enrolled"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={progress?.progress?.overallProgress}
                          className="h-2 w-full"
                        />
                        <span className="text-sm">
                          {progress?.progress?.overallProgress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          progress?.progress?.status === "completed"
                            ? "success"
                            : progress?.progress?.status === "in_progress"
                            ? "inProgress"
                            : "notEnrolled"
                        }
                      >
                        {progress?.progress?.status === "completed"
                          ? "Completed"
                          : progress?.progress?.status === "in_progress"
                          ? "In Progress"
                          : "Not Enrolled"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {progress?.progress?.lastAccessed
                        ? formatDate(progress.progress.lastAccessed)
                        : "No activity"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No student progress data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProgressPage;
