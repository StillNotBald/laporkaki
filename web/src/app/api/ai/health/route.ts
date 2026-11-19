import { connection } from "next/server";
import { isConfigured } from "@/lib/ai/qwen";

// Answered per request (reads the environment at call time).
export async function GET() {
  await connection();
  return Response.json({
    configured: isConfigured(),
    model: process.env.QWEN_MODEL || "qwen4-max",
  });
}
