import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import dbConnect from "@/lib/db";
import Settings from "@/models/Settings";

function isAuthenticated(cookieStore) {
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_SESSION_SECRET;
}

// GET /api/settings — public: returns header_code only
export async function GET() {
  try {
    await dbConnect();
    const setting = await Settings.findOne({ key: "header_code" });
    return NextResponse.json({ header_code: setting?.value || "" });
  } catch (e) {
    return NextResponse.json({ header_code: "" });
  }
}

// PUT /api/settings — protected: update any setting
export async function PUT(req) {
  const cookieStore = await cookies();
  if (!isAuthenticated(cookieStore)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const { key, value } = await req.json();

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    const setting = await Settings.findOneAndUpdate(
      { key },
      { value: value || "" },
      { upsert: true, new: true }
    );

    revalidateTag("settings"); // Bust layout's cached header code
    revalidatePath("/", "layout"); // Revalidate all pages using the root layout
    return NextResponse.json({ success: true, setting });
  } catch (e) {
    console.error("Settings PUT error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
