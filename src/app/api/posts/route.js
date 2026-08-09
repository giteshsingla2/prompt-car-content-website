import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import dbConnect from "@/lib/db";
import Post from "@/models/Post";
import { enrichPost } from "@/lib/carArticles";

const SEED_POSTS = [
  {
    articleIndex: 0,
    date: "08 Aug 2026",
    author: "Auto Expert",
    image: "https://picsum.photos/seed/xuv700/900/650",
    prompt: "A sleek silver Mahindra XUV700 SUV parked on a high mountain peak at sunrise, volumetric lighting, epic landscape background, ultra-realistic automotive photography, shot on 85mm lens, 8k resolution, cinematic color grading."
  },
  {
    articleIndex: 1,
    date: "06 Aug 2026",
    author: "Auto Expert",
    image: "https://picsum.photos/seed/slaviasudan/900/650",
    prompt: "A deep metallic blue Skoda Slavia sedan parked on a winding European coastal road during golden hour, long reflections on the body, dynamic angle, high-end commercial car photo, photorealistic, 8k."
  },
  {
    articleIndex: 2,
    date: "04 Aug 2026",
    author: "Auto Expert",
    image: "https://picsum.photos/seed/nexonev/900/650",
    prompt: "A bright green Tata Nexon EV driving on a wet futuristic city street at dusk, neon light reflections in rain puddles, light trails, high-tech vibe, 3d render style, octane render, photorealistic."
  },
  {
    articleIndex: 3,
    date: "02 Aug 2026",
    author: "Auto Expert",
    image: "https://picsum.photos/seed/safarisuv/900/650",
    prompt: "A white Tata Safari SUV cruising along a majestic desert highway, dust kicking up behind, dramatic action shot, rugged adventure style, cinematic color grading, 8k, photorealistic."
  },
  {
    articleIndex: 4,
    date: "31 Jul 2026",
    author: "Auto Expert",
    image: "https://picsum.photos/seed/kushaqsuv/900/650",
    prompt: "A red Skoda Kushaq compact SUV driving through a rustic forest road with sunlight filtering through trees, forest background, realistic reflections, shot on Hasselblad, 8k."
  },
  {
    articleIndex: 5,
    date: "29 Jul 2026",
    author: "Auto Expert",
    image: "https://picsum.photos/seed/tharroxx/900/650",
    prompt: "A matte black Mahindra Thar Roxx 4x4 crawling over large rocks in a desert canyon, rugged off-road action, aggressive stance, warm sunlight, photorealistic."
  },
  {
    articleIndex: 6,
    date: "27 Jul 2026",
    author: "Auto Expert",
    image: "https://picsum.photos/seed/punchev/900/650",
    prompt: "A compact teal Tata Punch EV parked at a modern smart-charging station in a green city suburb, clean energy concept, hyper-realistic, soft studio lighting."
  },
  {
    articleIndex: 7,
    date: "25 Jul 2026",
    author: "Auto Expert",
    image: "https://picsum.photos/seed/superbsedan/900/650",
    prompt: "A luxury black Skoda Superb executive sedan parked outside a modern glass skyscraper in the evening, sleek reflections, rich corporate aesthetic, cinematic lighting, 8k."
  },
  {
    articleIndex: 8,
    date: "23 Jul 2026",
    author: "Auto Expert",
    image: "https://picsum.photos/seed/curvvcoupe/900/650",
    prompt: "A copper-colored Tata Curvv coupe-SUV parked on a dramatic concrete bridge at twilight, city skyline in the background, sleek futuristic design, high-end automotive shoot."
  },
  {
    articleIndex: 9,
    date: "21 Jul 2026",
    author: "Auto Expert",
    image: "https://picsum.photos/seed/scorpion/900/650",
    prompt: "A gold Mahindra Scorpio-N SUV conquering a steep muddy trail in a tropical jungle, water splashes, tough off-road action, realistic textures, high contrast."
  },
  {
    articleIndex: 10,
    date: "19 Jul 2026",
    author: "Auto Expert",
    image: "https://picsum.photos/seed/octaviars/900/650",
    prompt: "A sporty race-blue Skoda Octavia RS sedan drifting on a wet racetrack, tire smoke, high speed motion blur, dynamic camera angle, professional motorsport photography."
  },
  {
    articleIndex: 11,
    date: "17 Jul 2026",
    author: "Auto Expert",
    image: "https://picsum.photos/seed/tatamotors/900/650",
    prompt: "A group of modern Tata concept cars displayed in a clean, futuristic exhibition hall under dramatic spotlighting, silver and white cars, high-tech automotive showroom."
  }
];

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export async function GET() {
  try {
    await dbConnect();
    let posts = await Post.find({}).sort({ createdAt: -1 });

    if (posts.length === 0) {
      console.log("No posts found. Seeding database with cars...");
      await Post.insertMany(SEED_POSTS);
      posts = await Post.find({}).sort({ createdAt: -1 });
    }

    const enrichedPosts = posts.map(p => enrichPost(p));
    return NextResponse.json(enrichedPosts);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const data = await req.json();
    
    const { image, prompt } = data;

    if (!image || !prompt) {
      return NextResponse.json({ error: "Missing image or prompt" }, { status: 400 });
    }

    const count = await Post.countDocuments();

    const post = await Post.create({
      image,
      prompt,
      articleIndex: count,
      date: todayLabel(),
      author: "Auto Expert",
      title: "", // For Mongoose schema fallback
      category: "", // For Mongoose schema fallback
      blurb: "" // For Mongoose schema fallback
    });

    const enriched = enrichPost(post);

    revalidateTag("posts"); // Bust cached posts list
    return NextResponse.json(enriched, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
