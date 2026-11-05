
import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

export async function GET(request) {
  const auth = await verifyAuth(request);

  if (!auth.success) {
    return NextResponse.json(
      {
        success: false,
        message: auth.message,
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Authentication successful!",
    userId: auth.userId,
  });
}
