import { createClerkClient } from "@clerk/backend";
import dotenv from "dotenv";

dotenv.config();

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

async function listUsers() {
  const userListResponse = await clerkClient.users.getUserList();
  const users = userListResponse.data;

  users.forEach(user => {
    console.log(`User: ${user.firstName} ${user.lastName} - ID: ${user.id}`);
  });
}

listUsers().catch(console.error);
