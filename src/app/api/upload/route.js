import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate that it is indeed an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Process and compress the image using sharp
    // 1. Resize to a max width of 1200px to avoid massive layout files
    // 2. Convert to WebP with 80% quality for optimal compression & web serving
    let compressedBuffer;
    try {
      compressedBuffer = await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    } catch (err) {
      console.error("Compression failed, saving original buffer:", err);
      compressedBuffer = buffer;
    }

    // Generate a unique clean filename with webp extension
    const timestamp = Math.floor(Date.now() / 1000);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `car_${timestamp}_${randomStr}.webp`;

    // Ensure directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Write file to disk
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, compressedBuffer);

    // Return the relative public URL
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
