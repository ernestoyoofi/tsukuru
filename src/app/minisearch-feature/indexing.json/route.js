import { NextResponse } from "next/server";
import { Fn_GetListArticleCard } from "@/lib/posts/globals";

export const dynamic = "force-static" // Forceing static API

export async function GET() {
  const articles = await Fn_GetListArticleCard({ disabled_padpage: true });
  return NextResponse.json({
    posts: articles || []
  });
}