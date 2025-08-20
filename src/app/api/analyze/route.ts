import Groq from "groq-sdk";

export const runtime = "nodejs";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text || !text.trim()) {
    return new Response("No transcript text provided", { status: 400 });
  }

    const system = `
    You are an analysis engine. 
    Always return ONLY valid JSON in exactly this format:

    {
    "summary": { 
        "main_points": ["List the most important ideas as short, clear bullet points."], 
        "action_items": [
        "Action items must be concrete, specific, and start with an imperative verb (e.g., 'Schedule...', 'Review...', 'Send...', 'Prepare...').",
        "They should represent tasks someone can actually do, not reflections or advice."
        ], 
        "decisions": ["List only explicit decisions reached in the discussion."]
    },
    "topics": [ 
        { "topic": "Short descriptive label", "start": 0, "end": 0, "weight": 0 } 
    ],
    "keywords": [ 
        { "term": "Important term", "count": 0, "definition": "Explain the term in exactly one clear sentence." } 
    ],
    "offTopic": [ 
        { "start": 0, "end": 0, "note": "One-sentence note about what was off-topic." } 
    ]
    }

    Guidelines:
    - Action items = tasks you can check off a to-do list (no vague reflections).  
    - Keep writing concise and professional.  
    - Use plain English, avoid filler phrases.  
    - Do not include anything outside the JSON object.  
    - All arrays must always be present (even if empty).  
    `;

  const user = `Transcript:\n"""${text}"""`;

  const resp = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
  });

  const content = resp.choices[0]?.message?.content ?? "{}";
  const json = JSON.parse(content);
  return Response.json(json);
}