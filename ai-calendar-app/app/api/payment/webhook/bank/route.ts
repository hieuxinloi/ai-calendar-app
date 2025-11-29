import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Webhook endpoint để nhận callback từ ngân hàng
 * Endpoint này sẽ được ngân hàng gọi khi có giao dịch chuyển khoản vào tài khoản của bạn
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Parse webhook data từ ngân hàng
    const {
      transactionId,
      amount,
      accountNumber,
      content,
      timestamp,
      signature,
    } = body;

    // Validate required fields
    if (!transactionId || !amount || !accountNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify signature (implement based on BIDV docs)
    // if (!verifyBankSignature(body, signature)) {
    //   return NextResponse.json(
    //     { error: "Invalid signature" },
    //     { status: 401 }
    //   );
    // }

    const supabase = await createClient();

    // Parse nội dung để lấy payment ID
    // Format: "Thanh toan goi PRO - Ma GD: 12345678"
    const paymentIdMatch = content?.match(/Ma GD:?\s*([A-Z0-9]+)/i);
    const paymentId = paymentIdMatch ? paymentIdMatch[1] : null;

    if (!paymentId) {
      console.log("No payment ID found in content:", content);
      return NextResponse.json(
        { error: "Cannot identify payment from transaction" },
        { status: 400 }
      );
    }

    // Find payment by ID prefix (payment ID là UUID, nhưng lưu 8 ký tự đầu)
    const { data: payments, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
      .like('id', `${paymentId}%`);

    if (findError || !payments || payments.length === 0) {
      console.error("Payment not found:", findError);
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    const payment = payments[0];

    // Verify amount matches
    if (Math.abs(amount - payment.amount) > 1000) {
      console.error("Amount mismatch:", amount, payment.amount);
      return NextResponse.json(
        { error: "Amount mismatch" },
        { status: 400 }
      );
    }

    // Get plan from metadata
    const plan = (payment.metadata as any)?.plan || 'pro';

    // Create or get subscription
    let subscriptionId = payment.subscription_id;
    
    if (!subscriptionId) {
      // Create new subscription
      const { data: newSubscription, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: payment.user_id,
          plan,
          status: 'pending',
        })
        .select()
        .single();

      if (subError) {
        console.error("Subscription creation error:", subError);
      } else {
        subscriptionId = newSubscription.id;
      }
    }

    // Update payment status to completed
    const updateData: any = {
      status: 'completed',
      subscription_id: subscriptionId,
      completed_at: new Date().toISOString(),
      transaction_id: transactionId,
      notes: `Tự động xác nhận từ ngân hàng - Transaction: ${transactionId}`,
    };

    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', payment.id)
      .select()
      .single();

    if (updateError) {
      console.error("Payment update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update payment" },
        { status: 500 }
      );
    }

    // Activate subscription
    if (subscriptionId) {
      const { error: subUpdateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', subscriptionId);

      if (subUpdateError) {
        console.error("Subscription update error:", subUpdateError);
      }
    }

    // Return success
    return NextResponse.json({
      success: true,
      paymentId: updatedPayment.id,
      message: "Payment confirmed automatically"
    });

  } catch (error) {
    console.error("Bank webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to verify bank signature
function verifyBankSignature(data: any, signature: string): boolean {
  // TODO: Implement signature verification based on BIDV documentation
  // This is a critical security feature
  return true;
}

