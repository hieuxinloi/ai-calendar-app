import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PayOS } from "@payos/node";

// PayOS configuration
const payOS = new PayOS(
  "ab3137a1-e439-4548-b91f-03ef56dff5c0",
  "8ca0f845-05d5-48f1-a030-00752eba3732",
  "f75e963b27183304a4071eadacffc21d29658753f18ae9be1a70c736b60baa58"
);

/**
 * POST /api/payment/payos/webhook
 * Webhook endpoint nhận callback từ PayOS
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // PayOS webhook data format
    const {
      code,
      desc,
      data,
    } = body;

    console.log("PayOS Webhook received:", { code, desc, data });

    if (code !== '00' || !data) {
      console.error("PayOS webhook error:", { code, desc });
      return NextResponse.json(
        { error: "Invalid webhook data" },
        { status: 400 }
      );
    }

    // Extract order information from PayOS data
    const { orderCode, amount, description, transactionDateTime, accountNumber } = data;

    // Find payment by PayOS order code
    const supabase = await createClient();
    
    const { data: payments, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_method', 'payos')
      .like('metadata', `%${orderCode}%`);

    if (findError || !payments || payments.length === 0) {
      console.error("Payment not found for orderCode:", orderCode);
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    const payment = payments[0];

    // Check if already processed
    if (payment.status === 'completed') {
      console.log("Payment already processed:", payment.id);
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // Get plan from metadata
    const plan = (payment.metadata as any)?.plan || 'pro';

    // Create or get subscription
    let subscriptionId = payment.subscription_id;
    
    if (!subscriptionId) {
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
      transaction_id: orderCode.toString(),
      notes: `PayOS thanh toán thành công - Account: ${accountNumber || 'N/A'}`,
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

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully"
    });

  } catch (error) {
    console.error("PayOS webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

