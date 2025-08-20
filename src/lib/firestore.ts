import { db } from "./firebase";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "firebase/firestore";

export async function saveAnalysis(data: any) {
  return await addDoc(collection(db, "analyses"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getAnalyses() {
  const q = query(collection(db, "analyses"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}