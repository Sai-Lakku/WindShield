import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  OLLAMA_BASE_URL: z.string().url().default("http://127.0.0.1:11434"),
  OLLAMA_MODEL: z.string().default("llama3.1:8b"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  CRON_SECRET: z.string().optional(),
});

const parsed = envSchema.parse(process.env);

export const env = {
  ...parsed,
  supabaseUrl: parsed.SUPABASE_URL ?? parsed.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseKey:
    parsed.SUPABASE_SERVICE_ROLE_KEY ??
    parsed.SUPABASE_PUBLISHABLE_KEY ??
    parsed.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    "",
  ollamaBaseUrl: parsed.OLLAMA_BASE_URL,
  ollamaModel: parsed.OLLAMA_MODEL,
  openaiApiKey: parsed.OPENAI_API_KEY ?? "",
  openaiModel: parsed.OPENAI_MODEL,
  cronSecret: parsed.CRON_SECRET ?? "",
};
