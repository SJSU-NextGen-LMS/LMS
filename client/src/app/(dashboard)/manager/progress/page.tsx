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
import { useGetAllStudentsProgressQuery } from "@/state/api";
import { StudentProgress } from "@/state/api";

const StudentProgressPage = () => {
  const { user, isLoaded } = useUser();
  const [filteredProgress, setFilteredProgress] = useState<StudentProgress[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Use RTK Query hook
  const {
    data: studentProgress = [],
    isLoading,
    error,
  } = useGetAllStudentsProgressQuery();

  // Use memoization to prevent unnecessary re-renders
  const filteredData = useMemo(() => {
    if (!studentProgress || studentProgress.length === 0) {
      return [];
    }

    // Apply filters
    let filtered = [...studentProgress];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    return filtered;
  }, [searchTerm, statusFilter, studentProgress]);

  // Update filtered progress when filtered data changes
  useEffect(() => {
    setFilteredProgress(filteredData);
  }, [filteredData]);

  // Calculate statistics
  const completedCount =
    studentProgress?.filter((item) => item.status === "completed").length || 0;

  const inProgressCount =
    studentProgress?.filter((item) => item.status === "in_progress").length ||
    0;

  const totalCourses = studentProgress
    ? new Set(studentProgress.map((item) => item.courseId)).size
    : 0;

  const totalStudents = studentProgress
    ? new Set(studentProgress.map((item) => item.userId)).size
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
                placeholder="Search by course or student ID..."
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
                <TableHead>Student ID</TableHead>
                <TableHead>Course</TableHead>
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
                      {progress.userId}
                    </TableCell>
                    <TableCell>{progress.courseName}</TableCell>
                    <TableCell>{formatDate(progress.enrollmentDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={progress.overallProgress}
                          className="h-2 w-full"
                        />
                        <span className="text-sm">
                          {progress.overallProgress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          progress.status === "completed"
                            ? "success"
                            : "default"
                        }
                      >
                        {progress.status === "completed"
                          ? "Completed"
                          : "In Progress"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(progress.lastAccessed)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
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
