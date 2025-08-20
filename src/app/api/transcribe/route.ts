import { createClient } from "@deepgram/sdk";

export const runtime = "nodejs"; 
export const maxDuration = 60;   

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return new Response("No file provided (field name must be 'file')", { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: "nova-3",
        smart_format: true,
        punctuate: true,
      }
    );

    if (error) throw error;

    const alt = result?.results?.channels?.[0]?.alternatives?.[0] ?? {};
    const text: string = alt.transcript ?? "";

    const words = alt.words ?? [];

    const paragraphs = alt.paragraphs?.paragraphs ?? [];

    return Response.json({ text, words, paragraphs, raw: result });
  } catch (e) {
    console.error("Deepgram transcribe error:", e);
    return new Response("Transcription failed", { status: 500 });
  }
}