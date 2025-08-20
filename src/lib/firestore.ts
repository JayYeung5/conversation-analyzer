import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  type FirestoreDataConverter,
  type DocumentReference,
} from "firebase/firestore";

type Topic = { topic: string; start: number; end: number; weight: number };
type Keyword = { term: string; count: number; definition?: string };
type OffTopic = { start: number; end: number; note?: string };
type Summary = { main_points?: string[]; action_items?: string[]; decisions?: string[] };

type Analysis = {
  summary?: Summary;
  topics?: Topic[];
  keywords?: Keyword[];
  offTopic?: OffTopic[];
};

export type AnalysisDoc = {
  transcript?: string;
  analysis?: Analysis;
  createdAt?: Timestamp | null;
  source?: { kind: "file" | "paste"; name?: string };
  model?: string;
};

type NewAnalysis = Omit<AnalysisDoc, "createdAt">;

const analysisConverter: FirestoreDataConverter<AnalysisDoc> = {
  toFirestore: (data) => {
    const { createdAt, ...rest } = data;
    return { ...rest, createdAt: createdAt ?? serverTimestamp() };
  },
  fromFirestore: (snap, options) => {
    const data = snap.data(options) as AnalysisDoc;
    return data;
  },
};

const analysesCol = collection(db, "analyses").withConverter(analysisConverter);

export async function saveAnalysis(data: NewAnalysis): Promise<DocumentReference<AnalysisDoc>> {
  return await addDoc(analysesCol, data);
}

export async function getAnalyses(): Promise<Array<AnalysisDoc & { id: string }>> {
  const q = query(analysesCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}