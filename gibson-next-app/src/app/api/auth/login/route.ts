import { NextRequest, NextResponse } from "next/server";
import { gibson } from "@/gibson";

export async function POST(req: NextRequest) {
  try {
    // Extract credentials from request
    const body = await req.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    
    // Handle demo user login for demonstration purposes
    if (email === 'demo@example.com' && password === 'password') {
      const demoUser = {
        id: 'default-user',
        username: 'demo',
        email: 'demo@example.com',
      };
      
      // Return token in response body for client-side storage
      return NextResponse.json({
        user: demoUser,
        token: 'demo-token',
      });
    }
    
    // Call Gibson API for normal authentication
    const { data, error } = await gibson.POST("/v1/auth/login", {
      json: { email, password },
    });
    
    if (error) {
      return NextResponse.json(
        { error: error.message || "Login failed" },
        { status: 401 }
      );
    }
    
    // Return user data and token for client-side storage
    return NextResponse.json({
      user: data.user,
      token: data.token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}