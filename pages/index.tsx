import React, { useState } from 'react';
import Head from 'next/head';
import { Loader2, AlertCircle, CheckCircle2, PlaySquare, Facebook, Video, Sparkles, Copy } from 'lucide-react';

interface GenerateResponse {
  analysis: any;
  generated: any;
}

const PLATFORM_OPTIONS = [
  { id: 'tiktok', label: 'TikTok', icon: <Video size={16} /> },
  { id: 'youtube_shorts', label: 'YouTube Shorts', icon: <PlaySquare size={16} /> },
  { id: 'facebook_reels', label: 'Facebook Reels', icon: <Facebook size={16} /> },
];

export default function Home() {
  const [rawText, setRawText] = useState('');
  const [niche, setNiche] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['tiktok']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  const handlePlatformChange = (id: string) => {
    setPlatforms(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim() || !niche.trim() || platforms.length === 0) {
      setError('Please fill in all fields and select at least one platform.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, niche, platforms }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Something went wrong during generation.');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate content.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <Head>
        <title>Affiliate Content Factory</title>
        <meta name="description" content="Generate viral affiliate scripts with AI" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <header className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide uppercase">
            <Sparkles size={14} />
            AI-Powered Workflow
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Affiliate Content <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Factory</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Transform competitor content into high-converting viral video scripts using Gemini 2.0 and GPT-4.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: INPUT FORM */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8 sticky top-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Competitor Content */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    1. Competitor Content (Raw Text)
                  </label>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full h-56 p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm leading-relaxed"
                    placeholder="Paste transcript, caption, or description here..."
                  />
                </div>

                {/* 2. Niche */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    2. Niche / Industry
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Weight Loss, Tech Gadgets, Crypto..."
                  />
                </div>

                {/* 3. Platforms */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-3">
                    3. Target Platforms
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {PLATFORM_OPTIONS.map((opt) => (
                      <label
                        key={opt.id}
                        className={`cursor-pointer flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                          platforms.includes(opt.id)
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={platforms.includes(opt.id)}
                          onChange={() => handlePlatformChange(opt.id)}
                          className="hidden"
                        />
                        {opt.icon}
                        <span className="text-sm font-semibold">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3 text-sm">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      <span>Generating Strategy...</span>
                    </>
                  ) : (
                    <span>Generate Content</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: OUTPUT DISPLAY */}
          <div className="lg:col-span-7 space-y-8">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200 min-h-[500px] p-8 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Sparkles size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Ready to Generate</h3>
                <p className="text-sm max-w-sm mx-auto">
                  Fill out the details on the left to start analyzing competitor content and generating viral scripts.
                </p>
              </div>
            )}

            {result && (
              <>
                {/* 1. Analysis Result */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-indigo-900 px-6 py-4 border-b border-indigo-800">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-indigo-300" />
                      Gemini 2.0 Analysis
                    </h2>
                  </div>
                  <div className="p-0 bg-slate-900">
                    <div className="max-h-[300px] overflow-y-auto p-6 custom-scrollbar">
                      <pre className="text-xs md:text-sm font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
                        {JSON.stringify(result.analysis, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* 2. Generated Scripts */}
                <div className="space-y-8">
                  {result.generated.platform_contents?.map((pc: any, idx: number) => (
                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white capitalize flex items-center gap-2">
                          {pc.platform === 'tiktok' && <Video size={18} />}
                          {pc.platform === 'youtube_shorts' && <PlaySquare size={18} />}
                          {pc.platform === 'facebook_reels' && <Facebook size={18} />}
                          {pc.platform.replace('_', ' ')}
                        </h2>
                        <span className="text-xs bg-white/20 text-white px-2 py-1 rounded font-medium">
                          {pc.items?.length || 0} Variants
                        </span>
                      </div>
                      
                      <div className="p-6 space-y-10">
                        {pc.items?.map((item: any, i: number) => (
                          <div key={i} className="relative group">
                            {/* Variant Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded">
                                Variant {item.variant_index}
                              </span>
                              <h3 className="font-bold text-lg text-slate-800">{item.title}</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                              {/* Script Section */}
                              <div className="relative">
                                <div className="flex justify-between items-end mb-2">
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Video Script</h4>
                                  <button 
                                    onClick={() => copyToClipboard(item.script)}
                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Copy size={12} /> Copy
                                  </button>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-800 leading-relaxed font-mono whitespace-pre-wrap">
                                  {item.script}
                                </div>
                              </div>

                              {/* Caption & Hashtags */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Caption</h4>
                                  <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200 italic h-full">
                                    {item.caption}
                                  </p>
                                </div>
                                
                                <div>
                                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Hashtags</h4>
                                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 h-full flex flex-wrap gap-2 content-start">
                                    {item.hashtags?.map((tag: string, t: number) => (
                                      <span key={t} className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Divider if not last */}
                            {i < pc.items.length - 1 && (
                              <div className="h-px bg-slate-200 my-8 w-full" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Fallback for raw output if parsing fails structure */}
                  {(!result.generated.platform_contents) && (
                     <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-slate-800 px-6 py-4">
                          <h2 className="text-white font-bold">Raw OpenAI Output</h2>
                        </div>
                        <pre className="p-6 bg-slate-900 text-yellow-400 text-xs overflow-auto font-mono">
                          {JSON.stringify(result.generated, null, 2)}
                        </pre>
                     </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
