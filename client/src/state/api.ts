import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BaseQueryApi, FetchArgs } from "@reduxjs/toolkit/query";
import { User } from "@clerk/nextjs/server";
import { Clerk } from "@clerk/clerk-js";
import { toast } from "sonner";

// Add StudentProgress interface
export interface StudentProgress {
  userId: string;
  courseId: string;
  courseName: string;
  enrollmentDate: string;
  overallProgress: number;
  status: string;
  lastAccessed: string;
  managerName?: string;
}

export interface ManagerAssignedCourses {
  userId: string;
  courseId: string;
  courseName: string;
  userName: string;
  dueDate: string;
  enrollmentDate: string;
  overallProgress: number;
  status: string;
  lastAccessed: string;
  managerName?: string;
  progress: {
    status: string;
    overallProgress: number;
    enrollmentDate: string;
    lastAccessed: string;
  };
}

const customBaseQuery = async (
  args: string | FetchArgs,
  api: BaseQueryApi,
  extraOptions: any
) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: async (headers) => {
      const token = await window.Clerk?.session?.getToken();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  try {
    const result: any = await baseQuery(args, api, extraOptions);

    if (result.error) {
      const errorData = result.error.data;
      const errorMessage =
        errorData?.message ||
        result.error.status.toString() ||
        "An error occurred";
      toast.error(`Error: ${errorMessage}`);
      console.log(errorMessage);
      console.log(errorData?.message);
      console.log(result.error);
    }

    const isMutationRequest =
      (args as FetchArgs).method && (args as FetchArgs).method !== "GET";

    if (isMutationRequest) {
      const successMessage = result.data?.message;
      if (successMessage) toast.success(successMessage);
    }

    if (result.data) {
      result.data = result.data.data;
    } else if (
      result.error?.status === 204 ||
      result.meta?.response?.status === 24
    ) {
      return { data: null };
    }

    return result;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return { error: { status: "FETCH_ERROR", error: errorMessage } };
  }
};

