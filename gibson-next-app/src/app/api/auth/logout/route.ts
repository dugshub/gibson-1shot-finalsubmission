import { NextResponse } from "next/server";

export async function POST() {
  try {
    // For client-side auth, we only need to return success
    // The client will remove the token from local storage
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}