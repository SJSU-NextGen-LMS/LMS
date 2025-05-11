import { Request, Response } from "express";
import { clerkClient } from "../index";

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const userData = req.body;
  try {
    const user = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        userType: userData.publicMetadata.userType,
        settings: userData.publicMetadata.settings,
      },
    });

    res.json({ message: "User updated successfully", data: user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};


export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    let allUsers: any[] = [];
    let pageToken: number | undefined;
    let maxIterations = 1000;

    do {
      const response = await clerkClient.users.getUserList({
        limit: 100,
        offset: pageToken,
      });
      pageToken = 0
      maxIterations--;

      allUsers = allUsers.concat(response.data);
      if(allUsers.length != response.totalCount){
        pageToken = allUsers.length;
      }
    } while (pageToken && maxIterations > 0);

    res.json({ message: "Users retrieved successfully", data: allUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: "Error retrieving users", error });
  }
};