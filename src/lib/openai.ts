// @ts-nocheck
import OpenAI from "openai";

export async function runOpenAI(prompt: string) {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  console.log("🔑 OpenAI API Key exists:", !!apiKey);
  console.log("📝 Prompt:", prompt);

  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_OPENAI_API_KEY is not set");
  }

  try {
    const openai = new openAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // Required for client-side usage
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Use gpt-3.5-turbo for speed and cost efficiency
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "No response";
    console.log("✅ OpenAI Response:", response);
    return response;
  } catch (error) {
    console.error("❌ OpenAI Error:", error);

    if (error instanceof Error) {
      // Handle specific OpenAI errors
      if (error.message.includes("rate limit")) {
        throw new Error("Rate limit exceeded. Please try again later.");
      } else if (error.message.includes("quota")) {
        throw new Error(
          "API quota exceeded. Please check your OpenAI billing.",
        );
      } else if (error.message.includes("invalid_api_key")) {
        throw new Error(
          "Invalid OpenAI API key. Please check your configuration.",
        );
      }
      throw new Error(`OpenAI API Error: ${error.message}`);
    }

    throw new Error("Unknown OpenAI API error occurred");
  }
}
