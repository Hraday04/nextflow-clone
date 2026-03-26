type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
};

export async function runAI(
  prompt: string,
  imageBase64?: string,
  mimeType: string = "image/png",
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Gemini API key");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt },

          // 🔥 Add image support
          ...(imageBase64
            ? [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: imageBase64,
                  },
                },
              ]
            : []),
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
    },
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const raw = await res.text();

    if (!res.ok) {
      throw new Error(`Gemini Error ${res.status}: ${raw}`);
    }

    const data: GeminiResponse = JSON.parse(raw);

    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!output) {
      throw new Error("Empty response from Gemini");
    }

    return output;
  } catch (err) {
    console.error("❌ Gemini Failed:", err);
    throw err;
  }
}
