import seed from "./seed/seedDynamodb";

export const handler = async () => {
  await seed();
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Seeding completed successfully" }),
  };
};
