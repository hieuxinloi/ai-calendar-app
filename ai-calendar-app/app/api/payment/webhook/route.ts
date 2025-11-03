import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify webhook signature in production
    // const signature = request.headers.get('x-signature');
    // if (!verifySignature(signature, body)) {
    //   return NextResponse.json(
    //     { error: "Invalid signature" },
    //     { status: 401 }
    //   );
    // }

    const { transaction_id, status, amount } = body;

    if (!transaction_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get supabase admin client for webhook processing
    const supabase = await createClient();

    // Find payment by transaction_id
    const { data: payment, error: findError } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', transaction_id)
      .single();

    if (findError || !payment) {
      console.error("Payment not found:", transaction_id);
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Check if already processed
    if (payment.status === 'completed' && status === 'completed') {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: status as 'pending' | 'completed' | 'failed' | 'refunded',
        transaction_id: transaction_id,
        metadata: {
          ...payment.metadata,
          webhook_received_at: new Date().toISOString(),
        },
      })
      .eq('id', payment.id);

    if (updateError) {
      console.error("Payment update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update payment" },
        { status: 500 }
      );
    }

    // If payment completed, update subscription (trigger will handle this)
    if (status === 'completed') {
      // Create or update subscription
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: payment.user_id,
          plan: (payment.metadata as any)?.plan || 'pro',
          status: 'pending',
        }, {
          onConflict: 'user_id',
        });

      if (subError) {
        console.error("Subscription error:", subError);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to verify webhook signature (implement based on your provider)
// function verifySignature(signature: string | null, body: any): boolean {
//   // Implement signature verification logic
//   return true;
// }

