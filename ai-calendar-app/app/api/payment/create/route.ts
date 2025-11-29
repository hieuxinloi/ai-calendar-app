import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { plan } = body;

    // Validate plan
    if (!plan || !['free', 'pro'].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Calculate amount based on plan
    const planPricing = {
      free: 0,
      pro: 99000, // 99,000 VND
    };

    const amount = planPricing[plan as keyof typeof planPricing];

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount,
        currency: 'VND',
        status: 'pending',
        payment_method: 'qr_code',
        qr_code: null, // Will be generated below
        metadata: {
          plan,
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          user_agent: request.headers.get('user-agent'),
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Payment creation error:", paymentError);
      return NextResponse.json(
        { error: "Failed to create payment" },
        { status: 500 }
      );
    }

    // Bank account information
    const accountNumber = "5580232066"; // Số tài khoản của bạn
    const accountName = "HUYNH HUU HIEU"; // Tên tài khoản
    const bankCode = "970418"; // Mã ngân hàng BIDV (theo vietqr.io)
    const bankName = "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)";
    
    const content = `Thanh toan goi ${plan.toUpperCase()} - Ma GD: ${payment.id.slice(0, 8).toUpperCase()}`;
    
    // Generate VietQR using vietqr.io API
    // Format: https://img.vietqr.io/image/{bank}-{account}-{template}.{imageFormat}
    // Bank code mapping: BIDV = 970418
    const qrImageUrl = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact.jpg`;
    
    // For QR code display with all payment info
    const qrData = qrImageUrl;

    // Update payment with QR code
    const { error: updateError } = await supabase
      .from('payments')
      .update({ qr_code: qrData })
      .eq('id', payment.id);

    if (updateError) {
      console.error("Payment update error:", updateError);
    }

    // Debug: Log QR data để kiểm tra
    console.log("Generated VietQR:", qrData);
    console.log("Account:", accountNumber, "Bank:", bankCode);

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount,
        currency: 'VND',
        qr_code: qrData,
        status: 'pending',
      },
    });

  } catch (error) {
    console.error("Payment API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
