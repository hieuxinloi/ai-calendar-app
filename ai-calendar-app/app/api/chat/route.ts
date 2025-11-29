import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic echo response for now
    // Can be extended to integrate with AI service later
    return NextResponse.json({
      message: "API endpoint is working",
      received: body,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Chat API endpoint",
    status: "active",
  });
}

