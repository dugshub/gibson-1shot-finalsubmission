import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";

export async function POST(req: NextRequest) {
  try {
    // Extract registration data from request
    const body = await req.json();
    const { username, email, password } = body;
    
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }
    
    // Call Gibson API for user registration
    const { data, error } = await gibson.POST("/v1/auth/register", {
      json: { username, email, password },
    });
    
    if (error) {
      return NextResponse.json(
        { error: error.message || "Registration failed" },
        { status: 400 }
      );
    }
    
    // Return user data and token for client-side storage
    return NextResponse.json({
      user: data.user,
      token: data.token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}