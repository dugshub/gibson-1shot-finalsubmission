import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";
import { getAuthToken } from "@/lib/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    // Get auth token from request or cookie
    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Handle demo token for demonstration purposes
    if (token === 'demo-token') {
      return NextResponse.json({
        id: 'default-user',
        username: 'demo',
        email: 'demo@example.com',
      });
    }
    
    // Call Gibson API to get current user data
    const { data, error } = await gibson.GET("/v1/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to get user data" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Auth/me error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}