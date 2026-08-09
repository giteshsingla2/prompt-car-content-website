import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import { enrichPost } from "@/lib/carArticles";

// Fetch a single post by ID
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Enrich the post with car article details before returning
    const enriched = enrichPost(post);
    return NextResponse.json(enriched);
  } catch (error) {
    console.error("GET Single Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a single post by ID
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const deleted = await Post.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    revalidateTag("posts"); // Bust cached posts list
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
