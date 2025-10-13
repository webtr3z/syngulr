import OpenAI from "openai";

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_OPENAI_API_KEY. Please configure your environment variables.",
  );
}

export const openai = new OpenAI({
  apiKey,
});
