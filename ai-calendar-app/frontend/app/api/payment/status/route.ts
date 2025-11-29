import { NextRequest, NextResponse } from "next/server";
import { getPaymentStatusHandler } from "@/backend/api/payment/status";

export async function GET(request: NextRequest) {
  return getPaymentStatusHandler(request);
}

