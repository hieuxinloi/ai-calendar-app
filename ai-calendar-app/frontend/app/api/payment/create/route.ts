import { NextRequest, NextResponse } from "next/server";
import { createPaymentHandler } from "@/backend/api/payment/create";

export async function POST(request: NextRequest) {
  return createPaymentHandler(request);
}
