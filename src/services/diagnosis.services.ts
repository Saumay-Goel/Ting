import { GoogleGenAI } from "@google/genai";
import { Diagnosis, AlarmInput } from "../types/diagnosis.types.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_INSTRUCTION = `You are an AWS DevOps assistant. Given a CloudWatch alarm, explain the most likely root cause and give concrete, actionable fix steps for an engineer.

Respond with ONLY a JSON object, no markdown, no backticks, in exactly this shape:
{
  "summary": "one short sentence describing what happened",
  "severity": "low" | "medium" | "high" | "critical",
  "cause": "the most likely root cause in 1-3 sentences",
  "steps": ["step 1", "step 2", "step 3"]
}

Be specific and practical. If information is limited, state reasonable assumptions.`;

export async function diagnose(alarm: AlarmInput): Promise<Diagnosis> {
  const prompt = `${SYSTEM_INSTRUCTION}

Alarm name: ${alarm.alarmName}
State: ${alarm.state}
Reason: ${alarm.reason}`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash",
    contents: prompt,
  });

  const raw = response.text ?? "";

  const clean = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(clean) as Diagnosis;
  } catch {
    return {
      summary: alarm.alarmName,
      severity: "medium",
      cause: "Could not parse AI diagnosis. Raw output below.",
      steps: [raw.slice(0, 500) || "No output from model."],
    };
  }
}
