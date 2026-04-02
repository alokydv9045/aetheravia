import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Only allow admins (add your admin check logic here)
  // ...existing admin check logic...

  const { folder, public_id } = await req.json();
  const timestamp = Math.floor(Date.now() / 1000);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary env vars missing" }, { status: 500 });
  }

  // Build signature string
  let paramsToSign = `folder=${folder}&public_id=${public_id}&timestamp=${timestamp}`;
  const crypto = await import("crypto");
  const signature = crypto.createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  return NextResponse.json({
    cloudName,
    apiKey,
    timestamp,
    signature,
    folder,
    public_id
  });
}
