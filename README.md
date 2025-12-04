# Affiliate Content Factory

A Next.js application that leverages **Gemini 2.0** for analysis and **OpenAI GPT-4** for content generation to create viral affiliate marketing scripts.

## Stack

- **Framework**: Next.js 14 (Pages Router)
- **Styling**: Tailwind CSS
- **AI Models**: Google Gemini 2.0 Flash, OpenAI GPT-4

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env.local` file in the root directory:
    ```env
    GEMINI_API_KEY=your_gemini_key
    OPENAI_API_KEY=your_openai_key
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

## Deploy to Vercel

1.  Push code to GitHub.
2.  Import project into Vercel.
3.  Add `GEMINI_API_KEY` and `OPENAI_API_KEY` in Vercel Project Settings > Environment Variables.
4.  Deploy.

## Troubleshooting

- **504 Gateway Timeout**: The generation process involves two sequential AI calls. On Vercel Hobby tier (10s limit), this might timeout. Upgrade to Pro or use Edge Functions if needed.
- **JSON Parse Error**: AI models may occasionally output malformed JSON. The API includes basic cleaning, but retrying usually fixes it.
