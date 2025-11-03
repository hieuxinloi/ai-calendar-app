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
 * POST /api/payment/payos/create-link
 * Tạo payment link với PayOS
 */
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

    // Calculate amount
    const planPricing = {
      free: 0,
      pro: 99000,
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
        payment_method: 'payos',
        metadata: { plan },
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

    // Generate orderCode from payment ID (use last 8 digits of UUID as timestamp)
    const orderCode = Date.now() % 100000000; // Ensure 8 digits

    // Create PayOS payment link
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    const returnUrl = `${baseUrl}/payment/success?paymentId=${payment.id}`;
    const cancelUrl = `${baseUrl}/payment?plan=${plan}`;

    // Create payment link using PayOS SDK
    const paymentLinkData = await payOS.createPaymentLink({
      orderCode,
      amount,
      description: `Thanh toan goi ${plan.toUpperCase()} - Ma GD: ${payment.id.slice(0, 8).toUpperCase()}`,
      items: [
        {
          name: `Gói ${plan.toUpperCase()}`,
          quantity: 1,
          price: amount,
        },
      ],
      returnUrl,
      cancelUrl,
    });

    // Update payment with PayOS data
    await supabase
      .from('payments')
      .update({
        transaction_id: paymentLinkData.id.toString(),
        qr_code: JSON.stringify(paymentLinkData),
        metadata: {
          ...(payment.metadata as any),
          payos_order_code: orderCode,
        },
      })
      .eq('id', payment.id);

    return NextResponse.json({
      success: true,
      paymentLink: paymentLinkData.checkoutUrl,
      paymentId: payment.id,
      orderCode,
    });

  } catch (error) {
    console.error("PayOS API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
