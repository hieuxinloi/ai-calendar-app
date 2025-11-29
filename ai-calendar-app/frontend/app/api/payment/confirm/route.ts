import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/backend/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, confirmedAmount } = body;

    if (!paymentId || !confirmedAmount) {
      return NextResponse.json(
        { error: "Payment ID and confirmed amount are required" },
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

    // Get payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', user.id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Check if already completed
    if (payment.status === 'completed') {
      return NextResponse.json({
        success: true,
        payment,
        message: "Payment already confirmed"
      });
    }

    // Verify amount matches (cho phép sai số nhỏ do làm tròn)
    const expectedAmount = payment.amount;
    const confirmed = parseInt(confirmedAmount.toString().replace(/[^\d]/g, '')); // Remove non-digits
    
    if (Math.abs(confirmed - expectedAmount) > 1000) { // Cho phép sai số 1,000 VND
      return NextResponse.json(
        { 
          error: "Số tiền không khớp",
          expected: expectedAmount,
          received: confirmed
        },
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
          user_id: user.id,
          plan,
          status: 'pending',
        })
        .select()
        .single();

      if (subError) {
        console.error("Subscription creation error:", subError);
        // Continue anyway, subscription will be created by trigger
      } else {
        subscriptionId = newSubscription.id;
      }
    }

    // Prepare update data
    const updateData: any = {
      status: 'completed',
      completed_at: new Date().toISOString(),
      notes: `Xác nhận thủ công - Số tiền: ${confirmed.toLocaleString('vi-VN')} VND`,
    }
    
    if (subscriptionId) {
      updateData.subscription_id = subscriptionId
    }

    // Update payment status to completed
    const { data: updatedPayment, error: updateError } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single();

    if (updateError) {
      console.error("Payment update error:", updateError);
      return NextResponse.json(
        { error: "Failed to confirm payment", details: updateError },
        { status: 500 }
      );
    }
    
    if (!updatedPayment) {
      console.error("No payment updated");
      return NextResponse.json(
        { error: "Payment update failed" },
        { status: 500 }
      );
    }

    // The trigger will automatically activate the subscription
    // But let's also ensure it's active
    if (subscriptionId) {
      const { error: subUpdateError } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month
        })
        .eq('id', subscriptionId);

      if (subUpdateError) {
        console.error("Subscription update error:", subUpdateError);
        // Continue, trigger might handle it
      }
    }

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      message: "Thanh toán đã được xác nhận thành công!"
    });

  } catch (error) {
    console.error("Payment confirm API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

