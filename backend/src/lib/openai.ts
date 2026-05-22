import OpenAI from "openai";
import { env } from "../config/env.js";

export const openaiClient = env.openaiApiKey ? new OpenAI({ apiKey: env.openaiApiKey }) : null;
