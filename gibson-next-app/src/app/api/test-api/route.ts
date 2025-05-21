import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test connection to Gibson API by checking env vars
    const apiKey = process.env.GIBSON_API_KEY;
    const apiUrl = process.env.GIBSON_API_URL;
    const apiSpec = process.env.GIBSON_API_SPEC;
    
    const connectionStatus = {
      apiKeyConfigured: !!apiKey,
      apiUrlConfigured: !!apiUrl,
      apiSpecConfigured: !!apiSpec,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json({
      status: "API integration test",
      connection: connectionStatus,
      demo_info: {
        message: "The SplitReceipt app is configured with demo data for testing",
        login: {
          email: "demo@example.com",
          password: "password"
        }
      }
    });
  } catch (error) {
    console.error("API test error:", error);
    return NextResponse.json(
      { error: "API test failed", message: error.message },
      { status: 500 }
    );
  }
}