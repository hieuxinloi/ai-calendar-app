import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, thread_id, history, user_id } = body;
    
    // Log để debug
    console.log("📨 Next.js API received (frontend/app/api):", { 
      message: message?.substring(0, 50), 
      user_id: user_id || "null",
      thread_id 
    });
    
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Call Python AI service
    try {
      const requestBody: any = {
        message,
        thread_id: thread_id || "default",
        history: history || [],
      };
      
      // Luôn gửi user_id, ngay cả khi null
      if (user_id) {
        requestBody.user_id = user_id;
      } else {
        requestBody.user_id = null; // Explicitly set to null
      }
      
      console.log("📤 Sending to Python service (frontend/app/api):", { 
        message: requestBody.message?.substring(0, 50),
        user_id: requestBody.user_id,
        user_id_type: typeof requestBody.user_id,
        full_body: JSON.stringify(requestBody)
      });
      
      const response = await fetch(`${AI_SERVICE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "AI service error" }));
        throw new Error(errorData.detail || `AI service returned ${response.status}`);
      }

      const data = await response.json();
      
      return NextResponse.json({
        message: data.message,
        role: data.role || "assistant",
      });
    } catch (fetchError: any) {
      console.error("Error calling AI service:", fetchError);
      
      // Fallback response if AI service is unavailable
      return NextResponse.json(
        {
          message: "Xin lỗi, dịch vụ AI hiện đang không khả dụng. Vui lòng thử lại sau.",
          role: "assistant",
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Invalid request" },
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

