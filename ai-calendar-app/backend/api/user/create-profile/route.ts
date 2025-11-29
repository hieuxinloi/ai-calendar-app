import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/backend/lib/supabase/server";

/**
 * API route để tự động tạo user profile trong users table
 * Được gọi sau khi user đăng ký thành công
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Lấy user hiện tại từ session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Kiểm tra xem user đã có profile chưa
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error checking existing user:', checkError);
      return NextResponse.json(
        { error: "Failed to check user profile" },
        { status: 500 }
      );
    }

    // Nếu đã có profile, return success
    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: "User profile already exists",
        user: existingUser
      });
    }

    // Tạo profile mới
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email || null,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user profile:', insertError);
      return NextResponse.json(
        { error: "Failed to create user profile", details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User profile created successfully",
      user: newUser
    });

  } catch (error: any) {
    console.error("Create user profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

