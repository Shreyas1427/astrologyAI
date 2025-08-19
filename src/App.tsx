import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Globe, User, Wand2, Download, Sparkles, Settings, MessageCircle } from "lucide-react";
import { z } from "zod";
import * as htmlToImage from "html-to-image";
import jsPDF from "jspdf";
import { profileFromBirth, dailyMessage, qaFallback, type BirthInput, type AstroProfile } from "./astrology";

const birthSchema = z.object({
  name: z.string().min(1, "Your name is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM (24h)"),
  place: z.string().min(1, "Birth place is required"),
  tzOffset: z.string().regex(/^[+-]\d{2}:\d{2}$/, "e.g. +05:30"),
});

type Mode = "Rule-based" | "OpenAI";

function classNames(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

const defaultTZ = "+05:30";

function Label({icon: Icon, children}:{icon: any, children: React.ReactNode}) {
  return (
    <div className="flex items-center gap-2 text-slate-300 text-sm">
      <Icon className="w-4 h-4" />
      <span>{children}</span>
    </div>
  )
}

export default function App() {
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem("mode") as Mode) || "Rule-based");
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem("openai_key") || "");
  const [input, setInput] = useState<BirthInput>({
    name: "",
    date: "",
    time: "",
    place: "",
    tzOffset: defaultTZ,
  });
  const [question, setQuestion] = useState("");
  const [profile, setProfile] = useState<AstroProfile | null>(null);
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("mode", mode);
  }, [mode]);

  useEffect(() => {
    if (apiKey) localStorage.setItem("openai_key", apiKey);
  }, [apiKey]);

  const todayISO = useMemo(() => new Date().toISOString().slice(0,10), []);

  const handleGenerate = () => {
    const parsed = birthSchema.safeParse(input);
    if (!parsed.success) {
      alert(parsed.error.issues.map(i => i.message).join("\n"));
      return;
    }
    const prof = profileFromBirth(parsed.data);
    setProfile(prof);
    setResponse("");
  };

  async function askLLM(q: string, prof: AstroProfile) {
    const sys = `You are "Vedaz AI Astrologer" – blend Vedic-style wisdom with gentle, actionable, uplifting guidance.
Use ONLY the provided profile. DO NOT invent precise astronomical claims.
Profile:
Name: ${prof.name}
Sun Sign: ${prof.sunSign}
Element: ${prof.element}
Modality: ${prof.modality}
Life Path: ${prof.lifePath}
Chinese Zodiac: ${prof.chineseAnimal}
Lucky Color: ${prof.luckyColor}
Lucky Number: ${prof.luckyNumber}

Tone: empathetic, practical, non-deterministic. Avoid medical/legal/financial absolutes. Provide 3–5 bullet point suggestions.`;

    const user = `Question: ${q}\nDate today: ${todayISO}`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {role: "system", content: sys},
          {role: "user", content: user},
        ],
        temperature: 0.7,
        max_tokens: 400,
      })
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(text);
    }
    const data = await resp.json();
    return data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response.";
  }

  const handleAsk = async () => {
    if (!profile) {
      alert("Generate your profile first.");
      return;
    }
    if (!question.trim()) {
      alert("Type a question.");
      return;
    }
    setLoading(true);
    try {
      let ans = "";
      if (mode === "OpenAI") {
        if (!apiKey) {
          alert("Add your OpenAI API key in Settings or switch to Rule-based.");
          setLoading(false);
          return;
        }
        ans = await askLLM(question, profile);
      } else {
        ans = qaFallback(question, profile);
      }
      setResponse(ans);
    } catch (e:any) {
      setResponse("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  async function downloadPNG() {
    if (!reportRef.current) return;
    const dataUrl = await htmlToImage.toPng(reportRef.current, { pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `Vedaz_Astro_Report_${input.name || "User"}.png`;
    a.click();
  }

  async function downloadPDF() {
    if (!reportRef.current) return;
    const dataUrl = await htmlToImage.toPng(reportRef.current, { pixelRatio: 2 });
    const pdf = new jsPDF({ orientation: "p", unit: "px", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const img = new Image();
    await new Promise<void>(res => { img.onload = () => res(); img.src = dataUrl; });
    const ratio = Math.min(pageW / img.width, pageH / img.height);
    const w = img.width * ratio;
    const h = img.height * ratio;
    pdf.addImage(img, "PNG", (pageW - w)/2, 20, w, h);
    pdf.save(`Vedaz_Astro_Report_${input.name || "User"}.pdf`);
  }

  return (
    <div className="bg-starfield min-h-screen text-white font-body">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-400/80 to-cyan-400/80 grid place-items-center"
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
          >
            <Sparkles className="w-5 h-5 text-slate-950" />
          </motion.div>
          <div>
            <h1 className="text-xl font-semibold">Vedaz Astro Lite</h1>
            <p className="text-xs text-slate-400">Simple, friendly AI astrologer demo</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="card px-3 py-2 flex items-center gap-2">
            <span className="text-xs text-slate-400">Mode</span>
            <select
              className="bg-transparent text-sm outline-none"
              value={mode}
              onChange={e => setMode(e.target.value as Mode)}
            >
              <option>Rule-based</option>
              <option>OpenAI</option>
            </select>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="card px-3 py-2 hover:bg-slate-800/70 transition"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-6">
        {/* Left: Form */}
        <section className="card p-5">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Wand2 className="w-5 h-5" /> Birth Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label icon={User}>Full Name</Label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g. Virat Kohli"
                value={input.name}
                onChange={e => setInput({...input, name: e.target.value})}
              />
            </div>
            <div>
              <Label icon={Calendar}>Date (YYYY-MM-DD)</Label>
              <input
                type="date"
                className="mt-1 w-full rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                value={input.date}
                onChange={e => setInput({...input, date: e.target.value})}
                max={new Date().toISOString().slice(0,10)}
              />
            </div>
            <div>
              <Label icon={Clock}>Time (24h)</Label>
              <input
                type="time"
                className="mt-1 w-full rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                value={input.time}
                onChange={e => setInput({...input, time: e.target.value})}
              />
            </div>
            <div>
              <Label icon={Globe}>Birth Place (City, Country)</Label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="e.g. Pune, India"
                value={input.place}
                onChange={e => setInput({...input, place: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <Label icon={Clock}>Time Zone (e.g., +05:30)</Label>
              <input
                className="mt-1 w-full rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                value={input.tzOffset}
                onChange={e => setInput({...input, tzOffset: e.target.value})}
                placeholder="+05:30"
              />
              <p className="text-xs text-slate-500 mt-1">Tip: If unsure, keep +05:30 (IST). This demo uses rule-based logic and does not require precise coordinates.</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerate}
              className="px-4 py-2 rounded-xl bg-emerald-400 text-slate-900 font-semibold hover:brightness-95 transition"
            >
              Generate Profile
            </button>
            <button
              onClick={() => { setInput({name: "", date: "", time: "", place: "", tzOffset: defaultTZ}); setProfile(null); setResponse(""); setQuestion(""); }}
              className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition"
            >
              Reset
            </button>
          </div>
        </section>

        {/* Right: Report */}
        <section className="card p-5">
          <div ref={reportRef}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5" /> Your Astro Snapshot</h2>
              {profile && (
                <div className="flex gap-2">
                  <button onClick={downloadPNG} className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" /> PNG
                  </button>
                  <button onClick={downloadPDF} className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-sm flex items-center gap-2">
                    <Download className="w-4 h-4" /> PDF
                  </button>
                </div>
              )}
            </div>

            {!profile ? (
              <p className="text-slate-400 text-sm">Fill in your birth details and click <b>Generate Profile</b>.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div className="rounded-xl p-4 bg-gradient-to-br from-slate-800/80 to-slate-900/60 border border-slate-700">
                  <h3 className="font-semibold text-slate-200 mb-2">{profile.name}</h3>
                  <div className="text-sm text-slate-300 space-y-1">
                    <div><b>Sun Sign:</b> {profile.sunSign}</div>
                    <div><b>Element:</b> {profile.element}</div>
                    <div><b>Modality:</b> {profile.modality}</div>
                    <div><b>Life Path:</b> {profile.lifePath}</div>
                    <div><b>Chinese Zodiac:</b> {profile.chineseAnimal}</div>
                    <div className="flex items-center gap-2">
                      <span><b>Lucky Color:</b></span>
                      <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: profile.luckyColor }}></span>
                      <code className="text-xs text-slate-400">{profile.luckyColor}</code>
                    </div>
                    <div><b>Lucky Number:</b> {profile.luckyNumber}</div>
                  </div>
                </div>

                <div className="rounded-xl p-4 bg-gradient-to-br from-slate-800/80 to-slate-900/60 border border-slate-700">
                  <h3 className="font-semibold text-slate-200 mb-2">Overview</h3>
                  <p className="text-sm text-slate-300 leading-6">{profile.summary}</p>
                  <div className="mt-3 text-emerald-300/90 text-sm">
                    <b>Daily Note:</b> {dailyMessage(profile.name, new Date().toISOString().slice(0,10))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Q&A */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><MessageCircle className="w-5 h-5" /> Ask an Astro Question</h2>
            <textarea
              className="w-full min-h-[90px] rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="e.g. How do I improve my career prospects over the next few months?"
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={handleAsk}
                disabled={loading}
                className={classNames("px-4 py-2 rounded-xl font-semibold transition",
                  loading ? "bg-slate-700" : "bg-cyan-400 text-slate-900 hover:brightness-95"
                )}
              >
                {loading ? "Thinking..." : "Get Guidance"}
              </button>
              <span className="text-xs text-slate-400">
                {mode === "OpenAI" ? "Powered by OpenAI (client-side key)" : "Rule-based guidance (offline)"}
              </span>
            </div>

            {response && (
              <div className="mt-4 rounded-xl bg-slate-800/60 border border-slate-700 p-4 text-sm leading-6">
                {response.split("\n").map((line, i) => <p key={i}>{line}</p>)}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center p-4 z-50">
          <div className="card p-5 max-w-lg w-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Settings className="w-5 h-5" /> Settings</h3>
              <button onClick={() => setSettingsOpen(false)} className="text-slate-400 hover:text-white">Close</button>
            </div>
            <div className="space-y-4">
              <div>
                <Label icon={Settings}>OpenAI API Key (optional)</Label>
                <input
                  className="mt-1 w-full rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
                <p className="text-xs text-slate-500 mt-1">Stored only in your browser (localStorage). For demo use—avoid production keys.</p>
              </div>
              <div>
                <Label icon={Sparkles}>Mode</Label>
                <select
                  className="mt-1 w-full rounded-xl bg-slate-800/60 border border-slate-700 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-400"
                  value={mode}
                  onChange={e => setMode(e.target.value as Mode)}
                >
                  <option>Rule-based</option>
                  <option>OpenAI</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
