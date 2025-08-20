"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { saveAnalysis } from "@/lib/firestore";

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState<boolean>(false);

  const [transcript, setTranscript] = useState<string>("");
  const [txLoading, setTxLoading] = useState<boolean>(false);

  const MAX_BYTES = 100 * 1024 * 1024;

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFileError(null);
    setFile(f);
    if (f && f.size > MAX_BYTES) {
      setFile(null);
      setFileError("File too large (max 100MB).");
    }
  }

  function getErrMsg(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    try {
      return JSON.stringify(err);
    } catch {
      return "Unknown error";
    }
  }

  async function handleAnalyzeFile() {
    if (!file) {
      setFileError("Please select an audio/video file first.");
      return;
    }
    setFileError(null);
    setFileLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const txRes = await fetch("/api/transcribe", { method: "POST", body: fd });
      const txText = await txRes.text();
      if (!txRes.ok) throw new Error(txText || "Transcription request failed");
      const { text: transcriptText = "" } = JSON.parse(txText || "{}");

      const anRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcriptText }),
      });
      const anText = await anRes.text();
      if (!anRes.ok) throw new Error(anText || "Analysis request failed");
      const analysisData = JSON.parse(anText || "{}");

      const docRef = await saveAnalysis({
        transcript: transcriptText,
        analysis: analysisData,
        source: { kind: "file", name: file.name },
        model: "groq:meta-llama/llama-4-scout-17b-16e-instruct",
      });

      router.push(`/results/${docRef.id}`);
    } catch (err: unknown) {
      console.error(err);
      setFileError(getErrMsg(err) || "Transcription or analysis failed.");
    } finally {
      setFileLoading(false);
    }
  }

  async function handleAnalyzeTranscript() {
    if (!transcript.trim()) return;
    setTxLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(txt || "Analysis request failed");
      const analysisData = JSON.parse(txt || "{}");

      const docRef = await saveAnalysis({
        transcript,
        analysis: analysisData,
        source: { kind: "paste" },
        model: "groq:meta-llama/llama-4-scout-17b-16e-instruct",
      });

      router.push(`/results/${docRef.id}`);
    } catch (err: unknown) {
      console.error(err);
      alert(getErrMsg(err) || "Analysis failed.");
    } finally {
      setTxLoading(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900" />
      <div className="relative z-10 min-h-screen text-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6 text-blue-400">Upload & Analyze</h1>
            <p className="text-gray-400">
              Drop in an audio/video file or paste a transcript. We’ll transcribe, analyze, and save your results.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 text-blue-400">Audio/Video</h2>
              <p className="text-sm text-gray-400 mb-4">
                MP3, WAV, MP4. Max 100MB. We’ll transcribe, analyze, and save to your results.
              </p>
              <label
                htmlFor="file"
                className="group flex flex-col items-center justify-center text-center rounded-lg border-2 border-dashed border-gray-600 p-6 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/5 transition"
              >
                <input
                  id="file"
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-sm text-gray-400">
                  {file ? (
                    <>
                      <strong className="text-gray-100">{file.name}</strong>
                      <span className="block text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </>
                  ) : (
                    <>Click to choose a file or drag it here</>
                  )}
                </span>
              </label>
              {fileError && <p className="text-sm text-red-400 mt-2">{fileError}</p>}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleAnalyzeFile}
                  disabled={!file || !!fileError || fileLoading}
                  className="flex-1 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 font-medium text-white hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50"
                >
                  {fileLoading ? "Processing…" : "Analyze File"}
                </button>
                <button
                  onClick={() => {
                    setFile(null);
                    setFileError(null);
                    const el = document.getElementById("file") as HTMLInputElement | null;
                    if (el) el.value = "";
                  }}
                  className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-gray-300 hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </section>
            <section className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 text-blue-400">Transcript</h2>
              <p className="text-sm text-gray-400 mb-4">
                Paste any length transcript. We’ll analyze and save your results.
              </p>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste transcript here…"
                className="w-full h-40 p-3 rounded-lg bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-500 resize-none"
              />

              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleAnalyzeTranscript}
                  disabled={!transcript.trim() || txLoading}
                  className="flex-1 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-pink-500 to-red-500 px-4 py-2 font-medium text-white hover:from-pink-400 hover:to-red-400 disabled:opacity-50"
                >
                  {txLoading ? "Analyzing…" : "Analyze Transcript"}
                </button>
                <button
                  onClick={() => setTranscript("")}
                  className="flex-1 rounded-lg bg-gray-700 px-4 py-2 text-gray-300 hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </section>
          </div>
          <div className="grid md:grid-cols-3">
            <div className="col-span-3 flex justify-center">
              <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 border border-gray-700 text-center">
                <strong className="block text-yellow-400 mb-1">Formats</strong>
                Audio: MP3/WAV · Video: MP4 · Max 100MB.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}