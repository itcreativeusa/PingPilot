import OpenAI from "openai";
import { NextResponse } from "next/server";
import { buildUploadContext, extractTextFromUpload } from "@/lib/fileParser";
import type { MessageForm } from "@/lib/types";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(request: Request) {
  try {
    let form: MessageForm = {
      recipientName: "",
      recipientCompany: "",
      recipientRole: "",
      channel: "LinkedIn",
      tone: "Friendly",
      goal: "",
      context: "",
      fileContext: ""
    };

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      const fileContext = file && file instanceof File
        ? buildUploadContext(file.name, await extractTextFromUpload(file))
        : "";

      form = {
        recipientName: String(formData.get("recipientName") || ""),
        recipientCompany: String(formData.get("recipientCompany") || ""),
        recipientRole: String(formData.get("recipientRole") || ""),
        channel: (String(formData.get("channel") || "LinkedIn") as MessageForm["channel"]),
        tone: (String(formData.get("tone") || "Friendly") as MessageForm["tone"]),
        goal: String(formData.get("goal") || ""),
        context: String(formData.get("context") || ""),
        fileContext
      };
    } else {
      form = (await request.json()) as MessageForm;
    }

    if (!form.goal || !form.channel) {
      return NextResponse.json({ error: "Goal and channel are required." }, { status: 400 });
    }

    if (!openai) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY in .env.local." },
        { status: 500 }
      );
    }

    const prompt = `Create a ${form.tone.toLowerCase()} ${form.channel} outreach message.
Recipient name: ${form.recipientName || "Unknown"}
Recipient role: ${form.recipientRole || "Unknown"}
Company: ${form.recipientCompany || "Unknown"}
Goal: ${form.goal}
Context: ${form.context || "No extra context"}
Uploaded file context: ${form.fileContext || "No uploaded file context"}

Rules:
- Keep it natural and concise.
- Do not sound spammy.
- Include a clear next step.
- For LinkedIn, keep it shorter.
- For Email, include a subject line.
- Use the uploaded file context to personalize the message when relevant.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You write high-quality business outreach messages." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    return NextResponse.json({ message: completion.choices[0]?.message?.content || "" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate message." }, { status: 500 });
  }
}