export const api = createApi({
  baseQuery: customBaseQuery,
  reducerPath: "api",
  tagTypes: ["Courses", "Users", "UserCourseProgress", "UserEnrolledCourses", "AssignCourses", "StudentProgress"],
  endpoints: (build) => ({
    /* 
    ===============
    USER CLERK
    =============== 
    */
    updateUser: build.mutation<User, Partial<User> & { userId: string }>({
      query: ({ userId, ...updatedUser }) => ({
        url: `users/clerk/${userId}`,
        method: "PUT",
        body: updatedUser,
      }),
      invalidatesTags: ["Users"],
    }),

    getUsers: build.query<User[], void>({
      query: () => ({
        url: "users/clerk",
      }),
      providesTags: ["Users"],
    }),

    /* 
    ===============
    COURSES
    =============== 
    */
    getCourses: build.query<Course[], { category?: string }>({
      query: ({ category }) => ({
        url: "courses",
        params: { category },
      }),
      providesTags: ["Courses"],
    }),

    getCourse: build.query<Course, string>({
      query: (id) => `courses/${id}`,
      providesTags: (result, error, id) => [{ type: "Courses", id }],
    }),

    getTeacherCourses: build.query<Course[], string>({
      query: (userId) => `courses/teacher-courses/${userId}`,
      providesTags: ["Courses"],
    }),

    createCourse: build.mutation<
      Course,
      { teacherId: string; teacherName: string }
    >({
      query: (body) => ({
        url: `courses`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Courses"],
    }),

    updateCourse: build.mutation<
      Course,
      { courseId: string; formData: FormData }
    >({
      query: ({ courseId, formData }) => ({
        url: `courses/${courseId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Courses", id: courseId },
      ],
    }),

    deleteCourse: build.mutation<{ message: string }, string>({
      query: (courseId) => ({
        url: `courses/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Courses"],
    }),

    getUploadVideoUrl: build.mutation<
      { uploadUrl: string; videoUrl: string },
      {
        courseId: string;
        chapterId: string;
        sectionId: string;
        fileName: string;
        fileType: string;
      }
    >({
      query: ({ courseId, sectionId, chapterId, fileName, fileType }) => ({
        url: `courses/${courseId}/sections/${sectionId}/chapters/${chapterId}/get-upload-url`,
        method: "POST",
        body: { fileName, fileType },
      }),
    }),

    /* 
    ===============
    TRANSACTIONS
    =============== 
    */
    getTransactions: build.query<Transaction[], string>({
      query: (userId) => `transactions?userId=${userId}`,
    }),
    
    createTransaction: build.mutation<Transaction, Partial<Transaction>>({
      query: (transaction) => ({
        url: "transactions",
        method: "POST",
        body: transaction,
      }),
      invalidatesTags: ["UserEnrolledCourses"],
    }),

    /*
    ===============
    ASSIGN COURSE 
    =============== 
    */

    getAssignCourses: build.query<Course[], string>({
      query: (userId) => `assignCourse/${userId}`,
      providesTags: ["AssignCourses"],
    }),

    getUserAssignCourse: build.query<
      AssignCourse,
      { userId: string; courseId: string }
    >({
      query: ({ userId, courseId }) => `assignCourse/${userId}/${courseId}`,
      providesTags: ["AssignCourses"],
    }),

    createAssignCourse: build.mutation<AssignCourse, Partial<AssignCourse>>({
      query: (assignCourse) => ({
        url: "assignCourse",
        method: "POST",
        body: assignCourse,
      }),
      invalidatesTags: ["AssignCourses", "StudentProgress"],
    }),

    getManagerAssignedCourses: build.query<ManagerAssignedCourses[], string>({
      query: (userId) => `assignCourse/manager/${userId}`,
      providesTags: ["StudentProgress"],
    }),

    /* 
    ===============
    USER COURSE PROGRESS
    =============== 
    */

    getUserEnrolledCourses: build.query<Course[], string>({
      query: (userId) => `users/course-progress/${userId}/enrolled-courses`,
      providesTags: ["Courses", "UserCourseProgress", "UserEnrolledCourses"],
    }),

    getUserCourseProgress: build.query<
      UserCourseProgress,
      { userId: string; courseId: string }
    >({
      query: ({ userId, courseId }) =>
        `users/course-progress/${userId}/courses/${courseId}`,
      providesTags: ["UserCourseProgress"],
    }),
    
    getAllStudentsProgress: build.query<StudentProgress[], void>({
      query: () => ({
        url: "users/course-progress/all-progress",
      }),
      providesTags: ["StudentProgress"],
    }),

/*
    getAllStudentsProgress: build.query<StudentProgress[], void>({
        query: ({ category }) => ({
          url: "courses",
          params: { category },
        }),
        providesTags: ["Courses"],
      }),
  
      
      query: () => {

        /
        // Get user type from window.Clerk if available
        let userType = "unknown";
        try {
          // @ts-expect-error - Clerk types may not be fully compatible
          userType = window.Clerk?.user?.publicMetadata?.userType || "unknown";
        } catch (e) {
          console.error("Error accessing user type:", e);
        }

        return {
          url: "users/course-progress/all-progress",
          headers: {
            "x-user-type": userType as string,
          },
        };
      },
    }),*/

    updateUserCourseProgress: build.mutation<
      UserCourseProgress,
      {
        userId: string;
        courseId: string;
        progressData: {
          sections: SectionProgress[];
        };
      }
    >({
      query: ({ userId, courseId, progressData }) => ({
        url: `users/course-progress/${userId}/courses/${courseId}`,
        method: "PUT",
        body: progressData,
      }),
      invalidatesTags: ["UserCourseProgress", "StudentProgress", "AssignCourses"],
      async onQueryStarted(
        { userId, courseId, progressData },
        { dispatch, queryFulfilled }
      ) {
        const patchResult = dispatch(
          api.util.updateQueryData(
            "getUserCourseProgress",
            { userId, courseId },
            (draft) => {
              Object.assign(draft, {
                ...draft,
                sections: progressData.sections,
              });
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useUpdateUserMutation,
  useGetUsersQuery,
  useGetCoursesQuery,
  useGetCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetUploadVideoUrlMutation,
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useCreateAssignCourseMutation,
  useGetAssignCoursesQuery,
  useGetUserAssignCourseQuery,
  useGetUserEnrolledCoursesQuery,
  useGetUserCourseProgressQuery,
  useUpdateUserCourseProgressMutation,
  useGetAllStudentsProgressQuery,
  useGetTeacherCoursesQuery,
  useGetManagerAssignedCoursesQuery,
} = api;
