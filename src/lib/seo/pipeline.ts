import { env } from "@/lib/env";
import type { AiTranscriptJob, GeneratedSeoPackage, PlatformId } from "@/lib/types";

const seoPrompts: Record<PlatformId, string> = {
  tiktok:
    "Generate a short hook-led title, concise caption, and keyword-rich hashtags optimized for discovery and completion rate.",
  instagram:
    "Generate a visually expressive caption with platform-native phrasing, clearer call-to-action, and niche-relevant hashtags.",
  youtube:
    "Generate a searchable title and a longer description structured for retention, query relevance, and video context."
};

export async function queueTranscriptJob(job: AiTranscriptJob) {
  return {
    ...job,
    status: "queued" as const
  };
}

export async function buildSeoPrompt(platform: PlatformId, transcript: string) {
  return {
    platform,
    instructions: seoPrompts[platform],
    transcript
  };
}

export async function generateSeoFromTranscript(
  platform: PlatformId,
  transcript: string
): Promise<GeneratedSeoPackage> {
  const prompt = await buildSeoPrompt(platform, transcript);

  if (!env.OPENAI_API_KEY) {
    return {
      platform,
      title: "AI SEO pending (no API key configured)",
      caption: "OpenAI API key is missing. Add it to generate SEO content.",
      description: transcript.slice(0, 220),
      hashtags: ["#setup"]
    };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content:
            "You are an expert social media strategist. Return ONLY valid JSON with keys: title, caption, description, hashtags (array of strings), summary."
        },
        {
          role: "user",
          content: `${prompt.instructions}\n\nTranscript:\n${transcript}`
        }
      ],
      temperature: 0.4
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI SEO generation failed: ${response.status} ${errorBody}`);
  }

  const payload = await response.json();
  const text = extractResponseText(payload);
  const parsed = JSON.parse(text) as {
    title: string;
    caption: string;
    description: string;
    hashtags: string[];
    summary?: string;
  };

  return {
    platform,
    title: parsed.title,
    caption: parsed.caption,
    description: parsed.description,
    hashtags: parsed.hashtags
  };
}

export async function transcribeAudioBuffer(input: {
  filename: string;
  contentType: string;
  buffer: ArrayBuffer;
}) {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([input.buffer], { type: input.contentType }),
    input.filename
  );
  formData.append("model", "gpt-4o-mini-transcribe");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI transcription failed: ${response.status} ${errorBody}`);
  }

  const payload = await response.json();
  const transcript = payload.text ?? payload.transcript ?? "";

  if (!transcript) {
    throw new Error("OpenAI transcription returned an empty response.");
  }

  return transcript as string;
}

function extractResponseText(payload: Record<string, unknown>) {
  const output = payload.output as Array<{ content?: Array<{ text?: string }> }> | undefined;
  const text = output?.[0]?.content?.[0]?.text;

  if (!text) {
    throw new Error("OpenAI response did not include text output.");
  }

  return text;
}
