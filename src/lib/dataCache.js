/**
 * src/lib/dataCache.js
 *
 * Centralised cached data-fetching helpers.
 *
 * Uses Next.js `unstable_cache` which integrates with:
 *   - Vercel's Data Cache (persistent, tag-based invalidation)
 *   - Next.js in-memory cache in self-hosted / dev mode
 *
 * Tags:
 *   'posts'    → all post-related data
 *   'settings' → site settings (header code, etc.)
 *
 * Call revalidateTag('posts') or revalidateTag('settings')
 * from any API route that mutates the corresponding data.
 */

import { unstable_cache } from "next/cache";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import Settings from "@/models/Settings";
import { enrichPost } from "@/lib/carArticles";

/* ─── Posts ─────────────────────────────────────────────── */

export const getCachedPosts = unstable_cache(
  async () => {
    await dbConnect();
    const posts = await Post.find({}).sort({ createdAt: -1 }).lean();
    // Serialise Mongoose objects to plain JSON
    const plainPosts = JSON.parse(JSON.stringify(posts));
    // Enrich with car articles
    return plainPosts.map(p => enrichPost(p));
  },
  ["posts-list"],          // cache key
  {
    tags: ["posts"],
    revalidate: false,     // Only revalidate on explicit revalidateTag('posts')
  }
);

export const getCachedPost = unstable_cache(
  async (id) => {
    await dbConnect();
    const post = await Post.findById(id).lean();
    if (!post) return null;
    const plainPost = JSON.parse(JSON.stringify(post));
    // Enrich with car article details
    return enrichPost(plainPost);
  },
  ["post-single"],
  {
    tags: ["posts"],
    revalidate: false,
  }
);

/* ─── Settings ───────────────────────────────────────────── */

export const getCachedSettings = unstable_cache(
  async () => {
    await dbConnect();
    const settings = await Settings.find({}).lean();
    // Return a key→value map for convenience
    const map = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  },
  ["settings-all"],
  {
    tags: ["settings"],
    revalidate: false,
  }
);
