import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';

type RequestBody = {
  rawText: string;
  niche: string;
  platforms: string[];
};

// --- PROMPT TEMPLATES ---

const GEMINI_ANALYZE_PROMPT_TEMPLATE = `
Vai trò: Bạn là chuyên gia phân tích nội dung marketing.

Niche: {{NICHE}}

Nội dung đối thủ:
"""
{{RAW_TEXT}}
"""

Yêu cầu:
1. Tóm tắt 5–10 câu.
2. Phân tích cấu trúc (hook, body, CTA).
3. Yếu tố thu hút.
4. Pain – Desire – False Belief.
5. 10 ý tưởng nội dung mới phù hợp niche.

Trả về JSON:
{
 "summary": "...",
 "structure": {
   "hook": "...",
   "body_points": ["...", "..."],
   "closing_cta": "..."
 },
 "attraction_factors": ["...", "..."],
 "tone_of_voice": "...",
 "insights": {
   "pains": ["..."],
   "desires": ["..."],
   "false_beliefs": ["..."]
 },
 "ideas": [
   {
     "id": "idea_1",
     "title": "...",
     "short_description": "...",
     "video_type": "review|story|tips|..."
   }
 ]
}
`;

const OPENAI_GENERATE_PROMPT_TEMPLATE = `
Vai trò: Bạn là chuyên gia sáng tạo nội dung video ngắn.

Niche: {{NICHE}}
Platforms: {{PLATFORMS}}

Dưới đây là phân tích từ Gemini:
{{GEMINI_JSON}}

Nhiệm vụ:
1. Chọn 3 ý tưởng tốt nhất.
2. Với MỖI PLATFORM → Tạo 2 phiên bản nội dung khác nhau.

Mỗi phiên bản gồm JSON:
{
 "idea_id": "...",
 "variant_index": 1,
 "title": "...",
 "script": "...",
 "caption": "...",
 "hashtags": ["...", "..."]
}

Hook mạnh trong 3 giây đầu.
Không copy nội dung gốc.
CTA dùng placeholder [LINK_AFFILIATE].
Trả về JSON:
{
 "platform_contents": [
   {
     "platform": "tiktok",
     "items": [ ... ]
   }
 ]
}
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { rawText, niche, platforms } = req.body as RequestBody;

  if (!rawText || !niche || !platforms || platforms.length === 0) {
    return res.status(400).json({ message: 'Missing required fields: rawText, niche, or platforms.' });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!geminiApiKey || !openaiApiKey) {
    return res.status(500).json({ message: 'Server configuration error: Missing API Keys.' });
  }

  try {
    // --- 1. GEMINI ANALYSIS ---
    const googleAI = new GoogleGenAI({ apiKey: geminiApiKey });
    const geminiPrompt = GEMINI_ANALYZE_PROMPT_TEMPLATE
      .replace('{{RAW_TEXT}}', rawText)
      .replace(/{{NICHE}}/g, niche); // Global replace for safety

    const geminiResponse = await googleAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: geminiPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const geminiText = geminiResponse.text;
    if (!geminiText) {
      throw new Error("Gemini returned empty response");
    }

    let geminiJson;
    try {
      geminiJson = JSON.parse(geminiText);
    } catch (e) {
      // Clean markdown code blocks if necessary
      const cleaned = geminiText.replace(/```json/g, '').replace(/```/g, '').trim();
      geminiJson = JSON.parse(cleaned);
    }

    // --- 2. OPENAI GENERATION ---
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const openaiPrompt = OPENAI_GENERATE_PROMPT_TEMPLATE
      .replace(/{{NICHE}}/g, niche)
      .replace('{{PLATFORMS}}', JSON.stringify(platforms))
      .replace('{{GEMINI_JSON}}', JSON.stringify(geminiJson));

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Using gpt-4-turbo for reliability and JSON mode support
      messages: [
        { role: "system", content: "Bạn là chuyên gia sáng tạo nội dung video ngắn." },
        { role: "user", content: openaiPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const openaiText = completion.choices[0].message.content;
    if (!openaiText) {
      throw new Error("OpenAI returned empty response");
    }

    const openaiJson = JSON.parse(openaiText);

    // --- 3. RETURN RESPONSE ---
    return res.status(200).json({
      analysis: geminiJson,
      generated: openaiJson
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ message: error.message || 'Internal Server Error', detail: error });
  }
}
