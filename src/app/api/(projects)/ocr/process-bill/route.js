import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/roleGuard";
import { processReceipt } from "@/lib/ocr";

export async function POST(req) {
  try {
    const userToken = await getUserFromRequest(req);
    if (!userToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get OCR API key from environment
    const apiKey = process.env.OCR_SPACE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OCR API key not configured" }, { status: 500 });
    }

    // Process the receipt/bill using OCR
    const receiptData = await processReceipt(file, apiKey);

    // Transform the data to match vendor bill format
    const transformedData = {
      totalAmount: receiptData.total_amount || '0.00',
      billDate: receiptData.transaction_date || new Date().toISOString().split('T')[0],
      lines: receiptData.line_items?.map(item => ({
        description: item.item_name,
        quantity: item.quantity || 1,
        unitPrice: item.price || 0,
      })) || [],
      rawOcrData: receiptData, // Include raw data for debugging
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error processing OCR:", error);
    return NextResponse.json({ 
      error: "Failed to process bill image", 
      details: error.message 
    }, { status: 500 });
  }
}
