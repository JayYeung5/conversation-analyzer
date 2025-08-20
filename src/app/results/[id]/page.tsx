"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

type Topic = { topic: string; start: number; end: number; weight: number };
type Keyword = { term: string; count: number; definition?: string };
type OffTopic = { start: number; end: number; note?: string };
type Summary = { main_points?: string[]; action_items?: string[]; decisions?: string[] };

type AnalysisDoc = {
  transcript?: string;
  analysis?: {
    summary?: Summary;
    topics?: Topic[];
    keywords?: Keyword[];
    offTopic?: OffTopic[];
  };
  createdAt?: { toDate: () => Date };
  source?: { kind: "file" | "paste"; name?: string };
  model?: string;
};

function usePersistedToggle(key: string, defaultOpen = true) {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setOpen(raw === "1");
    } catch {}
  }, [key]);
  useEffect(() => {
    try {
      localStorage.setItem(key, open ? "1" : "0");
    } catch {}
  }, [key, open]);
  return [open, setOpen] as const;
}

function ToggleSection({
  id,
  title,
  children,
  defaultOpen = true,
  rightNode,
  forceOpen,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  rightNode?: React.ReactNode;
  forceOpen?: boolean | null;
}) {
  const [open, setOpen] = usePersistedToggle(id, defaultOpen);
  useEffect(() => {
    if (typeof forceOpen === "boolean") setOpen(forceOpen);
  }, [forceOpen, setOpen]);

  return (
    <section className="bg-gray-900 rounded-2xl shadow">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <button
          type="button"
          className="group flex items-center gap-3 text-left"
          aria-expanded={open}
          aria-controls={id + "-panel"}
          onClick={() => setOpen(o => !o)}
        >
          <svg
            className={`h-5 w-5 transform transition-transform duration-200 text-blue-400 ${open ? "rotate-90" : ""}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M7 5l6 5-6 5V5z" />
          </svg>
          <h2 className="text-xl font-semibold text-blue-400">{title}</h2>
        </button>
        <div className="flex items-center gap-3">
          {rightNode}
          <button
            className="text-xs px-2 py-1 rounded border border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={() => setOpen(o => !o)}
          >
            {open ? "Collapse" : "Expand"}
          </button>
        </div>
      </header>
      <div
        id={id + "-panel"}
        className={`px-6 py-6 transition-[max-height,opacity] duration-300 ease-out overflow-hidden ${open ? "opacity-100" : "opacity-0"}`}
        style={{ maxHeight: open ? "4000px" : "0px" }}
      >
        {open && children}
      </div>
    </section>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [docData, setDocData] = useState<AnalysisDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [forceAll, setForceAll] = useState<boolean | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const snap = await getDoc(doc(db, "analyses", id));
      setDocData(snap.exists() ? (snap.data() as AnalysisDoc) : null);
      setLoading(false);
    })();
  }, [id]);

  const createdAtStr = useMemo(() => {
    if (!docData?.createdAt) return "";
    try {
      return docData.createdAt.toDate().toLocaleString();
    } catch {
      return "";
    }
  }, [docData]);

  const summary: Summary = docData?.analysis?.summary ?? {};
  const topics: Topic[] = docData?.analysis?.topics ?? [];
  const keywords: Keyword[] = docData?.analysis?.keywords ?? [];
  const offTopic: OffTopic[] = docData?.analysis?.offTopic ?? [];
  const transcript = docData?.transcript ?? "";
  const model = docData?.model ?? "unknown";
  const source = docData?.source;

  const topicWeights = topics.map(t => ({ topic: t.topic, weight: Number(t.weight ?? 0) }));
  const topicDurations = topics.map(t => ({
    topic: t.topic,
    duration: Math.max(0, Number(t.end ?? 0) - Number(t.start ?? 0)),
  }));
  const keywordCounts = keywords.map(k => ({ term: k.term, count: Number(k.count ?? 0) }));

  const setAll = useCallback((open: boolean) => {
    try {
      [
        `toggle:${id}:summary`,
        `toggle:${id}:weights`,
        `toggle:${id}:durations`,
        `toggle:${id}:keywords`,
        `toggle:${id}:offtopic`,
        `toggle:${id}:transcript`,
      ].forEach(k => localStorage.setItem(k, open ? "1" : "0"));
      setForceAll(open);
      requestAnimationFrame(() => setForceAll(null));
    } catch {}
  }, [id]);

  if (loading) return <div className="p-6 text-gray-300">Loading…</div>;
  if (!docData) {
    return (
      <div className="p-6 space-y-4 text-gray-300">
        <p className="text-red-400">Analysis not found.</p>
        <button
          onClick={() => router.push("/upload")}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black text-gray-100 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 px-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-blue-400">Results</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-400">
            <span className="shrink-0">ID:</span>
            <span className="font-mono break-all">{id}</span>
            {createdAtStr && <span className="shrink-0">• {createdAtStr}</span>}
            {source?.kind && (
              <span className="min-w-0">
                • Source: {source.kind}{source.name ? ` (${source.name})` : ""}
              </span>
            )}
            {model && <span className="shrink-0">• Model: {model}</span>}
          </div>
        </div>

        <div className="w-full sm:w-auto pt-1 sm:pt-0">
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(docData.analysis ?? {}, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `analysis-${id}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="w-full sm:w-auto px-3 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Download JSON
            </button>
            <button
              onClick={() => setAll(true)}
              className="w-full sm:w-auto px-3 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Expand all
            </button>
            <button
              onClick={() => setAll(false)}
              className="w-full sm:w-auto px-3 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Collapse all
            </button>
          </div>
        </div>
      </div>

      <ToggleSection
        id={`toggle:${id}:summary`}
        title="Structured Summary"
        defaultOpen
        forceOpen={forceAll}
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2 text-white">Main Points</h3>
            <ul className="list-disc ml-5 space-y-1">
              {(summary.main_points ?? []).map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-white">Action Items</h3>
            <ul className="list-disc ml-5 space-y-1">
              {(summary.action_items ?? []).map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-white">Decisions</h3>
            <ul className="list-disc ml-5 space-y-1">
              {(summary.decisions ?? []).map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        </div>
      </ToggleSection>

      <ToggleSection
        id={`toggle:${id}:weights`}
        title="Topic Weights"
        defaultOpen
        rightNode={<span className="text-xs text-gray-400">bars: weight</span>}
        forceOpen={forceAll}
      >
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={topicWeights}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="topic" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Legend />
              <Bar dataKey="weight" name="Weight" fill="#60A5FA" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ToggleSection>

      <ToggleSection
        id={`toggle:${id}:durations`}
        title="Topic Duration (s)"
        defaultOpen
        rightNode={<span className="text-xs text-gray-400">bars: seconds</span>}
        forceOpen={forceAll}
      >
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={topicDurations}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="topic" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Legend />
              <Bar dataKey="duration" name="Duration (s)" fill="#34D399" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ToggleSection>

      <ToggleSection
        id={`toggle:${id}:keywords`}
        title="Keyword Frequency"
        defaultOpen
        rightNode={<span className="text-xs text-gray-400">bars: count</span>}
        forceOpen={forceAll}
      >
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={keywordCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="term" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Count" fill="#FBBF24" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {!!keywords.length && (
          <ul className="mt-4 grid md:grid-cols-2 gap-2 text-sm text-gray-300">
            {keywords.map((k, i) => (
              <li key={i}>
                <span className="font-medium text-blue-300">{k.term}</span>
                {k.definition ? ` — ${k.definition}` : ""}
              </li>
            ))}
          </ul>
        )}
      </ToggleSection>

      <ToggleSection
        id={`toggle:${id}:offtopic`}
        title="Off-Topic Segments"
        defaultOpen
        forceOpen={forceAll}
      >
        {offTopic.length === 0 ? (
          <p className="text-gray-400">None detected.</p>
        ) : (
          <ul className="list-disc ml-5 space-y-1">
            {offTopic.map((o, i) => (
              <li key={i}>
                {o.note || "Off-topic"} — {Math.round(o.start)}s → {Math.round(o.end)}s
              </li>
            ))}
          </ul>
        )}
      </ToggleSection>

      <ToggleSection
        id={`toggle:${id}:transcript`}
        title="Transcript"
        forceOpen={forceAll}
      >
        <pre className="bg-gray-800 p-4 rounded max-h-80 overflow-auto whitespace-pre-wrap text-gray-200">
          {transcript}
        </pre>
      </ToggleSection>
    </div>
  );
}