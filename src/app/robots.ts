import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

const SEARCH = ["Googlebot", "Googlebot-Image", "Google-InspectionTool", "Bingbot", "DuckDuckBot", "YandexBot", "Applebot", "Baiduspider", "Yeti", "SeznamBot"];

const AI = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "Meta-ExternalAgent",
  "meta-externalfetcher",
  "MistralAI-User",
  "DuckAssistBot",
  "CCBot",
];

const PREVIEWS = ["facebookexternalhit", "Twitterbot", "LinkedInBot", "Slackbot", "Slackbot-LinkExpanding", "WhatsApp", "Discordbot", "TelegramBot", "Pinterestbot"];

const DISALLOW = ["/api/", "/home/"];

export default function robots(): MetadataRoute.Robots {
  const production = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true;
  if (!production) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: [{ userAgent: [...SEARCH, ...AI, ...PREVIEWS, "*"], allow: "/", disallow: DISALLOW }],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
