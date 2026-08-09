import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    const validUser = process.env.ADMIN_USERNAME;
    const validPass = process.env.ADMIN_PASSWORD;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;

    if (!validUser || !validPass || !sessionSecret) {
      return NextResponse.json(
        { error: "Admin credentials not configured." },
        { status: 500 }
      );
    }

    if (username !== validUser || password !== validPass) {
      // Deliberate delay to slow brute-force attempts
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("admin_session", sessionSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
