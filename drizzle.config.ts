import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Optional: `npx drizzle-kit push` creates the tables manually.
// (The app also creates them automatically on first request.)
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
