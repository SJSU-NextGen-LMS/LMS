"use client";

import React, { useEffect, useState } from "react";
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

interface StudentProgress {
  userId: string;
  courseId: string;
  courseName: string;
  enrollmentDate: string;
  overallProgress: number;
  status: string;
  lastAccessed: string;
}

const StudentProgressPage = () => {
  const { user, isLoaded } = useUser();
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [filteredProgress, setFilteredProgress] = useState<StudentProgress[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchStudentProgress = async () => {
      if (!user || !isLoaded) return;

      try {
        // Create a properly formatted URL to avoid redirection issues
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        // Use the new direct API endpoint
        const apiUrl = `${baseUrl.replace(/\/+$/, "")}/api/student-progress`;

        console.log("Requesting from URL:", apiUrl);

        // Explicitly get the authentication token using Clerk's client-side API
        // @ts-ignore - Clerk types may not be fully compatible
        const token = await window.Clerk?.session?.getToken();

        console.log("Auth token available:", !!token);

        const response = await fetch(apiUrl, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
            "x-user-type": user.publicMetadata.userType as string,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("API error response:", errorText);
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Received non-JSON response:", text);
          throw new Error("Invalid response format from API");
        }

        const data = await response.json();

        if (!data || !data.data) {
          console.error("Unexpected response structure:", data);
          throw new Error("Invalid data structure from API");
        }

        setStudentProgress(data.data);
        setFilteredProgress(data.data);
      } catch (err: any) {
        console.error("Error fetching student progress:", err);
        setError(err.message || "Failed to load student progress data");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchStudentProgress();
    }
  }, [isLoaded, user]);

  useEffect(() => {
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

    setFilteredProgress(filtered);
  }, [searchTerm, statusFilter, studentProgress]);

  // Calculate statistics
  const completedCount = studentProgress.filter(
    (item) => item.status === "completed"
  ).length;
  const inProgressCount = studentProgress.filter(
    (item) => item.status === "in_progress"
  ).length;
  const totalCourses = new Set(studentProgress.map((item) => item.courseId))
    .size;
  const totalStudents = new Set(studentProgress.map((item) => item.userId))
    .size;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (!isLoaded || loading) {
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
            <p>{error}</p>
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
