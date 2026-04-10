import { z } from "zod";

const envSchema = z.object({
  APP_PASSWORD: z.string().min(1).default("change-me"),
  SESSION_SECRET: z.string().min(24).default("replace-with-a-long-random-secret"),
  CRON_SECRET: z.string().min(24).default("replace-with-a-long-random-secret"),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  CHANNEL_TOKEN_ENCRYPTION_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  TIKTOK_CLIENT_ID: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),
  INSTAGRAM_CLIENT_ID: z.string().optional(),
  INSTAGRAM_CLIENT_SECRET: z.string().optional(),
  YOUTUBE_CLIENT_ID: z.string().optional(),
  YOUTUBE_CLIENT_SECRET: z.string().optional()
});

export const env = envSchema.parse({
  APP_PASSWORD: process.env.APP_PASSWORD,
  SESSION_SECRET: process.env.SESSION_SECRET,
  CRON_SECRET: process.env.CRON_SECRET,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  CHANNEL_TOKEN_ENCRYPTION_KEY: process.env.CHANNEL_TOKEN_ENCRYPTION_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  TIKTOK_CLIENT_ID: process.env.TIKTOK_CLIENT_ID,
  TIKTOK_CLIENT_SECRET: process.env.TIKTOK_CLIENT_SECRET,
  INSTAGRAM_CLIENT_ID: process.env.INSTAGRAM_CLIENT_ID,
  INSTAGRAM_CLIENT_SECRET: process.env.INSTAGRAM_CLIENT_SECRET,
  YOUTUBE_CLIENT_ID: process.env.YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET: process.env.YOUTUBE_CLIENT_SECRET
});
