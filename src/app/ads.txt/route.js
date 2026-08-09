import { NextResponse } from "next/server";

export async function GET() {
  const content = process.env.ADS_TXT_CONTENT || "";

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // Cache for 1 hour, allow CDN caching
      "Cache-Control": "public, max-age=3600",
    },
  });
}
