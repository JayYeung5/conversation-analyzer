"use client";

import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();

  // --- File section state ---
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(false);

  // --- Transcript section state ---
  const [transcript, setTranscript] = useState("");
  const [txLoading, setTxLoading] = useState(false);

  const MAX_BYTES = 100 * 1024 * 1024; // 100MB

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFileError(null);
    setFile(f);

    if (f && f.size > MAX_BYTES) {
      setFile(null);
      setFileError("File too large (max 100MB).");
    }
  }

  async function handleAnalyzeFile() {
    if (!file) {
      setFileError("Please select an audio/video file first.");
      return;
    }
    setFileLoading(true);

    // need to transcribe and send to analyze
    setTimeout(() => {
      setFileLoading(false);
      router.push("/results/demo");
    }, 1000);
  }

  async function handleAnalyzeTranscript() {
    if (!transcript.trim()) return;
    setTxLoading(true);

    // need to send to analyze
    setTimeout(() => {
      setTxLoading(false);
      router.push("/results/demo");
    }, 700);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8">
      <h1 className="text-3xl font-bold mb-6">Upload / Analyze</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Audio/Video</h2>
          <p className="text-sm text-gray-500 mb-4">
            Upload an audio/video file (MP3, WAV, MP4). We&apos;ll transcribe it, then analyze.
          </p>

          <label
            htmlFor="file"
            className="flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:bg-gray-50"
          >
            <input
              id="file"
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="text-sm text-gray-600">
              {file ? (
                <>
                  <strong>{file.name}</strong>
                  <span className="block text-gray-400">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </span>
                </>
              ) : (
                "Click to choose a file or drop it here"
              )}
            </span>
          </label>

          {fileError && <p className="text-sm text-red-600 mt-2">{fileError}</p>}

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleAnalyzeFile}
              disabled={!file || !!fileError || fileLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {fileLoading ? "Transcribing..." : "Analyze File"}
            </button>
            <button
              onClick={() => {
                setFile(null);
                setFileError(null);
                (document.getElementById("file") as HTMLInputElement)?.value && ((document.getElementById("file") as HTMLInputElement).value = "");
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </section>

        {}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Transcript</h2>
          <p className="text-sm text-gray-500 mb-4">
            Paste a transcript (any length). We&apos;ll analyze it directly.
          </p>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste transcript here..."
            className="w-full h-60 rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleAnalyzeTranscript}
              disabled={!transcript.trim() || txLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {txLoading ? "Analyzing..." : "Analyze Transcript"}
            </button>
            <button
              onClick={() => setTranscript("")}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}